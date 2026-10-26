/* Memory scenes: the kiss, the snow, and the fragments he cannot put down. */

import {
  W, H, P, fill, px, line, poly, ellipse, circle, ring, dither, bands,
  glow, dust, grain, vignette, alphaRect, text, ticket, redThread,
  projectorBeam, projectorFlicker, flicker,
} from "../art.js";
import { drawPerson, drawReachingHand, drawEmbrace } from "../characters.js";
import { exterior, booth, drawProjector } from "./common.js";

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => v * v * (3 - 2 * v);

export function kissMemory(ctx, t, shot, local) {
  fill(ctx, "#0c080b", 0, 0, W, H);
  // Projection booth, reduced to reels and a hot beam.
  bands(ctx, 0, 0, W, H, [
    ["#170f14", 1], ["#2a171b", 0.7], ["#0d090d", 1],
  ]);
  glow(ctx, 430, 120, 360, 240, P.warm2, 0.17);
  glow(ctx, 430, 120, 180, 140, P.pink3, 0.07);
  // The projector port sits behind her, so even the dark booth has one warm
  // source that can catch a cheek, a strand of hair, the edge of a profile.
  glow(ctx, 372, 190, 280, 210, P.warm2, 0.28);
  glow(ctx, 356, 184, 130, 100, P.pink3, 0.12);
  // Out-of-focus reels.
  for (const [rx, ry, r] of [[86, 70, 56], [136, 46, 34]]) {
    circle(ctx, "#100c10", rx, ry, r);
    ring(ctx, "#584137", rx, ry, r - 9, 3, 0.3);
    ring(ctx, "#3a2c28", rx, ry, r - 20, 2, 0.25);
    circle(ctx, "#171116", rx, ry, 5);
  }
  // A bright slot of light behind them.
  fill(ctx, P.warm2, 504, 22, 90, 6, 0.35);
  glow(ctx, 548, 28, 150, 100, P.warm2, 0.16);

  // A close two-shot.  She faces us, lit by the port; he is a dark shell at
  // the edge of the frame, so the kiss reads through nearness and a single
  // point of contact rather than two interpenetrating faces.
  const lean = ease(clamp01((local - 0.5) / 2.4)) * 10;
  // Her face, eyes closing into a smile as he gets close.
  const close = local > 1.5;
  drawPerson(ctx, "her", 336, 580, {
    scale: 5, view: "front", pose: "stand",
    expression: close ? "smile" : "soft",
    // The mouth opens a little once his claw lands: the smallest reaction
    // that keeps the shot from being a still face held for three seconds.
    mouth: clamp01((local - 2.4) / 0.4) * 0.5,
    outfit: "winter", arm: "hold", headTilt: 1,
    // She turns into his claw instead of facing the lens; the kiss is a
    // direction, not a pose.
    turn: -1, gaze: -1,
    blink: close ? 0 : (local % 4.6 > 4.4 ? 1 : 0),
  });
  // Warm rake along the lip of her shell, where the port light lands.
  fill(ctx, P.warm3, 183, 110, 2, 160, 0.1);
  fill(ctx, P.warm3, 486, 120, 2, 150, 0.09);
  // He stays at the edge of the frame, a dark shell with a warm claw.
  // Keeping his face out of it leaves her expression as the whole event.
  const bodyX = 16 + lean * 0.5;
  drawPerson(ctx, "him", bodyX + 2, 360, {
    scale: 3.4, facing: "right", silhouette: true, silhouetteColor: "#6a4038",
    alpha: 0.75, outfit: "winter",
  });
  drawPerson(ctx, "him", bodyX, 358, {
    scale: 3.4, facing: "right", silhouette: true, silhouetteColor: "#140d12",
    alpha: 0.95, outfit: "winter",
  });
  // His claw comes to her cheek, slowly, and stays.
  const reach = ease(clamp01((local - 0.6) / 2.2));
  const hx = 112 + reach * 30;
  drawReachingHand(ctx, hx, 190, 1, 1.6, { who: "him" });
  // The contact itself: a small change of light at her cheek, not a graphic.
  const touch = clamp01((local - 2.2) / 0.6);
  if (touch > 0) {
    fill(ctx, P.warm3, 178, 188, 8, 3, 0.3 * touch);
    fill(ctx, P.red3, 183, 192, 2, 1, 0.35 * touch);
  }
  // Foreground: the projector and a strip of film.  It hides their bodies,
  // keeping the shot intimate rather than anatomical.
  fill(ctx, "#0a080b", 0, 299, W, 61);
  fill(ctx, "#21181a", 0, 299, W, 4);
  drawProjector(ctx, 486, 350, 1.55, t, true);
  fill(ctx, "#141014", 0, 342, 470, 18);
  for (let i = 0; i < 14; i++) {
    fill(ctx, P.black, 12 + i * 32, 346, 24, 12);
    fill(ctx, "#4d3a30", 16 + i * 32, 349, 16, 6, 0.2);
  }
  // A red scarf dropped on the desk.
  poly(ctx, P.red1, [[42, 314], [112, 310], [138, 326], [72, 330]]);
  fill(ctx, P.red2, 48, 314, 58, 2, 0.6);
  // The memory is warm, but already losing its edges.
  const veil = 0.05 + clamp01(local / 4.2) * 0.12;
  alphaRect(ctx, "#6e3f3f", 0, 0, W, H, veil);
  dust(ctx, t, 160, 60, 380, 250, 22, P.warm3, 0.4);
  for (let i = 0; i < 3; i++) {
    fill(ctx, P.pink3, 0, 76 + i * 32, W, 1, 0.018);
  }
  grain(ctx, t, 0.05);
  vignette(ctx, 0.48);
}

/* A bare foot in profile, heel on the snow, toes pointing to `dir`. */
function bareFoot(ctx, x, y, dir, scale = 2) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale * dir, scale);
  // Snow gives way under the foot.
  ellipse(ctx, "#899cab", 3, -1, 10, 3, 0.55);
  ellipse(ctx, "#a9bac6", 4, 0, 8, 2, 0.5);
  // Foot silhouette, with the toes left as four small steps at the front.
  poly(ctx, P.ink, [
    [-6, -2], [-6, -10], [-3, -13], [1, -13], [3, -10],
    [11, -8], [17, -6], [18, -4], [18, -2], [12, -1], [-4, 0],
  ]);
  poly(ctx, P.skin, [
    [-5, -3], [-5, -9], [-2, -12], [1, -12], [2, -9],
    [10, -7], [16, -5], [17, -4], [16, -2], [11, -1], [-4, -1],
  ]);
  // Toe clefts; the big toe is the widest.
  fill(ctx, P.ink, 11, -4, 1, 2, 0.6);
  fill(ctx, P.ink, 14, -4, 1, 2, 0.55);
  fill(ctx, P.ink, 16, -3, 1, 2, 0.45);
  fill(ctx, P.skinSh, 8, -5, 6, 2, 0.35);
  fill(ctx, P.cream2, 4, -9, 5, 1, 0.3);
  // Ankle: skin only, so the foot flows into the leg instead of wearing a
  // black cuff.
  fill(ctx, P.skin, -5, -17, 11, 9);
  fill(ctx, P.skinSh, 3, -14, 2, 6, 0.4);
  fill(ctx, P.skinSh, -3, -8, 8, 1, 0.25);
  // A snowflake or two on the skin.
  fill(ctx, P.cream, 6, -8, 1, 1, 0.65);
  fill(ctx, P.cream, 11, -4, 1, 1, 0.5);
  ctx.restore();
}

export function snowMemory(ctx, t, shot, local) {
  // A low insert on the doorstep: her bare feet in fresh snow, the red shoes
  // set down a step away.  The lyric is "光着脚", so the feet are the shot.
  fill(ctx, "#0d131c", 0, 0, W, H);
  bands(ctx, 0, 0, W, 130, [
    ["#111927", 1], ["#1a2534", 1], ["#253345", 0.9],
  ]);
  // The cinema front, out of focus: bokeh, not architecture.
  glow(ctx, 96, 32, 240, 130, P.red2, 0.24);
  glow(ctx, 54, 72, 180, 110, P.warm2, 0.15);
  circle(ctx, P.red2, 72, 30, 13, 0.16);
  circle(ctx, P.red3, 106, 50, 7, 0.18);
  circle(ctx, P.warm3, 152, 22, 5, 0.2);
  circle(ctx, P.red1, 32, 54, 9, 0.12);
  dither(ctx, "#0d131c", 0, 0, 260, 130, 3, 0, 0.25);
  // Snow field.  The steps are close together and dithered broadly so the
  // ground reads as one surface instead of horizontal stripes.
  const snowTop = "#8a9ba9";
  const snowLow = "#dde5e8";
  for (let i = 0; i < 26; i++) {
    const p = i / 25;
    const r = Math.round(0x8a + (0xdd - 0x8a) * p);
    const g = Math.round(0x9b + (0xe5 - 0x9b) * p);
    const b = Math.round(0xa9 + (0xe8 - 0xa9) * p);
    fill(ctx, `rgb(${r},${g},${b})`, 0, 112 + i * 10, W, 11);
  }
  fill(ctx, snowTop, 0, 108, W, 6, 0.6);
  dither(ctx, "#a6b6c1", 0, 190, W, 30, 3, 0, 0.35);
  dither(ctx, "#eef2f3", 0, 220, W, 26, 3, 1, 0.3);
  for (let i = 0; i < 110; i++) {
    px(ctx, i % 4 ? "#edf1f2" : "#9fb1be", (i * 97 + 13) % W, 116 + (i * 41) % 244, 0.3);
  }
  // Drifts and the press of feet.
  ellipse(ctx, "#d3dde2", 150, 172, 130, 9, 0.35);
  ellipse(ctx, "#b9c8d2", 540, 150, 120, 8, 0.35);
  ellipse(ctx, "#e6ebec", 336, 300, 250, 16, 0.5);
  ellipse(ctx, "#c2ced7", 260, 258, 120, 10, 0.25);
  // One long soft shadow falls away from the doorway.
  poly(ctx, "#93a6b5", [[348, 262], [520, 246], [560, 268], [352, 280]], 0.18);
  ellipse(ctx, "#9db0bf", 470, 258, 40, 5, 0.2);
  // Warm doorway light rakes across the snow from the left.
  poly(ctx, P.warm2, [[0, 96], [176, 116], [250, 360], [0, 360]], 0.08);
  glow(ctx, 34, 190, 240, 210, P.warm2, 0.13);
  // Footprints: from the shoes to her feet, filling in behind her.
  for (let i = 0; i < 5; i++) {
    const fx = 448 - i * 30;
    const fy = 256 - i * 2 + (i % 2) * 3;
    ellipse(ctx, "#7c90a0", fx, fy, 7, 2, 0.3);
    ellipse(ctx, "#a7b8c3", fx + 1, fy + 1, 5, 1, 0.3);
  }
  for (let i = 0; i < 4; i++) {
    const fx = 536 + i * 22;
    const fy = 238 - i * 4;
    ellipse(ctx, "#8a9dab", fx, fy, 4, 2, 0.22);
  }
  // She stands in the drift, low in the frame: a crab in the snow, its little
  // legs half buried.  The bare-foot insert, in the film's own grammar.
  const shift = Math.round(Math.sin(local * 1.1) * 1);
  drawPerson(ctx, "her", 336, 268 + shift, {
    scale: 3.4, facing: "right", pose: "stand", expression: "soft",
    outfit: "winter", blink: local % 4.6 > 4.42 ? 1 : 0, alpha: 0.96,
  });
  // Snow banked around the feet, so she stands in the drift, not on it.
  ellipse(ctx, "#cfdade", 336, 264 + shift, 60, 9, 0.7);
  ellipse(ctx, "#e7ecee", 330, 259 + shift, 40, 6, 0.5);
  ellipse(ctx, "#b6c5d0", 352, 272 + shift, 34, 5, 0.35);
  // The red shoes, set down carefully, one a little tipped.
  const shoe = (sx, sy, tilt, scale) => {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(tilt);
    ctx.scale(scale, scale);
    ellipse(ctx, "#8296a5", 0, 4, 21, 4, 0.55);
    // Sole and upper, with a raised heel collar so it reads as a shoe.
    poly(ctx, P.ink, [
      [-21, 2], [-21, -6], [-15, -10], [-4, -11], [8, -10],
      [16, -7], [19, -2], [21, 1], [20, 4], [-19, 4],
    ]);
    poly(ctx, P.cream2, [[-19, 1], [-19, -1], [18, -1], [19, 2], [18, 3], [-18, 3]]);
    poly(ctx, P.red2, [[-19, 0], [-19, -5], [-14, -9], [-4, -10], [8, -9], [15, -6], [18, -2], [18, 0]]);
    // Toe cap and heel.
    ellipse(ctx, P.red3, -14, -3, 6, 5, 0.9);
    fill(ctx, P.red3, 12, -8, 6, 8, 0.85);
    fill(ctx, P.red4, 17, -7, 2, 7, 0.6);
    fill(ctx, P.cream2, 13, -8, 4, 1, 0.35);
    // Laces.
    fill(ctx, P.cream2, -6, -8, 3, 1, 0.8);
    fill(ctx, P.cream2, -1, -7, 3, 1, 0.8);
    fill(ctx, P.cream2, 4, -6, 3, 1, 0.7);
    // Snow settled on the toe and the collar.
    fill(ctx, "#e8edee", -18, -10, 11, 3, 0.9);
    fill(ctx, "#c6d2d9", -14, -12, 7, 2, 0.6);
    fill(ctx, "#e8edee", 10, -12, 9, 3, 0.75);
    ctx.restore();
  };
  shoe(472, 258, 0, 1.35);
  shoe(522, 252, -0.05, 1.3);
  // Snow settles on the toes of the shoes.
  fill(ctx, P.cream, 458, 244, 10, 1, 0.5);
  fill(ctx, P.cream, 508, 238, 9, 1, 0.45);
  fill(ctx, "#cfd9de", 450, 246, 14, 1, 0.3);
  // Falling snow.
  const wind = Math.sin(t * 0.4) * 8;
  for (let i = 0; i < 84; i++) {
    const sx = ((i * 83 + t * (10 + (i % 5) * 2) + wind) % (W + 40)) - 20;
    const sy = ((i * 53 + t * (13 + (i % 4) * 3)) % (H + 30)) - 15;
    const size = i % 14 === 0 ? 2 : 1;
    fill(ctx, i % 8 === 0 ? P.pink3 : P.cream, sx, sy, size, size, 0.16 + (i % 5) * 0.07);
  }
  // A few flakes catch the sign's red near the top.
  for (let i = 0; i < 12; i++) {
    const sx = 20 + (i * 47 + t * 9) % 300;
    const sy = 8 + (i * 31 + t * 14) % 92;
    fill(ctx, P.red3, sx, sy, 1, 1, 0.16);
  }
  grain(ctx, t, 0.035);
  vignette(ctx, 0.42);
}

function frameScene(ctx, t, x, y, w, h, kind, seed) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (kind === "sea") {
    bands(ctx, x, y, w, h * 0.5, [[P.dusk1, 1], [P.pink1, 1], [P.pink2, 1], [P.pink3, 0.8]]);
    circle(ctx, P.pink3, x + w * 0.66, y + h * 0.4, w * 0.1);
    fill(ctx, P.sea1, x, y + h * 0.5, w, h * 0.5);
    for (let i = 0; i < 4; i++) fill(ctx, P.pink3, x + 3, y + h * 0.6 + i * 5, w - 6, 1, 0.25);
    fill(ctx, "#4a3035", x + w * 0.44, y + h * 0.52, 2, 10);
    fill(ctx, "#4a3035", x + w * 0.56, y + h * 0.51, 2, 11);
  } else if (kind === "cinema") {
    fill(ctx, "#0c0a0e", x, y, w, h);
    fill(ctx, "#b98d75", x + w * 0.18, y + h * 0.14, w * 0.64, h * 0.36);
    bands(ctx, x + w * 0.18, y + h * 0.14, w * 0.64, h * 0.18, [[P.pink2, 1], [P.pink3, 1]]);
    for (let i = 0; i < 4; i++) {
      fill(ctx, "#64242a", x + w * 0.14 + i * w * 0.2, y + h * 0.66, w * 0.16, h * 0.2);
    }
    fill(ctx, "#1a1115", x, y + h * 0.85, w, h * 0.15);
  } else if (kind === "ticket") {
    fill(ctx, "#1b1114", x, y, w, h);
    ticket(ctx, x + w * 0.2, y + h * 0.22, w * 0.6, h * 0.42, { title: "影院", sub: "7:10" });
    alphaRect(ctx, P.ink, x, y + h * 0.72, w, h * 0.28, 0.4);
  } else if (kind === "kiss") {
    bands(ctx, x, y, w, h, [["#2a171b", 1], [P.dusk1, 1], [P.pink1, 0.7]]);
    drawEmbrace(ctx, x + w * 0.5, y + h * 0.96, (h / 96) * 0.9, { color: "#1a1116" });
    glow(ctx, x + w * 0.72, y + h * 0.2, w * 0.4, h * 0.3, P.warm2, 0.12);
  } else if (kind === "snow") {
    bands(ctx, x, y, w, h, [["#1b2333", 1], ["#39465a", 0.8], ["#7a8790", 0.4]]);
    for (let i = 0; i < 14; i++) {
      fill(ctx, P.cream, x + (i * 31 + seed * 7) % w, y + (i * 23 + t * 14) % h, 1, 1, 0.3);
    }
    fill(ctx, "#b6403a", x + w * 0.48, y + h * 0.52, 4, h * 0.3);
    fill(ctx, "#2a2228", x + w * 0.4, y + h * 0.42, 9, h * 0.5);
  } else if (kind === "phone") {
    fill(ctx, "#0d0d13", x, y, w, h);
    fill(ctx, "#2b3540", x + w * 0.36, y + h * 0.22, w * 0.28, h * 0.5);
    fill(ctx, "#9dc2c8", x + w * 0.4, y + h * 0.28, w * 0.2, h * 0.12, 0.4);
    fill(ctx, "#d8c7ab", x + w * 0.42, y + h * 0.62, w * 0.16, h * 0.02, 0.35);
  } else {
    bands(ctx, x, y, w, h, [[P.dusk2, 1], [P.pink2, 0.8], [P.sea1, 1]]);
    fill(ctx, "#1a1217", x + w * 0.42, y + h * 0.35, w * 0.18, h * 0.55);
  }
  // Print damage and a slight gate weave.
  for (let i = 0; i < 3; i++) {
    fill(ctx, P.cream, x + 20 + (i * 17 + seed * 5) % (w - 20), y, 1, h * 0.1, 0.08);
  }
  dither(ctx, "#2a1c1e", x, y, w, h, 3, 0, 0.2);
  ctx.restore();
  fill(ctx, "#07060a", x - 2, y - 2, w + 4, 2);
  fill(ctx, "#07060a", x - 2, y + h, w + 4, 2);
  fill(ctx, "#07060a", x - 2, y, 2, h);
  fill(ctx, "#07060a", x + w, y, 2, h);
}

export function memoryFlash(ctx, t, shot, local) {
  fill(ctx, "#08060a", 0, 0, W, H);
  // Red projector spill.
  glow(ctx, 320, 180, 620, 380, P.red1, 0.13);
  const phase = local;
  // The filmstrip, drifting through the dark.
  const shift = phase * 30;
  const kinds = ["sea", "kiss", "cinema", "ticket", "snow", "phone"];
  for (let i = 0; i < 8; i++) {
    const idx = (i + 1) % kinds.length;
    const x = 24 + i * 150 - (shift % 150);
    const y = 96 + Math.round(Math.sin(i * 1.7 + t * 0.6) * 11);
    const w = 120;
    const h = 70;
    if (x < -130 || x > W + 20) continue;
    // Film base and sprocket holes.
    fill(ctx, "#130e12", x - 8, y - 8, w + 16, h + 16, 0.9);
    for (let s = 0; s < 5; s++) {
      fill(ctx, P.cream3, x - 5, y - 4 + s * 15, 3, 5, 0.16);
      fill(ctx, P.cream3, x + w + 2, y - 4 + s * 15, 3, 5, 0.16);
    }
    frameScene(ctx, t, x, y, w, h, kinds[idx], i);
    // Torn sprocket / light leak on one frame.
    if (i === 3) fill(ctx, P.red2, x + w - 12, y, 12, h, 0.14);
  }
  // Warm light leaks across the strip, as if the gate were breathing.
  const a1 = clamp01((phase - 0.2) / 1.0) * clamp01((3.2 - phase) / 1.0);
  if (a1 > 0) {
    poly(ctx, P.red3, [[0, 236], [104, 40], [124, 40], [18, 240]], 0.05 * a1);
    poly(ctx, "#f0b49a", [[50, 258], [158, 32], [174, 32], [66, 262]], 0.035 * a1);
  }
  // Her eye, opened over the strip for a moment: the memory looking back.
  const a2 = clamp01((phase - 1.3) / 0.7) * clamp01((3.5 - phase) / 0.8);
  if (a2 > 0) {
    ctx.save();
    ctx.globalAlpha *= a2 * 0.75;
    ellipse(ctx, P.ink, 320, 150, 72, 30);
    ellipse(ctx, P.cream, 320, 150, 64, 22);
    ellipse(ctx, P.pink1, 318, 147, 40, 16, 0.5);
    ellipse(ctx, "#8b4a45", 330, 150, 21, 21);
    ellipse(ctx, "#5c2a2c", 330, 150, 15, 15);
    circle(ctx, P.ink, 331, 150, 8);
    circle(ctx, P.cream, 336, 143, 3);
    circle(ctx, P.pink3, 326, 157, 2, 0.7);
    ellipse(ctx, P.pink2, 320, 163, 48, 4, 0.45);
    line(ctx, P.ink, 384, 146, 396, 140, 2);
    line(ctx, P.ink, 386, 152, 400, 150, 2);
    line(ctx, P.ink, 256, 146, 244, 141, 1);
    ctx.restore();
  }
  // The ticket, the one object they both touch.
  const a3 = clamp01((phase - 2.2) / 0.5) * clamp01((4.0 - phase) / 0.4);
  if (a3 > 0) {
    ctx.save();
    ctx.globalAlpha *= a3 * 0.62;
    ticket(ctx, 250, 118, 140, 70, { title: "影院", sub: "ADMIT ONE · 7:10", titleSize: 15 });
    fill(ctx, P.red4, 260, 128, 40, 3, 0.35);
    ctx.restore();
  }
  // Faster cuts: a strip frame blown up, its grain the size of bricks.
  if (phase > 3.0 && phase < 3.35) {
    ctx.save();
    ctx.translate(134, 88);
    ctx.scale(3, 3);
    frameScene(ctx, t, 0, 0, 124, 72, "kiss", 4);
    ctx.restore();
    alphaRect(ctx, P.red2, 0, 0, W, H, 0.2);
    alphaRect(ctx, P.cream, 0, 0, W, H, 0.08);
  } else if (phase > 3.4 && phase < 3.7) {
    ctx.save();
    ctx.translate(110, 62);
    ctx.scale(3, 3);
    frameScene(ctx, t, 0, 0, 140, 78, "snow", 7);
    ctx.restore();
    alphaRect(ctx, P.pink3, 0, 0, W, H, 0.12);
  } else if (phase >= 3.7) {
    fill(ctx, P.red2, 0, 0, W, H, 0.5);
    alphaRect(ctx, P.cream, 0, 0, W, H, 0.25);
  }
  // Projector beam, dust, film scratches.
  projectorBeam(ctx, 610, 20, 300, 180, 150, 0.035, P.warm3);
  dust(ctx, t, 80, 40, 500, 260, 26, P.cream3, 0.3);
  for (let i = 0; i < 3; i++) {
    fill(ctx, P.red3, 40 + i * 210, 0, 1, H, 0.04);
  }
  grain(ctx, t, 0.06);
  vignette(ctx, 0.46);
}
