/* Player and projection engine for 《红》.
 *
 * The MP3 is the master clock.  Scene drawing, the edit decision list and the
 * player live in separate files; this file only wires them together.  If the
 * audio cannot be decoded, the same edit still runs on a silent clock so the
 * picture can be inspected instead of failing to a black screen.
 */

import {
  W, H, P, fill, alphaRect, text, textWidth,
  clamp, smoothstep,
} from "./art.js";
import {
  AUDIO_SRC, SHOTS, ACTS, CHAPTERS, TRANSITIONS, DIALOGUE,
  DURATION, actAt, shotAt,
} from "./timeline.js";
import { loadLyrics, lyricAt, lyricIndexAt } from "./lyrics.js";
import { rendererFor } from "./registry.js";

/* --------------------------------------------------------------- elements */

const player = document.getElementById("player");
const stage = document.getElementById("stage");
const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d", { alpha: false });
ctx.imageSmoothingEnabled = false;

const loadingEl = document.getElementById("loading");
const loadingLabel = document.getElementById("loadingLabel");
const loadingNote = document.getElementById("loadingNote");
const loadBar = document.getElementById("loadBar");
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const startNote = document.getElementById("startNote");
const endHint = document.getElementById("endHint");
const replayEndBtn = document.getElementById("replayEndBtn");

const playBtn = document.getElementById("playBtn");
const curTimeEl = document.getElementById("curTime");
const durTimeEl = document.getElementById("durTime");
const seekEl = document.getElementById("seek");
const actLabelEl = document.getElementById("actLabel");
const shotLabelEl = document.getElementById("shotLabel");
const muteBtn = document.getElementById("muteBtn");
const volumeEl = document.getElementById("volume");
const fullBtn = document.getElementById("fullBtn");
const chaptersBtn = document.getElementById("chaptersBtn");
const infoBtn = document.getElementById("infoBtn");

const chapterDrawer = document.getElementById("chapterDrawer");
const infoDrawer = document.getElementById("infoDrawer");
const scrim = document.getElementById("scrim");
const chapterList = document.getElementById("chapterList");
const shotList = document.getElementById("shotList");
const shotActLabel = document.getElementById("shotActLabel");
const toastEl = document.getElementById("toast");
const audio = document.getElementById("audio");

/* --------------------------------------------------------------- runtime */

const transitionCanvas = document.createElement("canvas");
transitionCanvas.width = W;
transitionCanvas.height = H;
const transitionCtx = transitionCanvas.getContext("2d", { alpha: true });
transitionCtx.imageSmoothingEnabled = false;

let lyrics = [];
let mediaDuration = DURATION;
let duration = DURATION;
let audioReady = false;
let useFallback = false;
let audioUrl = null;
let hasStarted = false;
let ended = false;
let manualMode = false;
let manualTime = 0;

let fakeTime = 0;
let fakePlaying = false;
let fakeStamp = 0;
let lastT = 0;
let lastPaint = 0;
let lastPaintReal = 0;
let dirty = true;
let scrubbing = false;
let debug = false;
let volumeValue = 0.9;
let muted = false;
let openDrawerEl = null;
let toastTimer = 0;
let currentActId = null;
let currentShotId = null;
let fps = 0;
let frameCount = 0;
let fpsStamp = performance.now();
const failedRenderers = new Set();

const now = () => performance.now();

/* ----------------------------------------------------------------- loading */

function setProgress(p) {
  loadBar.style.width = `${Math.round(clamp(p, 0, 1) * 100)}%`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadAudioTrack(onProgress) {
  const res = await fetch(AUDIO_SRC, { cache: "no-store" });
  if (!res.ok) throw new Error(`无法读取音轨（HTTP ${res.status}）`);

  const total = Number(res.headers.get("content-length")) || 0;
  let blob;

  if (res.body && res.body.getReader) {
    const reader = res.body.getReader();
    const chunks = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      const p = total ? received / total : Math.min(0.85, received / 6400000);
      onProgress?.(p);
    }
    blob = new Blob(chunks, { type: res.headers.get("content-type") || "audio/mpeg" });
  } else {
    onProgress?.(0.4);
    blob = await res.blob();
    onProgress?.(1);
  }

  audioUrl = URL.createObjectURL(blob);
  audio.src = audioUrl;
  audio.volume = volumeValue;
  audio.muted = muted;
  audio.load();

  await new Promise((resolve, reject) => {
    let settled = false;
    const finish = (ok, err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      audio.removeEventListener("loadedmetadata", okHandler);
      audio.removeEventListener("error", errHandler);
      if (ok) resolve();
      else reject(err || new Error("音轨无法载入"));
    };
    const okHandler = () => finish(true);
    const errHandler = () => finish(false, new Error("音轨解码失败"));
    const timer = setTimeout(() => {
      if (audio.readyState >= 1) finish(true);
      else finish(false, new Error("音轨载入超时"));
    }, 7000);

    audio.addEventListener("loadedmetadata", okHandler, { once: true });
    audio.addEventListener("error", errHandler, { once: true });
    if (audio.readyState >= 1) finish(true);
  });

  if (Number.isFinite(audio.duration) && audio.duration > 1) {
    mediaDuration = audio.duration;
    duration = audio.duration;
  }
  audioReady = true;
}

async function init() {
  drawFrame(0);
  requestAnimationFrame(loop);

  setProgress(0.03);
  loadingNote.textContent = "读取本地音轨与歌词";

  let lyricError = null;
  let audioError = null;

  const lyricPromise = loadLyrics()
    .then((lines) => {
      lyrics = Array.isArray(lines) ? lines : [];
      setProgress(0.9);
    })
    .catch((err) => {
      lyricError = err;
      lyrics = [];
      setProgress(0.9);
    });

  const audioPromise = loadAudioTrack((p) => {
    setProgress(0.04 + p * 0.84);
    if (p > 0.02) loadingNote.textContent = `读取音轨 ${Math.min(99, Math.round(p * 100))}%`;
  }).catch((err) => {
    audioError = err;
    useFallback = true;
    audioReady = false;
    setProgress(0.9);
  });

  await Promise.all([lyricPromise, audioPromise]);
  await delay(320);

  api.lyrics = lyrics;
  setDurationUI();

  if (lyricError) {
    console.warn("[红] LRC 未载入：", lyricError);
    loadingNote.textContent = "未找到歌词时间轴，将以画面继续";
  } else if (!lyrics.length) {
    loadingNote.textContent = "歌词为空，将以画面继续";
  }

  if (audioError) {
    console.warn("[红] 音轨未载入：", audioError);
    startNote.textContent = "音轨未载入 · 可作静默分镜观看";
    loadingNote.textContent = "音轨未载入，改为静默时间轴放映";
  } else {
    startNote.textContent = "建议佩戴耳机 · 可全屏观看";
  }

  setProgress(1);
  loadingLabel.textContent = "准备放映";
  await delay(260);

  loadingEl.classList.add("hidden");
  startScreen.classList.remove("hidden");
  dirty = true;

  api.ready = true;
  api.audioReady = audioReady;
  api.duration = duration;
  api.lyrics = lyrics;
  api.resolveReady?.(api);
}

/* ------------------------------------------------------------------ clock */

function clockTime() {
  if (manualMode) return manualTime;

  if (!audioReady || useFallback) {
    const stamp = now();
    if (fakePlaying) {
      fakeTime += (stamp - fakeStamp) / 1000;
      fakeStamp = stamp;
    }
    if (fakeTime >= duration - 0.001) {
      fakeTime = duration;
      if (fakePlaying) finishPlayback();
    }
    return clamp(fakeTime, 0, duration);
  }

  return clamp(audio.currentTime || 0, 0, duration);
}

function currentTime() {
  return manualMode ? manualTime : clockTime();
}

function isPlaying() {
  if (!hasStarted || manualMode) return false;
  if (useFallback || !audioReady) return fakePlaying;
  return !audio.paused && !audio.ended;
}

function setTime(value) {
  const t = clamp(Number(value) || 0, 0, duration);
  if (manualMode) {
    manualTime = t;
  } else if (!audioReady || useFallback) {
    fakeTime = t;
    fakeStamp = now();
  } else {
    try { audio.currentTime = t; } catch { fakeTime = t; fakeStamp = now(); }
  }
  lastT = t;
  if (t < duration - 0.15) {
    ended = false;
    endHint.classList.add("hidden");
  }
  dirty = true;
  drawFrame(t);
  syncUI(t, true);
}

function play() {
  if (!api.ready) {
    toast("正在装片，请稍候");
    return;
  }
  if (!hasStarted) {
    beginPlayback();
    return;
  }
  if (ended) {
    ended = false;
    endHint.classList.add("hidden");
    setTime(0);
  }

  const resume = manualMode ? manualTime : currentTime();
  manualMode = false;
  dirty = true;

  if (!audioReady || useFallback) {
    fakeTime = resume >= duration - 0.02 ? 0 : resume;
    fakeStamp = now();
    fakePlaying = true;
    return;
  }

  if (Math.abs((audio.currentTime || 0) - resume) > 0.02 && resume < duration - 0.03) {
    try { audio.currentTime = resume; } catch { /* ignore */ }
  }
  const promise = audio.play();
  if (promise && promise.catch) {
    promise.catch((err) => {
      console.warn("[红] 播放被阻止，切换静默时间轴：", err);
      switchToFallback(resume, true);
      toast("音频无法播放，已改为静默放映");
    });
  }
}

function pause() {
  if (useFallback || !audioReady) {
    fakeTime = clockTime();
    fakeStamp = now();
    fakePlaying = false;
  } else {
    audio.pause();
  }
  dirty = true;
  syncUI(lastT, true);
}

function beginPlayback() {
  if (!api.ready) {
    toast("正在装片，请稍候");
    return;
  }
  hasStarted = true;
  startScreen.classList.add("hidden");
  stage.classList.add("started");
  ended = false;
  endHint.classList.add("hidden");
  if (!audioReady && !useFallback) useFallback = true;
  play();
}

function togglePlayback() {
  if (!hasStarted) {
    beginPlayback();
    return;
  }
  if (ended) {
    replay();
    return;
  }
  if (isPlaying()) pause();
  else play();
}

function replay() {
  hasStarted = true;
  startScreen.classList.add("hidden");
  stage.classList.add("started");
  ended = false;
  endHint.classList.add("hidden");
  manualMode = false;
  if (audioReady && !useFallback) {
    try { audio.currentTime = 0; } catch { /* ignore */ }
  }
  fakeTime = 0;
  fakeStamp = now();
  fakePlaying = false;
  lastT = 0;
  play();
}

function finishPlayback() {
  if (ended) return;
  ended = true;
  fakePlaying = false;
  dirty = true;
  endHint.classList.remove("hidden");
  syncPlayButton();
}

function switchToFallback(resumeAt = lastT, keepPlaying = true) {
  if (useFallback) {
    fakePlaying = keepPlaying;
    fakeStamp = now();
    return;
  }
  useFallback = true;
  audioReady = false;
  try { audio.pause(); } catch { /* ignore */ }
  fakeTime = clamp(resumeAt, 0, duration);
  fakeStamp = now();
  fakePlaying = keepPlaying;
  startNote.textContent = "音轨中断 · 静默时间轴继续";
}

/* --------------------------------------------------------------- painting */

function renderScene(target, time, shot) {
  target.save();
  target.setTransform(1, 0, 0, 1, 0, 0);
  target.globalAlpha = 1;
  target.globalCompositeOperation = "source-over";
  target.imageSmoothingEnabled = false;
  const renderer = rendererFor(shot);
  try {
    renderer(target, time, shot, Math.max(0, time - shot.start));
  } catch (err) {
    console.error(`[红] 镜头 ${shot.id} 渲染失败`, err);
    if (!failedRenderers.has(shot.id)) {
      failedRenderers.add(shot.id);
      toast(`镜头 ${shot.id} 绘制出错，详见控制台`);
    }
    fill(target, P.black, 0, 0, W, H);
    text(target, `${shot.id} · 渲染错误`, 20, 20, {
      size: 10, color: P.red3, shadow: false, threshold: 50,
    });
    text(target, String(err?.message || err), 20, 36, {
      size: 8, color: P.cream2, shadow: false, threshold: 50,
    });
  }
  target.restore();
}

function activeTransition(t) {
  for (const tr of TRANSITIONS) {
    if (!tr.dur) continue;
    let a;
    let b;
    if (tr.type === "fadeOut") {
      a = tr.at;
      b = tr.at + tr.dur;
    } else {
      a = tr.at - tr.dur / 2;
      b = tr.at + tr.dur / 2;
    }
    if (t >= a && t < b) return tr;
  }
  return null;
}

function drawSceneFrame(t, tr) {
  if (tr && tr.type === "cross") {
    const outShot = shotAt(tr.at - 0.001);
    const inShot = shotAt(tr.at + 0.001);
    const outTime = t < tr.at ? t : tr.at - 0.001;
    const inTime = t < tr.at ? tr.at + 0.001 : t;
    const p = smoothstep(clamp((t - (tr.at - tr.dur / 2)) / tr.dur, 0, 1));

    fill(ctx, P.black, 0, 0, W, H);
    renderScene(ctx, outTime, outShot);

    transitionCtx.save();
    transitionCtx.setTransform(1, 0, 0, 1, 0, 0);
    transitionCtx.globalAlpha = 1;
    transitionCtx.clearRect(0, 0, W, H);
    transitionCtx.restore();
    renderScene(transitionCtx, inTime, inShot);

    ctx.save();
    ctx.globalAlpha = p;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(transitionCanvas, 0, 0);
    ctx.restore();
    return;
  }

  const shot = shotAt(t);
  fill(ctx, P.black, 0, 0, W, H);
  renderScene(ctx, t, shot);
}

function drawTransitionOverlay(t, tr) {
  if (!tr) return;

  if (tr.type === "dip") {
    const local = Math.abs(t - tr.at) / (tr.dur / 2);
    const a = Math.pow(1 - clamp(local, 0, 1), 1.35);
    alphaRect(ctx, P.black, 0, 0, W, H, a);
    return;
  }

  if (tr.type === "flash") {
    const local = Math.abs(t - tr.at) / (tr.dur / 2);
    const a = Math.pow(1 - clamp(local, 0, 1), 0.8);
    if (a <= 0) return;
    alphaRect(ctx, P.cream, 0, 0, W, H, a * 0.72);
    alphaRect(ctx, P.red3, 0, 0, W, H, a * 0.16);
    return;
  }

  if (tr.type === "fadeOut") {
    const a = smoothstep(clamp((t - tr.at) / tr.dur, 0, 1));
    alphaRect(ctx, P.black, 0, 0, W, H, a);
  }
}

function drawFrame(t) {
  const time = clamp(t, 0, duration);
  lastT = time;

  const tr = activeTransition(time);
  drawSceneFrame(time, tr);
  drawTransitionOverlay(time, tr);
  drawDialogue(time);
  drawLyrics(time);

  if (debug) drawDebug(time, tr);

  frameCount++;
  const stamp = now();
  if (stamp - fpsStamp >= 1000) {
    fps = Math.round((frameCount * 1000) / (stamp - fpsStamp));
    frameCount = 0;
    fpsStamp = stamp;
  }
}

/* --------------------------------------------------------------- subtitles */

function drawLyrics(t) {
  const line = lyricAt(lyrics, t);
  if (!line) return;

  const fadeIn = smoothstep(clamp((t - line.start) / 0.22, 0, 1));
  const fadeOut = 1 - smoothstep(clamp((t - (line.end - 0.3)) / 0.3, 0, 1));
  const alpha = Math.min(fadeIn, fadeOut);
  if (alpha <= 0.01) return;

  const rise = Math.round((1 - fadeIn) * 3);

  // A low, quiet scrim so the lyric stays legible over both the sea and neon.
  for (let i = 0; i < 6; i++) {
    alphaRect(ctx, P.black, 0, 292 + i * 11, W, 11, (0.035 + i * 0.013) * alpha);
  }

  const hasSub = Boolean(line.sub);
  const mainY = (hasSub ? 307 : 313) + rise;
  const markY = (hasSub ? 302 : 308) + rise;
  fill(ctx, P.red2, W / 2 - 9, markY, 18, 1, 0.5 * alpha);

  const size = /^[\x00-\x7F\s]+$/.test(line.text) ? 13 : 14;
  text(ctx, line.text, W / 2, mainY, {
    size,
    color: P.cream,
    align: "center",
    letterSpacing: 1,
    shadow: true,
    shadowColor: "#0a080c",
    threshold: 76,
    alpha,
  });

  if (hasSub) {
    text(ctx, line.sub, W / 2, 326 + rise, {
      size: 7,
      color: P.cream3,
      align: "center",
      letterSpacing: 1,
      shadow: false,
      threshold: 58,
      alpha: alpha * 0.72,
    });
  }
}

/* ---------------------------------------------------------------- dialogue */

function drawDialogue(t) {
  for (const d of DIALOGUE) {
    if (t < d.start || t >= d.end) continue;

    const fadeIn = smoothstep(clamp((t - d.start) / 0.12, 0, 1));
    const fadeOut = 1 - smoothstep(clamp((t - (d.end - 0.18)) / 0.18, 0, 1));
    const alpha = Math.min(fadeIn, fadeOut);
    if (alpha <= 0.01) continue;

    const size = 12;
    const w = Math.min(230, textWidth(d.text, size) + 22);
    const h = 26;
    const x = Math.round(clamp(d.bx - w / 2, 8, W - w - 8));
    const y = Math.round(clamp(d.by, 8, 286 - h));
    const tipX = Math.round(clamp(d.tipX, x + 10, x + w - 10));
    const tipY = Math.round(Math.min(y + h + 8, 296));

    ctx.save();
    ctx.globalAlpha *= alpha;

    // Tail first, so the box closes over its seam.
    fill(ctx, P.ink, x + 2, y + 3, w, h, 0.26);
    fill(ctx, P.ink, tipX - 6, y + h - 1, 12, 9);
    fill(ctx, P.ink, tipX - 4, y + h + 2, 8, 7);
    fill(ctx, P.cream, tipX - 4, y + h - 2, 8, 7);
    fill(ctx, P.cream, tipX - 2, y + h + 2, 4, 5);

    fill(ctx, P.ink, x - 1, y + 2, w + 2, h, 0.55);
    fill(ctx, P.cream, x, y, w, h);
    fill(ctx, P.cream2, x, y + h - 1, w, 1);
    fill(ctx, P.red2, x + 7, y + 8, 2, 3);

    text(ctx, d.text, x + 11, y + 7, {
      size,
      color: P.ink,
      shadow: false,
      threshold: 72,
    });
    ctx.restore();
  }
}

/* -------------------------------------------------------------------- debug */

function drawDebug(t, tr) {
  const shot = shotAt(t);
  const act = actAt(t);
  const li = lyricIndexAt(lyrics, t);
  const line = li >= 0 ? lyrics[li] : null;
  const panelW = 218;
  const panelH = 86;

  fill(ctx, P.black, 8, 8, panelW, panelH, 0.72);
  fill(ctx, P.red1, 8, 8, 2, panelH, 0.8);

  const row = (label, value, y, color = P.cream2) => {
    text(ctx, label, 16, y, { size: 7, color: P.muted ?? P.cream3, shadow: false, threshold: 46 });
    text(ctx, value, 54, y, { size: 7, color, shadow: false, threshold: 46 });
  };

  row("TIME", `${t.toFixed(2)} / ${duration.toFixed(2)}`, 15, P.cream);
  row("SHOT", `${shot.id} · ${shot.render}`, 27, P.cream);
  row("ACT", `${act.index} ${act.label}`, 39);
  row("LYRIC", line ? `${li + 1}/${lyrics.length} ${line.text.slice(0, 10)}` : `— / ${lyrics.length}`, 51);
  row("JOIN", tr ? `${tr.type} @ ${tr.at.toFixed(2)}` : "cut", 63, tr ? P.red3 : P.cream2);
  row("CLOCK", `${audioReady && !useFallback ? "audio" : "silent"} · ${fps}fps`, 75, useFallback ? P.red3 : P.cream2);
  row("STATE", `${isPlaying() ? "playing" : "paused"}${manualMode ? " · manual" : ""}`, 87);
}

/* --------------------------------------------------------------- main loop */

function loop(stamp) {
  requestAnimationFrame(loop);

  if (manualMode) {
    if (dirty) {
      drawFrame(manualTime);
      syncUI(manualTime, true);
      dirty = false;
      lastPaintReal = now();
    }
    return;
  }

  const playing = isPlaying();
  const t = clockTime();

  if (playing && stamp - lastPaint >= 1000 / 30) {
    drawFrame(t);
    syncUI(t, false);
    lastPaint = stamp;
    lastPaintReal = now();
    dirty = false;
  } else if (dirty) {
    drawFrame(t);
    syncUI(t, true);
    dirty = false;
    lastPaint = stamp;
    lastPaintReal = now();
  } else if (ended && stamp - lastPaint > 600) {
    // Keep the last frame available but stop repainting a black card.
  }
}

/* Some browsers/embeds throttle requestAnimationFrame to 1 Hz when the window
 * is occluded, minimised or screenshotted by automation, even though the audio
 * keeps running.  The film then falls behind the soundtrack by up to a second.
 * A cheap watchdog repaints from the audio clock whenever rAF has gone quiet,
 * so picture and sound stay locked in every environment. */
setInterval(() => {
  if (manualMode || !isPlaying()) return;
  if (now() - lastPaintReal < 90) return;
  const t = clockTime();
  drawFrame(t);
  syncUI(t, false);
  lastPaintReal = now();
}, 33);

function drawNow() {
  if (manualMode) drawFrame(manualTime);
  else drawFrame(currentTime());
}

/* --------------------------------------------------------------------- UI */

function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

function setDurationUI() {
  if (Number.isFinite(mediaDuration)) duration = mediaDuration;
  durTimeEl.textContent = formatTime(duration);
  seekEl.max = String(duration);
}

function setSeekVisual(t) {
  const p = duration > 0 ? clamp(t / duration, 0, 1) : 0;
  seekEl.style.setProperty("--p", `${(p * 100).toFixed(2)}%`);
}

function syncPlayButton() {
  const playing = isPlaying();
  playBtn.classList.toggle("is-playing", playing);
  playBtn.setAttribute("aria-label", playing ? "暂停" : "播放");
}

function syncUI(t, force = false) {
  if (!scrubbing) {
    const value = clamp(t, 0, duration);
    seekEl.value = String(value);
    setSeekVisual(value);
    curTimeEl.textContent = formatTime(value);
  }

  const act = actAt(t);
  const shot = shotAt(t);

  if (force || act.id !== currentActId) {
    currentActId = act.id;
    actLabelEl.textContent = `${act.index} · ${act.label}`;
    updateChapterActive();
    if (!chapterDrawer.hidden) renderShotList(act);
  }

  if (force || shot.id !== currentShotId) {
    currentShotId = shot.id;
    shotLabelEl.textContent = `${shot.id} · ${shot.title}`;
    updateShotActive();
  }

  syncPlayButton();
}

/* Chapters and shot list */

function buildChapterList() {
  chapterList.textContent = "";
  for (const act of CHAPTERS) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chapter-item";
    btn.dataset.start = String(act.start);
    btn.dataset.act = act.id;

    const index = document.createElement("span");
    index.className = "chapter-index";
    index.textContent = act.index;

    const copy = document.createElement("span");
    copy.className = "chapter-copy";
    const name = document.createElement("span");
    name.className = "chapter-name";
    name.textContent = act.label;
    const tone = document.createElement("span");
    tone.className = "chapter-tone";
    tone.textContent = act.tone;
    copy.append(name, tone);

    const time = document.createElement("span");
    time.className = "chapter-time";
    time.textContent = formatTime(act.start);

    btn.append(index, copy, time);
    li.append(btn);
    chapterList.append(li);
  }
}

function renderShotList(act) {
  shotList.textContent = "";
  shotActLabel.textContent = `${act.index} · ${act.label}`;
  for (const shot of SHOTS.filter((s) => s.act === act.id)) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "shot-item";
    btn.dataset.start = String(shot.start);
    btn.dataset.shot = shot.id;

    const id = document.createElement("span");
    id.className = "shot-id";
    id.textContent = shot.id;
    const name = document.createElement("span");
    name.className = "shot-name";
    name.textContent = shot.title;
    const time = document.createElement("span");
    time.className = "shot-time";
    time.textContent = formatTime(shot.start);

    btn.append(id, name, time);
    li.append(btn);
    shotList.append(li);
  }
  updateShotActive();
}

function updateChapterActive() {
  const actId = actAt(lastT).id;
  for (const btn of chapterList.querySelectorAll(".chapter-item")) {
    btn.classList.toggle("active", btn.dataset.act === actId);
  }
}

function updateShotActive() {
  const id = shotAt(lastT).id;
  for (const btn of shotList.querySelectorAll(".shot-item")) {
    btn.classList.toggle("active", btn.dataset.shot === id);
  }
}

function jumpToChapter(start) {
  hasStarted = true;
  startScreen.classList.add("hidden");
  stage.classList.add("started");
  endHint.classList.add("hidden");
  setTime(start);
  closeDrawer();
}

function openDrawer(el) {
  if (!el) return;
  if (openDrawerEl && openDrawerEl !== el) {
    openDrawerEl.classList.remove("open");
    openDrawerEl.hidden = true;
  }
  openDrawerEl = el;
  el.hidden = false;
  scrim.hidden = false;

  if (el === chapterDrawer) {
    renderShotList(actAt(lastT));
    updateChapterActive();
  }

  requestAnimationFrame(() => {
    el.classList.add("open");
    scrim.classList.add("visible");
  });

  const close = el.querySelector(".drawer-close");
  close?.focus({ preventScroll: true });
}

function closeDrawer() {
  const el = openDrawerEl;
  if (!el) return;
  openDrawerEl = null;
  el.classList.remove("open");
  scrim.classList.remove("visible");

  window.setTimeout(() => {
    if (!el.classList.contains("open")) el.hidden = true;
    if (!openDrawerEl) scrim.hidden = true;
  }, 280);
}

/* Toast */

function toast(message, ms = 2200) {
  window.clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.classList.add("show");
  toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), ms);
}

/* Fullscreen */

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await player.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  } catch (err) {
    console.warn("[红] 无法全屏：", err);
    toast("浏览器未允许全屏");
  }
}

/* ------------------------------------------------------------------ events */

startBtn.addEventListener("click", beginPlayback);
replayEndBtn.addEventListener("click", replay);
playBtn.addEventListener("click", togglePlayback);

stage.addEventListener("click", (event) => {
  if (!hasStarted) return;
  if (event.target !== canvas && event.target !== stage) return;
  togglePlayback();
});

seekEl.addEventListener("pointerdown", () => { scrubbing = true; });
window.addEventListener("pointerup", () => {
  if (!scrubbing) return;
  scrubbing = false;
  setTime(Number(seekEl.value));
});
seekEl.addEventListener("input", () => {
  const t = Number(seekEl.value);
  setSeekVisual(t);
  curTimeEl.textContent = formatTime(t);
  setTime(t);
});
seekEl.addEventListener("change", () => {
  scrubbing = false;
  setTime(Number(seekEl.value));
});

volumeEl.addEventListener("input", () => {
  volumeValue = clamp(Number(volumeEl.value), 0, 1);
  audio.volume = volumeValue;
  if (volumeValue > 0 && muted) {
    muted = false;
    audio.muted = false;
    muteBtn.classList.remove("is-muted");
  }
});
muteBtn.addEventListener("click", () => {
  muted = !muted;
  audio.muted = muted;
  muteBtn.classList.toggle("is-muted", muted);
  muteBtn.setAttribute("aria-label", muted ? "取消静音" : "静音");
});

chaptersBtn.addEventListener("click", () => openDrawer(chapterDrawer));
infoBtn.addEventListener("click", () => openDrawer(infoDrawer));
scrim.addEventListener("click", closeDrawer);
for (const btn of document.querySelectorAll("[data-close]")) {
  btn.addEventListener("click", closeDrawer);
}

chapterList.addEventListener("click", (event) => {
  const btn = event.target.closest(".chapter-item");
  if (!btn) return;
  jumpToChapter(Number(btn.dataset.start));
});

shotList.addEventListener("click", (event) => {
  const btn = event.target.closest(".shot-item");
  if (!btn) return;
  jumpToChapter(Number(btn.dataset.start));
});

fullBtn.addEventListener("click", toggleFullscreen);
document.addEventListener("fullscreenchange", () => {
  fullBtn.setAttribute("aria-label", document.fullscreenElement ? "退出全屏" : "全屏");
});

audio.addEventListener("ended", () => {
  finishPlayback();
  drawFrame(duration);
  syncUI(duration, true);
});

audio.addEventListener("error", () => {
  if (!audioUrl) return;
  console.warn("[红] 音轨播放中断");
  switchToFallback(lastT, hasStarted && !ended && !audio.paused);
  toast("音轨中断，已切换静默时间轴");
});

document.addEventListener("keydown", (event) => {
  const tag = event.target?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

  if (event.key === "Escape") {
    if (openDrawerEl) closeDrawer();
    return;
  }

  switch (event.key.toLowerCase()) {
    case " ":
      event.preventDefault();
      if (loadingEl.classList.contains("hidden") && !hasStarted) beginPlayback();
      else togglePlayback();
      break;
    case "arrowleft":
      event.preventDefault();
      setTime(currentTime() - (event.shiftKey ? 1 : 5));
      break;
    case "arrowright":
      event.preventDefault();
      setTime(currentTime() + (event.shiftKey ? 1 : 5));
      break;
    case "j":
      event.preventDefault();
      setTime(currentTime() - 10);
      break;
    case "l":
      event.preventDefault();
      setTime(currentTime() + 10);
      break;
    case "c":
      event.preventDefault();
      if (openDrawerEl === chapterDrawer) closeDrawer();
      else openDrawer(chapterDrawer);
      break;
    case "f":
      event.preventDefault();
      toggleFullscreen();
      break;
    case "d":
      event.preventDefault();
      debug = !debug;
      api.debug = debug;
      dirty = true;
      toast(debug ? "调试信息：开" : "调试信息：关", 1100);
      break;
    case "m":
      event.preventDefault();
      muteBtn.click();
      break;
    case "r":
      event.preventDefault();
      replay();
      break;
    case "home":
      event.preventDefault();
      setTime(0);
      break;
    case "end":
      event.preventDefault();
      setTime(duration - 0.1);
      break;
    default:
      break;
  }
});

window.addEventListener("beforeunload", () => {
  if (audioUrl) URL.revokeObjectURL(audioUrl);
});

/* -------------------------------------------------------------------- API */

let resolveReady = null;
const readyPromise = new Promise((resolve) => { resolveReady = resolve; });

const api = {
  ready: false,
  audioReady: false,
  duration,
  lyrics,
  shots: SHOTS,
  acts: ACTS,
  chapters: CHAPTERS,
  transitions: TRANSITIONS,
  dialogue: DIALOGUE,
  whenReady: readyPromise,
  resolveReady,
  play,
  pause,
  toggle: togglePlayback,
  replay,
  seek: (t) => setTime(t),
  renderAt(t) {
    hasStarted = true;
    startScreen.classList.add("hidden");
    loadingEl.classList.add("hidden");
    stage.classList.add("started");
    endHint.classList.add("hidden");
    manualMode = true;
    manualTime = clamp(Number(t) || 0, 0, duration);
    ended = false;
    try { audio.pause(); } catch { /* ignore */ }
    drawFrame(manualTime);
    syncUI(manualTime, true);
    dirty = false;
  },
  drawNow() {
    drawNow();
    syncUI(lastT, true);
  },
  snapshot() {
    return canvas.toDataURL("image/png");
  },
  currentShot() { return shotAt(lastT); },
  currentAct() { return actAt(lastT); },
  currentLyric() { return lyricAt(lyrics, lastT); },
  transition() { return activeTransition(lastT); },
  setDebug(value) {
    debug = Boolean(value);
    api.debug = debug;
    dirty = true;
    drawNow();
  },
  toString() { return `[红] ${lastT.toFixed(2)}s · ${shotAt(lastT).id}`; },
};

Object.defineProperties(api, {
  time: { get: () => lastT, enumerable: true },
  mediaTime: { get: () => (manualMode ? manualTime : currentTime()), enumerable: true },
  audioTime: { get: () => audio.currentTime || 0, enumerable: true },
  audioDuration: { get: () => (Number.isFinite(audio.duration) ? audio.duration : 0), enumerable: true },
  debug: { get: () => debug, set: (v) => { debug = Boolean(v); }, enumerable: true },
  fallback: { get: () => useFallback, enumerable: true },
});

window.__HONG__ = api;

/* ------------------------------------------------------------------- boot */

buildChapterList();
setDurationUI();
syncUI(0, true);
init().catch((err) => {
  console.error("[红] 初始化失败", err);
  loadingLabel.textContent = "初始化失败";
  loadingNote.textContent = String(err?.message || err);
  loadingEl.classList.remove("hidden");
  api.ready = false;
  api.resolveReady?.(api);
});
