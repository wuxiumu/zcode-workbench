# 🤖 AI 解读助手 · ai-assistant

独立、零依赖、可复用的 AI 解读机器人组件 —— 一个 `<script>` 引入任意工作台，即可获得：

1. **右下角 🤖 机器人按钮 + 解读对话面板**：打字机效果输出，支持「整体解读 / 风险提示 / 优化建议」快捷提问；
2. **友好 Toast 弹窗提示系统**（`window.ZToast`）：页面加载欢迎提示 + 周期性模拟业务事件提醒；
3. **主题自动跟随**：样式全部引用宿主页面 CSS 变量，亮/暗主题切换无需任何处理。

> 数据与解读**全部来自各自工作台**：每个工作台只需注入一份 `window.AI_ASSISTANT` 配置，机器人的解读内容即由该工作台的实时 Mock 数据动态生成。

## 快速接入

```html
<!-- 1. 注入本工作台的数据配置（放在页面主脚本之后，可直接引用页面内的实时变量） -->
<script>
window.AI_ASSISTANT = {
  title: '财务经营驾驶舱',
  subtitle: 'FINANCE COCKPIT',
  insights() {   // 必填：返回解读数组，lv 取 ok | warn | bad | info
    return [
      { tag: '营收', lv: 'ok',   text: '本月营收 ¥' + rev + ' 万，环比 +8.6%' },
      { tag: '净利率', lv: 'warn', text: '净利率 ' + (npRate * 100).toFixed(1) + '%，' + (npRate >= .15 ? '达标' : '低于 15% 目标') }
    ];
  },
  advice() {     // 可选：优化建议
    return ['现金流低于安全水位时优先压缩非核心开支'];
  },
  alerts() {     // 可选：周期性事件提醒（每 ~30s 抽取一次，返回 null 跳过）
    return Math.random() < .5 ? { lv: 'warn', text: '⚠️ 现金流接近安全水位' } : null;
  }
};
</script>
<!-- 2. 引入组件（defer 保证 DOM 就绪后渲染） -->
<script src="../../assets/ai-assistant/ai-assistant.js" defer></script>
```

## 配置项

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `title` | ✅ | string | 面板标题（工作台中文名） |
| `subtitle` | – | string | 副标题（英文标识） |
| `insights()` | ✅ | `{tag,lv,text}[]` | 数据解读；`lv`: `ok`/`warn`/`bad`/`info`，「风险提示」标签只展示 warn/bad |
| `advice()` | – | `string[]` | 「优化建议」标签的内容 |
| `alerts()` | – | `{lv,text}`\|`null` | 周期 Toast 提醒（每 26~35s 抽取一次；页面切到后台时自动暂停） |

## 对外 API

| API | 说明 |
|-----|------|
| `window.ZToast.show(text, lv?, ms?)` | 手动弹一条友好提示（`ZToast.ok/warn/bad/info` 快捷方法） |
| `window.ZAI.open() / close()` | 手动打开 / 收起机器人面板 |
| `window.ZAI.notify(text, lv?, ms?)` | 同 ZToast.show 的别名 |

## 文件

- `ai-assistant.js` —— 组件本体（样式注入 + 机器人面板 + Toast，约 9KB 无依赖）
- `demo.html` —— 独立演示页（直接浏览器打开即可体验）
- `README.md` —— 本文档

## 主题

组件所有颜色引用宿主页面的 CSS 变量（`--p1 --p2 --line --txt --sub --acc --ok --warn --bad --cyan`），
变量缺失时自动回退到暗色默认值。工作台现有 ☀️/🌙 主题切换按钮生效时，机器人面板即时跟随。
