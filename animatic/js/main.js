import { SpriteBank } from "../../js/engine/sprites.js";
import { drawText } from "../../js/engine/pixeltext.js";
import { PAL } from "../../js/engine/palette.js";
import { clamp, smoothstep, envelope } from "../../js/engine/util.js";
import { W, H, variantAtlas } from "./art.js";
import {
  SCENES, BEATS, TRANSITIONS, DIALOGUE,
  TOTAL_DURATION, AUDIO_END, beatAt,
} from "./timeline.js";
import { createPrologue, createReturn, createPost } from "./scenes/present.js";
import {
  createFirstMeet, createPandemic, createConfession,
  createClasses, createHigh2,
} from "./scenes/school.js";
import { createHiking } from "./scenes/outdoors.js";
import { createHigh3 } from "./scenes/high3.js";
import { createBreakup } from "./scenes/university.js";

const $ = (id) => document.getElementById(id);

const canvas = $("screen");
const ctx = canvas.getContext("2d", { alpha: false });
ctx.imageSmoothingEnabled = false;

const stage = $("stage");
const loading = $("loading");
const playBtn = $("play");
const replayBtn = $("replay");
const fsBtn = $("fs");
const listBtn = $("list-toggle");
const fsExit = $("fs-exit");
const scrub = $("scrub");
const timeNow = $("time-now");
const totalLabel = $("time-total");
const currentBeatLabel = $("current-beat");
const chapterStrip = $("chapter-strip");
const drawer = $("scene-drawer");
const drawerList = $("scene-list");
const audio = $("audio");
const audioStatus = $("audio-status");

const buffers = [document.createElement("canvas"), document.createElement("canvas")];
const bufCtxs = buffers.map((b) => {
  b.width = W;
  b.height = H;
  const c = b.getContext("2d", { alpha: false });
  c.imageSmoothingEnabled = false;
  return c;
});

let scenes = [];
let booted = false;
let playing = false;
let timelineTime = 0;
let lastFrame = performance.now();
let lastUiAt = 0;
let fps = 0;
let fpsAccum = 0;
let fpsFrames = 0;
let debugOn = false;
let scaleDev = 1;
let cssScale = 1;
let chapterEls = [];
let drawerEls = [];
let activeBeatIndex = -1;
let audioFailed = false;
let silenceAnchor = 0;

const fmt = (t) => {
  const mm = Math.floor(t / 60);
  const ss = t - mm * 60;
  return `${String(mm).padStart(2, "0")}:${ss.toFixed(1).padStart(4, "0")}`;
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const done = () => resolve(img);
      if (img.decode) img.decode().then(done).catch(done);
      else done();
    };
    img.onerror = () => reject(new Error(`无法载入 ${src}`));
    img.src = src;
  });
}

/* The bundled MP3 is loaded once into a same-origin blob.  This keeps seeking
 * exact even when a simple local static server does not implement HTTP Range
 * requests.  The audio file itself is never copied, converted, or modified. */
async function prepareAudio() {
  const original = audio.getAttribute("src");
  if (!original) return;
  try {
    const res = await fetch(original, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    audio.src = url;
    audio.load();
    await new Promise((resolve, reject) => {
      const onReady = () => { cleanup(); resolve(); };
      const onError = () => { cleanup(); reject(audio.error || new Error("audio decode failed")); };
      const cleanup = () => {
        audio.removeEventListener("loadedmetadata", onReady);
        audio.removeEventListener("error", onError);
      };
      audio.addEventListener("loadedmetadata", onReady);
      audio.addEventListener("error", onError);
    });
    try { audio.currentTime = 0; } catch (err) { /* ignore */ }
    audioStatus.textContent = `真实音轨 · ${fmt(audio.duration || AUDIO_END)}`;
  } catch (err) {
    console.warn("Audio could not be buffered for seeking; using direct stream", err);
    audio.src = original;
    audio.load();
  }
}

async function loadAssets() {
  const paths = {
    gate: "../assets/bg/gate_dusk.png",
    gateFg: "../assets/bg/gate_dusk_fg.png",
    classroom: "../assets/bg/classroom_day.png",
    classroomFg: "../assets/bg/classroom_day_fg.png",
    bedroomMale: "../assets/bg/bedroom_male_night.png",
    bedroomFemale: "../assets/bg/bedroom_female_night.png",
    bedroomMaleFg: "../assets/bg/bedroom_male_fg.png",
    bedroomFemaleFg: "../assets/bg/bedroom_female_fg.png",
    male: "../assets/sprites/male.png",
    female: "../assets/sprites/female.png",
    glowBlue: "../assets/fx/glow_blue.png",
    glowWarm: "../assets/fx/glow_warm.png",
    glowMoon: "../assets/fx/glow_moon.png",
  };

  const entries = await Promise.all(
    Object.entries(paths).map(async ([key, src]) => [key, await loadImage(src)])
  );
  const imgs = Object.fromEntries(entries);

  const res = await fetch("../assets/sprites/manifest.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`无法载入精灵表清单（HTTP ${res.status}）`);
  const manifest = await res.json();

  // Runtime palette variants.  The PNG atlases themselves are never modified.
  const variants = {
    adultMale: variantAtlas(imgs.male, {
      "#2f3f60": "#3b463c",
      "#1f2a44": "#2a332a",
      "#4a5f86": "#59644d",
      "#f2eee2": "#e6e0d2",
      "#cfc8b7": "#bdb5a4",
    }),
    uniMale: variantAtlas(imgs.male, {
      "#2f3f60": "#3a4454",
      "#1f2a44": "#29313f",
      "#4a5f86": "#5c6878",
      "#f2eee2": "#e4dfd6",
    }),
    uniFemale: variantAtlas(imgs.female, {
      "#2f3f60": "#4a3f52",
      "#1f2a44": "#332b3c",
      "#4a5f86": "#6b5d72",
      "#f2eee2": "#e4dfd6",
      "#b4473e": "#7a5a54",
      "#c9564f": "#8d6a62",
    }),
    casualMale: variantAtlas(imgs.male, {
      "#2f3f60": "#5b4f43",
      "#1f2a44": "#3e352d",
      "#4a5f86": "#7d6c5b",
      "#f2eee2": "#efe7d8",
    }),
    casualFemale: variantAtlas(imgs.female, {
      "#2f3f60": "#c9854a",
      "#1f2a44": "#8a5a38",
      "#4a5f86": "#e0a468",
      "#f2eee2": "#efe7d8",
      "#b4473e": "#a8433e",
      "#c9564f": "#bd5a51",
    }),
  };

  return {
    bg: {
      gate: imgs.gate,
      gateFg: imgs.gateFg,
      classroom: imgs.classroom,
      classroomFg: imgs.classroomFg,
      bedroomMale: imgs.bedroomMale,
      bedroomFemale: imgs.bedroomFemale,
      bedroomMaleFg: imgs.bedroomMaleFg,
      bedroomFemaleFg: imgs.bedroomFemaleFg,
    },
    fx: {
      glowBlue: imgs.glowBlue,
      glowWarm: imgs.glowWarm,
      glowMoon: imgs.glowMoon,
    },
    sprites: new SpriteBank({ male: imgs.male, female: imgs.female }, manifest),
    variants,
  };
}

function buildScenes(assets) {
  return {
    prologue: createPrologue(assets),
    firstMeet: createFirstMeet(assets),
    pandemic: createPandemic(assets),
    confession: createConfession(assets),
    classes: createClasses(assets),
    hiking: createHiking(assets),
    high2: createHigh2(assets),
    high3: createHigh3(assets),
    breakup: createBreakup(assets),
    return: createReturn(assets),
    post: createPost(assets),
  };
}

function sceneIndexAt(t) {
  for (let i = 0; i < SCENES.length; i++) {
    if (t >= SCENES[i].start && t < SCENES[i].end) return i;
  }
  return t >= TOTAL_DURATION - 0.001 ? SCENES.length - 1 : 0;
}

function drawSceneTo(target, index, t) {
  target.setTransform(1, 0, 0, 1, 0, 0);
  target.globalAlpha = 1;
  target.globalCompositeOperation = "source-over";
  target.imageSmoothingEnabled = false;
  target.fillStyle = "#000";
  target.fillRect(0, 0, W, H);
  const entry = SCENES[index];
  if (!entry) return;
  const scene = scenes[entry.id];
  if (!scene) return;
  scene.draw(target, Math.max(0, t - entry.start), t);
}

function crossfadeAt(t) {
  for (const tr of TRANSITIONS) {
    if (tr.type !== "cross" || tr.dur <= 0) continue;
    if (t >= tr.at && t < tr.at + tr.dur) {
      return {
        from: Math.max(0, sceneIndexAt(tr.at) - 1),
        to: sceneIndexAt(tr.at + 0.001),
        q: smoothstep((t - tr.at) / tr.dur),
      };
    }
  }
  return null;
}

function whiteAt(t) {
  for (const tr of TRANSITIONS) {
    if (tr.type !== "white" || tr.dur <= 0) continue;
    const lead = 0.18;
    if (t >= tr.at - lead && t < tr.at) {
      return smoothstep((t - (tr.at - lead)) / lead) * 0.9;
    }
    if (t >= tr.at && t < tr.at + tr.dur) {
      return 1 - smoothstep((t - tr.at) / tr.dur);
    }
  }
  return 0;
}

function dipAt(t) {
  for (const tr of TRANSITIONS) {
    if (tr.type !== "dip" || tr.dur <= 0) continue;
    if (t >= tr.at && t < tr.at + tr.dur) {
      return smoothstep((t - tr.at) / tr.dur);
    }
  }
  return 0;
}

function drawDialogue(t) {
  if (t >= AUDIO_END) return;
  let line = null;
  for (const d of DIALOGUE) {
    if (t >= d.start && t < d.end) { line = d; break; }
  }
  if (!line) return;

  const a = envelope(t, line.start, line.start + 0.16, line.end - 0.16, line.end);
  if (a <= 0) return;

  ctx.save();
  ctx.globalAlpha = a * 0.52;
  fillRect("#07070a", 0, 316, W, 44);
  ctx.globalAlpha = a * 0.5;
  fillRect(line.who === "him" ? PAL.warmMid : PAL.redSoft, 292, 319, 56, 1);
  ctx.globalAlpha = a;
  drawText(ctx, line.text, 320, 326, {
    size: 14,
    color: PAL.cream,
    align: "center",
    shadow: true,
    shadowColor: "#000000",
    threshold: 96,
  });
  ctx.restore();
}

function fillRect(color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawDebug(t) {
  if (!debugOn) return;
  const entry = SCENES[sceneIndexAt(t)];
  ctx.save();
  ctx.globalAlpha = 0.8;
  fillRect("rgba(8,7,12,0.7)", 8, 8, 196, 44);
  drawText(ctx, `${fmt(t)}  ${entry ? entry.id : "—"}`, 14, 12, {
    size: 9, color: PAL.warm, threshold: 90,
  });
  drawText(ctx, `local ${(t - (entry ? entry.start : 0)).toFixed(2)}s · ${fps.toFixed(0)}fps`, 14, 26, {
    size: 8, color: PAL.cream, threshold: 90,
  });
  drawText(ctx, `audio ${audioFailed ? "unavailable" : `${audio.currentTime.toFixed(2)}s`}`, 14, 38, {
    size: 8, color: PAL.cool, threshold: 90,
  });
  ctx.restore();
}

function drawAt(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  const xf = crossfadeAt(t);
  if (xf) {
    drawSceneTo(bufCtxs[0], xf.from, t);
    drawSceneTo(bufCtxs[1], xf.to, t);
    ctx.globalAlpha = 1 - xf.q;
    ctx.drawImage(buffers[0], 0, 0);
    ctx.globalAlpha = xf.q;
    ctx.drawImage(buffers[1], 0, 0);
    ctx.globalAlpha = 1;
  } else {
    drawSceneTo(bufCtxs[0], sceneIndexAt(t), t);
    ctx.drawImage(buffers[0], 0, 0);
  }

  const white = whiteAt(t);
  if (white > 0) {
    ctx.globalAlpha = white;
    ctx.fillStyle = "#fff7e8";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  const dip = dipAt(t);
  if (dip > 0) {
    ctx.globalAlpha = dip;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  if (t < 1.5) {
    ctx.globalAlpha = 1 - smoothstep(t / 1.5);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  drawDialogue(t);
  drawDebug(t);
}

function currentSceneLabel(t) {
  const beat = beatAt(t);
  return `${beat.index} · ${beat.label}`;
}

function updateUI(now, force = false) {
  if (!force && now - lastUiAt < 70) return;
  lastUiAt = now;

  const t = timelineTime;
  timeNow.textContent = fmt(t);
  scrub.value = String(t);
  scrub.style.setProperty("--progress", `${(t / TOTAL_DURATION) * 100}%`);

  if (t >= TOTAL_DURATION - 0.01) playBtn.textContent = "重播";
  else if (playing) playBtn.textContent = "暂停";
  else playBtn.textContent = "播放";
  playBtn.setAttribute("aria-pressed", String(playing));

  const beat = beatAt(t);
  currentBeatLabel.textContent = currentSceneLabel(t);
  const idx = BEATS.indexOf(beat);
  if (idx !== activeBeatIndex) {
    if (chapterEls[activeBeatIndex]) chapterEls[activeBeatIndex].classList.remove("active");
    if (drawerEls[activeBeatIndex]) drawerEls[activeBeatIndex].classList.remove("active");
    activeBeatIndex = idx;
    if (chapterEls[idx]) chapterEls[idx].classList.add("active");
    if (drawerEls[idx]) {
      drawerEls[idx].classList.add("active");
      if (!drawer.hidden) drawerEls[idx].scrollIntoView({ block: "nearest" });
    }
  }
}

function play() {
  if (!booted) return;
  if (timelineTime >= TOTAL_DURATION - 0.01) timelineTime = 0;
  playing = true;
  lastFrame = performance.now();
  silenceAnchor = timelineTime >= AUDIO_END
    ? performance.now() - (timelineTime - AUDIO_END) * 1000
    : 0;

  if (timelineTime < AUDIO_END - 0.01) {
    try {
      if (Math.abs(audio.currentTime - timelineTime) > 0.08) {
        audio.currentTime = timelineTime;
      }
    } catch (err) {
      console.warn("Audio seek failed", err);
    }
    audio.play().then(() => {
      audioFailed = false;
      audioStatus.textContent = "真实音轨 · 已同步";
    }).catch((err) => {
      audioFailed = true;
      audioStatus.textContent = "音轨未启动 · 画面继续";
      console.warn("Audio playback blocked", err);
    });
  } else {
    audio.pause();
  }
  updateUI(performance.now(), true);
}

function pause() {
  playing = false;
  audio.pause();
  updateUI(performance.now(), true);
}

function toggle() {
  if (playing) pause();
  else play();
}

function seek(t) {
  timelineTime = clamp(t, 0, TOTAL_DURATION);
  silenceAnchor = timelineTime >= AUDIO_END
    ? performance.now() - (timelineTime - AUDIO_END) * 1000
    : 0;
  audio.pause();
  if (timelineTime < AUDIO_END - 0.005) {
    try { audio.currentTime = timelineTime; } catch (err) { /* metadata may not be ready */ }
    if (playing) {
      audio.play().catch(() => {});
    }
  } else {
    try { audio.currentTime = Math.min(AUDIO_END, audio.duration || AUDIO_END); } catch (err) { /* ignore */ }
  }
  if (timelineTime >= TOTAL_DURATION - 0.01) playing = false;
  drawAt(timelineTime);
  updateUI(performance.now(), true);
}

function replay() {
  seek(0);
  play();
}

function tick(now) {
  step(now);
  requestAnimationFrame(tick);
}

/* Some environments throttle requestAnimationFrame to a crawl (occluded
 * windows, some embedded browsers).  Audio must still drive the picture, so a
 * low-frequency watchdog steps the same clock when rAF has gone quiet. */
let lastStepAt = 0;

function step(now) {
  const dt = Math.min(0.12, Math.max(0, (now - lastFrame) / 1000));
  lastFrame = now;
  lastStepAt = now;

  if (dt > 0 && dt < 500) {
    fpsAccum += dt * 1000;
    fpsFrames++;
    if (fpsAccum >= 500) {
      fps = (fpsFrames * 1000) / fpsAccum;
      fpsAccum = 0;
      fpsFrames = 0;
    }
  }

  if (playing) {
    if (!audio.paused && !audio.ended) {
      // The audio element is the master clock while it is sounding.
      silenceAnchor = 0;
      if (audio.readyState >= 2) {
        const at = audio.currentTime;
        if (at > timelineTime + 0.6 && timelineTime < 0.4) {
          // The browser restarted the track under us; keep the picture at 0.
          timelineTime = 0;
        } else {
          timelineTime = Math.min(at, AUDIO_END);
        }
      }
    } else if (audio.ended && timelineTime < AUDIO_END - 0.02) {
      timelineTime = AUDIO_END;
      silenceAnchor = now;
    } else if (timelineTime >= AUDIO_END) {
      // Planned post-song silence: wall-clock based so it cannot drift when
      // frames are throttled.
      if (!silenceAnchor) silenceAnchor = now - (timelineTime - AUDIO_END) * 1000;
      timelineTime = Math.min(TOTAL_DURATION, AUDIO_END + (now - silenceAnchor) / 1000);
    } else {
      // No audio available (blocked or failed); keep the picture moving.
      timelineTime += dt;
    }

    if (timelineTime >= AUDIO_END && !audio.paused) {
      audio.pause();
    }
    if (timelineTime >= TOTAL_DURATION) {
      timelineTime = TOTAL_DURATION;
      playing = false;
      audio.pause();
    }
  }

  drawAt(timelineTime);
  updateUI(now);
}

function resize() {
  const rect = stage.getBoundingClientRect();
  const isFullscreen = document.fullscreenElement === stage;
  const pad = isFullscreen ? 0 : 16;
  const availW = Math.max(1, rect.width - pad);
  const availH = Math.max(1, rect.height - pad);
  const dpr = window.devicePixelRatio || 1;

  const maxDev = Math.min((availW * dpr) / W, (availH * dpr) / H);
  scaleDev = Math.floor(maxDev);
  if (scaleDev < 1) scaleDev = Math.max(0.35, maxDev);

  cssScale = scaleDev / dpr;
  // Round, not floor: devicePixelRatio is often 0.99999997, and flooring
  // would shave a whole CSS pixel off a perfectly integer 1x scale.
  canvas.style.width = `${Math.round(W * cssScale)}px`;
  canvas.style.height = `${Math.round(H * cssScale)}px`;
}

function buildChapterUI() {
  chapterStrip.innerHTML = "";
  drawerList.innerHTML = "";
  chapterEls = [];
  drawerEls = [];

  BEATS.forEach((beat, i) => {
    const seg = document.createElement("button");
    seg.type = "button";
    seg.className = `chapter-seg beat-${beat.index === "序" ? "prologue" : beat.index}`;
    seg.style.flexGrow = String(beat.end - beat.start);
    seg.title = `${beat.index} ${beat.label} · ${fmt(beat.start)}–${fmt(beat.end)}`;
    seg.setAttribute("aria-label", seg.title);
    const label = document.createElement("span");
    label.textContent = `${beat.index} ${beat.label}`;
    seg.appendChild(label);
    seg.addEventListener("click", () => {
      seek(beat.start);
      seg.blur();
    });
    chapterStrip.appendChild(seg);
    chapterEls.push(seg);

    const row = document.createElement("button");
    row.type = "button";
    row.className = "scene-row";
    row.innerHTML = `
      <span class="scene-index">${beat.index}</span>
      <span class="scene-main">
        <b>${beat.label}</b>
        <em>${beat.status}</em>
      </span>
      <span class="scene-time">${fmt(beat.start)}<br>${fmt(beat.end)}</span>
    `;
    row.addEventListener("click", () => {
      seek(beat.start);
      row.blur();
    });
    drawerList.appendChild(row);
    drawerEls.push(row);
  });
}

function setDebug(on) {
  debugOn = Boolean(on);
  updateUI(performance.now(), true);
}

async function boot() {
  try {
    const [assets] = await Promise.all([loadAssets(), prepareAudio()]);
    scenes = buildScenes(assets);
    buildChapterUI();
    totalLabel.textContent = fmt(TOTAL_DURATION);
    booted = true;
    resize();
    drawAt(0);
    updateUI(performance.now(), true);
    loading.hidden = true;
    lastFrame = performance.now();
    requestAnimationFrame(tick);

    audio.addEventListener("loadedmetadata", () => {
      audioStatus.textContent = `真实音轨 · ${fmt(audio.duration || AUDIO_END)}`;
    });
    audio.addEventListener("ended", () => {
      audioStatus.textContent = "歌后留白 · 静默";
    });
    audio.addEventListener("error", () => {
      audioFailed = true;
      audioStatus.textContent = "音轨读取失败 · 仅画面";
    });

    window.__ANIMATIC__ = {
      get ready() { return booted; },
      get time() { return timelineTime; },
      get duration() { return TOTAL_DURATION; },
      get playing() { return playing; },
      get audioTime() { return audio.currentTime; },
      get audioDuration() { return audio.duration; },
      scenes: SCENES,
      beats: BEATS,
      transitions: TRANSITIONS,
      seek,
      play,
      pause,
      toggle,
      replay,
      debug: setDebug,
      drawNow() {
        drawAt(timelineTime);
        updateUI(performance.now(), true);
      },
      get canvas() { return canvas; },
      get audio() { return audio; },
    };
    console.info("[ANIMATIC] ready — window.__ANIMATIC__ available");
  } catch (err) {
    console.error(err);
    loading.classList.add("error");
    loading.textContent = `素材载入失败：${err.message}\n请确认通过本地服务器访问 /animatic/`;
  }
}

playBtn.addEventListener("click", () => {
  toggle();
  playBtn.blur();
});
replayBtn.addEventListener("click", () => {
  replay();
  replayBtn.blur();
});
fsBtn.addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) await stage.requestFullscreen();
    else await document.exitFullscreen();
  } catch (err) {
    console.warn("Fullscreen unavailable", err);
  }
  fsBtn.blur();
});
listBtn.addEventListener("click", () => {
  drawer.hidden = !drawer.hidden;
  listBtn.setAttribute("aria-pressed", String(!drawer.hidden));
  listBtn.textContent = drawer.hidden ? "分镜列表" : "收起列表";
  if (!drawer.hidden) updateUI(performance.now(), true);
  listBtn.blur();
});
canvas.addEventListener("click", () => toggle());

scrub.addEventListener("input", () => {
  seek(parseFloat(scrub.value));
});

fsExit.addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
  } catch (err) {
    console.warn("Exit fullscreen unavailable", err);
  }
});

document.addEventListener("fullscreenchange", () => {
  const on = Boolean(document.fullscreenElement);
  fsBtn.textContent = on ? "退出全屏" : "全屏";
  fsExit.hidden = !on;
  setTimeout(resize, 60);
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && playing) pause();
  lastFrame = performance.now();
});

window.addEventListener("keydown", (e) => {
  if (!booted) return;
  const tag = e.target?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  if (tag === "BUTTON" && (e.code === "Space" || e.code === "Enter")) return;

  switch (e.code) {
    case "Space":
      e.preventDefault();
      toggle();
      break;
    case "ArrowLeft":
      e.preventDefault();
      seek(timelineTime - (e.shiftKey ? 1 : 5));
      break;
    case "ArrowRight":
      e.preventDefault();
      seek(timelineTime + (e.shiftKey ? 1 : 5));
      break;
    case "Home":
      e.preventDefault();
      seek(0);
      break;
    case "End":
      e.preventDefault();
      seek(TOTAL_DURATION);
      break;
    case "KeyR":
      e.preventDefault();
      replay();
      break;
    case "KeyF":
      e.preventDefault();
      fsBtn.click();
      break;
    case "KeyD":
      e.preventDefault();
      setDebug(!debugOn);
      break;
    case "KeyL":
      e.preventDefault();
      listBtn.click();
      break;
    default:
      break;
  }
});

setInterval(() => {
  if (!booted || !playing) return;
  const now = performance.now();
  if (now - lastStepAt > 260) step(now);
}, 120);

window.addEventListener("resize", resize);
if ("ResizeObserver" in window) {
  new ResizeObserver(() => resize()).observe(stage);
}

resize();
boot();
