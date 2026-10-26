import { PAL } from "../../js/engine/palette.js";

/* The shared palette predates the paper surfaces used by V2's album and
 * yearbook.  Fill them in locally so V1's files and V1's palette stay
 * untouched. */
if (!PAL.paper) PAL.paper = "#e8dcc8";
if (!PAL.paperSh) PAL.paperSh = "#cfc0a8";
import { drawText, measureText } from "../../js/engine/pixeltext.js";
import { clamp, smoothstep } from "../../js/engine/util.js";

export const W = 640;
export const H = 360;

/* A few cinematic colours that sit beside the existing 16-bit palette. */
export const C = {
  skyNight: "#141a2c",
  skyDuskTop: "#3d3a5b",
  skyDuskMid: "#8f6676",
  skyDuskLow: "#d68a68",
  skyDawnTop: "#29354a",
  skyDawnMid: "#727d8c",
  skyDawnLow: "#d7b48c",
  cityFar: "#2a3144",
  cityMid: "#202636",
  cityNear: "#161b28",
  wallWarm: "#5d4f45",
  wallWarmDk: "#463b35",
  wallCool: "#273342",
  wallCoolDk: "#1c2633",
  floorWarm: "#4b3930",
  floorCool: "#242b35",
  wood: "#6b5443",
  woodDk: "#4a3a30",
  woodHi: "#8d7058",
  paper: "#e8d8c8",
  paperSh: "#c8b6a4",
  glass: "#a9c7d2",
  glassDk: "#6f98b4",
  leaf: "#3f5d4a",
  leafHi: "#88a06e",
  leafDk: "#263c32",
  stone: "#6f6a67",
  stoneDk: "#4c4847",
  white: "#f2eee2",
};

export function fill(ctx, color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function vBands(ctx, x, y, w, h, bands) {
  let cursor = Math.round(y);
  const total = bands.reduce((sum, b) => sum + b[1], 0);
  for (let i = 0; i < bands.length; i++) {
    const end = i === bands.length - 1
      ? Math.round(y + h)
      : Math.round(y + (h * bands.slice(0, i + 1).reduce((s, b) => s + b[1], 0)) / total);
    fill(ctx, bands[i][0], x, cursor, w, end - cursor);
    cursor = end;
  }
}

export function hBands(ctx, x, y, w, h, bands) {
  let cursor = Math.round(x);
  const total = bands.reduce((sum, b) => sum + b[1], 0);
  for (let i = 0; i < bands.length; i++) {
    const end = i === bands.length - 1
      ? Math.round(x + w)
      : Math.round(x + (w * bands.slice(0, i + 1).reduce((s, b) => s + b[1], 0)) / total);
    fill(ctx, bands[i][0], cursor, y, end - cursor, h);
    cursor = end;
  }
}

export function dither(ctx, color, x, y, w, h, step = 2, phase = 0) {
  ctx.fillStyle = color;
  const x0 = Math.round(x);
  const y0 = Math.round(y);
  const x1 = Math.round(x + w);
  const y1 = Math.round(y + h);
  for (let yy = y0; yy < y1; yy += step) {
    for (let xx = x0 + ((yy / step + phase) % 2 ? 1 : 0); xx < x1; xx += step) {
      ctx.fillRect(xx, yy, 1, 1);
    }
  }
}

export function pixelCircle(ctx, color, cx, cy, r) {
  ctx.fillStyle = color;
  const rr = Math.max(1, Math.round(r));
  for (let y = -rr; y <= rr; y++) {
    const half = Math.floor(Math.sqrt(Math.max(0, rr * rr - y * y)));
    ctx.fillRect(Math.round(cx - half), Math.round(cy + y), half * 2 + 1, 1);
  }
}

export function glow(ctx, img, cx, cy, w, h, alpha = 1) {
  if (!img) return;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha *= alpha;
  ctx.drawImage(img, Math.round(cx - w / 2), Math.round(cy - h / 2), Math.round(w), Math.round(h));
  ctx.restore();
}

export function drawSpriteScaled(ctx, bank, who, frame, x, y, scale = 1, opts = {}) {
  const rect = bank.manifest.characters[who]?.[frame];
  if (!rect) return;
  const img = opts.image || bank.images[who];
  if (!img) return;
  const [sx, sy, sw, sh] = rect;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (opts.alpha !== undefined) ctx.globalAlpha *= opts.alpha;
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale((opts.flipX ? -1 : 1) * scale, scale);
  ctx.drawImage(img, sx, sy, sw, sh, -bank.anchorX, -bank.anchorY, sw, sh);
  ctx.restore();
}

/**
 * Head-and-shoulders crop of a sprite cell.  Only used by temporary animatic
 * close-ups; it does not add a new frame of character animation.
 */
export function drawSpritePortrait(ctx, bank, who, frame, cx, cy, scale = 6, opts = {}) {
  const rect = bank.manifest.characters[who]?.[frame];
  if (!rect) return;
  const img = opts.image || bank.images[who];
  if (!img) return;
  const [sx, sy] = rect;
  const cropX = opts.cropX ?? 8;
  const cropY = opts.cropY ?? 4;
  const cropW = opts.cropW ?? 32;
  const cropH = opts.cropH ?? 38;
  const focusX = opts.focusX ?? cropX + cropW / 2;
  const focusY = opts.focusY ?? cropY + 22;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (opts.alpha !== undefined) ctx.globalAlpha *= opts.alpha;
  ctx.translate(Math.round(cx), Math.round(cy));
  ctx.scale((opts.flipX ? -1 : 1) * scale, scale);
  ctx.translate(-focusX, -focusY);

  // The atlas leaves a transparent band where the neck should be.  At
  // full-body scale it reads as a shadow; at portrait scale the head looks
  // detached.  A small skin bridge behind the sprite closes that band.
  if (opts.neckRect) {
    const [nx, ny, nw, nh] = opts.neckRect;
    ctx.fillStyle = PAL.skin;
    ctx.fillRect(nx, ny, nw, nh);
    ctx.fillStyle = PAL.skinSh;
    ctx.fillRect(nx, ny + nh - 2, nw, 2);
  }

  ctx.drawImage(img, sx + cropX, sy + cropY, cropW, cropH, cropX, cropY, cropW, cropH);
  ctx.restore();
}

function hexToRgb(hex) {
  const v = hex.slice(1);
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ];
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

/** Runtime-only palette swap.  The source PNGs are never rewritten. */
export function variantAtlas(image, map) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, 0, 0);

  const out = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const replacements = new Map(
    Object.entries(map).map(([from, to]) => [hexToRgb(from).join(","), hexToRgb(to)])
  );

  for (let i = 0; i < out.data.length; i += 4) {
    if (out.data[i + 3] === 0) continue;
    const key = `${out.data[i]},${out.data[i + 1]},${out.data[i + 2]}`;
    const rgb = replacements.get(key);
    if (rgb) {
      out.data[i] = rgb[0];
      out.data[i + 1] = rgb[1];
      out.data[i + 2] = rgb[2];
    }
  }
  ctx.putImageData(out, 0, 0);
  return canvas;
}

export function drawSnow(ctx, t, x, y, w, h, count = 42, color = C.white) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  ctx.clip();
  for (let i = 0; i < count; i++) {
    const drift = Math.sin(t * 0.35 + i * 1.7) * 7;
    const px = x + ((i * 53 + t * (3 + (i % 5))) % w) + drift;
    const py = y + ((i * 37 + t * (10 + (i % 7) * 3)) % h);
    ctx.globalAlpha = 0.25 + (i % 4) * 0.12;
    ctx.fillStyle = i % 7 === 0 ? PAL.warm : color;
    ctx.fillRect(Math.round(px), Math.round(py), i % 6 === 0 ? 2 : 1, 1);
  }
  ctx.restore();
}

export function drawRain(ctx, t, x, y, w, h, count = 34, color = PAL.cool) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  ctx.clip();
  for (let i = 0; i < count; i++) {
    const px = x + ((i * 47 + t * 5) % w);
    const py = y + ((i * 31 + t * (22 + (i % 6) * 4)) % h);
    ctx.globalAlpha = 0.12 + (i % 5) * 0.05;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(px), Math.round(py), 1, 3 + (i % 3));
  }
  ctx.restore();
}

export function drawDust(ctx, t, x, y, w, h, count = 26, color = PAL.warm, alpha = 1) {
  for (let i = 0; i < count; i++) {
    const px = x + ((i * 67 + Math.sin(t * 0.4 + i) * 9 + t * 1.4) % w);
    const py = y + ((i * 41 + t * (2 + (i % 4))) % h);
    const twinkle = 0.3 + 0.7 * Math.max(0, Math.sin(t * 1.2 + i * 2.1));
    ctx.globalAlpha = alpha * (0.09 + (i % 4) * 0.04) * twinkle;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(px), Math.round(py), 1, 1);
  }
  ctx.globalAlpha = 1;
}

export function drawBirds(ctx, t, x, y, count = 4, color = C.cityNear) {
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const bx = x + ((i * 61 + t * 7) % 260);
    const by = y + Math.sin(t * 0.5 + i * 1.3) * 5 + i * 7;
    const flap = Math.sin(t * 3 + i) > 0 ? 1 : -1;
    ctx.fillRect(Math.round(bx), Math.round(by), 1, 1);
    ctx.fillRect(Math.round(bx) - 2, Math.round(by) - flap, 2, 1);
    ctx.fillRect(Math.round(bx) + 2, Math.round(by) - flap, 2, 1);
  }
}

export function drawCloud(ctx, x, y, scale, color) {
  fill(ctx, color, x, y, 34 * scale, 5 * scale);
  fill(ctx, color, x + 6 * scale, y - 3 * scale, 18 * scale, 4 * scale);
  fill(ctx, color, x + 13 * scale, y - 6 * scale, 10 * scale, 5 * scale);
}

export function drawWindow(ctx, x, y, w, h, mode = "dawn", t = 0) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  if (mode === "dawn") {
    vBands(ctx, x, y, w, h, [
      [C.skyDawnTop, 1],
      [C.skyDawnMid, 1],
      [C.skyDawnLow, 1.3],
      ["#e4c9a0", 0.5],
    ]);
    pixelCircle(ctx, "#ffe0a8", x + w * 0.72, y + h * 0.5, 16);
    fill(ctx, "#d7b48c", x, y + h * 0.62, w, h * 0.38);
    for (let i = 0; i < 9; i++) {
      const bw = 12 + (i * 7) % 20;
      const bh = 16 + (i * 13) % 42;
      fill(ctx, i % 3 === 0 ? C.cityMid : C.cityFar, x + 6 + i * (w / 9), y + h - bh, bw, bh);
    }
    drawCloud(ctx, x + 12, y + 28, 1, "rgba(255,255,255,0.28)");
  } else if (mode === "night") {
    vBands(ctx, x, y, w, h, [
      [C.skyNight, 1],
      ["#1b2336", 1],
      ["#242d42", 1],
    ]);
    pixelCircle(ctx, "#f4e6bc", x + w * 0.72, y + h * 0.35, 13);
    pixelCircle(ctx, "#242d42", x + w * 0.72 + 6, y + h * 0.35 - 2, 12);
    for (let i = 0; i < 9; i++) {
      const bh = 20 + (i * 17) % 54;
      fill(ctx, i % 2 ? C.cityNear : C.cityMid, x + i * (w / 9), y + h - bh, w / 9 + 1, bh);
      for (let j = 0; j < 3; j++) {
        if ((i + j) % 3 !== 0) {
          fill(ctx, "#d9b879", x + i * (w / 9) + 4 + j * 7, y + h - bh + 5 + j * 8, 2, 2);
        }
      }
    }
  } else {
    vBands(ctx, x, y, w, h, [
      ["#7f9ab0", 1],
      ["#a7bcc8", 1],
      ["#d1d0c4", 1],
    ]);
    drawCloud(ctx, x + 10, y + 30, 1.2, "rgba(255,255,255,0.4)");
    for (let i = 0; i < 8; i++) {
      fill(ctx, "#6f7e82", x + i * (w / 8), y + h * 0.7, w / 8 - 2, h * 0.3);
    }
  }

  // Window frame and mullions.
  const frame = "#2a2433";
  fill(ctx, frame, x - 4, y - 4, w + 8, 4);
  fill(ctx, frame, x - 4, y + h, w + 8, 4);
  fill(ctx, frame, x - 4, y - 4, 4, h + 8);
  fill(ctx, frame, x + w, y - 4, 4, h + 8);
  fill(ctx, frame, x + w / 2 - 1, y, 2, h);
  fill(ctx, frame, x, y + h / 2 - 1, w, 2);
  fill(ctx, "rgba(255,255,255,0.12)", x + 2, y + 2, w - 4, 1);

  // A couple of rain/snow flecks on the glass.
  if (mode === "night") {
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 18; i++) {
      fill(ctx, PAL.cool, x + ((i * 29 + t * 9) % w), y + ((i * 17 + t * 13) % h), 1, 2);
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

export function drawRoomWindowLight(ctx, x, y, w, h, warm = true) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, warm ? "rgba(255,217,160,0.18)" : "rgba(159,198,216,0.18)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

export function drawChatPanel(ctx, opts) {
  const {
    x, y, w, h, t, messages, title = "聊天", dim = 1,
  } = opts;
  ctx.save();
  ctx.globalAlpha *= dim;

  fill(ctx, "rgba(0,0,0,0.45)", x + 4, y + 4, w, h);
  fill(ctx, "#0e1526", x, y, w, h);
  fill(ctx, "#3a4a68", x, y, w, 1);
  fill(ctx, "#3a4a68", x, y + h - 1, w, 1);
  fill(ctx, "#3a4a68", x, y, 1, h);
  fill(ctx, "#3a4a68", x + w - 1, y, 1, h);
  fill(ctx, "#22304b", x + 1, y + 1, w - 2, 1);

  fill(ctx, "#4f8f6a", x + 10, y + 12, 4, 4);
  drawText(ctx, title, x + 19, y + 6, {
    size: 13,
    color: PAL.cream,
    shadow: true,
    shadowColor: PAL.ink,
    threshold: 96,
  });
  fill(ctx, "#3a4a68", x + 9, y + 27, w - 18, 1);

  const visible = messages.filter((m) => t >= m.t);
  const step = 21;
  // `bottom` is the top of the last bubble, not the panel edge; subtract the
  // bubble height so the final line stays above the phone's bottom bezel.
  const bottom = y + h - 11 - 18;
  for (let i = 0; i < visible.length; i++) {
    const m = visible[i];
    const indexInAll = messages.indexOf(m);
    let yy = bottom - (visible.length - 1 - i) * step;
    // A gentle scroll-in during the first third of a second.
    yy -= (1 - smoothstep(clamp((t - m.t) / 0.28))) * 7;

    const tw = measureText(m.text, 13);
    const bw = Math.min(w - 18, tw + 14);
    const bx = m.who === "him" ? x + 10 : x + w - 10 - bw;
    fill(ctx, m.who === "him" ? PAL.navyDk : PAL.plum, bx, yy, bw, 18);
    fill(ctx, m.who === "him" ? PAL.navy : PAL.rose, bx, yy, bw, 1);
    drawText(ctx, m.text, bx + 7, yy + 3, {
      size: 13,
      color: PAL.cream,
      reveal: clamp((t - m.t) / 0.45),
      threshold: 96,
    });

    if (indexInAll === messages.length - 1 && t - m.t < 0.55 && Math.floor(t * 9) % 2 === 0) {
      fill(ctx, PAL.warm, bx + 7 + Math.round(tw * clamp((t - m.t) / 0.45)), yy + 9, 3, 1);
    }
  }

  // Typing dots before the next message.
  const next = messages.find((m) => t < m.t && m.t - t < 0.5);
  if (next) {
    const yy = bottom - visible.length * step + 2;
    const tw = 30;
    const bx = next.who === "him" ? x + 10 : x + w - 10 - tw;
    fill(ctx, next.who === "him" ? PAL.navyDk : PAL.plum, bx, yy, tw, 14);
    const phase = Math.floor(t * 6) % 3;
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = (i === phase ? 1 : 0.4) * dim;
      fill(ctx, PAL.whiteSh, bx + 9 + i * 4, yy + 6, 2, 2);
    }
    ctx.globalAlpha = dim;
  }

  ctx.restore();
}

export function drawPhoneCall(ctx, opts) {
  const {
    x, y, w, h, seconds = 0, connected = true, label = "通话中",
  } = opts;
  fill(ctx, "rgba(0,0,0,0.5)", x + 5, y + 6, w, h);
  fill(ctx, "#0a0f1a", x, y, w, h);
  fill(ctx, "#2b3952", x, y, w, 1);
  fill(ctx, "#2b3952", x, y + h - 1, w, 1);
  fill(ctx, "#2b3952", x, y, 1, h);
  fill(ctx, "#2b3952", x + w - 1, y, 1, h);

  const cx = x + w / 2;
  fill(ctx, "#2f3f60", cx - 18, y + 20, 36, 36);
  pixelCircle(ctx, PAL.paperSh, cx, y + 34, 9);
  fill(ctx, PAL.paperSh, cx - 13, y + 43, 26, 12);
  fill(ctx, "#2f3f60", cx - 7, y + 30, 3, 2);
  fill(ctx, "#2f3f60", cx + 5, y + 30, 3, 2);
  fill(ctx, "#2f3f60", cx - 5, y + 38, 11, 2);

  drawText(ctx, label, cx, y + 67, {
    size: 12,
    color: PAL.cream,
    align: "center",
    shadow: true,
    shadowColor: PAL.ink,
    threshold: 90,
  });

  if (connected) {
    const mm = Math.floor(seconds / 60);
    const ss = Math.floor(seconds % 60);
    drawText(ctx, `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`, cx, y + 84, {
      size: 11,
      color: PAL.warm,
      align: "center",
      threshold: 80,
    });
  } else {
    drawText(ctx, "正在呼叫…", cx, y + 84, {
      size: 10,
      color: PAL.whiteDk,
      align: "center",
      threshold: 80,
    });
  }

  fill(ctx, "#7a3a3e", cx - 13, y + h - 29, 26, 14);
  fill(ctx, "#b4473e", cx - 13, y + h - 29, 26, 1);
  fill(ctx, PAL.cream, cx - 5, y + h - 24, 10, 4);
}

export function drawPhonePhoto(ctx, x, y, w, h, t) {
  fill(ctx, "#0a0f1a", x, y, w, h);
  fill(ctx, "#1d2436", x + 4, y + 4, w - 8, h - 8);
  fill(ctx, "#6f5a50", x + 10, y + 12, w - 20, h - 42);
  // A tiny school-gate-like photo.
  fill(ctx, "#8e6f9e", x + 10, y + 12, w - 20, 24);
  fill(ctx, "#4a3a30", x + 14, y + 30, w - 28, h - 62);
  fill(ctx, "#2a2433", x + 20, y + 38, w - 40, h - 72);
  fill(ctx, "#ffd9a0", x + w - 34, y + 18, 8, 8);
  fill(ctx, "#6f98b4", x + 16, y + 16, 20, 4);
  ctx.globalAlpha = 0.3 + 0.1 * Math.sin(t * 0.8);
  fill(ctx, PAL.warm, x + 12, y + h - 22, w - 24, 1);
  ctx.globalAlpha = 1;
}

export function drawVignette(ctx, alpha = 0.3) {
  ctx.save();
  const g = ctx.createRadialGradient(W / 2, H / 2, 90, W / 2, H / 2, 390);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${alpha})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

export function drawGrain(ctx, t, alpha = 0.035) {
  // Deterministic sparse grain, kept very low so pixel edges stay clean.
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 90; i++) {
    const x = (i * 97 + Math.floor(t * 14) * 31) % W;
    const y = (i * 53 + Math.floor(t * 11) * 17) % H;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
}
