/* Pixel drawing kit for 《红》.
 *
 * Everything is drawn at the player's native 640 x 360.  Shapes are rasterised
 * to whole pixels here instead of relying on canvas path anti-aliasing, so the
 * film keeps one pixel grid from wide shots to close-ups.  No external images
 * are used.
 */

import { drawText, measureText } from "../../js/engine/pixeltext.js";
import { clamp, lerp, smoothstep, mulberry32 } from "../../js/engine/util.js";

export const W = 640;
export const H = 360;

/* One shared 16-bit family: warm tungsten, dusty rose, sea blue, brick red. */
export const P = {
  ink: "#0d0b12",
  ink2: "#15121c",
  ink3: "#1e1924",
  black: "#07060a",
  night0: "#101322",
  night1: "#171c2d",
  night2: "#22283d",
  night3: "#30374f",
  blue0: "#26344a",
  blue1: "#354a63",
  blue2: "#52708a",
  blue3: "#84a3b6",
  sea0: "#183345",
  sea1: "#245064",
  sea2: "#3d7182",
  sea3: "#6a9ba6",
  sea4: "#a5c3c3",
  dusk0: "#2d2745",
  dusk1: "#5d3f58",
  dusk2: "#986072",
  dusk3: "#d18a82",
  dusk4: "#f0b39a",
  pink0: "#b9687e",
  pink1: "#dc8e98",
  pink2: "#f2b4ae",
  pink3: "#ffd4c0",
  cloud0: "#d99aa3",
  cloud1: "#f2c1bd",
  cloud2: "#ffe3d2",
  red0: "#5c1f25",
  red1: "#8b2f35",
  red2: "#b84543",
  red3: "#d86357",
  red4: "#e98b78",
  rose: "#c87878",
  rust: "#9a5446",
  gold0: "#8e5a2c",
  gold1: "#c48a43",
  gold2: "#e3b66d",
  gold3: "#f7d79b",
  cream: "#f2e3cf",
  cream2: "#dbc7ad",
  cream3: "#b7a18a",
  warm0: "#8c6548",
  warm1: "#bd8d62",
  warm2: "#e7b77e",
  warm3: "#ffdda6",
  brown0: "#2f241f",
  brown1: "#4a352c",
  brown2: "#6a4c3d",
  brown3: "#8f6a53",
  skin: "#eec39d",
  skinSh: "#d29b78",
  skinDeep: "#a86e52",
  hairM: "#25222a",
  hairMhi: "#3c3540",
  hairF: "#3a2927",
  hairFhi: "#5b4038",
  teal: "#34545a",
  green: "#405c4d",
  white: "#fff6e8",
};

/* ------------------------------------------------------------------ basics */

export function fill(ctx, color, x, y, w, h, alpha = 1) {
  if (w <= 0 || h <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  ctx.restore();
}

export function px(ctx, color, x, y, alpha = 1) {
  fill(ctx, color, x, y, 1, 1, alpha);
}

export function line(ctx, color, x0, y0, x1, y1, width = 1, alpha = 1) {
  x0 = Math.round(x0); y0 = Math.round(y0);
  x1 = Math.round(x1); y1 = Math.round(y1);
  width = Math.max(1, Math.round(width));
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  const off = Math.floor(width / 2);
  while (true) {
    ctx.fillRect(x0 - off, y0 - off, width, width);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
  ctx.restore();
}

export function poly(ctx, color, pts, alpha = 1) {
  if (!pts || pts.length < 3) return;
  const ys = pts.map((p) => p[1]);
  const y0 = Math.floor(Math.min(...ys));
  const y1 = Math.ceil(Math.max(...ys));
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  for (let y = y0; y < y1; y++) {
    const cy = y + 0.5;
    const xs = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      if ((a[1] <= cy && b[1] > cy) || (b[1] <= cy && a[1] > cy)) {
        const q = (cy - a[1]) / (b[1] - a[1]);
        xs.push(a[0] + (b[0] - a[0]) * q);
      }
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const xa = Math.ceil(xs[i]);
      const xb = Math.floor(xs[i + 1]);
      if (xb >= xa) ctx.fillRect(xa, y, xb - xa, 1);
    }
  }
  ctx.restore();
}

export function ellipse(ctx, color, cx, cy, rx, ry, alpha = 1) {
  cx = Math.round(cx); cy = Math.round(cy);
  rx = Math.max(1, Math.round(rx)); ry = Math.max(1, Math.round(ry));
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  for (let y = -ry; y <= ry; y++) {
    const half = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
    ctx.fillRect(cx - half, cy + y, half * 2 + 1, 1);
  }
  ctx.restore();
}

export function circle(ctx, color, cx, cy, r, alpha = 1) {
  ellipse(ctx, color, cx, cy, r, r, alpha);
}

export function ring(ctx, color, cx, cy, r, width = 1, alpha = 1) {
  for (let y = -r; y <= r; y++) {
    const half = Math.floor(r * Math.sqrt(Math.max(0, 1 - (y * y) / (r * r))));
    if (Math.abs(Math.abs(y) - r) < width || Math.abs(half) < 1) {
      fill(ctx, color, cx - half, cy + y, half * 2, width, alpha);
    }
  }
}

export function dither(ctx, color, x, y, w, h, step = 2, phase = 0, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  const x0 = Math.round(x); const y0 = Math.round(y);
  const x1 = Math.round(x + w); const y1 = Math.round(y + h);
  for (let yy = y0; yy < y1; yy += step) {
    for (let xx = x0 + ((Math.floor(yy / step) + phase) % 2); xx < x1; xx += step) {
      ctx.fillRect(xx, yy, 1, 1);
    }
  }
  ctx.restore();
}

/** Horizontal colour bands with 1-px ordered dither at each seam. */
export function bands(ctx, x, y, w, h, stops, horizontal = false) {
  const total = stops.reduce((s, q) => s + q[1], 0);
  let cursor = horizontal ? x : y;
  for (let i = 0; i < stops.length; i++) {
    const size = (h * stops[i][1]) / total;
    const end = i === stops.length - 1 ? (horizontal ? x + w : y + h) : cursor + size;
    if (horizontal) fill(ctx, stops[i][0], cursor, y, end - cursor, h);
    else fill(ctx, stops[i][0], x, cursor, w, end - cursor);
    if (i > 0) {
      const col = stops[i][0];
      if (horizontal) dither(ctx, col, cursor, y, 2, h, 2, 0, 0.55);
      else dither(ctx, col, x, cursor, w, 2, 2, 0, 0.55);
    }
    cursor = end;
  }
}

export function alphaRect(ctx, color, x, y, w, h, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  ctx.restore();
}

/* ------------------------------------------------------------------- text */

export function text(ctx, str, x, y, opts = {}) {
  return drawText(ctx, str, x, y, {
    size: 12,
    color: P.cream,
    shadow: true,
    shadowColor: P.black,
    threshold: 88,
    ...opts,
  });
}

export function textWidth(str, size = 12, letterSpacing = 0) {
  return measureText(str, size, letterSpacing);
}

/* -------------------------------------------------------------------- sky */

export function sky(ctx, t, opts = {}) {
  const kind = opts.kind || "dusk";
  if (kind === "black") {
    fill(ctx, P.black, 0, 0, W, H);
    return;
  }
  if (kind === "night") {
    bands(ctx, 0, 0, W, H, [
      [P.night0, 1.1], [P.night1, 1], [P.night2, 0.9], [P.night3, 0.4],
    ]);
    stars(ctx, t, 0, 0, W, 250, 58, 0.55);
    return;
  }
  if (kind === "dawn") {
    bands(ctx, 0, 0, W, 244, [
      [P.blue1, 1.0], [P.blue2, 0.9], [P.dusk2, 0.8], [P.pink2, 0.9], [P.pink3, 0.6],
    ]);
    glow(ctx, 470, 188, 160, 105, P.pink3, 0.2);
    return;
  }
  if (kind === "snow") {
    bands(ctx, 0, 0, W, H, [
      ["#1b2335", 1], ["#293448", 1.1], ["#425164", 0.8], ["#637282", 0.4],
    ]);
    stars(ctx, t, 0, 0, W, 180, 20, 0.2);
    return;
  }
  // Pink dusk, the film's recurring "good evening".
  bands(ctx, 0, 0, W, 240, [
    [P.dusk0, 0.8], [P.dusk1, 0.85], [P.dusk2, 0.8],
    [P.dusk3, 0.8], [P.dusk4, 0.55],
  ]);
  stars(ctx, t, 0, 0, W, 90, 9, 0.16);
}

export function stars(ctx, t, x, y, w, h, count = 40, alpha = 0.5) {
  const rand = mulberry32(91);
  for (let i = 0; i < count; i++) {
    const sx = x + rand() * w;
    const sy = y + rand() * h;
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.7 + i * 1.9));
    fill(ctx, i % 9 === 0 ? P.pink2 : P.cream, sx, sy, i % 13 === 0 ? 2 : 1, 1, alpha * tw);
  }
}

export function cloud(ctx, x, y, scale = 1, color = P.cloud1, alpha = 0.8) {
  const s = Math.round(scale);
  ellipse(ctx, color, x + 15 * s, y, 18 * s, 5 * s, alpha);
  ellipse(ctx, color, x + 4 * s, y + 1 * s, 9 * s, 4 * s, alpha);
  ellipse(ctx, color, x + 24 * s, y + 1 * s, 10 * s, 4 * s, alpha);
  ellipse(ctx, color, x + 14 * s, y - 4 * s, 10 * s, 4 * s, alpha);
  fill(ctx, color, x + 2 * s, y + 2 * s, 30 * s, 2 * s, alpha);
}

export function cloudBank(ctx, t, opts = {}) {
  const y = opts.y ?? 76;
  const color = opts.color ?? P.cloud1;
  const alpha = opts.alpha ?? 0.75;
  const drift = (t * (opts.speed ?? 2.2)) % W;
  for (let i = 0; i < 7; i++) {
    const x = ((i * 131 - drift + W) % (W + 220)) - 80;
    cloud(ctx, x, y + Math.sin(i * 2.3) * 9, 0.75 + (i % 3) * 0.25, color, alpha);
  }
}

export function starsReflection(ctx, t, x, y, w, h, count = 22) {
  const rand = mulberry32(52);
  for (let i = 0; i < count; i++) {
    const sx = x + rand() * w;
    const sy = y + rand() * h;
    const shimmer = 0.2 + 0.8 * Math.abs(Math.sin(t * 1.7 + i));
    fill(ctx, i % 4 === 0 ? P.pink2 : P.sea4, sx, sy, 1 + (i % 5 === 0 ? 1 : 0), 1, 0.18 * shimmer);
  }
}

export function sun(ctx, cx, cy, r, color = P.pink3, alpha = 1) {
  glow(ctx, cx, cy, r * 7, r * 7, color, 0.11 * alpha);
  glow(ctx, cx, cy, r * 4, r * 4, color, 0.13 * alpha);
  circle(ctx, color, cx, cy, r, alpha);
  dither(ctx, P.pink2, cx - r, cy - r, r * 2, r * 2, 2, 0, 0.16 * alpha);
}

/* -------------------------------------------------------------------- sea */

export function sea(ctx, t, horizon = 220, opts = {}) {
  const kind = opts.kind || "dusk";
  const top = kind === "night" ? P.sea0 : P.sea1;
  const bottom = kind === "night" ? "#0b1924" : P.sea2;
  const count = opts.waves ?? 20;
  fill(ctx, top, 0, horizon, W, H - horizon);
  bands(ctx, 0, horizon, W, H - horizon, [
    [top, 0.6], [kind === "night" ? "#122635" : P.sea1, 1],
    [kind === "night" ? "#0d1e2b" : "#2c596b", 1.2],
    [kind === "night" ? "#09141e" : P.sea0, 1.8],
  ]);

  // Low sun / moon path.
  if (opts.pathX !== undefined) {
    const px0 = opts.pathX;
    for (let i = 0; i < 34; i++) {
      const y = horizon + 3 + i * ((H - horizon) / 34);
      const half = 2 + i * 0.9;
      const wobble = Math.sin(t * 1.2 + i * 0.7) * (1 + i * 0.08);
      fill(ctx, i % 3 === 0 ? P.pink3 : P.pink2, px0 - half + wobble, y, half * 2, 1, i > 22 ? 0.13 : 0.24);
    }
  }

  // Long horizontal glints.
  for (let i = 0; i < count; i++) {
    const y = horizon + 3 + (i / count) * (H - horizon - 2);
    const speed = 2.2 + (i % 4) * 0.55;
    const w = 8 + (i * 17) % 34;
    const x = ((i * 71 + t * speed) % (W + 80)) - 40;
    fill(ctx, i % 5 === 0 ? P.sea4 : P.sea3, x, y, w, 1, 0.12 + (i % 4) * 0.035);
  }

  // Foam at the near edge.
  for (let i = 0; i < 9; i++) {
    const y = H - 16 + Math.sin(t * 0.8 + i) * 2;
    const x = ((i * 83 + t * 5) % (W + 90)) - 40;
    fill(ctx, P.sea4, x, y, 34 + (i % 4) * 12, 1, 0.18);
  }
}

export function wetSand(ctx, t, y = 318, opts = {}) {
  const color = opts.color || "#6f6868";
  fill(ctx, color, 0, y, W, H - y);
  dither(ctx, "#554f50", 0, y + 5, W, H - y - 5, 3, 1, 0.6);
  for (let i = 0; i < 12; i++) {
    const x = ((i * 61 + t * 3) % (W + 80)) - 40;
    fill(ctx, "#8c8581", x, y + 4 + (i % 4) * 3, 18 + (i % 5) * 7, 1, 0.18);
  }
  if (opts.reflectionX !== undefined) {
    for (let i = 0; i < 20; i++) {
      const yy = y + 2 + i * 2;
      const half = 4 + i;
      fill(ctx, P.pink2, opts.reflectionX - half + Math.sin(t + i) * 2, yy, half * 2, 1, 0.07);
    }
  }
}

export function beachProps(ctx, t, opts = {}) {
  // A simple pier and two posts keep the beach from being an empty gradient.
  const horizon = opts.horizon ?? 220;
  fill(ctx, "#342d30", 0, horizon + 1, W, 2, 0.9);
  if (opts.pier !== false) {
    const x = opts.pierX ?? 42;
    fill(ctx, "#3f3330", x, horizon - 8, 74, 3);
    for (let i = 0; i < 5; i++) fill(ctx, "#322927", x + 6 + i * 15, horizon - 5, 3, 14 + (i % 2));
    for (let i = 0; i < 3; i++) fill(ctx, "#5d4840", x + 30 + i * 9, horizon - 12, 1, 4);
  }
  if (opts.posts !== false) {
    for (const [x, h] of [[530, 21], [566, 16]]) {
      fill(ctx, "#493b38", x, horizon - h, 2, h);
      fill(ctx, "#6f5a4e", x, horizon - h, 1, h);
      fill(ctx, "#b65b4c", x - 1, horizon - h, 4, 1, 0.55);
    }
  }
}

export function shore(ctx, t, opts = {}) {
  const horizon = opts.horizon ?? 220;
  sky(ctx, t, { kind: opts.sky || "dusk" });
  if (opts.clouds !== false) cloudBank(ctx, t, { y: opts.cloudY ?? 76, alpha: opts.cloudAlpha ?? 0.75, color: opts.cloudColor || P.cloud1 });
  if (opts.sun !== false) sun(ctx, opts.sunX ?? 468, opts.sunY ?? horizon - 12, opts.sunR ?? 15, opts.sunColor || P.pink3);
  sea(ctx, t, horizon, { pathX: opts.pathX ?? opts.sunX ?? 468, kind: opts.seaKind || "dusk" });
  wetSand(ctx, t, opts.sandY ?? 306, { reflectionX: opts.reflectionX ?? opts.sunX ?? 468, color: opts.sandColor });
  beachProps(ctx, t, { horizon, pier: opts.pier, pierX: opts.pierX, posts: opts.posts });
}

/* ---------------------------------------------------------------- effects */

export function glow(ctx, cx, cy, w, h, color, alpha = 0.3) {
  const steps = 5;
  for (let i = steps; i >= 1; i--) {
    ctx.save();
    ctx.globalAlpha = alpha * (i / steps) * 0.34;
    ctx.fillStyle = color;
    const ww = (w * i) / steps;
    const hh = (h * i) / steps;
    ctx.beginPath();
    ctx.ellipse(Math.round(cx), Math.round(cy), Math.max(1, ww / 2), Math.max(1, hh / 2), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function projectorBeam(ctx, x, y, sx, sy, spread, alpha = 0.1, color = P.warm3) {
  poly(ctx, color, [
    [x, y], [sx - spread, sy - spread * 0.56], [sx + spread, sy - spread * 0.56],
    [sx + spread, sy + spread * 0.56], [sx - spread, sy + spread * 0.56],
  ], alpha);
  for (let i = 0; i < 4; i++) {
    poly(ctx, color, [
      [x, y + i - 2], [sx - spread, sy - spread * 0.5 + i * 7], [sx + spread, sy - spread * 0.5 + i * 7],
      [sx + spread, sy + spread * 0.5 + i * 7], [sx - spread, sy + spread * 0.5 + i * 7],
    ], alpha * 0.25);
  }
}

export function dust(ctx, t, x, y, w, h, count = 32, color = P.warm3, alpha = 1) {
  const rand = mulberry32(311);
  for (let i = 0; i < count; i++) {
    const baseX = rand(); const baseY = rand(); const speed = 0.3 + rand() * 0.7;
    const px0 = x + ((baseX * w + t * (2 + speed * 3) + Math.sin(t * 0.4 + i) * 7) % w);
    const py0 = y + ((baseY * h + Math.sin(t * 0.3 + i * 2) * 4) % h);
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.1 + i));
    fill(ctx, color, px0, py0, i % 11 === 0 ? 2 : 1, 1, alpha * (0.08 + (i % 5) * 0.035) * tw);
  }
}

export function grain(ctx, t, alpha = 0.055) {
  const frame = Math.floor(t * 24);
  const rand = mulberry32(9001 + frame);
  ctx.save();
  ctx.fillStyle = P.black;
  for (let i = 0; i < 420; i++) {
    ctx.globalAlpha = alpha * (0.35 + rand() * 0.65);
    ctx.fillRect((rand() * W) | 0, (rand() * H) | 0, 1, 1);
  }
  // Sparse bright specks suggest a projected print, not digital noise.
  ctx.fillStyle = P.cream;
  for (let i = 0; i < 48; i++) {
    ctx.globalAlpha = alpha * 0.48 * rand();
    ctx.fillRect((rand() * W) | 0, (rand() * H) | 0, 1, 1);
  }
  ctx.restore();
}

export function vignette(ctx, strength = 0.32) {
  for (let i = 0; i < 30; i++) {
    const a = strength * Math.pow(i / 30, 2.1);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = P.black;
    ctx.fillRect(0, i, W, 1);
    ctx.fillRect(0, H - i - 1, W, 1);
    ctx.fillRect(i, 0, 1, H);
    ctx.fillRect(W - i - 1, 0, 1, H);
    ctx.restore();
  }
}

export function scanlines(ctx, alpha = 0.035) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = P.black;
  for (let y = 1; y < H; y += 2) ctx.fillRect(0, y, W, 1);
  ctx.restore();
}

export function flicker(t, seed = 0) {
  return 0.86 + 0.14 * Math.abs(Math.sin(t * 17.3 + seed)) * Math.abs(Math.sin(t * 5.7 + seed * 2));
}

export function projectorFlicker(t) {
  const gate = Math.sin(t * 24.0) > -0.94 ? 1 : 0.45;
  return gate * (0.9 + 0.1 * Math.sin(t * 11.0));
}

export function redThread(ctx, points, color = P.red3, alpha = 1) {
  for (let i = 0; i + 1 < points.length; i++) {
    line(ctx, color, points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], 1, alpha);
  }
}

export function paper(ctx, x, y, w, h, color = P.cream, shade = P.cream2) {
  fill(ctx, color, x, y, w, h);
  fill(ctx, shade, x, y + h - 2, w, 2);
  fill(ctx, "#ffffff", x + 1, y + 1, w - 2, 1, 0.28);
  dither(ctx, shade, x, y, w, h, 4, 0, 0.25);
}

export function ticket(ctx, x, y, w = 46, h = 24, opts = {}) {
  const c = opts.color || P.red2;
  const hi = opts.hi || P.red3;
  fill(ctx, P.ink, x - 1, y - 1, w + 2, h + 2);
  fill(ctx, c, x, y, w, h);
  fill(ctx, hi, x, y, w, 1);
  fill(ctx, "#7c2a2f", x, y + h - 2, w, 2);
  const notch = 4;
  for (let i = 0; i < notch; i++) {
    fill(ctx, P.ink, x + w - 8, y + i, 1, 1);
    fill(ctx, P.ink, x + w - 8, y + h - i - 1, 1, 1);
  }
  dither(ctx, "#a23d3c", x + 1, y + 1, w - 2, h - 2, 3, 0, 0.36);
  if (opts.text !== false) {
    const tSize = opts.titleSize || 8;
    const sSize = opts.subSize || 5;
    const pad = Math.max(4, Math.round(tSize * 0.5));
    text(ctx, opts.title || "影院", x + pad, y + pad, {
      size: tSize, color: P.cream, shadow: false, threshold: 70,
      bold: !!opts.titleBold,
    });
    text(ctx, opts.sub || "ADMIT ONE", x + pad, y + pad + tSize + 2, {
      size: sSize, color: P.cream2, shadow: false, threshold: 60,
    });
  }
}

/* A frame leader is used only in the opening and the final reel change. */
export function leader(ctx, t, opts = {}) {
  fill(ctx, P.black, 0, 0, W, H);
  const cx = W / 2; const cy = H / 2;
  const r = opts.r ?? 142;
  ring(ctx, "#4c2d2b", cx, cy, r, 1, 0.6);
  ring(ctx, "#4c2d2b", cx, cy, r - 8, 1, 0.35);
  line(ctx, "#4c2d2b", cx - r, cy, cx + r, cy, 1, 0.4);
  line(ctx, "#4c2d2b", cx, cy - r, cx, cy + r, 1, 0.4);
  // Crosshair, deliberately off-centre by a few pixels.
  line(ctx, "#7c4840", cx - 16, cy - 16, cx + 16, cy + 16, 1, 0.25);
  line(ctx, "#7c4840", cx + 16, cy - 16, cx - 16, cy + 16, 1, 0.25);
  text(ctx, opts.num || "5", cx, cy - 25, {
    size: 54, color: "#8d5047", align: "center", shadow: false, threshold: 70,
  });
  if (opts.label) {
    text(ctx, opts.label, cx, cy + 42, {
      size: 8, color: "#6b4b43", align: "center", shadow: false, letterSpacing: 3, threshold: 60,
    });
  }
  grain(ctx, t, 0.1);
  vignette(ctx, 0.5);
}

/* Small vignette-like frame markers used in the editing room. */
export function slate(ctx, t, id) {
  fill(ctx, "rgba(0,0,0,0.22)", 8, 8, 94, 18);
  text(ctx, id, 13, 12, { size: 8, color: P.cream2, shadow: false, threshold: 60 });
}

export function safe(value, a, b) {
  return clamp(value, a, b);
}

export { clamp, lerp, smoothstep, mulberry32, measureText };
