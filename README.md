# 像素 MV 实验

两支用原生 Canvas 2D 做的像素 MV：

- **《刻在我心底的名字》40 秒样片**（本目录）：三个段落，纯 Canvas 绘制，无外部素材。
- **《红》音乐影像**（`hong/`）：161.585 秒、8 幕 44 个镜头，以音频时间为唯一主时钟。

> **公开仓库版**：歌曲音频、LRC 歌词与导出视频因版权原因没有包含在仓库里；代码、像素素材和文档完整保留。复现《红》时请自备音频，放到 `hong/assets/audio/` 下（文件名见 `hong/README.md`）。

## 启动与预览

在本目录执行：

```
python serve.py
```

然后打开：

```
http://127.0.0.1:8123/
```

《红》在 <http://127.0.0.1:8123/hong/>。

`serve.py` 只使用 Python 标准库（`http.server`），没有第三方依赖。
需要换端口时：

```
python serve.py --port 9000
```

不要直接双击 `index.html`：ES Module 和 `fetch` 在 `file://` 下会被浏览器拦截，
必须通过本地 HTTP 服务访问。

## 三个段落

| 时间 | 段落 | 内容 |
| --- | --- | --- |
| 0 – 8.5 s | 黄昏校园 | 校门、夕照、片名 |
| 7.5 – 24.5 s | 教室初识 | 男生进教室、落座、与女生对视 |
| 23.5 – 40 s | 夜晚聊天 | 分屏两间卧室、手机聊天、放下手机 |

7.5 s 与 23.5 s 各有一个 1 秒的压黑转场，画面在全黑中点切换，避免叠影。

## 操作

| 操作 | 功能 |
| --- | --- |
| `Space` | 播放 / 暂停 |
| `←` / `→` | 后退 / 前进 1 秒 |
| `Shift` + `←` / `→` | 后退 / 前进 0.1 秒 |
| `Home` / `End` | 跳到开头 / 结尾 |
| `R` | 重播 |
| `D` | 调试叠加层（安全框、时间码） |
| 拖动进度条 | 任意定位，画面可逐帧复现 |
| 全屏按钮 | 整数倍放大，优先保证像素清晰 |

## 时间轴调试

页面暴露 `window.__MV__`，方便按时间点核对画面：

```js
__MV__.pause();
__MV__.seek(8.0);       // 转场全黑中点
__MV__.debug(true);     // 安全框 + 时间码
__MV__.scenes;          // [{ id, start, end }]
__MV__.clock.playing;   // 当前播放状态
__MV__.time;            // 当前时间
```

所有画面由 `renderFrame(t)` 根据时间 t 决定，暂停、拖动和逐帧截图的结果一致。

## 目录

```
serve.py              本地静态服务器（仅 Python 标准库）
index.html            页面与控件
style.css             页面外壳样式
js/main.js            时钟、场景调度、转场、缩放、控件
js/engine/clock.js    单调播放时钟（静音）
js/engine/sprites.js  精灵表取帧
js/engine/pixeltext.js 1-bit 像素文字
js/engine/palette.js  统一色板
js/engine/util.js     缓动、随机、贴图
js/scenes/gate.js     黄昏校园
js/scenes/classroom.js 教室初识
js/scenes/bedroom.js  夜晚聊天
tools/build_assets.py 确定性地生成全部像素素材
assets/               生成后的背景、精灵表、光效
```

重新生成素材（可选，仅在修改画稿时需要；需要 Pillow）：

```
python tools\build_assets.py
```

生成过程使用固定随机种子，重复执行结果一致。运行样片本身**不需要** Pillow。

## 技术说明

- 内部分辨率固定 640×360；按设备像素取整数倍放大
  （`scaleDev = floor(min(availW*dpr/640, availH*dpr/360))`），
  仅在窗口小于 640×360 时退化为小数缩放。窗口模式下若可用高度不足，
  可能只得到 1×（640×360）；全屏可获得更大的整数倍。
- `imageSmoothingEnabled = false`、`image-rendering: pixelated`，
  像素不做插值。
- 每个场景先画进 640×360 离屏缓冲，再合成到主画布，避免场景内部
  `globalAlpha` 影响转场。
- 本样片故意不加载音乐；后续接入音乐时再把 `MVClock` 改为以音频时间为准。
