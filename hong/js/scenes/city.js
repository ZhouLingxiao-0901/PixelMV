/* City scenes: the life he chose, and the work that fills it. */

import {
  W, H, P, fill, px, line, poly, ellipse, circle, ring, dither, bands,
  glow, dust, grain, vignette, alphaRect, text, ticket, redThread,
  cloudBank, stars, projectorBeam, projectorFlicker, flicker,
} from "../art.js";
import { drawPerson, drawHand, drawReachingHand } from "../characters.js";
import { screenSea } from "./common.js";

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => v * v * (3 - 2 * v);

function cityWindowView(ctx, t, x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  bands(ctx, x, y, w, h, [
    [P.night0, 0.8], [P.night1, 0.9], [P.night2, 0.8], [P.night3, 0.5],
  ]);
  // A grid of buildings with lit windows; the city is awake but nobody is home.
  for (let i = 0; i < 9; i++) {
    const bx = x - 18 + i * Math.max(34, w / 8);
    const bh = 50 + ((i * 37) % Math.max(30, h - 80));
    fill(ctx, i % 2 ? "#101521" : "#141a28", bx, y + h - bh, Math.max(30, w / 9), bh);
    for (let r = 0; r < Math.floor(bh / 14); r++) {
      for (let c = 0; c < 3; c++) {
        const on = (i * 7 + r * 3 + c * 5) % 11 < 4;
        if (on) fill(ctx, (i + r) % 5 === 0 ? P.warm2 : P.gold2, bx + 5 + c * 10, y + h - bh + 8 + r * 14, 3, 2, 0.35);
      }
    }
  }
  // One lit window across the street: a small warm rectangle.
  fill(ctx, "#0b0d15", x + w * 0.17, y + h * 0.28, Math.max(26, w * 0.14), Math.max(34, h * 0.42));
  fill(ctx, P.warm2, x + w * 0.19, y + h * 0.31, Math.max(16, w * 0.09), Math.max(20, h * 0.3), 0.65);
  fill(ctx, "#2a1a1b", x + w * 0.2, y + h * 0.45, Math.max(12, w * 0.06), 2, 0.5);
  // A red sign in the distance.
  fill(ctx, P.red2, x + w * 0.7, y + h * 0.38, 2, 18, 0.35);
  fill(ctx, P.red3, x + w * 0.69, y + h * 0.38, 4, 2, 0.4);
  // Haze and a slow aircraft light.
  alphaRect(ctx, "#d69b82", x, y + h - 24, w, 24, 0.04);
  const plane = ((t * 8) % (w + 80)) - 40;
  fill(ctx, P.cream, x + plane, y + 20, 1, 1, 0.5);
  ctx.restore();
}

function deskLamp(ctx, x, y) {
  fill(ctx, "#2d211c", x, y, 3, 40);
  poly(ctx, "#7a5940", [[x - 22, y], [x + 23, y], [x + 16, y + 9], [x - 15, y + 9]]);
  fill(ctx, "#f1c583", x - 15, y + 8, 30, 2, 0.8);
  glow(ctx, x, y + 18, 100, 80, P.warm2, 0.13);
}

export function studioCredit(ctx, t, shot, local) {
  fill(ctx, "#0c0b10", 0, 0, W, H);
  // Acoustic wall.
  fill(ctx, "#1b1a20", 0, 0, W, 268);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 9; c++) {
      const x = 8 + c * 40;
      const y = 8 + r * 40;
      fill(ctx, "#242129", x, y, 34, 34);
      dither(ctx, "#17151c", x, y, 34, 34, 3, 0, 0.3);
      line(ctx, "#302b33", x + 4, y + 30, x + 30, y + 4, 1, 0.35);
    }
  }
  // Window onto the city, left.
  fill(ctx, "#07080d", 34, 64, 188, 132);
  cityWindowView(ctx, t, 38, 68, 180, 124);
  fill(ctx, "#1a171c", 30, 60, 196, 5);
  fill(ctx, "#1a171c", 30, 194, 196, 5);
  fill(ctx, "#1a171c", 30, 64, 5, 132);
  fill(ctx, "#1a171c", 218, 64, 5, 132);
  // Desk and monitor.
  fill(ctx, "#141116", 0, 264, W, 96);
  fill(ctx, "#3b2a24", 0, 264, W, 4);
  fill(ctx, "#2a1d1b", 0, 300, W, 60);
  // Monitor.
  fill(ctx, "#0d0b0e", 326, 86, 274, 170);
  fill(ctx, "#1f252b", 332, 92, 262, 150);
  ctx.save();
  ctx.beginPath();
  ctx.rect(340, 98, 246, 118);
  ctx.clip();
  screenSea(ctx, t, 340, 98, 246, 118, { cloudAlpha: 0.4 });
  // Waveform and a small title block over the image.
  alphaRect(ctx, "#080b0e", 340, 190, 246, 26, 0.62);
  line(ctx, "#7d8a7c", 348, 203, 580, 203, 1, 0.5);
  for (let i = 0; i < 46; i++) {
    const amp = 2 + Math.abs(Math.sin(t * 2.4 + i * 0.6)) * 8;
    fill(ctx, "#93b39c", 350 + i * 5, 203 - amp / 2, 1, amp, 0.5);
  }
  text(ctx, "SEA / 07:10", 346, 100, {
    size: 7, color: P.cream2, shadow: false, threshold: 55, alpha: 0.55,
  });
  ctx.restore();
  // Monitor frame and a strip of tape.
  fill(ctx, "#29252a", 326, 86, 274, 3);
  fill(ctx, "#181419", 326, 254, 274, 4);
  fill(ctx, "#141116", 462, 258, 10, 22);
  fill(ctx, "#141116", 410, 278, 112, 5);
  fill(ctx, "#5b4a39", 560, 92, 18, 8, 0.7);
  // The red ticket, pinned by the monitor.
  ticket(ctx, 564, 226, 30, 16, { title: "影院", sub: "7:10" });
  // Console and faders.
  fill(ctx, "#17141a", 0, 286, 600, 36);
  fill(ctx, "#2e2830", 0, 286, 600, 3);
  for (let i = 0; i < 8; i++) {
    fill(ctx, "#0e0c10", 22 + i * 36, 294, 2, 24);
    fill(ctx, "#8f7f63", 18 + i * 36 + (i % 3) * 4, 300 + (i % 4) * 3, 10, 3);
  }
  for (let i = 0; i < 3; i++) circle(ctx, i === 0 ? P.red3 : "#5b5044", 326 + i * 12, 308, 2, 0.8);
  // The chair back sits behind him on his left, so it reads as furniture
  // rather than a dark slab across his shell.
  fill(ctx, "#1a1519", 186, 236, 24, 96);
  fill(ctx, "#30252a", 190, 238, 16, 74);
  fill(ctx, "#1a1519", 186, 330, 76, 5);
  // Him, at work; the crab's own cable is the red thread here.
  drawPerson(ctx, "him", 268, 346, {
    scale: 2, facing: "right", pose: "sit", expression: "soft",
    outfit: "home", arm: "reach", blink: local % 4.8 > 4.62 ? 1 : 0,
  });
  // Credits, small and factual.
  text(ctx, "声音设计", 50, 232, {
    size: 7, color: P.cream2, shadow: false, threshold: 55, alpha: 0.5,
  });
  text(ctx, "沈 野", 50, 242, {
    size: 11, color: P.cream, shadow: false, threshold: 60, alpha: 0.72, letterSpacing: 2,
  });
  text(ctx, "上海 · 一年后", 50, 258, {
    size: 7, color: "#b59b86", shadow: false, threshold: 55, alpha: 0.45,
  });
  // REC lamp and desk lamp.
  fill(ctx, "#1b1114", 538, 58, 58, 20);
  circle(ctx, P.red3, 548, 68, 3);
  glow(ctx, 548, 68, 42, 40, P.red3, 0.24);
  text(ctx, "REC", 558, 62, {
    size: 7, color: P.cream2, shadow: false, threshold: 55, alpha: 0.7,
  });
  deskLamp(ctx, 600, 238);
  dust(ctx, t, 240, 80, 340, 220, 14, P.cream3, 0.22);
  grain(ctx, t, 0.04);
  vignette(ctx, 0.44);
}

export function studioSilent(ctx, t, shot, local) {
  fill(ctx, "#08080c", 0, 0, W, H);
  bands(ctx, 0, 0, W, H, [
    ["#121016", 1], ["#1e171a", 0.8], ["#0a090d", 1],
  ]);
  // Out-of-focus monitor edge on the right, and city bokeh.
  fill(ctx, "#1e2229", 500, 20, 160, 250);
  glow(ctx, 530, 130, 240, 220, P.pink3, 0.11);
  for (let i = 0; i < 14; i++) {
    ellipse(ctx, i % 4 === 0 ? P.red2 : P.gold2, 500 + (i * 41) % 150, 56 + (i * 37) % 170, 8, 4, 0.08);
  }
  // His face, lit by the screen.
  drawPerson(ctx, "him", 312, 552, {
    scale: 5, view: "front", pose: "stand", expression: "sad",
    outfit: "home", mouth: 0.55, blink: local % 4.2 > 4.02 ? 1 : 0,
    turn: 1, gaze: 1,
  });
  // Headphones pushed down around the shell: only the cups show, one on each
  // side of the body, clear of the eyes.
  for (const cx of [156, 468]) {
    ellipse(ctx, "#121014", cx, 148, 13, 18);
    ellipse(ctx, "#242026", cx, 148, 11, 16);
    fill(ctx, "#4a3d34", cx - 9, 132, 4, 10, 0.5);
    fill(ctx, "#1c181c", cx - 7, 158, 14, 4, 0.8);
  }
  // A cool rim from the monitor; a warm, fading one from the room.
  fill(ctx, "#c6d4d2", 463, 40, 2, 200, 0.1);
  fill(ctx, P.warm3, 160, 60, 2, 100, 0.05);
  // The screen in his eyes, carried with the head as it turns.
  fill(ctx, P.pink3, 249, 152, 4, 2, 0.3);
  fill(ctx, P.pink3, 369, 152, 4, 2, 0.24);
  // Foreground desk and monitor with a flat line.
  fill(ctx, "#0a080b", 0, 310, W, 50);
  fill(ctx, "#211a1c", 0, 310, W, 3);
  fill(ctx, "#151216", 422, 248, 218, 92);
  fill(ctx, "#262b2f", 430, 256, 202, 70);
  line(ctx, "#7e8e88", 438, 292, 624, 292, 1, 0.35);
  for (let i = 0; i < 30; i++) fill(ctx, "#7e8e88", 440 + i * 6, 291, 2, 2, 0.16);
  text(ctx, "00:00:00", 438, 260, {
    size: 7, color: "#75847e", shadow: false, threshold: 55, alpha: 0.55,
  });
  // The ticket on the desk, out of focus.
  ticket(ctx, 468, 322, 38, 19, { title: "影院", sub: "7:10" });
  alphaRect(ctx, P.ink, 468, 322, 38, 19, 0.35);
  // Silence is visual: a single mote crossing the flat line.
  fill(ctx, P.cream3, 520 + ((t * 6) % 80), 280, 1, 1, 0.3);
  dust(ctx, t, 200, 60, 280, 260, 18, P.cream3, 0.25);
  grain(ctx, t, 0.045);
  vignette(ctx, 0.48);
}

export function splitPhone(ctx, t, shot, local) {
  fill(ctx, "#08070b", 0, 0, W, H);
  // Left: his apartment.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, 318, H);
  ctx.clip();
  fill(ctx, "#0f0e14", 0, 0, 318, H);
  fill(ctx, "#1a151b", 0, 0, 318, 260);
  // Window with city lights.
  fill(ctx, "#07080d", 28, 50, 126, 134);
  cityWindowView(ctx, t, 32, 54, 118, 126);
  fill(ctx, "#151218", 24, 46, 134, 4);
  fill(ctx, "#151218", 24, 184, 134, 4);
  // Sofa and lamp.
  fill(ctx, "#231a1d", 0, 262, 318, 98);
  fill(ctx, "#332427", 16, 270, 286, 34);
  fill(ctx, "#4a3331", 20, 270, 278, 3);
  fill(ctx, "#1a1518", 0, 304, 318, 3);
  fill(ctx, "#171318", 258, 222, 3, 72);
  fill(ctx, "#b98551", 242, 214, 34, 6);
  glow(ctx, 258, 220, 86, 70, P.warm2, 0.1);
  // Him, sitting, phone in hand.
  drawPerson(ctx, "him", 150, 330, {
    scale: 2, facing: "right", pose: "sit", expression: "sad",
    outfit: "home", arm: "phone", blink: local % 4.4 > 4.22 ? 1 : 0,
  });
  // Phone: cool blue, a cursor blinking, no message sent.  It sits in front
  // of his resting claw, not over his face.
  fill(ctx, "#0b0c10", 185, 249, 22, 34);
  fill(ctx, "#27313b", 188, 252, 16, 28);
  fill(ctx, "#9cc0c7", 189, 254, 14, 7, 0.35);
  line(ctx, "#8aa9b0", 189, 265, 200, 265, 1, 0.5);
  fill(ctx, P.cream, 189, 271, 4, 1, local % 1.3 < 0.65 ? 0.8 : 0.1);
  glow(ctx, 196, 266, 76, 76, "#a9d0d6", 0.14);
  // Reflection of the phone on the window.
  fill(ctx, "#9cc0c7", 58, 140, 10, 4, 0.06);
  // The clock, both sides.
  text(ctx, "23:48", 238, 28, {
    size: 8, color: P.cream2, shadow: false, threshold: 55, alpha: 0.45,
  });
  ctx.restore();

  // Right: the booth.
  ctx.save();
  ctx.beginPath();
  ctx.rect(322, 0, 318, H);
  ctx.clip();
  fill(ctx, "#120d10", 322, 0, 318, H);
  fill(ctx, "#28191b", 322, 0, 318, 260);
  // Booth window with screen glow.
  fill(ctx, "#07080b", 352, 48, 172, 122);
  bands(ctx, 356, 52, 164, 114, [
    [P.dusk1, 0.9], [P.dusk2, 0.8], [P.pink2, 0.9], [P.pink3, 0.7],
  ]);
  glow(ctx, 456, 104, 120, 90, P.pink3, 0.22);
  for (let i = 0; i < 7; i++) fill(ctx, P.dusk0, 356, 112 + i * 8, 164, 1, 0.3);
  fill(ctx, "#171116", 348, 44, 180, 5);
  fill(ctx, "#171116", 348, 170, 180, 5);
  // Projector silhouette.  Kept clear of her shell: at 164 the body sat on
  // her head and read as a hat.
  fill(ctx, "#100d11", 486, 150, 84, 52);
  fill(ctx, "#3d3732", 490, 154, 76, 44);
  circle(ctx, "#181518", 512, 140, 16);
  circle(ctx, "#181518", 548, 136, 16);
  ring(ctx, "#74614e", 512, 140, 11, 2, 0.5);
  ring(ctx, "#74614e", 548, 136, 11, 2, 0.5);
  // Desk and warm lamp.
  fill(ctx, "#3b2a22", 322, 272, 318, 6);
  fill(ctx, "#1c1416", 322, 278, 318, 82);
  fill(ctx, "#c29a63", 582, 240, 5, 34);
  fill(ctx, "#e1b87a", 572, 236, 24, 4);
  glow(ctx, 584, 248, 92, 72, P.warm2, 0.12);
  // Her, sitting, phone in hand.
  drawPerson(ctx, "her", 480, 330, {
    scale: 2, facing: "left", pose: "sit", expression: "soft",
    outfit: "cinema", arm: "phone", blink: local % 3.8 > 3.64 ? 1 : 0,
  });
  // Phone: warm, a cursor blinking, a draft not sent.
  fill(ctx, "#0c0a0c", 423, 249, 22, 34);
  fill(ctx, "#3a2a2b", 426, 252, 16, 28);
  fill(ctx, "#e0a488", 427, 254, 14, 7, 0.4);
  line(ctx, "#c58f78", 427, 265, 439, 265, 1, 0.5);
  fill(ctx, P.cream, 427, 271, 4, 1, local % 1.1 < 0.55 ? 0.8 : 0.1);
  glow(ctx, 434, 266, 76, 76, P.red3, 0.13);
  text(ctx, "23:48", 560, 28, {
    size: 8, color: P.cream2, shadow: false, threshold: 55, alpha: 0.45,
  });
  ctx.restore();

  // The seam.  At one moment both screens brighten, but nothing connects.
  const pulse = Math.max(0, Math.sin((local - 1.4) * 2.2)) * 0.25;
  fill(ctx, "#08070b", 315, 0, 10, H);
  fill(ctx, P.red2, 318 + pulse * 4, 0, 2, H, 0.22 + pulse);
  glow(ctx, 320, 190, 70, 260, P.red2, 0.08 + pulse * 0.1);
  grain(ctx, t, 0.045);
  vignette(ctx, 0.44);
}

export function cityWindow(ctx, t, shot, local) {
  fill(ctx, "#08070b", 0, 0, W, H);
  // A dark room, a large window, and the city doing its night business.
  fill(ctx, "#141015", 0, 0, W, H);
  const wx = 54; const wy = 38; const ww = 532; const wh = 258;
  fill(ctx, "#1a1418", wx - 12, wy - 12, ww + 24, wh + 24);
  cityWindowView(ctx, t, wx, wy, ww, wh);
  // A distant cinema sign, red and small.
  fill(ctx, "#2a1316", 454, 214, 54, 18);
  fill(ctx, P.red2, 458, 218, 46, 10, 0.8);
  text(ctx, "影院", 464, 219, {
    size: 7, color: P.cream, shadow: false, threshold: 60, alpha: 0.6,
  });
  glow(ctx, 480, 222, 80, 50, P.red2, 0.13);
  // Window frame.
  fill(ctx, "#0c090d", wx - 6, wy - 6, ww + 12, 6);
  fill(ctx, "#0c090d", wx - 6, wy + wh, ww + 12, 6);
  fill(ctx, "#0c090d", wx - 6, wy, 6, wh);
  fill(ctx, "#0c090d", wx + ww, wy, 6, wh);
  fill(ctx, "#0c090d", wx + ww / 2 - 3, wy, 6, wh);
  // Curtains at the sides.
  fill(ctx, "#201318", 0, 0, 56, 340);
  fill(ctx, "#2e1a1f", 0, 0, 44, 340);
  fill(ctx, "#201318", 584, 0, 56, 340);
  fill(ctx, "#2e1a1f", 596, 0, 44, 340);
  // His reflection, faint, in the glass.
  ctx.save();
  ctx.globalAlpha = 0.13;
  drawPerson(ctx, "him", 390, 336, {
    scale: 2, view: "back", pose: "stand", phase: local * 0.25,
    outfit: "home", alpha: 1,
  });
  ctx.restore();
  // Him in the room, back to us, watching the two windows.
  drawPerson(ctx, "him", 360, 334, {
    scale: 2, view: "back", pose: "stand", phase: local * 0.25,
    outfit: "home", alpha: 0.96,
  });
  fill(ctx, P.red2, 348, 180, 7, 3, 0.7);
  // Desk with a phone lighting up, then going dark.
  fill(ctx, "#1a1215", 0, 300, W, 60);
  fill(ctx, "#35231f", 0, 300, W, 3);
  fill(ctx, "#211619", 72, 318, 118, 22);
  fill(ctx, "#0b0a0a", 118, 316, 22, 12);
  const lit = Math.max(0, Math.sin(local * 1.6 + 1.2));
  if (lit > 0.55) {
    fill(ctx, "#96b0b5", 120, 317, 18, 10, 0.4);
    glow(ctx, 129, 322, 70, 40, "#a9d0d6", 0.09);
  }
  // A cup and a folded note.
  fill(ctx, "#d8c4a5", 250, 320, 16, 13);
  fill(ctx, "#7a5440", 252, 322, 12, 2);
  fill(ctx, "#d8c4a5", 300, 326, 30, 6);
  // A thin red thread of light from the distant cinema to his sill.
  line(ctx, P.red3, 480, 228, 420, 300, 1, 0.08);
  grain(ctx, t, 0.045);
  vignette(ctx, 0.46);
}

export function workSplit(ctx, t, shot, local) {
  fill(ctx, "#08070b", 0, 0, W, H);
  // Left panel: the studio at night.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, 318, H);
  ctx.clip();
  fill(ctx, "#0c0d12", 0, 0, 318, H);
  fill(ctx, "#171a21", 0, 0, 318, 250);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      fill(ctx, "#1e222a", 8 + c * 58, 8 + r * 40, 50, 34);
      dither(ctx, "#12151b", 8 + c * 58, 8 + r * 40, 50, 34, 3, 0, 0.2);
    }
  }
  fill(ctx, "#1b171c", 0, 244, 318, 116);
  fill(ctx, "#3d2b24", 0, 244, 318, 3);
  // Monitor with a waveform.
  fill(ctx, "#08090c", 58, 76, 188, 118);
  fill(ctx, "#1b2429", 63, 81, 178, 108);
  for (let i = 0; i < 60; i++) {
    const amp = 2 + Math.abs(Math.sin(t * 2.1 + i * 0.5)) * 13;
    fill(ctx, "#89b09c", 68 + i * 2.8, 150 - amp / 2, 1, amp, 0.45);
  }
  line(ctx, "#52665d", 68, 150, 236, 150, 1, 0.5);
  text(ctx, "REEL 02 / MIX", 68, 86, {
    size: 6, color: "#99a89e", shadow: false, threshold: 55, alpha: 0.5,
  });
  // Him at the desk, leaning in.
  drawPerson(ctx, "him", 222, 340, {
    scale: 2, facing: "left", pose: "sit", expression: "soft",
    outfit: "home", arm: "reach", blink: local % 4.5 > 4.3 ? 1 : 0,
  });
  fill(ctx, "#1c1519", 264, 268, 14, 72);
  // Red mug, the same object as her paint tin.
  fill(ctx, "#8c3d39", 40, 276, 14, 16);
  fill(ctx, "#c66c5d", 42, 276, 10, 2);
  fill(ctx, "#3b2420", 56, 280, 5, 7);
  // Desk lamp.
  deskLamp(ctx, 284, 226);
  // A tiny red REC light.
  circle(ctx, P.red3, 290, 62, 2, 0.85);
  glow(ctx, 290, 62, 30, 30, P.red3, 0.16);
  text(ctx, "上海", 18, 330, {
    size: 7, color: P.cream2, shadow: false, threshold: 55, alpha: 0.35,
  });
  ctx.restore();

  // Right panel: the cinema, work by hand.
  ctx.save();
  ctx.beginPath();
  ctx.rect(322, 0, 318, H);
  ctx.clip();
  fill(ctx, "#171014", 322, 0, 318, H);
  fill(ctx, "#3a2422", 322, 0, 318, 252);
  // Poster on the wall, half-painted.
  fill(ctx, "#1a1013", 366, 30, 218, 178);
  fill(ctx, "#e0c9a8", 372, 36, 206, 166);
  bands(ctx, 378, 42, 194, 84, [
    [P.dusk2, 1], [P.pink2, 1], [P.pink3, 1],
  ]);
  circle(ctx, P.red2, 512, 84, 18);
  fill(ctx, "#5c3f46", 378, 112, 194, 84);
  for (let i = 0; i < 5; i++) fill(ctx, P.pink3, 382, 122 + i * 12, 186, 1, 0.22);
  // Half of the poster is still bare paper; her brush is mid-stroke.
  fill(ctx, "#e0c9a8", 378, 42, 72, 154, 0.82);
  text(ctx, "影院", 390, 52, {
    size: 19, color: "#74403a", shadow: false, threshold: 58, alpha: 0.55,
  });
  text(ctx, "重 映", 390, 80, {
    size: 10, color: "#7a463b", shadow: false, threshold: 55, alpha: 0.45,
    letterSpacing: 2,
  });
  // Paint tin, brushes, rags.
  fill(ctx, "#1b1214", 322, 252, 318, 108);
  fill(ctx, "#3a2420", 322, 252, 318, 4);
  fill(ctx, "#8c3d39", 520, 250, 26, 28);
  fill(ctx, "#c66c5d", 523, 250, 20, 3);
  fill(ctx, "#5e2b2a", 524, 258, 18, 2, 0.7);
  line(ctx, "#2b1c1a", 494, 236, 524, 270, 2);
  fill(ctx, "#b78958", 490, 232, 8, 5);
  fill(ctx, "#d8c5a8", 464, 288, 28, 18, 0.7);
  // Her, standing at the poster, painting.
  drawPerson(ctx, "her", 410, 340, {
    scale: 2, facing: "right", pose: "stand", expression: "soft",
    outfit: "cinema", arm: "paint", blink: local % 4.2 > 4.02 ? 1 : 0,
  });
  fill(ctx, P.red3, 404, 168, 6, 3, 0.8);
  // Brush tip and a little red paint.
  fill(ctx, P.red2, 438, 210, 5, 3);
  fill(ctx, "#b78958", 436, 212, 3, 14);
  // Warm light from the lobby lamp.
  glow(ctx, 500, 210, 140, 120, P.warm2, 0.1);
  text(ctx, "影院", 574, 330, {
    size: 7, color: P.cream2, shadow: false, threshold: 55, alpha: 0.35,
  });
  ctx.restore();

  // Divider and a small timecode that belongs to both lives.
  fill(ctx, "#08070b", 315, 0, 10, H);
  fill(ctx, P.red2, 319, 0, 1, H, 0.18);
  text(ctx, "02:18", 302, 342, {
    size: 6, color: "#9c8478", shadow: false, threshold: 55, alpha: 0.3,
  });
  grain(ctx, t, 0.045);
  vignette(ctx, 0.42);
}

function tornHalf(ctx, x, y, w, h, side) {
  // side: -1 left half, +1 right half.  The torn edge is a deterministic
  // zigzag, not a straight line.
  const pts = [];
  if (side < 0) {
    pts.push([x, y], [x + w - 4, y]);
    const edge = [
      [w - 4, 0], [w - 1, 8], [w - 5, 16], [w - 2, 25], [w - 6, 34],
      [w - 3, 43], [w - 7, 52], [w - 4, 61], [w - 8, h],
    ];
    for (const [ex, ey] of edge) pts.push([x + ex, y + ey]);
    pts.push([x, y + h]);
  } else {
    const edge = [
      [0, 0], [5, 7], [1, 15], [6, 24], [2, 33], [5, 42], [1, 51],
      [4, 60], [0, h],
    ];
    for (const [ex, ey] of edge) pts.push([x + ex, y + ey]);
    pts.push([x + w, y + h], [x + w, y]);
  }
  // Draw with an ink keyline.
  poly(ctx, P.ink, pts.map(([px0, py0]) => [px0 + (side < 0 ? -1 : 0), py0]));
  poly(ctx, P.red2, pts);
  poly(ctx, P.red3, pts.map(([px0, py0]) => [px0 + (side < 0 ? 1 : 0), py0 + 1]), 0.25);
  dither(ctx, "#9a3437", x, y, w, h, 3, 0, 0.3);
}

export function ticketTorn(ctx, t, shot, local) {
  fill(ctx, "#0b080a", 0, 0, W, H);
  // Dark wooden table, a film can, and one warm lamp.
  bands(ctx, 0, 0, W, H, [
    ["#100c0e", 1], ["#241715", 0.8], ["#0a0809", 1],
  ]);
  fill(ctx, "#3a251e", 0, 220, W, 140);
  fill(ctx, "#5a3a2b", 0, 220, W, 3);
  dither(ctx, "#241713", 0, 222, W, 138, 3, 1, 0.4);
  for (let i = 0; i < 8; i++) {
    fill(ctx, "#74503a", 20 + i * 83, 226 + (i % 3) * 14, 60, 1, 0.16);
  }
  // A film can and a coil of red thread in the background.
  circle(ctx, "#171215", 104, 160, 54);
  circle(ctx, "#3d3834", 104, 160, 49);
  ring(ctx, "#7f6a53", 104, 160, 34, 2, 0.5);
  circle(ctx, "#171215", 104, 160, 12);
  ring(ctx, "#b04a43", 548, 176, 28, 2, 0.3);
  ring(ctx, "#b04a43", 548, 176, 22, 1, 0.2);
  // A soft lamp from the right.
  glow(ctx, 548, 120, 200, 160, P.warm2, 0.12);
  // The ticket, held between two hands, begins to tear.
  const pull = ease(clamp01((local - 0.7) / 2.1));
  const gap = 2 + pull * 22;
  const tear = clamp01((local - 1.7) / 0.5);
  const cy = 174;
  const leftX = 226 - pull * 12;
  const rightX = 320 + gap;
  tornHalf(ctx, leftX, cy, 94, 58, -1);
  tornHalf(ctx, rightX, cy, 94, 58, 1);
  // Text: the halves no longer make the same sentence.
  text(ctx, "影院", leftX + 12, cy + 10, {
    size: 15, color: P.cream, shadow: false, threshold: 62, alpha: 0.9,
  });
  text(ctx, "ADMIT", rightX + 16, cy + 12, {
    size: 8, color: P.cream2, shadow: false, threshold: 55, alpha: 0.85,
  });
  text(ctx, "ONE", rightX + 22, cy + 24, {
    size: 8, color: P.cream2, shadow: false, threshold: 55, alpha: 0.75,
  });
  text(ctx, "7:10", leftX + 14, cy + 36, {
    size: 7, color: "#7a2c2e", shadow: false, threshold: 55, alpha: 0.75,
  });
  // Torn paper fibers at the seam.
  if (tear > 0) {
    for (let i = 0; i < 11; i++) {
      const fx = 338 + Math.sin(i * 1.7) * 9;
      const fy = cy + 4 + i * 5;
      line(ctx, "#f0d7b8", fx, fy, fx + 3 + (i % 3), fy - 1, 1, 0.35 * tear);
    }
    // A few red fibers drift down.
    for (let i = 0; i < 6; i++) {
      const fx = 338 + (i * 13) % 30;
      const fy = cy + 18 + ((local * 18 + i * 7) % 52);
      fill(ctx, P.red3, fx, fy, 1, 2, 0.3 * tear);
    }
  }
  // Hands: her sleeve on the left, his on the right.  Each grips the outer
  // edge of one half, so the tear happens between them.
  const leftHand = leftX - 64;
  const rightHand = rightX + 94 + 64;
  const handY = cy + 40;
  poly(ctx, P.ink, [[0, handY - 24], [leftHand - 34, handY - 18], [leftHand - 34, handY + 20], [0, handY + 28]]);
  poly(ctx, "#6b3d34", [[0, handY - 21], [leftHand - 34, handY - 16], [leftHand - 34, handY + 17], [0, handY + 24]]);
  fill(ctx, "#8c5444", 0, handY - 19, Math.max(0, leftHand - 36), 2, 0.5);
  poly(ctx, P.ink, [[W, handY - 24], [rightHand + 34, handY - 18], [rightHand + 34, handY + 20], [W, handY + 28]]);
  poly(ctx, "#29303d", [[W, handY - 21], [rightHand + 34, handY - 16], [rightHand + 34, handY + 17], [W, handY + 24]]);
  fill(ctx, "#414c5d", W - 40, handY - 19, 40, 2, 0.5);
  drawReachingHand(ctx, leftHand, handY, 1, 2, {
    who: "her", outfit: "winter", sleeve: "#6b3d34", sleeveHi: "#8c5444",
  });
  drawReachingHand(ctx, rightHand, handY, -1, 2, {
    who: "him", outfit: "winter", sleeve: "#29303d", sleeveHi: "#414c5d",
  });
  // A red thread between their wrists, snapping at the tear.
  if (tear < 0.7) {
    line(ctx, P.red3, leftX + 66, cy + 50, rightX + 14, cy + 48, 1, 0.3 * (1 - tear));
  } else {
    line(ctx, P.red3, leftX + 68, cy + 52, leftX + 92, cy + 66, 1, 0.3);
    line(ctx, P.red3, rightX - 2, cy + 50, rightX - 22, cy + 66, 1, 0.25);
  }
  dust(ctx, t, 160, 100, 340, 180, 14, P.warm3, 0.25);
  grain(ctx, t, 0.04);
  vignette(ctx, 0.48);
}

export function redSlip(ctx, t, shot, local) {
  // Macro: two hands, a red thread, and the gap between two seats.
  fill(ctx, "#0b080b", 0, 0, W, H);
  // Seat fabric on both sides, with a vertical slit of warm light.
  fill(ctx, "#3e161d", 0, 0, 270, H);
  fill(ctx, "#5b2026", 0, 0, 250, H);
  fill(ctx, "#7a2c30", 0, 0, 230, H);
  fill(ctx, "#3e161d", 370, 0, 270, H);
  fill(ctx, "#5b2026", 390, 0, 250, H);
  fill(ctx, "#7a2c30", 410, 0, 230, H);
  dither(ctx, "#2a1016", 0, 0, 270, H, 3, 1, 0.4);
  dither(ctx, "#2a1016", 370, 0, 270, H, 3, 0, 0.4);
  // The slit: a thin bright line of the next row, and darkness below.
  fill(ctx, "#0a080b", 258, 0, 124, H);
  fill(ctx, "#1a1014", 270, 0, 100, H);
  const slit = 0.25 + 0.15 * Math.sin(t * 0.8);
  fill(ctx, P.red2, 314, 0, 6, H, slit * 0.5);
  glow(ctx, 320, 210, 120, 220, P.red2, 0.12 + slit * 0.08);
  // Seat seams and a few creases: enough upholstery to give the red depth.
  line(ctx, "#8f3a3d", 190, 0, 190, H, 1, 0.18);
  line(ctx, "#8f3a3d", 444, 0, 444, H, 1, 0.16);
  line(ctx, "#2b1117", 226, 0, 226, H, 1, 0.5);
  line(ctx, "#2b1117", 410, 0, 410, H, 1, 0.5);
  for (let i = 0; i < 5; i++) {
    const cx = 40 + i * 46;
    line(ctx, "#2b1117", cx, 26 + (i % 3) * 9, cx + 3, 150 + (i % 4) * 22, 1, 0.12);
    line(ctx, "#9a4444", 392 + i * 44, 34 + (i % 2) * 11, 395 + i * 44, 162 + (i % 4) * 18, 1, 0.1);
  }
  // The room darkens toward the top, and the crotch of the seat is in shadow.
  for (let i = 0; i < 7; i++) alphaRect(ctx, "#0a080b", 0, 0, W, 10 + i * 14, 0.05 + i * 0.022);
  ellipse(ctx, "#2a0f15", 320, 300, 190, 46, 0.24);
  // The red thread, pulled through the gap.
  const slip = clamp01(local / 3.1);
  const topY = 30;
  const endY = 180 + slip * 190;
  redThread(ctx, [[310, topY], [314, 90], [318, 150], [320, endY]], P.red3, 0.75);
  line(ctx, P.red4, 311, topY, 315, 90, 1, 0.35);
  // Fingers at first hold it, then close on nothing.
  const close = ease(clamp01((local - 1.4) / 1.5));
  const lx = 250 - close * 16;
  const rx = 378 + close * 16;
  const hy = 160 + close * 3;
  // Tapered sleeves out of the dark, so the arms belong to bodies off-screen
  // instead of ending in mid-air.
  poly(ctx, "#8c3f39", [[0, hy - 27], [lx - 38, hy - 20], [lx - 38, hy + 22], [0, hy + 31]]);
  poly(ctx, "#b25e51", [[0, hy - 24], [lx - 38, hy - 18], [lx - 38, hy - 16], [0, hy - 21]], 0.4);
  poly(ctx, "#5e2926", [[0, hy + 23], [lx - 38, hy + 15], [lx - 38, hy + 22], [0, hy + 31]], 0.55);
  const ry = 166 + close * 3;
  poly(ctx, "#253040", [[W, ry - 27], [rx + 38, ry - 20], [rx + 38, ry + 22], [W, ry + 31]]);
  poly(ctx, "#45546a", [[W, ry - 24], [rx + 38, ry - 18], [rx + 38, ry - 16], [W, ry - 21]], 0.4);
  poly(ctx, "#18212e", [[W, ry + 23], [rx + 38, ry + 15], [rx + 38, ry + 22], [W, ry + 31]], 0.55);
  // Lift the hands off the red with a soft contact shadow.
  ellipse(ctx, "#2a0f15", 292, hy + 26, 46, 13, 0.35);
  ellipse(ctx, "#2a0f15", 378, 166 + 26, 46, 13, 0.35);
  drawReachingHand(ctx, lx, hy, 1, 1.8, {
    who: "her", outfit: "winter",
  });
  drawReachingHand(ctx, rx, 166 + close * 3, -1, 1.8, {
    who: "him", outfit: "winter",
  });
  // The pinched thread between the fingertips.
  fill(ctx, P.red3, 306, 158, 24, 2, 0.85 * (1 - close));
  fill(ctx, P.red4, 312, 158, 10, 1, 0.9 * (1 - close));
  if (close > 0.7) {
    fill(ctx, P.red3, 306, 174, 9, 1, 0.2);
    fill(ctx, P.red3, 330, 178, 6, 1, 0.16);
  }
  // A sliver of ticket caught at the bottom of the gap.
  fill(ctx, P.cream2, 300, 316, 18, 5, 0.15);
  fill(ctx, P.red2, 300, 318, 12, 3, 0.4);
  // Floating fibers and dust.
  for (let i = 0; i < 14; i++) {
    const fx = 220 + ((i * 47 + t * 4) % 200);
    const fy = 40 + ((i * 61 + t * 3) % 260);
    fill(ctx, i % 3 === 0 ? P.red3 : P.cream3, fx, fy, 1, 1, 0.12);
  }
  grain(ctx, t, 0.045);
  vignette(ctx, 0.5);
}

export function cityWalk(ctx, t, shot, local) {
  fill(ctx, "#0a0b11", 0, 0, W, H);
  bands(ctx, 0, 0, W, 220, [
    [P.night0, 0.8], [P.night1, 0.9], [P.night2, 0.6],
  ]);
  // Buildings, signs, and shop windows.
  const scroll = local * 22;
  for (let i = 0; i < 7; i++) {
    const bx = i * 104 - (scroll % 104);
    const bh = 70 + (i * 29) % 90;
    fill(ctx, "#101520", bx, 220 - bh, 96, bh);
    fill(ctx, "#141b28", bx + 4, 220 - bh + 4, 88, bh - 8);
    for (let r = 0; r < Math.floor(bh / 18); r++) {
      for (let c = 0; c < 3; c++) {
        if ((i * 5 + r * 3 + c) % 7 < 3) {
          fill(ctx, (i + c) % 4 === 0 ? P.warm2 : P.gold2, bx + 10 + c * 26, 220 - bh + 12 + r * 18, 4, 3, 0.3);
        }
      }
    }
    if (i === 2) {
      fill(ctx, "#30151a", bx + 8, 220 - bh + 8, 42, 16);
      fill(ctx, P.red2, bx + 10, 220 - bh + 10, 38, 12, 0.75);
      text(ctx, "声音", bx + 15, 220 - bh + 11, {
        size: 7, color: P.cream, shadow: false, threshold: 58, alpha: 0.6,
      });
    }
    if (i === 5) {
      fill(ctx, "#2a1a12", bx + 54, 220 - bh + 24, 30, 52, 0.5);
    }
  }
  // Street and pavement.
  fill(ctx, "#19181e", 0, 220, W, 140);
  fill(ctx, "#2c292b", 0, 220, W, 3);
  fill(ctx, "#111116", 0, 278, W, 82);
  for (let i = 0; i < 7; i++) {
    fill(ctx, "#d8c9ac", 20 + i * 94 - (scroll % 94), 306, 44, 3, 0.16);
  }
  // Shop windows and the poster for a revival.
  fill(ctx, "#201a19", 60, 236, 92, 42);
  fill(ctx, "#c79a70", 64, 240, 84, 34, 0.35);
  fill(ctx, "#1c1414", 470, 222, 76, 58);
  fill(ctx, "#d9bfa0", 474, 226, 68, 50);
  bands(ctx, 478, 230, 60, 20, [[P.dusk2, 1], [P.pink2, 1]]);
  circle(ctx, P.red2, 522, 240, 6);
  fill(ctx, "#5b3d43", 478, 250, 60, 22);
  text(ctx, "重映", 486, 264, {
    size: 7, color: "#6b3532", shadow: false, threshold: 55, alpha: 0.85,
  });
  // A red traffic light.
  fill(ctx, "#161217", 404, 160, 8, 62);
  fill(ctx, "#2a1417", 398, 146, 20, 34);
  circle(ctx, P.red3, 408, 154, 5, 0.9);
  glow(ctx, 408, 154, 60, 50, P.red3, 0.18);
  circle(ctx, "#2c2a26", 408, 166, 4, 0.5);
  // Crowd, passing in both directions.
  for (let i = 0; i < 8; i++) {
    const dir = i % 2 ? 1 : -1;
    const x = ((i * 97 + local * 26 * dir + 180) % (W + 80)) - 40;
    const y = 302 + (i % 3) * 7;
    drawPerson(ctx, i % 3 ? "him" : "her", x, y, {
      scale: 1, facing: dir > 0 ? "right" : "left", pose: "walk",
      phase: local * 1.3 + i, outfit: "city", alpha: 0.35 + (i % 4) * 0.05,
      silhouette: true,
    });
  }
  // Him, not quite part of the crowd.
  const stop = clamp01((local - 2.5) / 1.2);
  const x = 270 + stop * 80;
  // The crowd walks at 1x; at 2x he was twice the height of the people he is
  // supposed to be part of.  1.4x keeps him the nearest figure, not a giant.
  drawPerson(ctx, "him", x, 318, {
    scale: 1.4, facing: "right", pose: stop > 0.6 ? "stand" : "walk",
    phase: local * 1.2, expression: "sad", outfit: "city",
    arm: "down", alpha: 1,
  });
  // His bag, set down on the pavement beside him: the shell is too wide to
  // hang one off, and a bag on the ground keeps him rooted in the shot.
  fill(ctx, "#1a1418", x - 54, 288, 22, 32);
  fill(ctx, "#6a4a39", x - 52, 290, 18, 28);
  fill(ctx, "#a87b52", x - 52, 290, 18, 2);
  fill(ctx, "#3a2a22", x - 48, 294, 10, 2, 0.6);
  // Dry pavement reflections, not rain.
  for (let i = 0; i < 8; i++) {
    const rx = 60 + i * 78;
    alphaRect(ctx, i % 3 === 0 ? P.red1 : P.gold0, rx, 292, 3, 38, 0.05);
  }
  dust(ctx, t, 100, 180, 460, 120, 10, P.cream3, 0.2);
  grain(ctx, t, 0.045);
  vignette(ctx, 0.42);
}

function miniScreen(ctx, x, y, w, h, kind, t) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (kind === "sea") {
    bands(ctx, x, y, w, h * 0.55, [[P.dusk2, 1], [P.pink2, 1], [P.pink3, 1]]);
    circle(ctx, P.pink3, x + w * 0.7, y + h * 0.4, w * 0.12);
    fill(ctx, P.sea1, x, y + h * 0.55, w, h * 0.45);
    for (let i = 0; i < 5; i++) fill(ctx, P.pink3, x + 4, y + h * 0.62 + i * 5, w - 8, 1, 0.3);
  } else if (kind === "stage") {
    fill(ctx, "#160e13", x, y, w, h);
    fill(ctx, "#6a2028", x + w * 0.2, y, w * 0.6, h * 0.7);
    fill(ctx, "#2a1218", x + w * 0.25, y, w * 0.5, h * 0.65);
    ellipse(ctx, "#08070a", x + w / 2, y + h * 0.44, w * 0.07, h * 0.08);
    fill(ctx, "#0c0a0d", x + w * 0.42, y + h * 0.52, w * 0.16, h * 0.3);
    fill(ctx, P.gold2, x + w * 0.47, y + h * 0.35, w * 0.06, h * 0.03);
  } else if (kind === "cinema") {
    fill(ctx, "#1a0d12", x, y, w, h);
    fill(ctx, "#c7a482", x + w * 0.18, y + h * 0.12, w * 0.64, h * 0.34);
    for (let r = 0; r < 2; r++) {
      for (let i = 0; i < 4; i++) {
        fill(ctx, "#6b252b", x + w * 0.16 + i * w * 0.17, y + h * 0.55 + r * h * 0.16, w * 0.13, h * 0.12);
      }
    }
  } else if (kind === "embrace") {
    bands(ctx, x, y, w, h, [[P.dusk1, 1], [P.pink1, 1], [P.pink2, 1]]);
    fill(ctx, "#39262d", x + w * 0.28, y + h * 0.34, w * 0.46, h * 0.46);
    ellipse(ctx, "#39262d", x + w * 0.5, y + h * 0.44, w * 0.1, h * 0.15);
    fill(ctx, "#2f2027", x + w * 0.22, y + h * 0.58, w * 0.22, h * 0.2);
  } else if (kind === "city") {
    bands(ctx, x, y, w, h, [[P.night1, 1], [P.night2, 1], [P.night3, 0.5]]);
    for (let i = 0; i < 7; i++) {
      const bh = h * (0.25 + (i * 0.11) % 0.5);
      fill(ctx, "#0b0f18", x + i * w / 7, y + h - bh, w / 7 - 1, bh);
      for (let r = 0; r < 3; r++) {
        if ((i + r) % 2) fill(ctx, P.gold2, x + i * w / 7 + 3, y + h - bh + 5 + r * 7, 2, 2, 0.4);
      }
    }
  } else {
    // Snow / white noise.
    fill(ctx, "#1c2028", x, y, w, h);
    for (let i = 0; i < 34; i++) {
      px(ctx, i % 5 === 0 ? P.red2 : P.cream, x + (i * 37 + t * 8) % w, y + (i * 53) % h, 0.25);
    }
  }
  // Screen scanlines and a little bloom.
  for (let i = 0; i < h; i += 3) fill(ctx, "#000000", x, y + i, w, 1, 0.1);
  ctx.restore();
  fill(ctx, "#0d0a0c", x - 3, y - 3, w + 6, 3);
  fill(ctx, "#0d0a0c", x - 3, y + h, w + 6, 3);
  fill(ctx, "#0d0a0c", x - 3, y, 3, h);
  fill(ctx, "#0d0a0c", x + w, y, 3, h);
}

export function cityReflections(ctx, t, shot, local) {
  fill(ctx, "#08070b", 0, 0, W, H);
  // The storefront.
  fill(ctx, "#1b171a", 58, 28, 524, 292);
  fill(ctx, "#0d1015", 68, 38, 504, 236);
  // Six screens, each a different role.
  const kinds = ["sea", "stage", "cinema", "embrace", "city", "snow"];
  for (let i = 0; i < 6; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 78 + col * 164;
    const y = 48 + row * 110;
    const w = 148;
    const h = 92;
    const glitch = i === 3 && Math.sin(t * 9.1) > 0.94;
    miniScreen(ctx, x, y, w, h, glitch ? "snow" : kinds[i], t + i);
    // One screen goes dark, then comes back.
    if (i === 4 && Math.sin(t * 0.7 + 1.5) > 0.2) {
      alphaRect(ctx, P.ink, x, y, w, h, 0.25);
    }
    // A tiny red standby light.
    circle(ctx, i === 3 ? P.red3 : "#4e3a36", x + w - 6, y + h - 5, 1, 0.7);
  }
  // A red neon shop sign above.
  fill(ctx, "#1b0e11", 220, 6, 200, 22);
  text(ctx, "影 像", 320, 9, {
    size: 12, color: P.red3, align: "center", shadow: false, threshold: 60,
    letterSpacing: 4, alpha: 0.7 * flicker(t, 2),
  });
  glow(ctx, 320, 18, 240, 50, P.red2, 0.1);
  // Glass and street reflection.
  poly(ctx, P.cream, [[90, 38], [162, 38], [80, 274], [54, 274]], 0.035);
  poly(ctx, P.cream, [[420, 38], [466, 38], [560, 274], [510, 274]], 0.022);
  // His reflection, standing on the pavement, looking in.
  ctx.save();
  ctx.globalAlpha = 0.19;
  drawPerson(ctx, "him", 396, 356, {
    scale: 2, facing: "left", pose: "stand", expression: "sad",
    outfit: "city", arm: "down", alpha: 1,
  });
  ctx.restore();
  // A faint double of his face over the embrace screen.
  ellipse(ctx, "#d2a08d", 398, 172, 10, 13, 0.08);
  fill(ctx, P.red2, 384, 158, 4, 2, 0.25);
  // Passing headlights sweep the glass.
  const sweep = ((local * 120) % 760) - 80;
  poly(ctx, "#e9e2ce", [[sweep, 36], [sweep + 38, 36], [sweep + 118, 274], [sweep + 82, 274]], 0.025);
  // Foreground pavement.
  fill(ctx, "#121015", 0, 300, W, 60);
  fill(ctx, "#242126", 0, 300, W, 3);
  for (let i = 0; i < 5; i++) fill(ctx, "#3a3336", 30 + i * 120, 326, 54, 1, 0.18);
  dust(ctx, t, 100, 50, 440, 250, 14, P.cream3, 0.2);
  grain(ctx, t, 0.045);
  vignette(ctx, 0.45);
}

export function cityClose(ctx, t, shot, local) {
  fill(ctx, "#08070b", 0, 0, W, H);
  // Out-of-focus city and a wet-looking glow, though it is not raining.
  bands(ctx, 0, 0, W, H, [
    [P.night0, 0.8], [P.night1, 0.8], [P.night2, 0.6],
  ]);
  for (let i = 0; i < 18; i++) {
    const x = (i * 71 + 20) % W;
    const y = 40 + (i * 43) % 260;
    const col = i % 6 === 0 ? P.red2 : i % 5 === 0 ? P.pink2 : P.gold2;
    ellipse(ctx, col, x, y, 8 + (i % 4) * 6, 3 + (i % 3) * 2, 0.08);
  }
  // A passing train / shop light.
  const sweep = ((local * 90) % 760) - 80;
  poly(ctx, P.red2, [[sweep, 0], [sweep + 70, 0], [sweep + 150, H], [sweep + 80, H]], 0.035);
  // His face.
  drawPerson(ctx, "him", 330, 552, {
    scale: 5, view: "front", pose: "stand", expression: "wistful",
    outfit: "city", blink: local % 4.6 > 4.42 ? 1 : 0,
    // The phones stay on, but his eyes leave the lens halfway through.
    gaze: local > 1.6 ? 1 : 0,
  });
  // Headphones over the sides of the shell, with the band arched above it.
  line(ctx, "#121014", 172, 152, 250, 26, 5);
  line(ctx, "#121014", 250, 26, 410, 26, 5);
  line(ctx, "#121014", 410, 26, 488, 152, 5);
  ellipse(ctx, "#211c22", 172, 150, 14, 20);
  ellipse(ctx, "#211c22", 488, 150, 14, 20);
  fill(ctx, "#44382f", 169, 140, 6, 18, 0.5);
  fill(ctx, "#44382f", 485, 140, 6, 18, 0.5);
  // The red cable, loose, hanging off the near cup.
  line(ctx, P.red2, 166, 168, 152, 222, 2, 0.8);
  line(ctx, P.red2, 152, 222, 168, 278, 1, 0.45);
  line(ctx, P.red2, 168, 278, 154, 334, 1, 0.2);
  // City light on his shell: cold from the left, a red sign from the right.
  fill(ctx, "#b9d0d2", 177, 40, 2, 200, 0.08);
  fill(ctx, P.red3, 481, 60, 2, 160, 0.07);
  // Neon reflections in his eyes.
  fill(ctx, "#b9d0d2", 257, 142, 4, 2, 0.22);
  fill(ctx, P.red3, 377, 142, 4, 2, 0.18);
  fill(ctx, P.cream, 258, 142, 2, 1, 0.45);
  // A recorder and phone in the foreground, held loosely.
  fill(ctx, "#0b0a0d", 0, 316, W, 44);
  fill(ctx, "#202027", 88, 326, 72, 30);
  fill(ctx, "#34343d", 92, 330, 64, 22);
  circle(ctx, "#0d0d10", 108, 341, 3);
  fill(ctx, P.red3, 124, 338, 2, 2, 0.7);
  // The city breathes; he does not move.
  dust(ctx, t, 220, 40, 300, 280, 16, P.cream3, 0.2);
  grain(ctx, t, 0.045);
  vignette(ctx, 0.48);
}
