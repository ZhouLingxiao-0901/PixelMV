/* Animatic V1 timeline.
 *
 * The picture is driven by the real MP3 clock.  Every range below is a
 * candidate editorial range derived from assets/audio/mv_timeline_draft.json;
 * the music analysis itself is deliberately not re-run or "corrected" here.
 */

export const AUDIO_END = 320.166;
export const TOTAL_DURATION = 325.0;
export const QUOTE_START = 322.0;

/* Rendering scenes.  These are the units that own a draw function. */
export const SCENES = [
  { id: "prologue", label: "成年回望", start: 0.0, end: 15.443 },
  { id: "firstMeet", label: "初次相识", start: 15.443, end: 34.243 },
  { id: "pandemic", label: "疫情期间", start: 34.243, end: 62.439 },
  { id: "confession", label: "电话表白", start: 62.439, end: 118.343 },
  { id: "classes", label: "分班与周末", start: 118.343, end: 160.92 },
  { id: "hiking", label: "爬山与初吻", start: 160.92, end: 188.743 },
  { id: "high2", label: "高二", start: 188.743, end: 216.853 },
  { id: "high3", label: "高三", start: 216.853, end: 246.5 },
  { id: "breakup", label: "大学分手", start: 246.5, end: 260.089 },
  { id: "return", label: "成年回望 / 名字揭晓", start: 260.089, end: 320.166 },
  { id: "post", label: "歌后留白", start: 320.166, end: 325.0 },
];

/* Editorial beats shown in the page UI.  Name reveal and the life-after
 * passage are two beats inside the same continuous present-day scene. */
export const BEATS = [
  { index: "序", label: "成年回望", start: 0.0, end: 15.443, scene: "prologue", status: "动态分镜" },
  { index: "01", label: "初次相识 / 名字悬念", start: 15.443, end: 34.243, scene: "firstMeet", status: "复用场景 + 分镜表演" },
  { index: "02", label: "疫情期间 / 手机聊天", start: 34.243, end: 62.439, scene: "pandemic", status: "复用场景 + 分镜表演" },
  { index: "03", label: "高一寒假 / 电话表白", start: 62.439, end: 118.343, scene: "confession", status: "临时表演 + 对白提案" },
  { index: "04", label: "不同班级 / 周末见面", start: 118.343, end: 160.92, scene: "classes", status: "临时合成" },
  { index: "05", label: "爬山 / 初吻", start: 160.92, end: 188.743, scene: "hiking", status: "临时合成" },
  { index: "06", label: "高二 / 学习与感情", start: 188.743, end: 216.853, scene: "high2", status: "临时合成" },
  { index: "07", label: "高三 / 最幸福的时光", start: 216.853, end: 246.5, scene: "high3", status: "临时蒙太奇" },
  { index: "08", label: "大学 / 分手", start: 246.5, end: 260.089, scene: "breakup", status: "临时合成" },
  { index: "09", label: "名字揭晓", start: 260.089, end: 283.115, scene: "return", status: "临时合成 · 主方案" },
  { index: "10", label: "继续生活", start: 283.115, end: 320.166, scene: "return", status: "临时合成" },
  { index: "终", label: "歌后留白", start: 320.166, end: 325.0, scene: "post", status: "尾卡" },
];

/* Transitions are anchored on the candidate boundaries.  "cross" renders both
 * scenes for the given duration; "white"/"dip" overlay a flash at the cut. */
export const TRANSITIONS = [
  { at: 15.443, dur: 0.8, type: "white" },
  { at: 34.243, dur: 0.0, type: "cut" },
  { at: 62.439, dur: 0.0, type: "cut" },
  { at: 118.343, dur: 1.4, type: "cross" },
  { at: 160.92, dur: 0.0, type: "cut" },
  { at: 188.743, dur: 1.8, type: "cross" },
  { at: 216.853, dur: 0.0, type: "cut" },
  { at: 246.5, dur: 1.6, type: "cross" },
  { at: 260.089, dur: 0.5, type: "white" },
  { at: 320.166, dur: 1.8, type: "dip" },
];

/* Sparse dialogue.  These are creative proposals, not verified original words.
 * Chat messages are rendered inside the phones and are not listed here. */
export const DIALOGUE = [
  { start: 26.8, end: 29.6, who: "him", text: "你叫什么名字？" },
  { start: 31.2, end: 31.9, who: "her", text: "我——" },
  { start: 74.7, end: 76.2, who: "her", text: "喂？" },
  { start: 76.6, end: 79.9, who: "him", text: "那个……我有话想跟你说。" },
  { start: 80.6, end: 82.4, who: "her", text: "你说。" },
  { start: 83.8, end: 86.8, who: "him", text: "我喜欢你。" },
  { start: 89.8, end: 92.4, who: "her", text: "……好。" },
];

export const CHAT_MESSAGES = [
  { t: 36.6, who: "him", text: "在干嘛？" },
  { t: 39.0, who: "her", text: "写作业。" },
  { t: 42.2, who: "her", text: "好无聊。" },
  { t: 45.4, who: "him", text: "我也是。" },
  { t: 48.8, who: "him", text: "外面下雨了。" },
  { t: 51.8, who: "her", text: "嗯，我这边也是。" },
  { t: 55.2, who: "him", text: "等开学见。" },
  { t: 58.6, who: "her", text: "晚安。" },
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
