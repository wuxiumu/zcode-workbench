#!/usr/bin/env python3
"""FDE 工作台矩阵 · 导览 GIF 装配工具

前置：tools/screenshot.sh 已产出 docs/screens/ 全页帧？——否，本工具配合无头浏览器
产出的全页帧（1280x2400，?tour=N 定格态）工作：

  1. 用无头 Chromium 截全页帧（见仓库 CI 文档 / tools/screenshot.sh 同款参数，
     窗口 1280x2400，URL 带 ?tour=N 定格第 N 站）；
  2. 本脚本检测每帧中聚光灯卡片（#4f8cff 描边环）位置 → 裁 1280x800 窗口；
  3. 用系统 PingFang 字体自绘字幕条（站点进度 + 一句话价值）；
  4. 合成 docs/showcase.gif（自动调色板，压缩提及）。

用法：python3 tools/make_showcase_gif.py /tmp/frames docs/showcase.gif
"""
import re, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FRAMES, OUT = Path(sys.argv[1]), Path(sys.argv[2])
W, H = 1280, 800          # 输出窗口
ACCENT = (79, 140, 255)   # --acc
CYAN = (34, 211, 238)     # --acc2

# ---- 站点数据：从门户 index.html 提取（单一事实来源） ----
src = (ROOT / "index.html").read_text(encoding="utf-8")
names = dict(re.findall(r'\{no:"(\d\d)".*?name:"([^"]+)"', src))
says = dict(re.findall(r'"(\d\d)":"([^"]+)"', src))
FINALE = "十五张作战地图看完了 —— 这就是一个 FDE 把业务问题翻译成可运行系统的能力。点开任何一张卡片，看细节。"

FONT_PATH = next(p for p in [
    "/System/Library/Fonts/PingFang.ttc",
    "/System/Library/Fonts/Hiragino Sans GB.ttc",
    "/System/Library/Fonts/STHeiti Medium.ttc",
    "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",   # Linux 兜底
] if Path(p).exists())
FONT_B = ImageFont.truetype(FONT_PATH, 30, index=0)
FONT_S = ImageFont.truetype(FONT_PATH, 20, index=0)

def spot_center(path):
    """检测聚光灯卡片中心（蓝描边环，排除底部 HUD 区域）"""
    im = np.asarray(Image.open(path).convert("RGB")).astype(int)
    m = (abs(im[:,:,0]-ACCENT[0])<26) & (abs(im[:,:,1]-ACCENT[1])<26) & (abs(im[:,:,2]-ACCENT[2])<32)
    m[2250:, :] = False                     # 排除 HUD 蓝边
    rows = np.where(m.sum(axis=1) > 120)[0]  # 横向边框线所在行
    if not len(rows): return None
    return int((rows.min() + rows.max()) / 2)

def caption(im, step, total, label, text, lines=1):
    d = ImageDraw.Draw(im, "RGBA")
    box = (40, H-148, W-40, H-32)
    d.rounded_rectangle(box, 18, fill=(13, 19, 34, 242), outline=(79, 140, 255, 255), width=2)
    d.text((box[0]+22, box[1]+14), f"第 {step} / {total} 站 · {label}", font=FONT_S, fill=CYAN)
    # 长句自动换行：超宽时贪心按字符断行（最多两行）
    maxw = box[2]-box[0]-44
    if d.textlength(text, font=FONT_B) <= maxw:
        d.text((box[0]+22, box[1]+46), text, font=FONT_B, fill=(230, 236, 255))
    else:
        parts, cur = [], ""
        for ch in text:
            if d.textlength(cur + ch, font=FONT_B) > maxw and cur:
                parts.append(cur); cur = ch
            else:
                cur += ch
        parts.append(cur)
        for i, line in enumerate(parts[:2]):
            d.text((box[0]+22, box[1]+38+i*38), line, font=FONT_B, fill=(230, 236, 255))
    return im

def load(path):
    return Image.open(path).convert("RGB")

frames, durations = [], []
# 开场：门户首屏
frames.append(load(FRAMES/"f00.png").crop((0, 0, W, H))); durations.append(1800)
# 15 站
for n in range(1, 16):
    p = FRAMES / f"f{n:02d}.png"
    cy = spot_center(p)
    if cy is None: cy = 400
    y = max(0, min(cy - H//2, 2400 - H))
    im = load(p).crop((0, y, W, y + H))
    no = f"{n:02d}"
    caption(im, n, 15, f"{no} {names.get(no,'')}", says.get(no, ""))
    frames.append(im); durations.append(1600)
# 收尾：裁切避开页面自带 HUD（y>2260），字幕由本脚本统一绘制
im = load(FRAMES/"f16.png").crop((0, 1350, W, 1350 + H))
caption(im, "✓", 15, "导览结束", FINALE)
frames.append(im); durations.append(2800)

# 缩放 + 量化 → GIF
frames = [f.resize((960, 600), Image.LANCZOS).quantize(colors=128, method=Image.MEDIANCUT) for f in frames]
OUT.parent.mkdir(parents=True, exist_ok=True)
frames[0].save(OUT, save_all=True, append_images=frames[1:], duration=durations, loop=0, optimize=True)
print(f"✓ {OUT} · {len(frames)} 帧 · {OUT.stat().st_size/1024:.0f} KB")
