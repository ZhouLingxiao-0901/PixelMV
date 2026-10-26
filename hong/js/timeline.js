/* Edit decision list for 《红》.
 *
 * Times are absolute seconds on the supplied MP3 (161.585 s).  Lyric marks are
 * kept in the LRC file and read at runtime; this file only decides picture and
 * performance.  The cut points follow the sung line starts, with a few
 * intentional 1-2 s offsets so the image can breathe before a phrase lands.
 */

export const AUDIO_SRC = "assets/audio/罗言 - 红.mp3";
export const LRC_SRC = "assets/audio/罗言 - 红.lrc";
export const DURATION = 161.585;

export const ACTS = [
  { id: "prologue", index: "序", label: "放映前", start: 0.0, end: 15.638, tone: "红 · 片头" },
  { id: "light", index: "一", label: "光落在她眼睛里", start: 15.638, end: 39.176, tone: "相遇 / 旧放映室" },
  { id: "sea", index: "二", label: "粉色的天", start: 39.176, end: 61.189, tone: "海边 / 承诺" },
  { id: "distance", index: "三", label: "几千公里", start: 61.189, end: 109.0, tone: "距离 / 裂痕" },
  { id: "after", index: "四", label: "散场之后", start: 109.0, end: 123.656, tone: "余波 / 无对白" },
  { id: "city", index: "五", label: "城市里的角色", start: 123.656, end: 140.197, tone: "各自生活" },
  { id: "screening", index: "六", label: "最后一场", start: 140.197, end: 151.212, tone: "重映 / 不复合" },
  { id: "outro", index: "尾", label: "天亮以前", start: 151.212, end: DURATION, tone: "海 / 片尾" },
];

/* Every shot names a renderer in one of the scene modules.  Keeping the shot
 * list as data means the film can be re-timed without touching the drawings. */
export const SHOTS = [
  { id: "p01", start: 0.000, end: 2.600, act: "prologue", render: "leaderFive", title: "片头 · 放映员计数" },
  { id: "p02", start: 2.600, end: 5.400, act: "prologue", render: "leaderTitle", title: "片名" },
  { id: "p03", start: 5.400, end: 8.700, act: "prologue", render: "cinemaNeonWide", title: "影院 · 黄昏" },
  { id: "p04", start: 8.700, end: 11.800, act: "prologue", render: "lobbyDoor", title: "门里的红光" },
  { id: "p05", start: 11.800, end: 14.600, act: "prologue", render: "auditoriumEmpty", title: "空场 · 海在银幕上" },
  { id: "p06", start: 14.600, end: 18.891, act: "light", render: "herEyes", title: "她的眼睛 / 第一句" },
  { id: "p07", start: 18.891, end: 22.903, act: "light", render: "boothTears", title: "放映室里的眼泪" },
  { id: "p08", start: 22.903, end: 26.406, act: "light", render: "ticketHands", title: "票根 / 第一次说话" },
  { id: "p09", start: 26.406, end: 29.662, act: "light", render: "auditoriumAlone", title: "空着的座位" },
  { id: "p10", start: 29.662, end: 35.672, act: "light", render: "studioCredit", title: "城里的名字 / 闪前" },
  { id: "p11", start: 35.672, end: 39.176, act: "light", render: "studioSilent", title: "唱不出的那一句" },
  { id: "p12", start: 39.176, end: 42.000, act: "sea", render: "shoreWalk", title: "无休止的黄昏" },
  { id: "p13", start: 42.000, end: 46.184, act: "sea", render: "shoreWide", title: "一个人在海边" },
  { id: "p14", start: 46.184, end: 49.939, act: "sea", render: "lobbyPostcard", title: "她写下的海边" },
  { id: "p15", start: 49.939, end: 54.439, act: "sea", render: "bikeToSea", title: "骑车去海边" },
  { id: "p16", start: 54.439, end: 57.688, act: "sea", render: "beachClouds", title: "粉色的天 / 软云" },
  { id: "p17", start: 57.688, end: 61.189, act: "sea", render: "busNight", title: "几千公里 / 夜车" },
  { id: "p18", start: 61.189, end: 63.951, act: "distance", render: "beachNightMeteor", title: "第一颗流星" },
  { id: "p19", start: 63.951, end: 64.950, act: "distance", render: "handsSand", title: "沙里的两只手" },
  { id: "p20", start: 64.950, end: 69.206, act: "distance", render: "splitPhone", title: "想打却没有打" },
  { id: "p21", start: 69.206, end: 72.712, act: "distance", render: "seaSad", title: "悲伤海" },
  { id: "p22", start: 72.712, end: 76.471, act: "distance", render: "roofMeteor", title: "屋顶上的流星" },
  { id: "p23", start: 76.471, end: 80.730, act: "distance", render: "kissMemory", title: "放映机前的吻" },
  { id: "p24", start: 80.730, end: 84.236, act: "distance", render: "argumentStart", title: "第一次争吵" },
  { id: "p25", start: 84.236, end: 88.504, act: "distance", render: "cityWindow", title: "城里的夜 / 两盏灯" },
  { id: "p26", start: 88.504, end: 92.516, act: "distance", render: "workSplit", title: "各自的工作" },
  { id: "p27", start: 92.516, end: 96.772, act: "distance", render: "ticketTorn", title: "撕开的票根" },
  { id: "p28", start: 96.772, end: 100.278, act: "distance", render: "redSlip", title: "从裂缝里溜走" },
  { id: "p29", start: 100.278, end: 105.537, act: "distance", render: "argumentClimax", title: "最恶毒的话" },
  { id: "p30", start: 105.537, end: 109.000, act: "distance", render: "snowMemory", title: "雪里光着脚" },
  { id: "p31", start: 109.000, end: 112.600, act: "after", render: "aftermathSeats", title: "散场 · 空座" },
  { id: "p32", start: 112.600, end: 116.200, act: "after", render: "aftermathPack", title: "收进纸箱的声音" },
  { id: "p33", start: 116.200, end: 119.800, act: "after", render: "aftermathBooth", title: "她还在放映" },
  { id: "p34", start: 119.800, end: 123.656, act: "after", render: "aftermathDoor", title: "门关上" },
  { id: "p35", start: 123.656, end: 127.677, act: "city", render: "cityWalk", title: "同一座城 / 不同方向" },
  { id: "p36", start: 127.677, end: 131.437, act: "city", render: "cityReflections", title: "橱窗里的角色" },
  { id: "p37", start: 131.437, end: 135.437, act: "city", render: "cityClose", title: "耳机里的海" },
  { id: "p38", start: 135.437, end: 140.197, act: "city", render: "memoryFlash", title: "脑海里的坎坷" },
  { id: "p39", start: 140.197, end: 142.953, act: "screening", render: "screeningBooth", title: "重映 / 光束" },
  { id: "p40", start: 142.953, end: 146.956, act: "screening", render: "screeningGlance", title: "隔着放映窗" },
  { id: "p41", start: 146.956, end: 151.212, act: "screening", render: "screeningSeats", title: "间隔一个座位" },
  { id: "p42", start: 151.212, end: 156.200, act: "outro", render: "screeningTicket", title: "留在座位上的票根" },
  { id: "p43", start: 156.200, end: 158.600, act: "outro", render: "dawnBeach", title: "天亮以前的海" },
  { id: "p44", start: 158.600, end: 161.585, act: "outro", render: "endCard", title: "片尾 · 红" },
];

/* Only a handful of joins get a dissolve; the rest are hard cuts like a film. */
export const TRANSITIONS = [
  { at: 5.400, type: "dip", dur: 0.42 },
  { at: 14.600, type: "dip", dur: 0.34 },
  { at: 39.176, type: "cross", dur: 1.05 },
  { at: 61.189, type: "dip", dur: 0.55 },
  { at: 80.730, type: "cut", dur: 0 },
  { at: 100.278, type: "flash", dur: 0.18 },
  { at: 109.000, type: "dip", dur: 1.0 },
  { at: 123.656, type: "cross", dur: 0.75 },
  { at: 140.197, type: "flash", dur: 0.22 },
  { at: 151.212, type: "cross", dur: 0.85 },
  { at: 156.200, type: "dip", dur: 0.7 },
  { at: 160.900, type: "fadeOut", dur: 0.685 },
];

/* Spoken lines, not lyrics.  Deliberately sparse: the song already says most
 * of it.  Each bubble is anchored in canvas coordinates and never enters the
 * subtitle safe area below y=304. */
export const DIALOGUE = [
  { start: 82.10, end: 83.25, who: "her", text: "你什么时候回来？", bx: 424, by: 146, tipX: 424 },
  { start: 83.45, end: 84.55, who: "him", text: "等这阵忙完。", bx: 266, by: 146, tipX: 266 },
  { start: 101.15, end: 102.55, who: "her", text: "你从来没打算留下。", bx: 420, by: 146, tipX: 420 },
  { start: 102.70, end: 104.05, who: "him", text: "我只是想让我们过得好一点。", bx: 266, by: 146, tipX: 266 },
  { start: 104.18, end: 105.35, who: "her", text: "那就别回来了。", bx: 414, by: 146, tipX: 414 },
];

/* Chapter metadata for the UI. */
export const CHAPTERS = ACTS.map((a) => ({ ...a }));

export function actAt(t) {
  for (const a of ACTS) if (t >= a.start && t < a.end) return a;
  return ACTS[ACTS.length - 1];
}

export function shotAt(t) {
  for (const s of SHOTS) if (t >= s.start && t < s.end) return s;
  return SHOTS[SHOTS.length - 1];
}

export function shotIndex(id) {
  return SHOTS.findIndex((s) => s.id === id);
}
