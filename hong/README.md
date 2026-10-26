# 红 · A Pixel Music Film

基于罗言《红》的声音与歌词意象创作的**原创像素音乐影像**。不是官方 MV，也不复述歌手的真实经历。

- 640 × 360 原生像素画面，16:9
- 纯 HTML5 Canvas 2D + 原生 ES Modules，无框架、无后端、无外部图片
- 音频驱动主时钟，歌词按 LRC 实际时间逐句显示
- 44 个镜头、8 幕、12 个转场；分镜、歌词、角色、场景、播放器彼此独立

## 运行

在仓库根目录启动静态服务器（根目录已有 `serve.py`）：

```bash
python serve.py
```

然后打开：

```
http://127.0.0.1:8123/hong/
```

> 音频与歌词因版权原因不在仓库中。请自备 `hong/assets/audio/罗言 - 红.mp3` 与同名 `.lrc` 文件，文件名需与 `js/timeline.js` 中的 `AUDIO_SRC`、`LRC_SRC` 一致。

必须通过 HTTP 打开，不能双击 `index.html`：`fetch` 读取 LRC、`audio` 读取 MP3 都受 `file://` 限制。浏览器要求一次用户点击才能播放音频，点“开始放映”即可。

## 操作

| 键 | 功能 |
| --- | --- |
| 空格 | 播放 / 暂停 |
| ← / → | 后退 / 前进 5 秒 |
| J / L | 后退 / 前进 10 秒 |
| C | 章节与镜头表 |
| F | 全屏 |
| M | 静音 |
| D | 调试信息 |
| R | 重映 |

播放器下方有进度条、音量、静音与全屏按钮；右侧抽屉会实时高亮当前镜头。

## 导出 MP4

导出不走录屏，而是逐帧调用播放器自己的渲染函数，所以画面和实时播放完全一致（含歌词、对白、转场）：

```bash
cd /d/PixelMV/hong
# 1. 逐帧渲染（需要本地服务器已在 127.0.0.1:8123 运行）
node tools/export_frames.cjs D:/PixelMV/hong/export/_frames

# 2. 合成 1080p MP4（640×360 整数 3× 最近邻放大）
FF="/d/剪映/JianyingPro/10.5.0.13988/ffmpeg.exe"
"$FF" -y -framerate 30 \
  -i export/_frames/frame_%05d.png \
  -i "assets/audio/罗言 - 红.mp3" \
  -vf "scale=1920:1080:flags=neighbor" \
  -c:v h264_nvenc -preset p6 -tune hq -rc vbr -cq 18 -b:v 0 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -map_chapters -1 -movflags +faststart \
  "/d/PixelMV/export/红_1080p.mp4"
```

- 帧率固定 30 fps，共 4848 帧（161.585 s）；脚本按音频绝对时间取帧，不依赖真实播放速度；
- 640×360 是原生分辨率，放大用 `flags=neighbor` 保持像素硬边，1920×1080 正好是 3×；
- 本机 PATH 里没有 ffmpeg，上面的路径是剪映自带的那一份（版本号会随剪映更新）。它没有 libx264，所以用 NVENC；没有 NVIDIA 显卡时把编码器换成 `h264_mf -b:v 12M`；
- 渲染脚本用 Playwright MCP 缓存里的 `playwright` 包驱动系统 Chrome（`channel: "chrome"`），不需要另外下载浏览器；
- 项目 MP3 带一个 ID3 章节，`-map_chapters -1` 把它丢掉，否则播放器里会多出一个没有意义的 `ch0`；
- 渲染完的 `export/_frames` 可以删（本次 4848 帧约 175 MB）。

## 目录结构

```
hong/
├── index.html            播放器外壳、抽屉、无障碍标签
├── style.css             UI、响应式、全屏、像素放大
├── assets/audio/
│   ├── 罗言 - 红.mp3      项目内音频（只读，不修改）
│   └── 罗言 - 红.lrc      歌词（只读，运行时解析）
├── js/
│   ├── main.js           播放引擎、主时钟、UI、字幕、对白、主循环
│   ├── timeline.js       EDL：AUDIO_SRC / SHOTS / TRANSITIONS / DIALOGUE / ACTS
│   ├── lyrics.js         LRC 解析、时间匹配
│   ├── characters.js     角色入口：drawPerson / drawPortrait / drawHand / drawReachingHand（含保留的人类骨架）
│   ├── crab.js           两个主角的像素小螃蟹：壳、腿、钳、眼、表情、配件
│   ├── art.js            像素绘制原语：色板、抖动、光晕、颗粒、票根、胶片片头
│   ├── registry.js       场景渲染函数注册表
│   └── scenes/
│       ├── cinema.js     影院、门厅、放映室、观众席、重映
│       ├── shore.js      海边、骑车、夜车、沙滩、黎明
│       ├── city.js       城市、录音棚、橱窗、票根、裂缝
│       ├── memory.js     吻、雪、记忆闪回
│       ├── finale.js     片尾
│       └── common.js     银幕上的海、观众席等共用元素
├── docs/
│   ├── song-study.md     歌曲研究、资料可信度、歌词结构
│   ├── story-bible.md    人物、世界、母题、结局
│   └── shot-list.md      44 个镜头与转场表
└── tools/
    ├── analyze_audio.py  离线节拍/能量分析（开发用，不影响播放）
    ├── export_frames.cjs 逐帧导出 PNG（MP4 合成见“导出 MP4”）
    └── audio_analysis.json
```

## 怎么改

### 改镜头时间

编辑 `js/timeline.js` 的 `SHOTS`。每条是 `{ id, start, end, act, render, title }`：

```js
{ id: "p12", start: 39.176, end: 42.000, act: "sea", render: "shoreWalk", title: "无休止的黄昏" },
```

- `render` 是 `js/registry.js` 里的函数名；新增镜头时把函数写进 `scenes/` 并在注册表里登记。
- 时间单位是秒，直接用音频的绝对时间。
- 改完后刷新页面即可，不需要构建。

### 改转场

`TRANSITIONS`：`{ at, type, dur }`，类型有 `dip`（黑场）、`cross`（叠化）、`flash`（红闪）、`cut`（硬切）、`fadeOut`（结尾淡出）。`at` 是转场开始时间。

### 改对白

`DIALOGUE`：`{ start, end, who, text, bx, by, tipX }`。气泡坐标是画布坐标，`by: 120` 位于人物头顶上方，不会进入 `y ≥ 292` 的字幕区。全片只有 5 句，新增时请克制。

### 改歌词

直接改 `assets/audio/罗言 - 红.lrc`。播放器每次加载都会重新解析：

- 时间标签 `[mm:ss.xxx]`；
- 同一时间戳上的制作人员行（作词/作曲/出品/OP 等）会被过滤；
- 括号译文若与主句不在同一时间戳，不单独显示；
- 每句默认最多停留 5.6 秒，下一句开始前 0.1 秒收尾。

不需要改 JS。

### 改画面

`js/scenes/*.js` 每个导出函数签名都是 `(ctx, t, shot, local)`：

- `t`：整首歌的绝对时间；
- `local`：本镜头内的时间（`t - shot.start`）；
- `ctx`：640×360 的 Canvas 2D 上下文。

所有绘制都是程序化的：`fill` 画矩形，`ellipse` 画椭圆，`dither` 做网点，`bands` 做色带，`grain` 加颗粒。没有贴图，也没有逐帧图片序列。

### 改人物

两个主角是桌面宠物风格的**原创像素小螃蟹**，画在 `js/crab.js`。`characters.js` 顶部的 `CRAB_LEADS = true` 让 `drawPerson` / `drawPortrait` / `drawHand` / `drawReachingHand` / `drawEmbrace` 全部转发到螃蟹；人类骨架原样保留在同一个文件里，把它改成 `false` 就整片切回。**没有使用任何现成桌宠素材**：`D:\clawd-on-desk` 的 GIF 是 All Rights Reserved，这里只是借了“方形壳 + 两根竖条眼 + 四根短线腿”的造型语言，像素全部现画。

- 他 = 橙色（`#e0895c`），她 = 粉色（`#e88ba8`）；辨识配件分别是壳上的一根红线缆、壳边的一枚红蝴蝶结；
- 接口与人类骨架完全一致，场景不需要改调用：
  - `drawPerson(ctx, who, x, y, { scale, view, pose, expression, arm, blink, mouth, turn, gaze, headTilt, silhouette, silhouetteColor, alpha })`
  - `drawPortrait` / `drawHand` / `drawReachingHand` / `drawEmbrace` 同理；
- 局部坐标：脚底 `y=0`，壳 `x∈[-31,31]`、`y∈[-63,-15]`，四根短线腿接在 `y=-15`，眼 `y=-40`（6×9，左上一格高光），嘴 `y=-25`，双钳静止在 `x=±36`；坐姿整体下移 8px、腿收到 `-9..1`；
- 4× 以上的特写会把整只蟹上抬 41px（`CLOSE_EYE_LINE = -81`），让眼睛落在旧人类骨架的眼线上，特写构图不用重排；
- 钳子的位置由 `arm` 决定：`down / up / reach / point / hold / holdout / holdback / plead / wipe / phone / write / paint / grip / lean`，见 `clawTargets()`；
- 举起的手（`up` / `paint`）画在壳的前面，手臂从壳的侧沿（`x=±31`）伸出去；画在壳后面的话壳会把手臂吃掉，只剩钳子像一根小旗杆；
- 双人同框时两个人脚底至少隔开 **150px**（2× 下，壳宽 124px + 26px 空气）；要让两只钳子正好碰在一起（`holdout` + `holdback`）大约需要 184px；
- 表情是眼型 + 眉 + 嘴 + 腮红：`soft / smile / sad / angry / surprised / tears / hurt / closed / kiss / wistful / smirk / pout / uneasy`；`blink: 1` 闭眼，`mouth > 0.35` 张嘴，腮红是三行渐变、在 4× 以上自动减淡；
- `gaze: -1 / 0 / 1` 只挪眼里的高光，不挪整只眼：2× 以上就能看出“在看哪边”，近景也不会把瞳孔拆开；
- 微表情的分寸：`wistful` 上眼睑压一行、眉只描一级、嘴角晚半拍；`smirk` 一边眉挑高、嘴角单边上扬；`uneasy` 眉是断的、嘴是抖的；`pout` 只画一个 2×2 的嘴；`kiss` 是闭眼的笑加一个 3×2 的噘嘴；
- 背影（`view: "back"`）不画脸，靠壳体接缝、居中高光和红色配件认人；
- 所有形状先在局部坐标按整数像素栅格化，再由 `ctx.scale(scale*dir, scale)` 放大，所以 5× 特写和远景是同一只蟹——要改长相就改 `crab.js`，不要单独修某个镜头里的脸。
- 蟹的大小跟着景别里的“参照物”走，不是全片一个比例：p34 影院门口 1.45×（约门洞的六成高）、p35 城市人群 1.4×（比 1× 的人群高约四成）、p04 门厅 1.6×（窄于门框，手里的胶片盘按同一比例缩）。改这些镜头的比例时，胶片盘、手、提包、座位扶手这些挂在身上的东西要一起改。
- 蟹壳比人类骨架矮（63px vs 99px），所以凡是叠在角色身上的道具（耳机、电话、毯子、座位扶手、票根、笔）都按场景单独对过位置；新增叠层道具时先在对应镜头里核一遍。

## 技术说明

### 主时钟

- 音频正常时：`clockTime()` 直接返回 `audio.currentTime`，画面是音频的从属。
- 音频不可用：`switchToFallback()` 切到 `performance.now()` 的静默时钟，UI 会提示“静默放映”。
- 播放循环以 30 fps 为目标重绘。部分浏览器在窗口被遮挡、最小化或被自动化截图时会把 `requestAnimationFrame` 限到 1 Hz，而音频继续走；`main.js` 里有一个 33 ms 的看门狗，一旦 rAF 超过 90 ms 没有绘制，就从音频时钟补画，避免声画拉开到一秒以上。前台正常浏览时看门狗不会触发。

### 音频加载

`main.js` 用 `fetch` 读取同源 MP3，再 `URL.createObjectURL` 交给 `<audio>`，避免某些浏览器对相对路径音频的 Range 请求问题。原始文件不被改写，页面卸载时释放 Blob URL。

### 字幕

- 位置固定在下缘，主行基线 `y=307`（有译文时）/ `313`，译行 `y=326`；
- 主行 14px（纯英文 13px），带 1px 阴影和很轻的渐变暗底；
- 淡入 0.22 s，结束前 0.3 s 淡出，整体上浮 3px；
- 对白气泡在 `y=120`，12px 字，绝不压字幕。

### 像素风

- 画布固定 640×360，CSS `image-rendering: pixelated` / `crisp-edges`，整数或近整数放大；
- 文本也走像素化管线（`../../js/engine/pixeltext.js`），在 640×360 下栅格化后再放大，避免高清字体和像素画风打架；
- 色板集中在 `js/art.js`，红、粉、海、夜、雪各有固定几档，避免“每个镜头各自调色”。

## 已验证

- Chrome（Playwright 驱动，1280×800 / 900×600 / 480×820）可加载、播放、暂停、拖动进度、全屏、结束提示；
- 音频时长 161.585 s，31 句歌词按 LRC 时间显示；
- 44 个镜头的中点逐帧检查，无空白镜头、无渲染异常、无控制台报错；
- 两个螃蟹主角在 640×360 原生画布上逐镜复核：正面特写（p06 / p11 / p23 / p37 / p39）眼睛完整、不被耳机或道具遮住；双人镜头（p12 / p15 / p16 / p18 / p22 / p24 / p29 / p41）两人之间留得出空隙，牵手、握车把、提灯、指流星这些动作有明确的指向；坐姿（p09 / p41）壳底压在座面上、扶手在身前；背影（p05 / p09 / p40 / p43）靠配件和轮廓仍能认出是谁；p14 的柜台不再切掉她的脸，p30 的雪地镜头已换成蟹腿版本；微表情在 1.4×–5× 下逐个核对（p06 / p37 / p41 的 `wistful`、p22 的 `smirk`、p24 的 `gaze` 对视、p23 的开口吻），高光朝向和嘴角都能读出来；
- 影院的名字统一为“影院”（竖招、雨棚字、票根、片尾），旧招牌名已全部清掉；
- 字幕不越过 `y=292` 的安全线，对白气泡不与字幕/人脸重叠；
- 转场 `dip / cross / flash / fadeOut` 均能正常绘制；
- 结尾在 161.57 s 淡到接近纯黑。

## 已知限制

- 项目内 MP3 为 2:41.59 版本，公开资料有 2:58 的版本，二者不是同一剪辑；本片所有时间点都以项目内音频为准。
- 浏览器自动播放策略要求一次点击，无法做到“打开即响”。
- 本项目是实时 Canvas 播放器；MP4 由 `tools/export_frames.cjs` 逐帧调用 `__HONG__.renderAt(t)` 后与音频合成，见“导出 MP4”。导出画面只有影片本身，不含播放器 UI。
- 极低端设备上粒子/抖动较多的镜头可能掉帧；主时钟仍以音频为准，不会累积漂移。
- 近景的“转头”是正面头的四分之三侧转（`turn` + `gaze`），不是独立绘制的侧面骨骼；真正的侧脸是 `headSide` 的 3×3 眼型，五官笔画比正面少，所以只在远景和中景使用侧视。

## 版权与边界

- 音乐、歌词版权归原权利人所有；本项目为非商业同人习作。
- 故事、人物、对白均为原创虚构，与罗言本人经历无关；这句声明只留在播放器的“关于”面板，片尾不再重复。
- 公开资料中可核对的信息、网络传闻、本片自己的解读，已在 `docs/song-study.md` 中分开标注。
