#!/usr/bin/env python3
"""FDE 工作台矩阵 · 可访问性静态审计（可作回归工具）

检查项：
  1. 交互元素（button/a）可访问名 —— 文本内容或 aria-label 至少其一
  2. 输入框可标签性 —— placeholder 或 aria-label
  3. html lang 属性、img alt
  4. prefers-reduced-motion 支持情况
  5. 核心色彩对比度（WCAG AA：正文 ≥4.5:1，按 theme.css 与页面内联变量计算）

用法：python3 tools/a11y_audit.py   （退出码 0 = 通过）
"""
import re, sys, glob
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = [str(ROOT / p) for p in ("index.html", "boss-one-pager.html")] + sorted(
    str(p) for p in (ROOT / "workbenches").glob("*/index.html"))

def lum(hex_color: str) -> float:
    hex_color = hex_color.lstrip("#")
    if len(hex_color) == 8: hex_color = hex_color[:6]
    r, g, b = (int(hex_color[i:i+2], 16) / 255 for i in (0, 2, 4))
    lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)

def contrast(fg: str, bg: str) -> float:
    l1, l2 = sorted((lum(fg), lum(bg)), reverse=True)
    return (l1 + 0.05) / (l2 + 0.05)

def strip_inline_css_noise(css: str) -> str:
    return css

problems = []
warnings = []

# ---------- 1-3：结构类检查（逐页） ----------
for path in PAGES:
    src = (ROOT / path).read_text(encoding="utf-8")
    rel = str(Path(path).relative_to(ROOT))

    if not re.search(r'<html[^>]*\blang=', src):
        problems.append(f"{rel}: <html> 缺少 lang 属性")

    for m in re.finditer(r'<button\b([^>]*)>(.*?)</button>', src, re.S):
        attrs, inner = m.group(1), m.group(2)
        text = re.sub(r'<[^>]+>', '', inner).strip()
        if not text and 'aria-label' not in attrs and 'aria-labelledby' not in attrs:
            problems.append(f"{rel}: 无可访问名的 <button>（{attrs.strip()[:60]}…）")

    for m in re.finditer(r'<a\b([^>]*)>(.*?)</a>', src, re.S):
        attrs, inner = m.group(1), m.group(2)
        text = re.sub(r'<[^>]+>', '', inner).strip()
        if not text and 'aria-label' not in attrs and 'aria-labelledby' not in attrs:
            problems.append(f"{rel}: 无可访问名的 <a> 链接（{attrs.strip()[:60]}…）")

    for m in re.finditer(r'<img\b([^>]*)>', src):
        if 'alt=' not in m.group(1):
            problems.append(f"{rel}: <img> 缺少 alt")

    for m in re.finditer(r'<input\b([^>]*)>', src):
        attrs = m.group(1)
        if 'type="hidden"' in attrs: continue
        if 'placeholder=' not in attrs and 'aria-label' not in attrs:
            problems.append(f"{rel}: <input> 既无 placeholder 也无 aria-label")

    # 交互元素 title 按钮应有 aria-label（title 不可靠）
    for m in re.finditer(r'<button\b[^>]*\btitle="([^"]*)"[^>]*>', src):
        if 'aria-label' not in m.group(0):
            warnings.append(f"{rel}: 按钮 title=\"{m.group(1)}\" 建议补 aria-label")

# ---------- 4：reduced-motion ----------
theme_css = (ROOT / "assets" / "theme.css").read_text(encoding="utf-8") if (ROOT / "assets/theme.css").exists() else ""
has_global_rm = "prefers-reduced-motion" in theme_css
for path in PAGES:
    src = (ROOT / path).read_text(encoding="utf-8")
    if "prefers-reduced-motion" not in src and not has_global_rm:
        warnings.append(f"{path}: 未支持 prefers-reduced-motion")

# ---------- 5：对比度（theme.css 核心 token + 各页内联覆盖） ----------
def collect_vars(css: str, selector: str) -> dict:
    m = re.search(re.escape(selector) + r'\{([^}]*)\}', css)
    return dict(re.findall(r'--([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})', m.group(1))) if m else {}

# 对比度标准：文字色（txt/sub）按 WCAG 1.4.3 正文 ≥4.5:1；
# 语义指示色（ok/warn/bad/acc）按 WCAG 1.4.11 非文字对比度 ≥3:1。
# 背景色变量（bg/panel/p1/p2）不作为前景色检查。
TEXT_PAIRS = [("txt", "bg"), ("txt", "p1"), ("txt", "p2"), ("sub", "bg"), ("sub", "p1")]
UI_PAIRS = [("ok", "bg"), ("warn", "bg"), ("bad", "bg"), ("acc", "bg")]
def check_pairs(merged, label, path, theme_name):
    for fg, bgk in TEXT_PAIRS:
        if fg in merged and bgk in merged:
            ratio = contrast(merged[fg], merged[bgk])
            if ratio < 4.5:
                problems.append(f"{path} {theme_name}: --{fg} on --{bgk} 对比度 {ratio:.2f}:1 (<4.5 文字)")
    for fg, bgk in UI_PAIRS:
        if fg in merged and bgk in merged:
            ratio = contrast(merged[fg], merged[bgk])
            if ratio < 3.0:
                problems.append(f"{path} {theme_name}: --{fg} on --{bgk} 对比度 {ratio:.2f}:1 (<3.0 图形)")

for theme_sel, theme_name in [(":root", "暗色"), ('[data-theme="light"]', "亮色")]:
    base = collect_vars(theme_css, theme_sel)
    if not base:
        continue
    for path in ["index.html", "boss-one-pager.html"]:  # 门户系页面自带变量
        src = (ROOT / path).read_text(encoding="utf-8")
        local = collect_vars(src, theme_sel)
        merged = {**base, **local}
        check_pairs(merged, "portal", path, theme_name)
    # 工作台（theme.css 提供 bg/p1，页面提供 txt/sub 与强调色）
    for path in sorted(str(p) for p in (ROOT / "workbenches").glob("*/index.html")):
        src = Path(path).read_text(encoding="utf-8")
        local = collect_vars(src, theme_sel)
        merged = {**base, **local}
        check_pairs(merged, "wb", path, theme_name)

# ---------- 输出 ----------
for w in warnings: print("⚠ ", w)
for p in problems: print("✗ ", p)
print(f"\n审计完成：{len(PAGES)} 页，{len(problems)} 个问题，{len(warnings)} 个建议")
sys.exit(1 if problems else 0)
