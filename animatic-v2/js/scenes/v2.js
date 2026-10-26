/* Animatic V2 — shot construction.
 *
 * The song is the edit.  Each long section in timeline.js is broken into a
 * shot list here; the lyric line at the cut is the reason the shot exists.
 * The nine real experiences are used as story material, not as a schedule.
 *
 * Everything in this file is still an animatic: sprite cells, procedural
 * holds and camera moves.  It is not final frame-by-frame animation.
 */

import { PAL } from "../../../js/engine/palette.js";
import { drawText } from "../../../js/engine/pixeltext.js";
import { clamp, lerp, smoothstep } from "../../../js/engine/util.js";
import {
  C, W, H, fill, vBands, dither, pixelCircle, glow, drawSpriteScaled,
  drawSpritePortrait, drawSnow, drawRain, drawDust, drawBirds, drawWindow,
  drawChatPanel, drawPhoneCall, drawVignette, drawGrain,
} from "../art.js";
import { CHAT_MESSAGES } from "../timeline.js";
import {
  drawApartment, drawAlbumClose, drawYearbookClose, drawCityStreet, drawBenchScene,
} from "./present.js";
import {
  drawGateShot, drawClassroomDay, drawBedroomSplit, drawPhoneDial,
  drawCorridor, drawPark, drawWideBedroom,
} from "./school.js";
import {
  drawMountainBackdrop, drawTrailWide, drawSummit, drawKiss,
} from "./outdoors.js";
import {
  drawRooftop, drawStudyAfternoon, drawWinterWalk, drawGateTogether,
  drawGraduation, drawRooftopDusk,
} from "./high3.js";
import {
  drawSplitDorm, drawCampusFork, drawDormExterior,
} from "./university.js";

/* ------------------------------------------------------------------ util */

function groundShadow(ctx, cx, cy, rx, ry, alpha = 0.25) {
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let y = -ry; y <= ry; y++) {
    const half = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
    fill(ctx, "#0a0c12", cx - half, cy + y, half * 2, 1);
  }
  ctx.restore();
}

function circleRows(ctx, color, cx, cy, r, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  pixelCircle(ctx, color, cx, cy, r);
  ctx.restore();
}

function neonSign(ctx, x, y, w, h, color, vertical) {
  ctx.save();
  ctx.globalAlpha = 0.06;
  fill(ctx, color, x - 7, y - 7, w + 14, h + 14);
  ctx.globalAlpha = 0.11;
  fill(ctx, color, x - 3, y - 3, w + 6, h + 6);
  ctx.globalAlpha = 0.95;
  fill(ctx, color, x, y, w, h);
  ctx.globalAlpha = 0.7;
  fill(ctx, "#fff3d8", x + 1, y + 1, Math.max(1, w - 2), 1);
  ctx.globalAlpha = 1;
  // Abstract glyph breaks; no invented shop name.
  if (vertical) {
    for (let i = 0; i < 3; i++) {
      fill(ctx, "#121522", x + 2, y + 9 + i * Math.max(10, (h - 14) / 3), Math.max(2, w - 4), 3);
    }
  } else {
    for (let i = 0; i < 3; i++) {
      fill(ctx, "#121522", x + 9 + i * Math.max(8, (w - 18) / 3), y + 2, 3, Math.max(2, h - 4));
    }
  }
  ctx.restore();
}

function drawUmbrella(ctx, cx, cy, r, color, rim) {
  for (let y = -r; y <= 0; y++) {
    const half = Math.round(Math.sqrt(Math.max(0, r * r - y * y)));
    fill(ctx, color, cx - half, cy + y, half * 2, 1);
  }
  // A lit rim along the canopy edge, so it reads against the night sky.
  for (let x = -r; x <= r; x++) {
    const h = Math.round(Math.sqrt(Math.max(0, r * r - x * x)));
    fill(ctx, rim, cx + x, cy - h, 1, 1);
    if (x % 12 === 0) fill(ctx, rim, cx + x, cy - h, 1, 2 + (x % 5));
  }
  fill(ctx, rim, cx - r, cy, r * 2, 1);
  // Ribs.
  for (const k of [-0.66, -0.33, 0.33, 0.66]) {
    for (let i = 0; i < r; i += 2) {
      const q = i / r;
      fill(ctx, "#0e1420", cx + k * r * q, cy - r + i, 1, 2);
    }
  }
  // Shaft and handle, visible enough to connect the canopy to his hand.
  fill(ctx, "#59647a", cx - 1, cy, 2, r + 20);
  fill(ctx, "#8b98ad", cx - 1, cy, 1, r + 16);
  fill(ctx, "#59647a", cx - 7, cy + r + 18, 7, 2);
  fill(ctx, "#59647a", cx - 8, cy + r + 12, 2, 8);
}

function withCamera(ctx, zoom, fx, fy, fn) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(fx, fy);
  ctx.scale(zoom, zoom);
  ctx.translate(-fx, -fy);
  fn();
  ctx.restore();
}

function snowAtWindows(ctx, t) {
  drawSnow(ctx, t, 196, 38, 100, 124, 16);
  drawSnow(ctx, t, 334, 38, 100, 124, 15);
}

/* ------------------------------------------------------------- new shots */

/** Rainy neon city.  Used for the present-day through-line and the crowd. */
export function drawNeonCity(ctx, t, opts = {}) {
  const pan = opts.pan ?? t * 10;

  vBands(ctx, 0, 0, W, 254, [
    ["#070b16", 1],
    ["#0d1728", 1.1],
    ["#1b2740", 0.65],
  ]);
  ctx.globalAlpha = 0.13;
  fill(ctx, "#8e4a5e", 0, 176, W, 82);
  ctx.globalAlpha = 1;

  // Far skyline, with a low parallax.
  for (let i = 0; i < 15; i++) {
    const bx = i * 54 - 40 - ((pan * 0.12) % 54);
    const bh = 42 + ((i * 37) % 82);
    fill(ctx, i % 4 === 0 ? "#0b1322" : "#0e1829", bx, 254 - bh, 50, bh);
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 2; k++) {
        if ((i + j + k) % 3 !== 0) {
          fill(ctx, j === 2 ? "#7b6a7a" : "#d9b879", bx + 8 + k * 17, 254 - bh + 10 + j * 16, 3, 2);
        }
      }
    }
  }

  // Nearer blocks.
  for (let i = 0; i < 11; i++) {
    const bx = i * 66 - 30 - ((pan * 0.26) % 66);
    const bh = 64 + ((i * 41) % 106);
    fill(ctx, i % 3 === 0 ? "#101a2b" : "#0b1421", bx, 254 - bh, 58, bh);
    fill(ctx, "#1c2940", bx, 254 - bh, 58, 2);
    for (let j = 0; j < 5; j++) {
      for (let k = 0; k < 3; k++) {
        if ((i + j + k) % 4 !== 0) {
          fill(ctx, "#c9a35c", bx + 7 + k * 16, 254 - bh + 9 + j * 14, 2, 3);
        }
      }
    }
  }

  const signs = [
    [46, 136, 10, 62, "#e06a8a", true],
    [104, 96, 54, 10, "#5fc8d8", false],
    [192, 150, 9, 54, "#f2b56b", true],
    [242, 112, 42, 9, "#8f7ad8", false],
    [382, 128, 9, 64, "#e06a8a", true],
    [432, 92, 50, 10, "#5fc8d8", false],
    [514, 146, 8, 52, "#f2b56b", true],
    [552, 108, 44, 9, "#e06a8a", false],
  ];
  for (const [sx, sy, sw, sh, color, vertical] of signs) {
    neonSign(ctx, sx - ((pan * 0.04) % 16), sy, sw, sh, color, vertical);
  }

  // Street and wet reflections.
  fill(ctx, "#232832", 0, 254, W, 14);
  fill(ctx, "#3c4350", 0, 254, W, 1);
  fill(ctx, "#0b1018", 0, 268, W, 92);
  fill(ctx, "#1a2029", 0, 268, W, 2);
  for (let i = 0; i < 8; i++) {
    fill(ctx, "#555b66", i * 92 - ((pan * 0.5) % 92), 318, 42, 2);
  }
  for (const [sx, , sw, , color] of signs) {
    for (let k = 0; k < 4; k++) {
      ctx.globalAlpha = 0.10 - k * 0.018;
      fill(ctx, color, sx - 2 + k * 4, 276, 3, 58 + k * 6);
    }
    ctx.globalAlpha = 0.07;
    dither(ctx, color, sx - 10, 294, sw + 20, 48, 3, 0);
    ctx.globalAlpha = 1;
  }
  // A few puddles keep the street from reading as a flat card.
  ctx.globalAlpha = 0.35;
  for (const [px, py, rx, ry] of [[170, 326, 110, 10], [456, 342, 140, 12]]) {
    for (let y = -ry; y <= ry; y++) {
      const half = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
      fill(ctx, "#233045", px - half, py + y, half * 2, 1);
    }
  }
  ctx.globalAlpha = 1;

  const crowd = opts.crowd === true;
  if (crowd) {
    // Street lamps give the crowd an edge to stand against.
    for (const lx of [132, 508]) {
      fill(ctx, "#1a2333", lx - 1, 238, 3, 68);
      fill(ctx, "#1a2333", lx - 5, 236, 16, 3);
      fill(ctx, "#ffd9a0", lx + 8, 238, 6, 3);
      glow(ctx, assetsForCity?.fx.glowWarm, lx + 10, 240, 130, 120, 0.16);
      ctx.globalAlpha = 0.08;
      fill(ctx, PAL.warm, lx - 46, 306, 112, 8);
      ctx.globalAlpha = 1;
    }
    for (let i = 0; i < 9; i++) {
      const x = ((i * 97 + t * 22) % 760) - 60;
      drawCrowdFigure(ctx, x, 314 - (i % 3) * 4, 0.92 + (i % 3) * 0.1, i, t, false);
    }
    const womanX = 640 - ((t * 24) % 780);
    drawCrowdFigure(ctx, womanX, 316, 1.05, 4, t, true);
    // Two out-of-focus figures at the edges put the viewer inside the crowd.
    drawCrowdFigure(ctx, 54, 368, 1.7, 7, t, false);
    drawCrowdFigure(ctx, 604, 364, 1.6, 9, t, true);
  }

  if (opts.adult !== false) {
    const ax = opts.adultX ?? 290;
    const frame = opts.stand
      ? `idle_side_${Math.floor(t * 1.4) % 4}`
      : `walk_side_${Math.floor(t * 6.8) % 6}`;
    groundShadow(ctx, ax, 333, 26, 5, 0.35);
    drawSpriteScaled(ctx, assetsForCity.sprites, "male", frame, ax, 332, 1.8, {
      image: opts.image, flipX: opts.flipX,
    });
    // Canopy edge sits just above the crown, offset to the hand side; the
    // shaft is in front of the shoulder, never down through the face.
    if (opts.umbrella) {
      drawUmbrella(ctx, ax + 16, 250, 40, "#161d2c", "#a7566b");
      fill(ctx, PAL.skin, ax + 6, 302, 10, 11);
      fill(ctx, PAL.skinSh, ax + 6, 310, 10, 3);
      fill(ctx, PAL.skinSh, ax + 6, 302, 2, 8);
    }
    // A cold shop-light rim, and a wet reflection.
    ctx.globalAlpha = 0.45;
    fill(ctx, "#9f6a78", ax + 17, 286, 1, 26);
    ctx.globalAlpha = 0.10;
    fill(ctx, "#2a2230", ax - 20, 334, 40, 16);
    ctx.globalAlpha = 1;
  }

  drawRain(ctx, t, 0, 0, W, H, 54);
  for (let i = 0; i < 9; i++) {
    ctx.globalAlpha = 0.04 + (i % 3) * 0.015;
    pixelCircle(ctx, ["#e06a8a", "#5fc8d8", "#f2b56b"][i % 3],
      (i * 83 + t * 2) % W, 246 + (i * 31) % 100, 2 + (i % 3));
  }
  ctx.globalAlpha = 1;
  drawVignette(ctx, 0.36);
}

// drawNeonCity is also called from inside a clipped window, where it must not
// draw the present-day man.  The asset bank only exists on the scene factory,
// so it is parked here during V2 construction.  This never touches the PNGs.
let assetsForCity = null;

function drawCrowdFigure(ctx, x, y, s, i, t, woman) {
  const coat = woman ? "#3a2733" : ["#1b2536", "#232b3a", "#2a2233"][i % 3];
  const rim = ["#e06a8a", "#5fc8d8", "#f2b56b"][i % 3];
  const bob = Math.round(Math.sin(t * 5.6 + i * 1.7) * s);
  groundShadow(ctx, x, y + 1, 14 * s, 3 * s, 0.35);
  // Legs and coat; shoulders are wider than the waist.
  fill(ctx, "#0c111b", x - 6 * s, y - 15 * s, 5 * s, 15 * s);
  fill(ctx, "#0c111b", x + 2 * s, y - 15 * s, 5 * s, 15 * s);
  fill(ctx, coat, x - 8 * s, y - 36 * s + bob, 16 * s, 26 * s);
  fill(ctx, coat, x - 10 * s, y - 38 * s + bob, 20 * s, 9 * s);
  fill(ctx, "#0e1420", x - 9 * s, y - 13 * s, 18 * s, 3 * s);
  // Head, with a hint of face turned toward the streetlight.
  circleRows(ctx, "#1d2335", x, y - 44 * s + bob, 6 * s);
  ctx.globalAlpha = 0.55;
  fill(ctx, "#8a6258", x - 2 * s, y - 45 * s + bob, 4 * s, 3 * s);
  ctx.globalAlpha = 1;
  if (woman) {
    fill(ctx, "#221c28", x + 4 * s, y - 48 * s + bob, 6 * s, 27 * s);
    fill(ctx, "#b0566c", x + 9 * s, y - 40 * s + bob, 1, 1);
  }
  // Wet neon rim, so the silhouette is not a black post.
  ctx.globalAlpha = 0.35;
  fill(ctx, rim, x + 9 * s, y - 34 * s + bob, 1, 20 * s);
  fill(ctx, rim, x - 10 * s, y - 12 * s, 3 * s, 1);
  ctx.globalAlpha = 1;
  if (i % 2 === 0) {
    drawUmbrella(ctx, x, y - 58 * s + bob, 17 * s, "#141c2c", rim);
  } else {
    fill(ctx, "#232d40", x - 7 * s, y - 52 * s + bob, 14 * s, 4 * s);
    fill(ctx, rim, x - 7 * s, y - 52 * s + bob, 14 * s, 1);
  }
}

/** Interior looking out at the neon street, with the man as a reflection. */
export function drawNeonWindow(ctx, t, opts = {}) {
  fill(ctx, "#15161d", 0, 0, W, H);
  vBands(ctx, 0, 0, W, 300, [["#1a1a22", 1], ["#12141c", 1]]);

  // Window opening.
  ctx.save();
  ctx.beginPath();
  ctx.rect(86, 24, 468, 286);
  ctx.clip();
  ctx.translate(-34, -8);
  drawNeonCity(ctx, t, {
    pan: (opts.pan ?? t * 6) + 40,
    adult: false,
    crowd: false,
  });
  // The glass is a little darker than the street.
  ctx.globalAlpha = 0.20;
  fill(ctx, "#07101e", 0, 0, W, H);
  ctx.globalAlpha = 1;

  // His reflection.  A dark shape alone disappears against the glass, so a
  // cold shop-light rim and one warm edge keep the silhouette readable.
  const rx = 434;
  ctx.globalAlpha = 0.78;
  fill(ctx, "#101a2a", rx - 64, 286, 128, 90);
  fill(ctx, "#101a2a", rx - 21, 250, 42, 50);
  pixelCircle(ctx, "#101a2a", rx, 224, 43);
  fill(ctx, "#101a2a", rx - 49, 200, 11, 30);
  fill(ctx, "#0d1624", rx + 38, 204, 8, 28);
  ctx.globalAlpha = 0.30;
  fill(ctx, "#7fa8c4", rx - 43, 192, 2, 50);
  fill(ctx, "#7fa8c4", rx - 63, 264, 2, 26);
  fill(ctx, "#7fa8c4", rx - 50, 286, 1, 14);
  ctx.globalAlpha = 0.22;
  fill(ctx, "#c98a6e", rx + 40, 204, 1, 34);
  ctx.globalAlpha = 0.12;
  fill(ctx, "#0a101c", rx - 64, 272, 128, 4);
  ctx.globalAlpha = 1;

  // Rain on the outside of the glass.
  drawRain(ctx, t, 86, 24, 468, 286, 38);
  for (let i = 0; i < 12; i++) {
    const dx = 100 + (i * 79 + t * 3) % 440;
    const dy = 40 + (i * 47 + t * 4) % 250;
    ctx.globalAlpha = 0.16;
    fill(ctx, "#cfe3ea", dx, dy, 1, 4);
    fill(ctx, "#cfe3ea", dx, dy + 6, 1, 1);
  }
  ctx.globalAlpha = 1;

  // A hand on the glass.
  if (opts.hand) {
    fill(ctx, PAL.skin, 414, 262, 42, 28);
    fill(ctx, PAL.skinSh, 414, 286, 42, 4);
    for (let i = 0; i < 4; i++) {
      fill(ctx, PAL.skin, 418 + i * 9, 236, 5, 28);
      fill(ctx, PAL.skinSh, 418 + i * 9, 258, 5, 4);
    }
    fill(ctx, PAL.skin, 402, 266, 12, 7);
  }
  ctx.restore();

  // Frame and mullions.
  fill(ctx, "#241c21", 74, 16, 492, 8);
  fill(ctx, "#241c21", 74, 310, 492, 10);
  fill(ctx, "#241c21", 74, 16, 12, 304);
  fill(ctx, "#241c21", 554, 16, 12, 304);
  fill(ctx, "#3b2c30", 84, 22, 468, 2);
  fill(ctx, "#3b2c30", 84, 308, 468, 2);
  fill(ctx, "#241c21", 318, 24, 6, 286);
  fill(ctx, "#241c21", 86, 164, 468, 5);
  fill(ctx, "rgba(255,255,255,0.05)", 90, 28, 222, 1);

  // Curtain and sill.
  fill(ctx, "#30252c", 584, 0, 56, 330);
  for (let i = 0; i < 5; i++) fill(ctx, "#3d2e36", 588 + i * 10, 0, 3, 330);
  fill(ctx, "#3b2c30", 62, 316, 516, 10);
  fill(ctx, "#20181c", 62, 326, 516, 8);

  // A plant, out of focus in the foreground.
  fill(ctx, "#3a2c27", 22, 312, 62, 30);
  fill(ctx, "#4a3a30", 22, 312, 62, 4);
  fill(ctx, "#2a1f1c", 26, 342, 54, 10);
  fill(ctx, "#1c2a24", 50, 246, 6, 68);
  for (let i = 0; i < 7; i++) {
    const lx = 30 + (i % 4) * 14;
    const ly = 230 + (i % 3) * 20;
    fill(ctx, i % 2 ? "#2d4234" : "#22352b", lx, ly, 20, 6);
    fill(ctx, i % 2 ? "#3c5541" : "#2d4234", lx + 3, ly - 2, 12, 2);
  }

  drawDust(ctx, t, 100, 40, 440, 260, 20, PAL.cool, 0.5);
  drawVignette(ctx, 0.36);
}

/** A face held in wet glass; used for "tell myself" and "remember you". */
export function drawFaceReflection(ctx, assets, t, who, opts = {}) {
  fill(ctx, "#070b13", 0, 0, W, H);
  for (let i = 0; i < 18; i++) {
    ctx.globalAlpha = 0.05 + (i % 4) * 0.018;
    pixelCircle(ctx, ["#e06a8a", "#5fc8d8", "#f2b56b", "#8f7ad8"][i % 4],
      (i * 91 + t * 2) % W, 60 + (i * 53) % 250, 3 + (i % 4) * 2);
  }
  ctx.globalAlpha = 1;

  const frame = `look_front_${Math.floor(t * 1.05) % 2}`;
  const zoom = opts.scale ?? 7.6;
  withCamera(ctx, 1 + (opts.push || 0), 320, 180, () => {
    drawSpritePortrait(ctx, assets.sprites, who, frame, 320, 180, zoom, {
      image: opts.image,
      alpha: 0.94,
      cropX: 8,
      cropY: 2,
      cropW: 32,
      cropH: 40,
      focusX: 24,
      focusY: 22,
      neckRect: who === "male" ? [21, 24, 7, 6] : [21, 27, 8, 7],
    });
  });

  ctx.globalAlpha = 0.24;
  fill(ctx, "#0a1728", 0, 0, W, H);
  ctx.globalAlpha = 1;

  // A window frame turns the portrait into a reflection in wet glass.
  fill(ctx, "#0b1019", 0, 0, W, 18);
  fill(ctx, "#0b1019", 0, 342, W, 18);
  fill(ctx, "#0b1019", 0, 0, 20, H);
  fill(ctx, "#0b1019", 620, 0, 20, H);
  fill(ctx, "#151d2c", 20, 18, W - 40, 3);
  fill(ctx, "#151d2c", 20, 339, W - 40, 3);
  fill(ctx, "#0b1019", 178, 18, 8, 322);
  fill(ctx, "#0b1019", 454, 18, 8, 322);
  ctx.globalAlpha = 0.14;
  fill(ctx, "#cfe3ea", 186, 18, 1, 322);
  fill(ctx, "#cfe3ea", 462, 18, 1, 322);
  ctx.globalAlpha = 1;

  drawRain(ctx, t, 20, 18, W - 40, 320, 34, "#cfe3ea");
  // Condensation beads, kept off the eyes.
  for (let i = 0; i < 15; i++) {
    const x = (i * 71 + t * 2) % W;
    const y = 40 + (i * 43) % 280;
    ctx.globalAlpha = 0.12;
    fill(ctx, "#cfe3ea", x, y, 1, 3);
  }
  ctx.globalAlpha = 1;
  drawVignette(ctx, 0.4);
}

/** Empty classroom between memories; no characters, only waiting light. */
export function drawEmptyClassroom(ctx, assets, t, opts = {}) {
  const q = smoothstep(clamp(opts.q ?? 0));
  drawClassroomDay(ctx, assets, t, {
    empty: true,
    zoom: 1.06 + q * 0.05,
    panX: -8 + q * 14,
    local: 0,
    fgY: 22,
    focusX: 322,
    // Keep the crop above the point where the 640×360 background would end,
    // otherwise the bottom of the frame becomes a black letterbox.
    focusY: 184,
  });
  // Stepped window light, kept inside the 16-bit edge language.
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 9; i++) {
    ctx.globalAlpha = 0.022;
    fill(ctx, PAL.warm, 388 - i * 22, 34 + i * 28, 196, 18);
  }
  ctx.restore();
  drawDust(ctx, t, 120, 60, 420, 230, 34, PAL.warm, 0.9);
  drawVignette(ctx, 0.26);
}

/** Different classes: she crosses frame, he stops half a beat too late. */
export function drawCorridorPass(ctx, assets, t) {
  drawCorridor(ctx, assets, t, { pan: 4 + t * 2 });

  const walk = Math.floor(t * 7) % 6;
  const fx = lerp(568, 52, smoothstep(clamp(t / 5.7)));
  const mx = lerp(88, 356, smoothstep(clamp(t / 3.3)));
  const floorY = 320;
  const scale = 1.7;

  groundShadow(ctx, fx, floorY + 1, 24, 4, 0.28);
  groundShadow(ctx, mx, floorY + 1, 24, 4, 0.28);
  // Long corridor shadows.
  ctx.globalAlpha = 0.14;
  fill(ctx, "#141018", fx - 34, floorY - 4, 62, 5);
  fill(ctx, "#141018", mx - 4, floorY - 4, 58, 5);
  ctx.globalAlpha = 1;

  drawSpriteScaled(ctx, assets.sprites, "female", `walk_side_${(walk + 2) % 6}`, fx, floorY, scale, {
    flipX: true,
  });
  if (t < 3.5) {
    drawSpriteScaled(ctx, assets.sprites, "male", `walk_side_${walk}`, mx, floorY, scale);
  } else {
    drawSpriteScaled(ctx, assets.sprites, "male", `look_side_${Math.floor(t * 2.4) % 2}`, mx, floorY, scale, {
      flipX: true,
    });
  }

  if (t > 2.1 && t < 3.4) {
    ctx.globalAlpha = 0.7;
    fill(ctx, PAL.warm, fx - 5, 272, 1, 1);
    fill(ctx, PAL.warm, mx + 3, 272, 1, 1);
    ctx.globalAlpha = 1;
  }
  if (t > 2.5 && t < 3.1) {
    // A hand almost leaves the sleeve.
    fill(ctx, PAL.skin, 318, 310, 5, 3);
    fill(ctx, PAL.skin, 344, 310, 5, 3);
  }
  drawDust(ctx, t, 60, 60, 520, 240, 24, PAL.warm, 0.7);
  drawVignette(ctx, 0.26);
}

/** Chat lives inside the phone screen, never in a floating bubble. */
export function drawPhoneChatClose(ctx, t, opts = {}) {
  fill(ctx, "#070b14", 0, 0, W, H);
  for (let i = 0; i < 20; i++) {
    ctx.globalAlpha = 0.05 + (i % 4) * 0.02;
    pixelCircle(ctx, ["#e06a8a", "#5fc8d8", "#f2b56b", "#8f7ad8"][i % 4],
      (i * 79 + t * 3) % W, 30 + (i * 61) % 320, 3 + (i % 5) * 2);
  }
  ctx.globalAlpha = 0.22;
  fill(ctx, "#0a1424", 0, 0, W, H);
  ctx.globalAlpha = 1;
  drawRain(ctx, t, 0, 0, W, H, 36, "#9fc6d8");

  // Phone body.
  ctx.globalAlpha = 0.4;
  fill(ctx, "#000000", 202, 26, 252, 324);
  ctx.globalAlpha = 1;
  fill(ctx, "#090d15", 194, 16, 252, 326);
  fill(ctx, "#3b465c", 194, 16, 252, 2);
  fill(ctx, "#232d42", 194, 340, 252, 2);
  fill(ctx, "#121a29", 202, 24, 236, 310);
  fill(ctx, "#080b12", 208, 42, 224, 278);
  // Screen.
  fill(ctx, "#0e1526", 208, 42, 224, 278);
  // Status bar.
  fill(ctx, "#0a101d", 208, 42, 224, 12);
  drawText(ctx, "23:41", 216, 43, { size: 8, color: PAL.cool, threshold: 80 });
  fill(ctx, "#9fc6d8", 406, 45, 10, 5);
  fill(ctx, "#0a101d", 416, 46, 2, 3);
  fill(ctx, "#0a101d", 408, 44, 6, 1);

  drawChatPanel(ctx, {
    x: 208,
    y: 54,
    w: 224,
    h: 266,
    t,
    messages: CHAT_MESSAGES,
    title: "聊天",
  });

  // Notch, home bar.
  fill(ctx, "#05080e", 294, 42, 52, 7);
  fill(ctx, "#2a3a52", 306, 45, 28, 2);
  fill(ctx, "#5a6578", 286, 331, 68, 2);

  // A hand on the bezel, never over the messages.
  fill(ctx, "#3b463c", 430, 250, 44, 82);
  fill(ctx, PAL.skin, 422, 252, 16, 48);
  fill(ctx, PAL.skinSh, 430, 288, 8, 5);
  fill(ctx, PAL.skin, 416, 238, 10, 16);
  fill(ctx, PAL.skin, 198, 290, 10, 34);
  fill(ctx, PAL.skinSh, 204, 316, 5, 6);

  ctx.globalAlpha = 0.18;
  fill(ctx, "#9fc6d8", 194, 40, 4, 280);
  ctx.globalAlpha = 1;
  drawVignette(ctx, 0.28);
}

/** Phone timer during the call: the lyric's "forgetting time". */
export function drawCallTimer(ctx, assets, t, opts = {}) {
  fill(ctx, "#090c14", 0, 0, W, H);
  dither(ctx, "#121826", 0, 0, W, H, 3, 1);
  glow(ctx, assets.fx.glowWarm, 92, 190, 210, 210, 0.1);
  glow(ctx, assets.fx.glowBlue, 520, 120, 220, 220, 0.08);
  drawRain(ctx, t, 0, 0, W, H, 24, "#6f98b4");

  drawPhoneCall(ctx, {
    x: 186,
    y: 10,
    w: 268,
    h: 300,
    seconds: opts.seconds ?? 0,
    connected: true,
    label: "通话中",
  });

  // The call screen is mostly quiet: a small voice trace, then the two
  // standard call actions.  Everything stays above the lyric safe area.
  fill(ctx, "#122033", 214, 136, 212, 1);
  const bars = 22;
  for (let i = 0; i < bars; i++) {
    const h = 3 + Math.abs(Math.sin(t * 2.6 + i * 0.62)) * 18;
    ctx.globalAlpha = 0.42 + (i % 4) * 0.08;
    fill(ctx, i % 3 === 0 ? PAL.warm : PAL.cool, 228 + i * 9, 190 - h / 2, 3, h);
  }
  ctx.globalAlpha = 1;

  // Hand gripping the right bezel, not over the call controls: a palm behind
  // the edge, fingertips curling onto it, thumb along the side, sleeve away.
  fill(ctx, "#3a453a", 470, 258, 54, 76);
  fill(ctx, "#2b352d", 470, 258, 54, 4);
  fill(ctx, "#59654f", 471, 264, 2, 64);
  fill(ctx, "#4a5546", 462, 254, 14, 82);
  fill(ctx, PAL.skin, 446, 258, 24, 38);
  pixelCircle(ctx, PAL.skin, 464, 292, 10);
  fill(ctx, PAL.skinSh, 446, 292, 18, 4);
  fill(ctx, PAL.skin, 447, 260, 3, 30);
  for (let i = 0; i < 4; i++) {
    const fy = 262 + i * 9;
    fill(ctx, PAL.skin, 440, fy, 10, 7);
    pixelCircle(ctx, PAL.skin, 440, fy + 3, 3);
    fill(ctx, PAL.skinSh, 440, fy + 6, 10, 1);
  }
  fill(ctx, PAL.skin, 456, 246, 10, 16);
  pixelCircle(ctx, PAL.skin, 458, 247, 5);
  fill(ctx, PAL.skinSh, 456, 258, 10, 3);
  drawVignette(ctx, 0.36);
}

/** Insert: his hand around the phone while she answers. */
export function drawPhoneHand(ctx, assets, t) {
  fill(ctx, "#0a0d15", 0, 0, W, H);
  for (let i = 0; i < 14; i++) {
    ctx.globalAlpha = 0.05 + (i % 3) * 0.02;
    pixelCircle(ctx, i % 2 ? "#d9a441" : "#6f98b4", (i * 97) % W, 40 + (i * 41) % 260, 4 + (i % 4) * 3);
  }
  ctx.globalAlpha = 1;
  glow(ctx, assets.fx.glowWarm, 210, 210, 280, 280, 0.12);
  glow(ctx, assets.fx.glowBlue, 320, 200, 260, 260, 0.16);

  // Phone tilted only by pixel-stepped rows, so edges stay hard.
  fill(ctx, "#05080e", 220, 62, 206, 246);
  fill(ctx, "#2a3144", 220, 62, 206, 2);
  fill(ctx, "#0a1220", 226, 68, 194, 234);
  fill(ctx, "#12243a", 238, 82, 170, 206);
  ctx.globalAlpha = 0.35;
  fill(ctx, "#9fc6d8", 250, 96, 146, 2);
  fill(ctx, "#9fc6d8", 250, 270, 146, 1);
  ctx.globalAlpha = 1;
  pixelCircle(ctx, "#d9a441", 322, 160, 9);
  fill(ctx, "#d9a441", 316, 176, 12, 3);

  // Hand: fingers wrap the left edge, thumb rests on the glass.
  fill(ctx, "#3b463c", 150, 236, 88, 76);
  fill(ctx, PAL.skin, 188, 176, 34, 124);
  fill(ctx, PAL.skinSh, 188, 292, 34, 6);
  for (let i = 0; i < 4; i++) {
    fill(ctx, PAL.skin, 196, 186 + i * 24, 58, 12);
    fill(ctx, PAL.skinSh, 246, 194 + i * 24, 8, 4);
  }
  fill(ctx, PAL.skin, 252, 268, 38, 20);
  fill(ctx, PAL.skinSh, 252, 284, 38, 4);

  drawDust(ctx, t, 120, 40, 400, 300, 18, PAL.warm, 0.6);
  drawVignette(ctx, 0.4);
}

/** Breath on a cold window; the body is only a reflection. */
export function drawBreathWindow(ctx, assets, t) {
  fill(ctx, "#111722", 0, 0, W, H);
  drawWindow(ctx, 70, 22, 500, 280, "night", t);
  ctx.globalAlpha = 0.18;
  fill(ctx, "#0b1426", 0, 0, W, H);
  ctx.globalAlpha = 1;

  // His reflection, low and out of focus.
  drawSpriteScaled(ctx, assets.sprites, "male", `idle_side_${Math.floor(t * 0.9) % 4}`, 250, 382, 3.15, {
    alpha: 0.15,
    flipX: true,
  });

  // Condensation and a palm print.
  for (let i = 0; i < 5; i++) {
    ctx.globalAlpha = 0.035 + i * 0.006;
    pixelCircle(ctx, "#cfe3ea", 300 + i * 17, 212 + i * 11, 24 + i * 8);
  }
  ctx.globalAlpha = 0.06;
  fill(ctx, PAL.skin, 318, 240, 46, 40);
  for (let i = 0; i < 4; i++) fill(ctx, PAL.skin, 322 + i * 10, 212, 5, 32);
  ctx.globalAlpha = 1;

  // A breath cloud, rising and fading.
  for (let i = 0; i < 3; i++) {
    const q = (t * 0.55 + i * 0.33) % 1;
    ctx.globalAlpha = 0.11 * (1 - q);
    pixelCircle(ctx, "#e6f0f4", 350 + Math.sin(t + i) * 10, 260 - q * 70, 7 + q * 10);
  }
  ctx.globalAlpha = 1;

  drawRain(ctx, t, 70, 22, 500, 280, 26, "#cfe3dc");
  drawDust(ctx, t, 100, 40, 440, 260, 16, PAL.cool, 0.5);
  drawVignette(ctx, 0.4);
}

/** Night platform: she can leave, he can only stay. */
export function drawPlatform(ctx, assets, t, opts = {}) {
  const zoom = 1 + (opts.zoom || 0);
  const panX = opts.panX || 0;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(320 + panX, 220);
  ctx.scale(zoom, zoom);
  ctx.translate(-320, -220);

  vBands(ctx, 0, 0, W, 250, [
    ["#0b1220", 1],
    ["#16213a", 1],
    ["#26314b", 0.8],
  ]);
  // City outside the station.
  for (let i = 0; i < 12; i++) {
    const bh = 28 + (i * 29) % 72;
    fill(ctx, "#111a2b", i * 56 - 20, 250 - bh, 52, bh);
    for (let j = 0; j < 3; j++) {
      if ((i + j) % 3 !== 0) fill(ctx, "#d9b879", i * 56 + 8 + j * 13, 250 - bh + 10, 3, 3);
    }
  }
  // A plane crossing the top, for "you can soar".
  const px = 60 + ((t * 20) % 520);
  fill(ctx, "#f2eee2", px, 74, 7, 1);
  fill(ctx, "#f2eee2", px + 3, 72, 3, 1);
  fill(ctx, "#f2eee2", px + 3, 76, 3, 1);
  ctx.globalAlpha = 0.4 + 0.5 * Math.max(0, Math.sin(t * 5));
  fill(ctx, "#e06a8a", px - 2, 74, 1, 1);
  ctx.globalAlpha = 1;

  // Canopy.
  fill(ctx, "#080d17", 0, 0, W, 52);
  fill(ctx, "#1c2638", 0, 50, W, 4);
  for (let i = 0; i < 4; i++) {
    fill(ctx, "#2a3448", 92 + i * 154, 48, 3, 10);
    fill(ctx, "#ffd9a0", 84 + i * 154, 54, 30, 3);
    glow(ctx, assets.fx.glowWarm, 99 + i * 154, 55, 80, 54, 0.1);
  }

  // Train.
  fill(ctx, "#252c3a", 322, 154, 400, 158);
  fill(ctx, "#59667a", 330, 160, 392, 146);
  fill(ctx, "#7b879a", 330, 160, 392, 4);
  fill(ctx, "#3b4558", 330, 298, 392, 8);
  fill(ctx, "#c9564f", 330, 224, 392, 4);
  for (let i = 0; i < 7; i++) {
    const wx = 346 + i * 44;
    if (wx > 452 && wx < 536) continue;
    fill(ctx, "#1a2436", wx, 178, 32, 30);
    fill(ctx, "#d9b879", wx + 2, 180, 28, 26);
    fill(ctx, "#f0d6a2", wx + 4, 184, 10, 10);
    ctx.globalAlpha = 0.18;
    fill(ctx, "#ffd9a0", wx - 3, 174, 38, 38);
    ctx.globalAlpha = 1;
  }
  // Open door.
  fill(ctx, "#101724", 452, 166, 84, 146);
  fill(ctx, "#e2ad6e", 460, 174, 68, 138);
  fill(ctx, "#f2c88e", 462, 176, 64, 128);
  fill(ctx, "#7b5542", 452, 166, 4, 146);
  fill(ctx, "#7b5542", 532, 166, 4, 146);
  ctx.globalAlpha = 0.14;
  fill(ctx, "#ffd9a0", 430, 290, 130, 70);
  ctx.globalAlpha = 1;

  // Platform.
  fill(ctx, "#2b3038", 0, 298, W, 62);
  fill(ctx, "#3c424b", 0, 298, W, 3);
  fill(ctx, "#d9a441", 0, 326, W, 3);
  fill(ctx, "#191e26", 0, 329, W, 31);
  for (let i = 0; i < 8; i++) {
    fill(ctx, "#4a515c", 20 + i * 82, 306 + (i % 3) * 6, 46, 2);
  }
  // Wet reflections.
  ctx.globalAlpha = 0.12;
  fill(ctx, "#d9b879", 452, 310, 84, 22);
  fill(ctx, "#5fc8d8", 350, 312, 26, 18);
  ctx.globalAlpha = 1;

  // Her, in the doorway.
  groundShadow(ctx, 502, 319, 24, 4, 0.35);
  drawSpriteScaled(ctx, assets.sprites, "female", `look_side_${Math.floor(t * 1.2) % 2}`, 502, 318, 1.75, {
    image: assets.variants.uniFemale,
    flipX: true,
  });
  // Her hand on the door edge.
  fill(ctx, PAL.skin, 486, 290, 7, 4);

  // Him, held on the platform.
  groundShadow(ctx, 208, 334, 26, 5, 0.4);
  drawSpriteScaled(ctx, assets.sprites, "male", `idle_side_${Math.floor(t * 1.1) % 4}`, 208, 333, 1.9, {
    image: assets.variants.uniMale,
  });
  // A small bag at his feet.
  fill(ctx, "#2b211d", 156, 320, 24, 15);
  fill(ctx, "#4a3a30", 156, 318, 24, 3);
  fill(ctx, "#4a3a30", 162, 312, 12, 7);

  drawRain(ctx, t, 0, 120, 320, 190, 22, "#9fc6d8");
  drawDust(ctx, t, 60, 60, 540, 260, 20, PAL.warm, 0.5);
  drawVignette(ctx, 0.32);
  ctx.restore();
}

/** Inside the train: city lights streak, her hand stays on the glass. */
export function drawTrainWindowClose(ctx, t) {
  fill(ctx, "#0b101b", 0, 0, W, H);
  fill(ctx, "#222c3e", 0, 0, W, 44);
  fill(ctx, "#2e394e", 0, 40, W, 4);
  fill(ctx, "#1a2334", 0, 320, W, 40);

  // Window.
  ctx.save();
  ctx.beginPath();
  ctx.rect(64, 44, 512, 224);
  ctx.clip();
  vBands(ctx, 64, 44, 512, 224, [["#0b1626", 1], ["#132238", 1], ["#1b2b3f", 0.8]]);
  for (let i = 0; i < 26; i++) {
    const speed = 90 + (i % 5) * 28;
    const x = 64 + ((i * 73 - t * speed) % 600 + 600) % 600;
    const y = 60 + (i * 37) % 200;
    const color = ["#d9b879", "#e06a8a", "#5fc8d8", "#f2b56b"][i % 4];
    ctx.globalAlpha = 0.14 + (i % 3) * 0.06;
    fill(ctx, color, x, y, 18 + (i % 5) * 9, 2);
    fill(ctx, color, x + 6, y + 2, 10, 1);
  }
  ctx.globalAlpha = 1;

  // Her reflection / silhouette.
  ctx.globalAlpha = 0.55;
  fill(ctx, "#3a2b34", 406, 214, 76, 100);
  fill(ctx, "#2a2230", 420, 132, 54, 86);
  pixelCircle(ctx, "#2a2230", 448, 140, 38);
  fill(ctx, "#221f2a", 466, 118, 20, 104);
  fill(ctx, "#221f2a", 482, 142, 9, 70);
  ctx.globalAlpha = 0.28;
  fill(ctx, "#ffd9a0", 414, 132, 2, 66);
  ctx.globalAlpha = 1;

  // Hand on the glass.
  ctx.globalAlpha = 0.85;
  fill(ctx, PAL.skin, 300, 210, 44, 30);
  fill(ctx, PAL.skinSh, 300, 236, 44, 4);
  for (let i = 0; i < 4; i++) {
    fill(ctx, PAL.skin, 304 + i * 9, 184, 5, 29);
    fill(ctx, PAL.skinSh, 304 + i * 9, 207, 5, 4);
  }
  fill(ctx, "#c9854a", 296, 240, 52, 30);
  ctx.globalAlpha = 1;

  drawRain(ctx, t, 64, 44, 512, 224, 20, "#cfe3ea");
  ctx.globalAlpha = 0.12;
  fill(ctx, "#e8f2f6", 70, 48, 500, 1);
  ctx.globalAlpha = 1;
  ctx.restore();

  // Window frame and overhead lights.
  fill(ctx, "#080d16", 56, 36, 528, 8);
  fill(ctx, "#080d16", 56, 268, 528, 10);
  fill(ctx, "#080d16", 56, 36, 8, 242);
  fill(ctx, "#080d16", 576, 36, 8, 242);
  fill(ctx, "#4a3a30", 62, 42, 516, 2);
  for (let i = 0; i < 3; i++) {
    fill(ctx, "#d9a441", 110 + i * 190, 22, 54, 3);
  }
  drawVignette(ctx, 0.4);
}

/** Low-angle feet on the trail; the screen is mostly ground, dust, boots. */
export function drawTrailClose(ctx, t) {
  const bob = Math.sin(t * 6.6) * 1.2;
  ctx.save();
  ctx.translate(0, bob);

  vBands(ctx, 0, 0, W, 46, [
    ["#7f98a5", 1],
    ["#c1b79e", 1],
    ["#dfc29a", 0.8],
  ]);
  pixelCircle(ctx, "#ffe2ad", 466, 18, 16);
  for (let i = 0; i < 5; i++) {
    const h = 20 + (i * 17) % 22;
    fill(ctx, i % 2 ? "#4c6657" : "#43594b", i * 150 - 30, 46 - h, 180, h);
  }

  // The trail fills the frame below the ridge, pale and stony.
  fill(ctx, "#6b5b46", 0, 42, W, 318);
  fill(ctx, "#7d6a52", 0, 42, W, 3);
  dither(ctx, "#5b4c3b", 0, 48, W, 312, 4, 0);
  fill(ctx, "#8a7457", 30, 150, 580, 120);
  fill(ctx, "#937d5d", 44, 158, 552, 104);
  dither(ctx, "#a08b69", 44, 162, 552, 96, 7, 1);

  // Stones and scuff marks, larger near the camera.
  for (let i = 0; i < 26; i++) {
    const x = (i * 83 + 17) % W;
    const y = 92 + (i * 47) % 250;
    const w = 6 + (i % 4) * 4 + (y > 240 ? 5 : 0);
    fill(ctx, i % 3 ? "#8b7656" : "#9a8361", x, y, w, 3);
    fill(ctx, "#5d4e3f", x + 2, y + 3, w - 2, 1);
  }
  for (let i = 0; i < 18; i++) {
    const x = (i * 59) % W;
    fill(ctx, "#4f4335", x, 250 + (i * 31) % 90, 2 + (i % 3) * 3, 2);
  }
  // Grass at the edges.
  for (let i = 0; i < 26; i++) {
    const x = i < 13 ? 2 + i * 9 : 528 + (i - 13) * 9;
    const h = 18 + (i * 13) % 38;
    fill(ctx, i % 2 ? "#3c5342" : "#526a49", x + Math.sin(t * 1.4 + i) * 3, 340 - h, 2, h);
  }

  // Two pairs of boots, only the lower calf in frame.  The legs are cropped
  // just above the knee and then dissolved into the trail with a depth fade,
  // so the close-up is about feet and ground, not two columns of trousers.
  ctx.globalAlpha = 0.24;
  fill(ctx, "#3b3127", 190, 300, 130, 4);
  fill(ctx, "#3b3127", 358, 274, 110, 3);
  ctx.globalAlpha = 1;
  drawHikerLegs(ctx, 250, 300, 1.2, Math.floor(t * 3.2) % 2, "male", 232, 226);
  drawHikerLegs(ctx, 412, 274, 1.0, Math.floor(t * 3.2 + 1) % 2, "female", 212, 206);
  // The trail colour washes back over the top of the calves: a cheap, hard-
  // edged depth of field that hides the cut and keeps the boots the subject.
  for (let y = 214; y < 258; y++) {
    ctx.globalAlpha = clamp((254 - y) / 26, 0, 1);
    fill(ctx, y < 242 ? "#937d5d" : "#7d6a52", 0, y, W, 1);
  }
  ctx.globalAlpha = 1;

  // Tall foreground grass from the bottom edge; it crosses the fade band and
  // breaks the leg silhouettes without swallowing the boots.
  for (let i = 0; i < 20; i++) {
    const edge = i < 7 || i > 13;
    const x = i < 7 ? 2 + i * 17 : i > 13 ? 560 + (i - 14) * 19 : 190 + (i - 7) * 44;
    const h = (edge ? 120 : 74) + (i * 29) % 56;
    const sway = Math.sin(t * 1.5 + i * 0.8) * (edge ? 5 : 3);
    fill(ctx, i % 2 ? "#2f4336" : "#3c5342", x + sway, 362 - h, 3, h);
    fill(ctx, "#54704f", x + sway, 362 - h, 1, 14);
  }

  // Footfall dust, brightest at the down foot.
  for (let i = 0; i < 10; i++) {
    const q = (t * 0.8 + i * 0.11) % 1;
    ctx.globalAlpha = 0.16 * (1 - q);
    pixelCircle(ctx, "#c9b491", 206 + (i * 43) % 200, 310 - q * 26, 3 + q * 6);
  }
  ctx.globalAlpha = 1;
  drawVignette(ctx, 0.34);
  ctx.restore();
}

function drawHikerLegs(ctx, baseX, bootY, s, phase, who, kneeOverride, thighTop = -16) {
  const pants = who === "male" ? "#3e352d" : "#4a3f45";
  const pantsSh = who === "male" ? "#2d2721" : "#3a3238";
  const pantsHi = who === "male" ? "#55493c" : "#5c4e58";
  const boot = who === "male" ? "#33261f" : "#5a3b2e";
  const bootHi = who === "male" ? "#4f3d31" : "#7a5540";
  const hipW = (who === "male" ? 34 : 30) * s;
  const kneeW = (who === "male" ? 25 : 22) * s;
  const calfW = (who === "male" ? 28 : 24) * s;
  const ankleW = (who === "male" ? 15 : 13) * s;
  const kneeY = kneeOverride ?? bootY - 104 * s;

  for (const side of [-1, 1]) {
    // One leg is planted, the other swings through with a visible step.
    const planted = phase ? side < 0 : side > 0;
    const lift = planted ? 0 : 16 * s;
    const stride = planted ? 15 * s : -11 * s;
    const hipX = baseX + side * 21 * s;
    const kneeX = baseX + side * 17 * s;
    const ankleX = kneeX + stride;
    const ankleY = bootY - lift;

    // Thigh, cropped at the knee by the frame.  thighTop lets a shot begin
    // inside a shaded bank instead of running the leg to the top of frame.
    for (let y = thighTop; y < kneeY; y += 1) {
      const q = (y - thighTop) / Math.max(1, kneeY - thighTop);
      const cx = lerp(hipX, kneeX, q);
      const w = lerp(hipW, kneeW, q);
      fill(ctx, pants, cx - w / 2, y, w, 1);
      fill(ctx, pantsHi, cx - w / 2 + 2, y, 3, 1);
      fill(ctx, pantsSh, cx + w / 2 - 3, y, 3, 1);
      if ((y - Math.round(hipX) + 200) % 23 === 0) {
        fill(ctx, pantsSh, cx - w / 2 + 4, y, w - 8, 1);
      }
    }
    // Knee crease.
    fill(ctx, pantsSh, kneeX - kneeW / 2 + 1, kneeY - 4 * s, kneeW - 2, 3 * s);

    // Calf: a bulge below the knee, then a taper to the ankle.  The ankle
    // drifts with the step so the leg bends rather than sliding as a column.
    const lowerH = Math.max(10, ankleY - kneeY);
    for (let i = 0; i < lowerH; i += 1) {
      const q = i / lowerH;
      const w = q < 0.28
        ? lerp(kneeW, calfW, q / 0.28)
        : lerp(calfW, ankleW, (q - 0.28) / 0.72);
      const xo = lerp(0, ankleX - kneeX, q * q);
      const x = kneeX - w / 2 + xo;
      fill(ctx, pants, x, kneeY + i, w, 1);
      fill(ctx, pantsHi, x + 2, kneeY + i, 2, 1);
      fill(ctx, pantsSh, x + w - 3, kneeY + i, 3, 1);
      if ((i + Math.round(ankleX) + 200) % 19 === 1) {
        fill(ctx, pantsSh, x + 3, kneeY + i, w - 6, 1);
      }
    }
    // Cuff, sitting above the boot shaft.
    const cuffX = kneeX + (ankleX - kneeX) * 1;
    fill(ctx, pantsSh, cuffX - ankleW * 0.8, ankleY - 20 * s, ankleW * 1.6, 4 * s);

    // Boot: a tall hiking shaft, toe and dark sole.  The shaft is deliberately
    // long in frame, so the boot reads at foot level instead of a toy shoe.
    const by = ankleY;
    ctx.globalAlpha = planted ? 0.3 : 0.14;
    fill(ctx, "#3b3127", ankleX - 23 * s, by + 16 * s - (planted ? 0 : 8 * s), 52 * s, 3 * s);
    ctx.globalAlpha = 1;
    fill(ctx, "#17131a", ankleX - 20 * s, by + 10 * s, 50 * s, 6 * s);
    fill(ctx, boot, ankleX - 17 * s, by - 16 * s, 38 * s, 28 * s);
    fill(ctx, boot, ankleX + 15 * s, by + 3 * s, 18 * s, 11 * s);
    fill(ctx, bootHi, ankleX - 14 * s, by - 15 * s, 32 * s, 3 * s);
    fill(ctx, "#17131a", ankleX + 30 * s, by + 9 * s, 5 * s, 3 * s);
    if (who === "male") {
      fill(ctx, "#8d7058", ankleX - 5 * s, by - 6 * s, 12 * s, 1);
      fill(ctx, "#8d7058", ankleX - 5 * s, by - 2 * s, 12 * s, 1);
      fill(ctx, "#8d7058", ankleX + 21 * s, by + 5 * s, 8 * s, 1);
    } else {
      fill(ctx, "#b4473e", ankleX - 14 * s, by - 19 * s, 34 * s, 3);
      fill(ctx, "#8f3029", ankleX + 13 * s, by - 19 * s, 7 * s, 3);
    }
  }
}

/** Wind through grass; a held breath between trail and summit. */
export function drawGrassWind(ctx, t) {
  drawMountainBackdrop(ctx, t, { scroll: 24 + t * 5, high: 0.4 });
  ctx.globalAlpha = 0.10;
  fill(ctx, "#ffe2ad", 0, 120, W, 200);
  ctx.globalAlpha = 1;

  // The crest they are walking along, so the figures sit on the land rather
  // than floating over the forest line.
  fill(ctx, "#4a6248", 150, 300, 360, 34);
  fill(ctx, "#55704f", 168, 300, 324, 4);
  dither(ctx, "#3f5741", 150, 308, 360, 26, 5, 0);

  // Short grass belongs behind the walkers.
  for (let i = 0; i < 30; i++) {
    const x = (i * 23 + 7) % W;
    const h = 12 + (i * 17) % 18;
    const sway = Math.sin(t * 1.6 + i * 0.5) * 3;
    fill(ctx, "#405a47", x + sway, 322 - h, 2, h);
  }

  const walk = Math.floor(t * 4.4) % 6;
  const wx = 288 + t * 1.6;
  ctx.globalAlpha = 0.25;
  fill(ctx, "#2d3b2d", wx - 8, 307, 40, 4);
  ctx.globalAlpha = 1;
  drawSpriteScaled(ctx, assetsForCity.sprites, "male", `walk_side_${walk}`, wx, 306, 0.82, {
    image: assetsForCity?.variants.casualMale,
  });
  drawSpriteScaled(ctx, assetsForCity.sprites, "female", `walk_side_${(walk + 2) % 6}`, wx + 26, 306, 0.82, {
    image: assetsForCity?.variants.casualFemale,
  });

  // Mid grass brushes their boots but leaves their silhouettes readable.
  for (let i = 0; i < 34; i++) {
    const x = (i * 19 + 11) % W;
    const h = 16 + (i * 29) % 26;
    const sway = Math.sin(t * 1.5 + i * 0.7) * (4 + (i % 3));
    for (let k = 0; k < h; k += 4) {
      fill(ctx, "#57704f", x + sway * (k / h) * (k / h), 338 - k, 2, 5);
    }
    if (i % 5 === 0) fill(ctx, "#d9c08a", x + sway, 338 - h - 2, 3, 3);
  }

  // Tall foreground grass is kept at the edges as a frame.
  for (let i = 0; i < 26; i++) {
    const edge = i < 13;
    const x = edge ? -4 + i * 12 : 500 + (i - 13) * 12;
    const h = 52 + (i * 37) % 58;
    const sway = Math.sin(t * 1.3 + i * 0.6) * 6;
    for (let k = 0; k < h; k += 4) {
      const q = k / h;
      fill(ctx, i % 2 ? "#38513f" : "#526a49", x + sway * q * q, 360 - k, 2, 5);
    }
  }

  // Wind streaks.
  ctx.globalAlpha = 0.16;
  for (let i = 0; i < 9; i++) {
    const x = (i * 83 + t * 26) % 700 - 30;
    fill(ctx, "#f2eee2", x, 190 + i * 15, 22 + (i % 4) * 12, 1);
  }
  ctx.globalAlpha = 1;
  drawDust(ctx, t, 0, 160, W, 190, 24, PAL.warm, 0.6);
  drawVignette(ctx, 0.24);
}

/** The last two steps before contact; kiss is withheld to 188.238. */
export function drawSummitApproach(ctx, t, opts = {}) {
  const lean = opts.lean ?? smoothstep(clamp(t / 2.4));
  const scale = opts.scale ?? 2.25;
  const zoom = 1 + (opts.zoom || 0) + lean * 0.06;

  ctx.save();
  ctx.translate(320, 200);
  ctx.scale(zoom, zoom);
  ctx.translate(-320, -200);
  drawSummit(ctx, t);
  const mx = opts.mx ? lerp(opts.mx[0], opts.mx[1], lean) : lerp(250, 282, lean);
  const fx = opts.fx ? lerp(opts.fx[0], opts.fx[1], lean) : lerp(412, 380, lean);
  const floorY = opts.floorY ?? 310;

  ctx.globalAlpha = 0.2;
  fill(ctx, "#3b3127", mx - 30, floorY - 2, 60, 3);
  fill(ctx, "#3b3127", fx - 30, floorY - 2, 60, 3);
  ctx.globalAlpha = 1;

  drawSpriteScaled(ctx, assetsForCity.sprites, "male", `idle_side_${Math.floor(t * 1.8) % 4}`, mx, floorY, scale, {
    image: assetsForCity?.variants.casualMale,
  });
  drawSpriteScaled(ctx, assetsForCity.sprites, "female", `look_side_${Math.floor(t * 1.6) % 2}`, fx, floorY, scale, {
    image: assetsForCity?.variants.casualFemale,
    flipX: true,
  });

  // Wind in her hair.
  ctx.globalAlpha = 0.7;
  for (let i = 0; i < 12; i++) {
    fill(ctx, "#2a2230", fx + 20 + i, floorY - 60 * scale - 12 + ((i * 3 + Math.floor(t * 5)) % 8), 1, 3);
  }
  ctx.globalAlpha = 1;
  drawDust(ctx, t, 60, 80, 520, 240, 22, PAL.warm, 0.8);
  ctx.restore();
  drawVignette(ctx, 0.22);
}

/** Reaching hands, the most literal the film gets about "holding". */
export function drawHands(ctx, t, opts = {}) {
  const city = opts.mode === "city";
  if (city) {
    vBands(ctx, 0, 0, W, H, [["#070b14", 1], ["#101a2c", 1], ["#1a2438", 0.8]]);
    for (let i = 0; i < 16; i++) {
      ctx.globalAlpha = 0.07;
      pixelCircle(ctx, ["#e06a8a", "#5fc8d8", "#f2b56b"][i % 3],
        (i * 83 + t * 2) % W, 50 + (i * 47) % 270, 4 + (i % 4) * 3);
    }
    ctx.globalAlpha = 1;
    drawRain(ctx, t, 0, 0, W, H, 26, "#9fc6d8");
  } else {
    vBands(ctx, 0, 0, W, H, [
      ["#9d7f78", 1],
      ["#c99a7a", 1],
      ["#e4b98a", 1],
      ["#f2d1a2", 0.8],
    ]);
    pixelCircle(ctx, "#fff0c8", 470, 98, 64);
    // Warm ridge line under the sunset rather than flat grey slabs.
    fill(ctx, "#7a6152", 0, 282, W, 78);
    fill(ctx, "#8a6f5b", 0, 282, W, 3);
    ridgeLine(ctx, 40, 294, 300, "#6b5448");
    ridgeLine(ctx, 420, 300, 260, "#5d4a40");
    fill(ctx, "#5d4a40", 0, 316, W, 44);
    fill(ctx, "#6b5448", 0, 316, W, 3);
    for (let i = 0; i < 26; i++) {
      const x = (i * 27 + 9) % W;
      const h = 10 + (i * 19) % 20;
      fill(ctx, i % 2 ? "#4a3d35" : "#57463b", x, 320 - h, 2, h);
    }
    drawDust(ctx, t, 0, 80, W, 260, 26, PAL.warm, 0.9);
  }

  // Stop a breath short: the reach, not the clasp, is the image.
  const gap = opts.gap ?? lerp(46, 12, smoothstep(clamp(t / 2.6)));
  const cy = 236;
  const tipL = 320 - gap / 2;
  const tipR = 320 + gap / 2;
  const leftCx = tipL - 34;
  const rightCx = tipR + 34;
  const jitter = Math.sin(t * 3.1) * 0.6;
  const interlaced = gap < 14;

  drawArm(ctx, 1, leftCx, cy - 4, tipL, "#3b463c", "#4d5a4d", jitter, interlaced ? 0 : 0);
  drawArm(ctx, -1, rightCx, cy + 10, tipR, "#8a5a38", "#9c6a44", -jitter, interlaced ? 4 : 0);

  if (gap < 10) {
    ctx.globalAlpha = 0.16 * (1 - gap / 10);
    pixelCircle(ctx, "#fff0c8", 320, cy - 2, 12);
    ctx.globalAlpha = 1;
  }

  if (opts.plane) {
    const q = smoothstep(clamp(t / 2.4));
    const px = 326 + Math.sin(t * 0.8) * 8;
    const py = 188 - q * 70;
    fill(ctx, "#f2eee2", px - 8, py, 16, 2);
    fill(ctx, "#f2eee2", px - 4, py - 3, 9, 3);
    fill(ctx, "#cfc8b7", px - 2, py + 2, 8, 1);
    ctx.globalAlpha = 0.2;
    fill(ctx, "#f2eee2", px - 26 - q * 40, py + 8 + q * 10, 24, 1);
    ctx.globalAlpha = 1;
  }

  drawVignette(ctx, 0.3);
}

function drawArm(ctx, dir, cx, cy, tip, sleeve, sleeveHi, jitter, fingerShift) {
  const wristX = cx - dir * 30;
  const wristY = cy + 12;

  // Sleeve entering from the lower corner, built as stepped cloth blocks.
  const startX = dir > 0 ? -10 : 650;
  for (let i = 0; i < 26; i++) {
    const q = i / 25;
    const x = lerp(startX, wristX, q);
    const y = lerp(302, wristY, q);
    const w = 36 - q * 6;
    fill(ctx, sleeve, x - w / 2, y - 19, w, 38);
    if (i % 5 === 0) fill(ctx, sleeveHi, x - w / 2 + 3, y - 18, 5, 36);
    if (i % 5 === 3) fill(ctx, "#2a2433", x - w / 2, y + 15, w, 3);
  }
  // Cuff.
  fill(ctx, sleeveHi, wristX - 16, wristY - 20, 32, 6);
  fill(ctx, sleeve, wristX - 16, wristY + 14, 32, 7);

  // Wrist, joining cuff to palm.
  fill(ctx, PAL.skin, wristX - 13, wristY - 15, 26, 30);
  fill(ctx, PAL.skinSh, wristX - 13, wristY + 11, 26, 4);

  // Palm, with a narrow shaded edge so it separates from the sunset.
  pixelCircle(ctx, PAL.skinSh, cx, cy + jitter, 21);
  fill(ctx, PAL.skinSh, cx - 18, cy - 20 + jitter, 36, 40);
  pixelCircle(ctx, PAL.skin, cx, cy + jitter, 19);
  fill(ctx, PAL.skin, cx - 17, cy - 18 + jitter, 34, 36);
  fill(ctx, "#ffe0bd", cx - 12, cy - 17 + jitter, 22, 3);
  fill(ctx, PAL.skinSh, cx - 16, cy + 14 + jitter, 32, 4);
  fill(ctx, PAL.skinSh, cx + dir * 14, cy - 14 + jitter, 2, 28);

  // Four fingers with different lengths, rounded tips, slight fan.
  const baseReach = Math.max(6, Math.abs(tip - cx) - 14);
  const lens = [0.8, 1.0, 0.92, 0.7];
  const ys = [-14, -5, 4, 13];
  for (let i = 0; i < 4; i++) {
    const len = Math.max(7, baseReach * lens[i]);
    const fy = cy + ys[i] + jitter + fingerShift;
    const bx = cx + dir * 14;
    const ex = bx + dir * len;
    const x0 = dir > 0 ? bx : bx - len;
    fill(ctx, PAL.skin, x0, fy, len, 6);
    pixelCircle(ctx, PAL.skin, ex, fy + 3, 3);
    fill(ctx, "#ffe0bd", x0, fy, len, 1);
    fill(ctx, PAL.skinSh, x0, fy + 5, len, 1);
  }
  // Thumb, resting under the palm.
  const thx = cx + dir * 4;
  const thy = cy + 17 + jitter;
  fill(ctx, PAL.skin, thx - 4, thy, 18, 7);
  pixelCircle(ctx, PAL.skin, thx + dir * 12, thy + 3, 4);
  fill(ctx, PAL.skinSh, thx - 4, thy + 6, 18, 2);
}

function ridgeLine(ctx, cx, baseY, halfW, color) {
  for (let x = -halfW; x <= halfW; x += 4) {
    const q = 1 - Math.abs(x / halfW);
    const h = Math.round(16 + 18 * q);
    fill(ctx, color, cx + x, baseY - h, 4, h);
  }
}

/** A key in an open palm: the "address / key to the sky" image. */
export function drawKeyPalm(ctx, t) {
  fill(ctx, "#080c15", 0, 0, W, H);
  for (let i = 0; i < 18; i++) {
    ctx.globalAlpha = 0.05;
    pixelCircle(ctx, ["#e06a8a", "#5fc8d8", "#f2b56b", "#8f7ad8"][i % 4],
      (i * 73 + t * 2) % W, 40 + (i * 59) % 300, 3 + (i % 5) * 2);
  }
  ctx.globalAlpha = 1;
  drawRain(ctx, t, 0, 0, W, H, 22, "#9fc6d8");

  // Sleeve, wrist and palm, from the bottom of frame.
  fill(ctx, "#3b463c", 244, 334, 152, 26);
  fill(ctx, "#2a332a", 244, 334, 152, 3);
  fill(ctx, PAL.skin, 258, 304, 124, 32);
  fill(ctx, PAL.skinSh, 258, 330, 124, 6);
  fill(ctx, PAL.skin, 262, 258, 116, 60);
  pixelCircle(ctx, PAL.skin, 320, 312, 56);
  fill(ctx, PAL.skin, 266, 296, 108, 30);
  fill(ctx, PAL.skinSh, 266, 312, 108, 5);

  // Four fingers with rounded tips, not a row of blocks.
  for (let i = 0; i < 4; i++) {
    const fx = 270 + i * 27;
    const fh = 52 + ((i === 1 || i === 2) ? 12 : 0);
    const top = 254 - fh;
    fill(ctx, PAL.skin, fx, top + 8, 20, fh);
    pixelCircle(ctx, PAL.skin, fx + 10, top + 9, 10);
    fill(ctx, "#ffe0bd", fx + 2, top + 8, 3, fh - 12);
    fill(ctx, PAL.skinSh, fx + 17, top + 12, 3, fh - 16);
    fill(ctx, PAL.skinSh, fx + 3, top + fh - 2, 14, 2);
  }
  // Thumb.
  fill(ctx, PAL.skin, 238, 270, 26, 46);
  pixelCircle(ctx, PAL.skin, 248, 270, 12);
  fill(ctx, "#ffe0bd", 242, 276, 3, 30);
  fill(ctx, PAL.skinSh, 256, 286, 4, 24);

  // Brass key lying across the palm.
  ctx.globalAlpha = 0.22;
  fill(ctx, "#ffd9a0", 268, 270, 116, 14);
  ctx.globalAlpha = 1;
  pixelCircle(ctx, "#d9a441", 286, 278, 11);
  pixelCircle(ctx, "#8a6326", 286, 278, 6);
  fill(ctx, "#d9a441", 296, 275, 62, 6);
  fill(ctx, "#f2b56b", 296, 275, 62, 2);
  fill(ctx, "#d9a441", 342, 281, 6, 8);
  fill(ctx, "#d9a441", 352, 281, 6, 11);
  fill(ctx, "#8a6326", 342, 287, 6, 2);
  fill(ctx, "#8a6326", 352, 290, 6, 2);
  // Chain.
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 8; i++) fill(ctx, "#c9a35c", 244 - i * 3, 258 + i * 4, 3, 1);
  ctx.globalAlpha = 1;

  drawRain(ctx, t, 0, 0, W, H, 12, "#cfe3ea");
  drawVignette(ctx, 0.4);
}

/** Shoes in a wet street; the crowd keeps moving around him. */
export function drawPuddle(ctx, t) {
  fill(ctx, "#0b1018", 0, 0, W, H);
  dither(ctx, "#151e2c", 0, 0, W, H, 3, 0);
  const colors = ["#e06a8a", "#5fc8d8", "#f2b56b", "#8f7ad8"];
  for (let i = 0; i < 4; i++) {
    ctx.globalAlpha = 0.11;
    fill(ctx, colors[i], 80 + i * 140, 20, 22, 280);
    ctx.globalAlpha = 0.05;
    dither(ctx, colors[i], 70 + i * 140, 90, 44, 220, 3, i % 2);
  }
  ctx.globalAlpha = 1;

  // Puddle.
  for (let y = -66; y <= 66; y++) {
    const half = Math.floor(230 * Math.sqrt(Math.max(0, 1 - (y * y) / (66 * 66))));
    fill(ctx, y % 3 === 0 ? "#1d2a3d" : "#1a2638", 320 - half, 264 + y, half * 2, 1);
  }
  ctx.globalAlpha = 0.18;
  fill(ctx, "#cfe3ea", 140, 252, 360, 1);
  ctx.globalAlpha = 1;

  // Ripples.
  for (let i = 0; i < 3; i++) {
    const r = ((t * 16 + i * 22) % 60) + 6;
    ctx.globalAlpha = 0.22 * (1 - r / 70);
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      fill(ctx, "#9fc6d8", 320 + Math.cos(a) * r * 2.4, 258 + Math.sin(a) * r * 0.55, 2, 1);
    }
  }
  ctx.globalAlpha = 1;

  // A woman's shoes pass behind, never stopping.  A distant silhouette:
  // her legs are cropped by the far edge of the puddle, not run to frame top.
  const fx = 460 + ((t * 26) % 240);
  ctx.globalAlpha = 0.34;
  fill(ctx, "#141824", fx - 7, 168, 6, 38);
  fill(ctx, "#141824", fx + 12, 168, 6, 38);
  fill(ctx, "#3a2733", fx - 9, 202, 12, 6);
  fill(ctx, "#3a2733", fx + 10, 202, 12, 6);
  fill(ctx, "#0d1119", fx - 9, 208, 12, 2);
  fill(ctx, "#0d1119", fx + 10, 208, 12, 2);
  ctx.globalAlpha = 1;

  // His legs, close and still.  A shoe-level close-up: the trousers run out
  // of frame and taper into the cuff, so the shot reads as a person standing
  // in the rain rather than two loose blocks on the pavement.
  const step = Math.floor(t * 2.2) % 2 ? 3 : 0;
  const leg = (cx, ankleY, phase) => {
    for (let y = 0; y < ankleY; y += 2) {
      const q = y / ankleY;
      const half = Math.round(26 - q * 9 + Math.sin(q * 9 + phase) * 1.2);
      fill(ctx, "#283753", cx - half, y, half * 2, 2);
      fill(ctx, "#38507a", cx - half + 1, y, 2, 2);
      fill(ctx, "#4a628e", cx - half + 4, y, 1, 2);
      fill(ctx, "#1a2438", cx + half - 7, y, 7, 2);
      // Cloth folds, sparse and diagonal.
      if ((y + phase * 13) % 34 < 3) fill(ctx, "#1f2c45", cx - half + 5, y, half * 2 - 10, 1);
      if ((y + 17 + phase * 7) % 41 < 2) fill(ctx, "#3f5782", cx - half + 8, y, half, 1);
    }
  };
  leg(252, 216, 0);
  leg(318 + 1, 212 - step, 3);
  // Cuffs and a sliver of sock.
  fill(ctx, "#202b44", 236, 214, 40, 5);
  fill(ctx, "#3a4c70", 238, 214, 36, 1);
  fill(ctx, "#121722", 240, 219, 32, 3);
  fill(ctx, "#202b44", 296, 210 - step, 40, 5);
  fill(ctx, "#3a4c70", 298, 210 - step, 36, 1);
  fill(ctx, "#121722", 300, 215 - step, 32, 3);
  // Shoes: toes toward the left, soles on the wet ground.
  fill(ctx, "#12151c", 226, 221, 64, 15);
  fill(ctx, "#0c0f15", 230, 236, 56, 5);
  fill(ctx, "#2a3144", 230, 221, 56, 3);
  fill(ctx, "#4a566e", 234, 222, 22, 1);
  fill(ctx, "#080a0f", 222, 227, 5, 8);
  fill(ctx, "#9fc6d8", 230, 235, 11, 1);
  fill(ctx, "#12151c", 294, 215 - step, 66, 15);
  fill(ctx, "#0c0f15", 298, 230 - step, 58, 5);
  fill(ctx, "#2a3144", 298, 215 - step, 58, 3);
  fill(ctx, "#4a566e", 302, 216 - step, 22, 1);
  fill(ctx, "#080a0f", 290, 221 - step, 5, 8);
  fill(ctx, "#9fc6d8", 298, 229 - step, 11, 1);
  // The reflection runs down into the water and is broken by the ripples.
  ctx.globalAlpha = 0.13;
  fill(ctx, "#7d95b8", 244, 242, 16, 34);
  fill(ctx, "#7d95b8", 312, 238 - step, 16, 34);
  fill(ctx, "#334a70", 248, 276, 12, 18);
  fill(ctx, "#334a70", 314, 272 - step, 12, 18);
  ctx.globalAlpha = 0.09;
  fill(ctx, "#cfe3ea", 232, 244, 58, 2);
  fill(ctx, "#cfe3ea", 296, 240 - step, 60, 2);
  ctx.globalAlpha = 1;

  // Splash at the front foot.
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 7; i++) {
    const q = (t * 3 + i * 0.14) % 1;
    fill(ctx, "#cfe3ea", 330 + (i - 3) * 6, 232 - q * 18, 1, 2);
  }
  ctx.globalAlpha = 1;
  drawRain(ctx, t, 0, 0, W, H, 30, "#9fc6d8");
  drawVignette(ctx, 0.42);
}

/** Phone face down on a bed; no argument, no explanation. */
export function drawBreakupPhone(ctx, t) {
  fill(ctx, "#15131a", 0, 0, W, H);
  // Bed sheet.
  fill(ctx, "#2b2a33", 0, 0, W, H);
  fill(ctx, "#34313c", 0, 40, W, 240);
  dither(ctx, "#25232c", 0, 0, W, H, 4, 1);
  for (let i = 0; i < 7; i++) {
    fill(ctx, "#3c3945", 0, 70 + i * 35, W, 2);
    fill(ctx, "#23212a", 0, 78 + i * 35, W, 1);
  }
  // Pillow edge.
  fill(ctx, "#3f3b46", 0, 0, W, 34);
  fill(ctx, "#4a4652", 0, 30, W, 4);

  // Phone, face down.
  ctx.globalAlpha = 0.4;
  fill(ctx, "#070910", 248, 158, 156, 90);
  ctx.globalAlpha = 1;
  fill(ctx, "#080a10", 240, 150, 160, 88);
  fill(ctx, "#202633", 240, 150, 160, 2);
  fill(ctx, "#141924", 242, 152, 156, 84);
  fill(ctx, "#0b0e15", 248, 158, 144, 72);
  // Camera island.
  fill(ctx, "#05070c", 252, 162, 34, 22);
  pixelCircle(ctx, "#141b28", 260, 169, 5);
  pixelCircle(ctx, "#141b28", 276, 169, 5);
  pixelCircle(ctx, "#2a3144", 260, 177, 3);
  pixelCircle(ctx, "#2a3144", 276, 177, 3);
  fill(ctx, "#2a3144", 250, 226, 20, 1);

  // The last cold light under the glass.
  const glowA = Math.max(0, 1 - t / 2.1) * 0.35;
  ctx.globalAlpha = glowA;
  fill(ctx, "#9fc6d8", 244, 236, 152, 3);
  ctx.globalAlpha = glowA * 0.4;
  fill(ctx, "#9fc6d8", 252, 240, 136, 2);
  ctx.globalAlpha = 1;

  // A hand at the edge, not reaching to turn it over.
  fill(ctx, "#3a4454", 400, 196, 58, 60);
  fill(ctx, PAL.skin, 388, 204, 24, 44);
  fill(ctx, PAL.skinSh, 388, 240, 24, 5);
  for (let i = 0; i < 3; i++) fill(ctx, PAL.skin, 380, 210 + i * 10, 18, 5);

  drawDust(ctx, t, 180, 100, 300, 220, 12, PAL.cool, 0.4);
  drawVignette(ctx, 0.44);
}

/* --------------------------------------------------------------- helpers */

function drawApartmentWindow(ctx, assets, t) {
  vBands(ctx, 0, 0, W, H, [["#252b32", 1], ["#3e4345", 1], ["#6d675c", 0.8]]);
  drawWindow(ctx, 340, 20, 260, 250, "dawn", t);
  ctx.globalAlpha = 0.22;
  fill(ctx, "#ffd9a0", 0, 0, W, H);
  ctx.globalAlpha = 1;
  drawSpriteScaled(ctx, assets.sprites, "male", `idle_side_${Math.floor(t * 0.8) % 4}`, 312, 268, 3.1, {
    image: assets.variants.adultMale,
  });
  drawDust(ctx, t, 120, 30, 420, 300, 28, PAL.warm, 1);
  drawVignette(ctx, 0.32);
}

function drawYearbookClosing(ctx, t) {
  drawYearbookClose(ctx, t, 1.16 + smoothstep(clamp(t / 4)) * 0.04, { nameReveal: 1 });
  const q = smoothstep(clamp((t - 2.35) / 1.35));
  if (q > 0) {
    fill(ctx, "#2a1c19", 0, H - q * H, W, q * H + 1);
    fill(ctx, "#5a3d31", 0, H - q * H, W, 4);
    fill(ctx, "#7b5542", 0, H - q * H + 4, W, 2);
    if (q > 0.25) {
      fill(ctx, "#c9a35c", 46, H - q * H + 18, 86, 2);
      fill(ctx, "#8a6326", 46, H - q * H + 22, 42, 1);
    }
  }
}

/* ------------------------------------------------------------ shot lists */

export function createV2Scenes(assets) {
  // The procedural shots need the same runtime sprite bank.  No image file is
  // written; this only shares the already-loaded atlases.
  assetsForCity = assets;

  return {
    /* 0–33.785: present-day rain, then a classroom answer cut in half. */
    prologue: {
      id: "prologue",
      draw(ctx, t) {
        if (t < 6.4) {
          drawNeonCity(ctx, t, {
            pan: t * 12,
            adultX: 270,
            umbrella: true,
            image: assets.variants.adultMale,
          });
        } else if (t < 11.6) {
          drawNeonWindow(ctx, t, { pan: t * 7 });
        } else if (t < 17.2) {
          const q = smoothstep(clamp((t - 11.6) / 5.6));
          drawApartment(ctx, assets, t, {
            zoom: 1.36 + q * 0.05,
            panX: 26 + q * 6,
            panY: 8,
            adultFrame: `sit_side_${Math.floor(t * 0.9) % 4}`,
            hand: true,
          });
        } else if (t < 22.6) {
          const q = smoothstep(clamp((t - 17.2) / 5.4));
          drawAlbumClose(ctx, assets, t - 17.2, {
            zoom: 1.02 + q * 0.06,
            focusX: 320,
            focusY: 180,
            photoGlow: 0.02,
          });
        } else if (t < 26.5) {
          drawEmptyClassroom(ctx, assets, t, { q: (t - 22.6) / 3.9 });
        } else if (t < 31.95) {
          drawClassroomDay(ctx, assets, t, {
            zoom: 2.9,
            focusX: 399,
            focusY: 296,
            local: 10.1,
            fgY: 8,
          });
        } else {
          const q = smoothstep(clamp((t - 31.95) / 1.835));
          drawAlbumClose(ctx, assets, t - 31.95, {
            zoom: 1.15 + q * 0.05,
            focusX: 209,
            focusY: 142,
            photoGlow: 0.04,
          });
        }
      },
    },

    /* 33.785–62.439: trying to forget, told through distance and phones. */
    forget: {
      id: "forget",
      draw(ctx, t, g) {
        if (t < 4.416) {
          drawNeonCity(ctx, t, {
            pan: 60 + t * 16,
            adultX: 292,
            umbrella: true,
            image: assets.variants.adultMale,
          });
        } else if (t < 11.41) {
          const q = smoothstep(clamp((t - 4.416) / 6.994));
          drawFaceReflection(ctx, assets, t, "male", {
            image: assets.variants.adultMale,
            scale: 7.4,
            push: q * 0.035,
          });
        } else if (t < 17.753) {
          drawCorridorPass(ctx, assets, t - 11.41);
        } else if (t < 21.415) {
          drawBedroomSplit(ctx, assets, t, {
            zoom: 1.1,
            local: t,
            warm: 0.1,
          });
          snowAtWindows(ctx, t);
        } else if (t < 26.8) {
          // Hold the phone long enough for the last "晚安。" to be read before
          // the cut to the face-down screen.
          drawPhoneChatClose(ctx, g);
        } else {
          drawBedroomSplit(ctx, assets, t, {
            zoom: 1.14,
            local: t,
            phoneDown: true,
            warm: 0.25,
          });
          snowAtWindows(ctx, t);
        }
      },
    },

    /* 62.439–118.343: dial, hesitate, confess, wait, answer. */
    confession: {
      id: "confession",
      draw(ctx, t, g) {
        if (t < 4.193) {
          drawWideBedroom(ctx, assets, t, t);
        } else if (t < 8.161) {
          drawPhoneDial(ctx, t);
        } else if (t < 11.592) {
          drawBedroomSplit(ctx, assets, t, { zoom: 1.05, local: t, warm: 0.2 });
          // Her phone light pulses in the dark.
          ctx.globalAlpha = 0.2 + 0.1 * Math.sin(t * 7);
          glow(ctx, assets.fx.glowBlue, 520, 292, 70, 70, 0.35);
          ctx.globalAlpha = 1;
        } else if (t < 14.161) {
          drawBedroomSplit(ctx, assets, t, { zoom: 1.02, local: t, warm: 0.25 });
        } else if (t < 18.161) {
          drawBedroomSplit(ctx, assets, t, { zoom: 1.05, local: t, warm: 0.3 });
        } else if (t < 21.361) {
          drawBedroomSplit(ctx, assets, t, { zoom: 1.02, local: t, warm: 0.35 });
        } else if (t < 24.361) {
          drawBedroomSplit(ctx, assets, t, { zoom: 1.0, local: t, warm: 0.4 });
          ctx.globalAlpha = 0.16;
          fill(ctx, "#050810", 0, 0, W, H);
          ctx.globalAlpha = 1;
          glow(ctx, assets.fx.glowBlue, 140, 292, 90, 90, 0.4);
        } else if (t < 27.104) {
          drawPhoneHand(ctx, assets, t);
        } else if (t < 29.961) {
          drawBedroomSplit(ctx, assets, t, { zoom: 1.02, local: t, warm: 0.85 });
          ctx.globalAlpha = 0.08;
          fill(ctx, PAL.warm, 0, 0, W, H);
          ctx.globalAlpha = 1;
        } else if (t < 34.273) {
          drawCallTimer(ctx, assets, t, { seconds: Math.max(0, g - 74.7) });
        } else if (t < 41.442) {
          drawBedroomSplit(ctx, assets, t, { zoom: 1.07, local: t, warm: 0.25 });
          snowAtWindows(ctx, t);
        } else if (t < 45.068) {
          drawBedroomSplit(ctx, assets, t, {
            zoom: 1.13,
            local: t,
            phoneDown: true,
            warm: 0.05,
          });
          snowAtWindows(ctx, t);
          ctx.globalAlpha = 0.1;
          fill(ctx, "#0b1426", 0, 0, W, H);
          ctx.globalAlpha = 1;
        } else if (t < 49.463) {
          drawBreathWindow(ctx, assets, t);
        } else {
          const q = smoothstep(clamp((t - 49.463) / 6.441));
          drawBedroomSplit(ctx, assets, t, {
            zoom: 1.05 + q * 0.04,
            local: t,
            warm: 0.9,
          });
          snowAtWindows(ctx, t);
          ctx.globalAlpha = 0.05 + q * 0.05;
          fill(ctx, PAL.warm, 0, 0, W, H);
          ctx.globalAlpha = 1;
        }
      },
    },

    /* 118.343–160.920: the second chorus turns the present into neon. */
    neon: {
      id: "neon",
      draw(ctx, t, g) {
        if (t < 3.396) {
          drawNeonCity(ctx, t, {
            pan: 40 + t * 18,
            adultX: 288,
            umbrella: true,
            image: assets.variants.adultMale,
          });
        } else if (t < 7.015) {
          const q = smoothstep(clamp((t - 3.396) / 3.619));
          drawAlbumClose(ctx, assets, t, {
            zoom: 1.42 + q * 0.3,
            focusX: 447,
            focusY: 136,
            photoGlow: 0.02,
          });
          // A finger traces the old class photo.
          ctx.globalAlpha = 0.85;
          fill(ctx, PAL.skin, 300, 260, 26, 38);
          fill(ctx, PAL.skin, 306, 226, 7, 38);
          fill(ctx, PAL.skinSh, 306, 258, 7, 5);
          ctx.globalAlpha = 1;
        } else if (t < 10.657) {
          drawApartment(ctx, assets, t, {
            zoom: 1.38,
            panX: 26,
            panY: 8,
            adultFrame: "sit_side_0",
            hand: true,
          });
        } else if (t < 14.113) {
          drawApartment(ctx, assets, t, {
            zoom: 1.58,
            panX: 54,
            panY: 18,
            adultFrame: "sit_side_1",
            hand: true,
          });
        } else if (t < 17.795) {
          drawNeonCity(ctx, t, {
            pan: 30 + t * 6,
            adultX: 306,
            stand: true,
            umbrella: true,
            image: assets.variants.adultMale,
          });
        } else if (t < 21.094) {
          drawHands(ctx, t, { mode: "city", plane: true });
        } else if (t < 30.324) {
          const q = smoothstep(clamp((t - 21.094) / 9.23));
          drawPlatform(ctx, assets, t, {
            zoom: q * 0.04,
            panX: -(t - 21.094) * 1.2,
          });
        } else if (t < 34.657) {
          drawTrainWindowClose(ctx, t);
        } else if (t < 38.657) {
          drawPark(ctx, assets, t, g);
          ctx.globalAlpha = 0.07;
          fill(ctx, PAL.warm, 0, 0, W, H);
          ctx.globalAlpha = 1;
        } else {
          drawNeonCity(ctx, t, {
            pan: 150 + t * 14,
            adultX: 296,
            crowd: true,
            umbrella: true,
            image: assets.variants.adultMale,
          });
        }
      },
    },

    /* 160.920–188.238: crowd → trail → boots → grass → near-kiss. */
    search: {
      id: "search",
      draw(ctx, t, g) {
        if (t < 5.28) {
          drawNeonCity(ctx, t, {
            pan: 60 + t * 6,
            adultX: 244 + t * 8,
            crowd: true,
            umbrella: true,
            image: assets.variants.adultMale,
          });
        } else if (t < 8.88) {
          const q = smoothstep(clamp((t - 5.28) / 3.6));
          drawFaceReflection(ctx, assets, t, "female", {
            image: assets.variants.casualFemale,
            scale: 7.9,
            push: q * 0.04,
          });
        } else if (t < 11.568) {
          drawPuddle(ctx, t);
        } else if (t < 16.28) {
          const q = smoothstep(clamp((t - 11.568) / 4.712));
          drawTrailWide(ctx, t, g, assets, {
            scroll: 20 + t * 10,
            // Start them above the subtitle safe area, not at the bottom lip
            // of the frame where the lyric scrim would swallow them.
            progress: 0.2 + q * 0.3,
            walkT: g,
            figureScale: 1.3,
          });
        } else if (t < 18.88) {
          drawTrailClose(ctx, t);
        } else if (t < 21.68) {
          drawGrassWind(ctx, t);
        } else if (t < 24.48) {
          drawSummitApproach(ctx, t, { lean: (t - 21.68) / 4.5, scale: 2.2 });
        } else if (t < 26.1) {
          drawHands(ctx, t, { mode: "mountain" });
        } else {
          // The last look before the downbeat: a tight two-shot, faces a
          // breath apart, still withholding the kiss.
          drawSummitApproach(ctx, t, {
            lean: 0.2 + smoothstep(clamp((t - 26.1) / 2.6)) * 0.8,
            scale: 4.0,
            floorY: 384,
            mx: [298, 306],
            fx: [360, 352],
            zoom: 0.1,
          });
        }
      },
    },

    /* 188.238–216.853: kiss on the downbeat, then the happiest years. */
    summit: {
      id: "summit",
      draw(ctx, t, g) {
        if (t < 2.5) {
          const bloom = 0.4 * (1 - smoothstep(clamp(t / 1.1)));
          drawKiss(ctx, t, { lean: smoothstep(clamp(t / 0.4)) });
          if (bloom > 0) {
            ctx.globalAlpha = bloom;
            fill(ctx, "#fff3d8", 0, 0, W, H);
            ctx.globalAlpha = 1;
          }
        } else if (t < 6.994) {
          drawSummit(ctx, t);
          drawSpriteScaled(ctx, assets.sprites, "male", "idle_side_0", 296, 306, 1.18, {
            image: assets.variants.casualMale,
          });
          drawSpriteScaled(ctx, assets.sprites, "female", "look_side_0", 342, 306, 1.18, {
            image: assets.variants.casualFemale,
            flipX: true,
          });
          ctx.globalAlpha = 0.06;
          fill(ctx, PAL.warm, 0, 80, W, 220);
          ctx.globalAlpha = 1;
          drawDust(ctx, t, 80, 80, 480, 220, 22, PAL.warm, 0.8);
        } else if (t < 10.962) {
          const q = smoothstep(clamp((t - 6.994) / 3.968));
          drawRooftop(ctx, t, { dusk: 0, pan: (t - 6.994) * 3 });
          const walk = Math.floor(g * 6.4) % 6;
          drawSpriteScaled(ctx, assets.sprites, "male", `walk_side_${walk}`, lerp(196, 322, q), 306, 1.7, {
            image: assets.variants.casualMale,
          });
          drawSpriteScaled(ctx, assets.sprites, "female", `walk_side_${(walk + 2) % 6}`, lerp(268, 394, q), 306, 1.7, {
            image: assets.variants.casualFemale,
          });
          ctx.globalAlpha = 0.07;
          fill(ctx, PAL.warm, 0, 0, W, H);
          ctx.globalAlpha = 1;
        } else if (t < 15.262) {
          const q = smoothstep(clamp((t - 10.962) / 4.3));
          withCamera(ctx, 2.55 + q * 0.08, 399, 272, () => {
            drawStudyAfternoon(ctx, assets, 8.0 + t);
          });
          drawDust(ctx, t, 300, 100, 300, 180, 18, PAL.warm, 0.7);
        } else if (t < 19.262) {
          drawWinterWalk(ctx, assets, t, g);
        } else if (t < 23.5) {
          drawRooftopDusk(ctx, assets, t - 19.262);
        } else {
          const q = smoothstep(clamp((t - 23.5) / 5.353));
          withCamera(ctx, 1 + q * 0.06, 320, 240, () => {
            drawGateTogether(ctx, assets, t);
          });
        }
      },
    },

    /* 216.853–247.826: chorus four begins to look at the past as an object. */
    distance: {
      id: "distance",
      draw(ctx, t, g) {
        if (t < 3.434) {
          drawYearbookClose(ctx, t, 1.08 + smoothstep(clamp(t / 3.4)) * 0.05, { nameReveal: 0 });
          drawDust(ctx, t, 120, 40, 420, 280, 22, PAL.warm, 0.6);
        } else if (t < 6.938) {
          drawNeonWindow(ctx, t, { pan: 50 + t * 4 });
        } else if (t < 9.347) {
          drawPark(ctx, assets, t, g);
          ctx.globalAlpha = 0.07;
          fill(ctx, PAL.warm, 0, 0, W, H);
          ctx.globalAlpha = 1;
        } else if (t < 11.647) {
          drawClassroomDay(ctx, assets, t, {
            zoom: 2.15,
            focusX: 399,
            focusY: 270,
            local: 9.2,
            fgY: 8,
          });
          ctx.globalAlpha = 0.05;
          fill(ctx, PAL.warm, 0, 0, W, H);
          ctx.globalAlpha = 1;
        } else if (t < 14.136) {
          drawGateShot(ctx, assets, t, { night: 0.28, zoom: 1.04, panX: 8 });
          const walk = Math.floor(g * 6.2) % 6;
          drawSpriteScaled(ctx, assets.sprites, "male", `walk_side_${walk}`, 276, 326, 1.5);
          drawSpriteScaled(ctx, assets.sprites, "female", `walk_side_${(walk + 2) % 6}`, 372, 326, 1.5);
          ctx.globalAlpha = 0.07;
          fill(ctx, PAL.warm, 0, 0, W, H);
          ctx.globalAlpha = 1;
        } else if (t < 17.797) {
          // The lyric closes on the key itself.
          drawKeyPalm(ctx, t - 14.136);
        } else if (t < 22.224) {
          // He keeps walking, she is elsewhere.
          drawNeonCity(ctx, t, {
            pan: 110 + t * 15,
            adultX: 282,
            umbrella: true,
            image: assets.variants.adultMale,
          });
        } else if (t < 26.647) {
          drawSplitDorm(ctx, assets, g, t);
        } else {
          drawCampusFork(ctx, assets, t - 26.647, g);
        }
      },
    },

    /* 247.826–260.089: the arrangement falls; the relationship ends quietly. */
    breakup: {
      id: "breakup",
      draw(ctx, t, g) {
        if (t < 3.5) {
          drawSplitDorm(ctx, assets, g, 6 + t);
        } else if (t < 7.5) {
          drawCampusFork(ctx, assets, t - 3.5, g);
        } else if (t < 10.0) {
          drawDormExterior(ctx, assets, 10.15 + (t - 7.5));
        } else {
          drawBreakupPhone(ctx, t - 10.0);
        }
      },
    },

    /* 260.089–292.966: final chorus, memory flashes, the two placeholders. */
    reveal: {
      id: "reveal",
      draw(ctx, t, g) {
        if (t < 3.427) {
          drawYearbookClose(ctx, t, 1.04 + smoothstep(clamp(t / 3.4)) * 0.04, { nameReveal: 0 });
          drawDust(ctx, t, 120, 40, 420, 280, 20, PAL.warm, 0.7);
        } else if (t < 7.05) {
          const q = smoothstep(clamp((t - 3.427) / 3.623));
          drawYearbookClose(ctx, t, 1.95 + q * 0.14, { nameReveal: 0 });
          // A finger on the class photo.
          fill(ctx, PAL.skin, 286, 242, 26, 52);
          fill(ctx, PAL.skin, 292, 206, 8, 42);
          fill(ctx, PAL.skinSh, 292, 240, 8, 5);
          ctx.globalAlpha = 0.22;
          fill(ctx, "#fff3d8", 230, 150, 60, 46);
          ctx.globalAlpha = 1;
        } else if (t < 14.526) {
          const cut = 1.869;
          const index = Math.min(3, Math.floor((t - 7.05) / cut));
          if (index === 0) {
            drawGateShot(ctx, assets, t, { night: 0.35, zoom: 1.02 });
            drawSpriteScaled(ctx, assets.sprites, "male", "idle_side_0", 278, 328, 1.7);
            drawSpriteScaled(ctx, assets.sprites, "female", "look_side_0", 370, 328, 1.7, { flipX: true });
            ctx.globalAlpha = 0.07;
            fill(ctx, PAL.warm, 0, 0, W, H);
            ctx.globalAlpha = 1;
          } else if (index === 1) {
            drawBedroomSplit(ctx, assets, t, { zoom: 1.18, local: 30, warm: 0.5 });
            snowAtWindows(ctx, t);
            glow(ctx, assets.fx.glowBlue, 140, 292, 80, 80, 0.3);
            glow(ctx, assets.fx.glowBlue, 520, 292, 80, 80, 0.3);
          } else if (index === 2) {
            drawKiss(ctx, t, { lean: 1 });
          } else {
            drawGraduation(ctx, assets, 2.0);
          }
          // Two-frame white bites on each memory cut.
          const near = Math.min(
            Math.abs(t - 7.05),
            Math.abs(t - (7.05 + cut)),
            Math.abs(t - (7.05 + cut * 2)),
            Math.abs(t - (7.05 + cut * 3)),
          );
          if (near < 0.1) {
            ctx.globalAlpha = 0.32 * (1 - near / 0.1);
            fill(ctx, "#fff3d8", 0, 0, W, H);
            ctx.globalAlpha = 1;
          }
        } else if (t < 18.283) {
          const q = smoothstep(clamp((t - 14.526) / 3.757));
          withCamera(ctx, 1 + q * 0.035, 320, 180, () => {
            drawRooftopDusk(ctx, assets, 2.0);
          });
          // A frozen print, but no caption.
          ctx.globalAlpha = 0.18;
          fill(ctx, "#f2eee2", 0, 0, W, 4);
          fill(ctx, "#f2eee2", 0, H - 4, W, 4);
          fill(ctx, "#f2eee2", 0, 0, 4, H);
          fill(ctx, "#f2eee2", W - 4, 0, 4, H);
          ctx.globalAlpha = 1;
          drawGrain(ctx, 14.5, 0.04);
        } else if (t < 22.026) {
          const q = smoothstep(clamp((t - 18.283) / 3.743));
          drawApartment(ctx, assets, t, {
            zoom: 1.3 + q * 0.04,
            panX: 44,
            adultFrame: "look_side_0",
            hand: false,
          });
        } else if (t < 31.411) {
          const q = smoothstep(clamp((t - 22.026) / 9.385));
          const a = smoothstep(clamp((g - 283.115) / 1.4));
          drawYearbookClose(ctx, t, 1.08 + q * 0.08, { nameReveal: a });
          drawDust(ctx, t, 100, 40, 440, 280, 24, PAL.warm, 0.8);
          if (a > 0) {
            ctx.globalAlpha = 0.04 * a;
            fill(ctx, PAL.warm, 0, 0, W, H);
            ctx.globalAlpha = 1;
          }
        } else {
          drawYearbookClose(ctx, t, 1.16, { nameReveal: 1 });
          drawDust(ctx, t, 100, 40, 440, 280, 20, PAL.warm, 0.6);
        }
      },
    },

    /* 292.966–320.166: close the book, walk out, keep living. */
    outro: {
      id: "outro",
      draw(ctx, t, g) {
        if (t < 3.834) {
          drawYearbookClosing(ctx, t);
        } else if (t < 8.534) {
          const q = smoothstep(clamp((t - 3.834) / 4.7));
          drawApartment(ctx, assets, t, {
            zoom: 1.16 + q * 0.06,
            panX: 12 + q * 12,
            adultFrame: `idle_side_${Math.floor(t * 0.7) % 4}`,
            hand: false,
          });
        } else if (t < 13.534) {
          drawCityStreet(ctx, t, { pan: (t - 8.534) * 24 });
          const walk = Math.floor(g * 6.2) % 6;
          drawSpriteScaled(ctx, assets.sprites, "male", `walk_side_${walk}`, 276, 338, 1.9, {
            image: assets.variants.adultMale,
          });
        } else if (t < 18.534) {
          drawBenchScene(ctx, assets, t - 13.534);
        } else if (t < 23.534) {
          drawApartmentWindow(ctx, assets, t - 18.534);
        } else {
          const q = smoothstep(clamp((t - 23.534) / 3.666));
          drawApartment(ctx, assets, t, {
            zoom: 1.04 + q * 0.07,
            panX: 20 + q * 14,
            panY: 2,
            adultFrame: `idle_side_${Math.floor(t * 0.7) % 4}`,
            hand: false,
          });
        }
      },
    },

    /* 320.166–325.0: black, then one line. */
    post: {
      id: "post",
      draw(ctx, t, g) {
        fill(ctx, "#000", 0, 0, W, H);
        const local = g - 320.166;
        const a = smoothstep(clamp((local - 1.834) / 0.766)) *
          (1 - smoothstep(clamp((local - 4.2) / 0.634)));
        if (a > 0) {
          ctx.globalAlpha = a;
          drawText(ctx, "「珍惜那些在你生命中的名字」", 320, 160, {
            size: 18,
            color: PAL.cream,
            align: "center",
            letterSpacing: 2,
            shadow: true,
            shadowColor: "#000000",
            threshold: 100,
          });
          ctx.globalAlpha = 1;
        }
      },
    },
  };
}
