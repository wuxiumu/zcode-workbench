#!/usr/bin/env bash
# ============================================================
# FDE 工作台矩阵 · 工作台截图工具（README 效果速览 / 回归留档）
# 用法：bash tools/screenshot.sh [workbench-dir ...]
#   例：bash tools/screenshot.sh ops-center growth-analytics
# 无参则截全部 15 个工作台。
# 依赖：优先用本机缓存的 Playwright Chromium headless shell；
#       找不到则回退系统 Chrome/Chromium 的 --headless 模式。
# 输出：docs/screens/<name>.png（1280x800）
# ============================================================
set -uo pipefail
cd "$(dirname "$0")/.."
OUT=docs/screens; mkdir -p "$OUT"

# --- 定位无头浏览器二进制 ---
BIN=""
for c in "$HOME"/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-mac-arm64/chrome-headless-shell \
         "$HOME"/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell; do
  [ -x "$c" ] && BIN="$c" && break
done
[ -z "$BIN" ] && BIN="$(command -v chromium || command -v chromium-browser || command -v google-chrome || true)"
if [ -z "$BIN" ]; then echo "❌ 未找到无头 Chromium（安装 playwright 或系统 Chrome）"; exit 1; fi
echo "使用浏览器：$BIN"

# --- 起本地服务 ---
PORT=18099
python3 -m http.server "$PORT" >/dev/null 2>&1 &
SRV=$!; sleep 1
trap 'kill $SRV 2>/dev/null' EXIT

shoot() {
  local dir="$1"
  "$BIN" --headless --disable-gpu --no-sandbox \
    --screenshot="$OUT/${dir}.png" --window-size=1280,800 \
    --virtual-time-budget=9000 --hide-scrollbars \
    "http://127.0.0.1:$PORT/workbenches/$dir/" >/dev/null 2>&1
  [ -s "$OUT/${dir}.png" ] && echo "✓ $dir" || echo "✗ $dir"
}

if [ $# -gt 0 ]; then TARGETS=("$@"); else
  TARGETS=(ops-center growth-analytics crm-workbench content-ops agent-observatory supply-chain-hub \
           finance-cockpit data-catalog llm-eval hr-analytics support-desk ads-performance \
           iot-fleet content-moderation ab-experiments)
fi
for t in "${TARGETS[@]}"; do shoot "$t"; done
echo "完成 → $OUT/"
