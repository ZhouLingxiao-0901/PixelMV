/* Animatic V2 timeline.
 *
 * V2 is cut to the song rather than to the chronology of the relationship.
 * Boundaries follow the LRC line starts and the candidate section nodes in
 * assets/audio/mv_timeline_draft.json.  Those nodes are still candidates; the
 * LRC timestamps are used for the lyric layer only and are never written back
 * into the source file.
 */

export const AUDIO_END = 320.166;
export const TOTAL_DURATION = 325.0;
export const QUOTE_START = 322.0;

/* Long-form sections.  The internal shot lists live in scenes/v2.js. */
export const SCENES = [
  { id: "prologue", label: "雨夜 / 名字悬念", start: 0.0, end: 33.785 },
  { id: "forget", label: "试着忘记", start: 33.785, end: 62.439 },
  { id: "confession", label: "电话表白", start: 62.439, end: 118.343 },
  { id: "neon", label: "霓虹城市", start: 118.343, end: 160.92 },
  { id: "search", label: "人海与山路", start: 160.92, end: 188.238 },
  { id: "summit", label: "世界静止", start: 188.238, end: 216.853 },
  { id: "distance", label: "翱翔与停滞", start: 216.853, end: 247.826 },
  { id: "breakup", label: "音乐落下", start: 247.826, end: 260.089 },
  { id: "reveal", label: "最终副歌 / 名字揭晓", start: 260.089, end: 292.966 },
  { id: "outro", label: "继续生活", start: 292.966, end: 320.166 },
  { id: "post", label: "歌后留白", start: 320.166, end: 325.0 },
];

/* The page groups the same sections as editorial beats. */
export const BEATS = [
  { index: "序", label: "雨夜 / 名字悬念", start: 0.0, end: 33.785, scene: "prologue", status: "歌词前奏 · 临时分镜" },
  { index: "01", label: "试着忘记", start: 33.785, end: 62.439, scene: "forget", status: "主歌一 · 城市 / 走廊 / 手机" },
  { index: "02", label: "电话表白", start: 62.439, end: 118.343, scene: "confession", status: "主歌二 + 副歌一 · 对白提案" },
  { index: "03", label: "霓虹城市", start: 118.343, end: 160.92, scene: "neon", status: "副歌二 · 现在与记忆交叉" },
  { index: "04", label: "人海与山路", start: 160.92, end: 188.238, scene: "search", status: "桥段 · 多景别镜头序列" },
  { index: "05", label: "世界静止", start: 188.238, end: 216.853, scene: "summit", status: "副歌三 · 初吻与幸福蒙太奇" },
  { index: "06", label: "翱翔与停滞", start: 216.853, end: 247.826, scene: "distance", status: "副歌四 · 距离开始" },
  { index: "07", label: "音乐落下", start: 247.826, end: 260.089, scene: "breakup", status: "间奏 · 克制分手" },
  { index: "08", label: "名字揭晓", start: 260.089, end: 292.966, scene: "reveal", status: "最终副歌 · 毕业册占位名" },
  { index: "09", label: "继续生活", start: 292.966, end: 320.166, scene: "outro", status: "尾声 · 长镜头" },
  { index: "终", label: "歌后留白", start: 320.166, end: 325.0, scene: "post", status: "尾卡" },
];

/* Transitions only mark scene joins.  Internal cuts are handled by the shot
 * lists, so nothing here forces a cut merely because a clock reached a value. */
export const TRANSITIONS = [
  { at: 33.785, dur: 0.0, type: "cut" },
  { at: 62.439, dur: 0.0, type: "cut" },
  { at: 118.343, dur: 0.0, type: "cut" },
  { at: 160.92, dur: 0.0, type: "cut" },
  { at: 188.238, dur: 0.45, type: "white" },
  { at: 216.853, dur: 0.0, type: "cut" },
  { at: 247.826, dur: 1.1, type: "cross" },
  { at: 260.089, dur: 0.8, type: "white" },
  { at: 292.966, dur: 1.5, type: "cross" },
  { at: 320.166, dur: 1.8, type: "dip" },
];

/* Spoken lines only.  Each bubble is anchored in canvas coordinates and is a
 * creative proposal, not verified original speech.  Chat text never appears
 * here: it belongs inside the phone screen. */
export const DIALOGUE = [
  { start: 26.9, end: 29.8, who: "him", text: "你叫什么名字？", bx: 68, by: 68, tipX: 120 },
  { start: 31.2, end: 31.9, who: "her", text: "我……", bx: 494, by: 68, tipX: 520 },
  { start: 74.7, end: 76.2, who: "her", text: "喂？", bx: 494, by: 238, tipX: 530 },
  { start: 76.6, end: 79.9, who: "him", text: "那个……我想说。", bx: 72, by: 238, tipX: 131 },
  { start: 80.6, end: 82.4, who: "her", text: "你说。", bx: 494, by: 238, tipX: 530 },
  { start: 83.8, end: 86.8, who: "him", text: "我喜欢你。", bx: 72, by: 238, tipX: 131 },
  { start: 89.8, end: 92.4, who: "her", text: "……好。", bx: 494, by: 238, tipX: 530 },
];

/* Chat is a phone UI, not a floating bubble.  Times are absolute. */
export const CHAT_MESSAGES = [
  { t: 55.2, who: "him", text: "在干嘛？" },
  { t: 56.4, who: "her", text: "写作业。" },
  { t: 57.3, who: "him", text: "外面下雨了。" },
  { t: 58.2, who: "her", text: "嗯，我这边也是。" },
  { t: 59.0, who: "him", text: "等开学见。" },
  { t: 59.6, who: "her", text: "晚安。" },
];

export const HIGH2_MESSAGES = [
  { t: 207.0, who: "him", text: "今天也加油。" },
  { t: 210.5, who: "her", text: "你也是。" },
  { t: 214.0, who: "her", text: "晚安。" },
];

export function beatAt(t) {
  for (const beat of BEATS) {
    if (t >= beat.start && t < beat.end) return beat;
  }
  return BEATS[BEATS.length - 1];
}

export function sceneAt(t) {
  for (const scene of SCENES) {
    if (t >= scene.start && t < scene.end) return scene;
  }
  if (t >= TOTAL_DURATION - 0.001) return SCENES[SCENES.length - 1];
  return SCENES[0];
}
