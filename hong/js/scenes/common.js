/* Reusable rooms and light for 《红》.
 *
 * The film only has a few locations.  They are drawn once here and re-lit for
 * memory, present day and the final screening, so the same red seat and the
 * same doorway can carry the change in the relationship.
 */

import {
  W, H, P, fill, px, line, poly, ellipse, circle, ring, dither, bands,
  glow, dust, projectorBeam, projectorFlicker, flicker, cloudBank, sea,
  text, alphaRect, grain,
} from "../art.js";
import { drawPerson } from "../characters.js";

export function screenSea(ctx, t, x, y, w, h, opts = {}) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  ctx.clip();
  const horizon = y + h * 0.58;
  bands(ctx, x, y, w, horizon - y, [
    [P.dusk1, 0.8], [P.dusk2, 0.8], [P.dusk3, 0.8], [P.pink2, 0.7], [P.pink3, 0.5],
  ]);
  cloudBank(ctx, t * 0.3, {
    y: y + h * 0.19, alpha: opts.cloudAlpha ?? 0.55, color: P.cloud1, speed: 1.1,
  });
  const sunX = x + w * 0.64;
  glow(ctx, sunX, horizon - 9, w * 0.35, h * 0.22, P.pink3, 0.25);
  circle(ctx, P.pink3, sunX, horizon - 9, Math.max(4, w * 0.018));
  sea(ctx, t, horizon, { pathX: sunX, kind: "dusk", waves: 9 });
  // A projected beach: two tiny figures, deliberately slightly too dark.
  const fx = x + w * 0.46;
  fill(ctx, "#3b2e35", fx - 10, horizon + 6, 2, 10);
  fill(ctx, "#3b2e35", fx + 5, horizon + 5, 2, 11);
  fill(ctx, "#3b2e35", fx - 13, horizon + 6, 7, 3);
  fill(ctx, "#3b2e35", fx + 7, horizon + 5, 7, 3);
  fill(ctx, "#5e4140", fx - 11, horizon + 15, 13, 1, 0.4);
  fill(ctx, "#5e4140", fx + 5, horizon + 15, 12, 1, 0.4);
  if (opts.oneFigure) fill(ctx, "#2d252d", fx + 7, horizon + 5, 0, 0);
  dither(ctx, P.dusk0, x, y, w, h, 3, 0, 0.08);
  ctx.restore();
  // Subtle screen border and projected light spill.
  fill(ctx, "#0b0b10", x - 7, y - 7, w + 14, 7);
  fill(ctx, "#0b0b10", x - 7, y + h, w + 14, 7);
  fill(ctx, "#0b0b10", x - 7, y, 7, h);
  fill(ctx, "#0b0b10", x + w, y, 7, h);
  fill(ctx, P.cream, x - 6, y - 6, w + 12, 1, 0.18);
}

export function curtain(ctx, x, y, w, h, opts = {}) {
  const alpha = opts.alpha ?? 1;
  const dark = opts.dark || "#4e1d24";
  const mid = opts.mid || "#7a2d32";
  const hi = opts.hi || "#a54441";
  poly(ctx, dark, [[x, y], [x + w, y], [x + w - 4, y + h], [x + 4, y + h]], alpha);
  for (let i = 0; i < 7; i++) {
    const fx = x + 4 + (i * (w - 8)) / 7;
    poly(ctx, i % 2 ? mid : dark, [
      [fx, y], [fx + (w - 8) / 7, y], [fx + (w - 8) / 7 - 2, y + h], [fx + 2, y + h],
    ], alpha);
    line(ctx, hi, fx + 2, y + 2, fx + 1, y + h - 2, 1, alpha * 0.28);
  }
  fill(ctx, hi, x + 2, y + 2, w - 4, 1, alpha * 0.35);
  dither(ctx, "#35151b", x, y, w, h, 3, 0, alpha * 0.2);
}

export function valance(ctx, x, y, w, opts = {}) {
  fill(ctx, "#3a171d", x, y, w, 13);
  for (let i = 0; i < Math.floor(w / 18); i++) {
    ellipse(ctx, i % 2 ? "#792d32" : "#5f232a", x + 9 + i * 18, y + 12, 10, 5);
    fill(ctx, "#a64441", x + 4 + i * 18, y + 1, 1, 7, 0.35);
  }
  fill(ctx, P.gold1, x, y + 1, w, 1, 0.2);
}

export function seat(ctx, x, y, w, h, opts = {}) {
  const dark = opts.dark || "#4c1d23";
  const mid = opts.mid || "#7a2c30";
  const hi = opts.hi || "#a74843";
  ellipse(ctx, "#2a1116", x + w / 2, y + 5, w / 2, 6);
  fill(ctx, "#2a1116", x, y, w, h - 4);
  ellipse(ctx, dark, x + w / 2, y + 5, w / 2 - 1, 5);
  fill(ctx, mid, x + 2, y + 4, w - 4, h - 9);
  ellipse(ctx, mid, x + w / 2, y + 5, w / 2 - 2, 4);
  fill(ctx, hi, x + 3, y + 3, w - 6, 1, 0.45);
  fill(ctx, "#32151a", x, y + h - 5, w, 4);
  fill(ctx, "#5e272b", x + 2, y + h - 10, w - 4, 2, 0.5);
  // Armrests.
  fill(ctx, "#30151a", x - 2, y + 6, 3, 8);
  fill(ctx, "#30151a", x + w - 1, y + 6, 3, 8);
  fill(ctx, "#8b3c3c", x - 1, y + 6, 1, 4, 0.4);
  fill(ctx, "#8b3c3c", x + w, y + 6, 1, 4, 0.4);
  dither(ctx, "#3a171c", x + 2, y + 8, w - 4, h - 14, 3, 0, 0.35);
}

export function seatRows(ctx, t, opts = {}) {
  const light = opts.light ?? 1;
  const rows = opts.rows ?? 4;
  for (let r = 0; r < rows; r++) {
    const y = 238 + r * 25 + (r === 0 ? -2 : 0);
    const scale = 1 + r * 0.1;
    const gap = 29 * scale;
    const leftCount = 7;
    for (let i = 0; i < leftCount; i++) {
      const sx = 70 + i * gap - r * 3;
      if (sx + 20 > 300) break;
      seat(ctx, sx, y, 22 * scale, 18 + r * 2, {
        dark: r % 2 ? "#42171e" : "#4c1d23",
        mid: r === 0 ? "#6f282d" : "#7c2d31",
        hi: "#a74843",
      });
    }
    const rightStart = 346 + r * 2;
    for (let i = 0; i < leftCount; i++) {
      const sx = rightStart + i * gap;
      if (sx + 22 * scale > 590) break;
      seat(ctx, sx, y, 22 * scale, 18 + r * 2, {
        dark: r % 2 ? "#42171e" : "#4c1d23",
        mid: r === 0 ? "#6f282d" : "#7c2d31",
        hi: "#a74843",
      });
    }
  }
  alphaRect(ctx, "#07060a", 0, 330, W, 30, 0.55);
}

export function seatedBack(ctx, cx, y, scale = 1, color = "#17121a") {
  // Back-of-head silhouette in a seat.  Used for wide auditorium shots.
  ellipse(ctx, color, cx, y - 18 * scale, 6 * scale, 7 * scale);
  fill(ctx, color, cx - 8 * scale, y - 13 * scale, 16 * scale, 13 * scale);
  ellipse(ctx, color, cx, y - 12 * scale, 9 * scale, 5 * scale);
}

export function auditorium(ctx, t, opts = {}) {
  const warm = opts.warm ?? 1;
  const beamOn = opts.beam !== false;
  const showScreen = opts.screen !== "blank";
  fill(ctx, "#09070c", 0, 0, W, H);
  // Back wall and screen.
  fill(ctx, "#1b1015", 34, 26, 572, 238);
  if (showScreen) {
    screenSea(ctx, t, 88, 48, 464, 182, { oneFigure: opts.oneFigure });
  } else {
    fill(ctx, "#d8cfc0", 88, 48, 464, 182);
    dither(ctx, "#b7aa98", 88, 48, 464, 182, 3, 0, 0.18);
  }
  // Screen light spill.
  if (showScreen) {
    ctx.save();
    ctx.globalAlpha = 0.06 * projectorFlicker(t);
    ctx.fillStyle = P.pink3;
    ctx.fillRect(30, 20, 580, 280);
    ctx.restore();
  }
  // Side walls, panels and sconces.
  fill(ctx, "#241318", 0, 20, 52, 250);
  fill(ctx, "#241318", 588, 20, 52, 250);
  for (let i = 0; i < 3; i++) {
    fill(ctx, "#311a1f", 6, 48 + i * 66, 34, 46);
    fill(ctx, "#3c2024", 600, 48 + i * 66, 34, 46);
    fill(ctx, "#7f4b3c", 18, 60 + i * 66, 3, 7, 0.8);
    fill(ctx, P.warm2, 19, 61 + i * 66, 1, 5, 0.75);
    glow(ctx, 20, 64 + i * 66, 52, 44, P.warm2, 0.13 * warm);
    glow(ctx, 620, 64 + i * 66, 52, 44, P.warm2, 0.13 * warm);
  }
  // Top valance and curtains.
  valance(ctx, 28, 24, 584);
  curtain(ctx, 26, 36, 60, 210, { alpha: 0.95 });
  curtain(ctx, 554, 36, 60, 210, { alpha: 0.95 });
  // Ceiling and beam.
  fill(ctx, "#08070a", 0, 0, W, 26);
  if (beamOn) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    projectorBeam(ctx, 578, 24, 320, 128, 124, 0.09 * projectorFlicker(t), P.pink3);
    ctx.restore();
    dust(ctx, t, 120, 40, 430, 190, 30, P.pink3, 0.8);
  }
  // Aisle carpet.
  fill(ctx, "#3c181e", 300, 238, 40, 122);
  fill(ctx, "#5a2428", 304, 238, 32, 122, 0.38);
  for (let i = 0; i < 5; i++) fill(ctx, "#261116", 300, 250 + i * 24, 40, 1, 0.6);
  seatRows(ctx, t, { rows: opts.rows ?? 4 });
  // Occupied seats.
  if (opts.occupied === "alone") {
    seatedBack(ctx, 320, 300, 1.3);
    const seatY = 300;
    fill(ctx, "#2b1a1d", 300, seatY - 10, 40, 10, 0.7);
  }
  if (opts.occupied === "pair") {
    seatedBack(ctx, 280, 308, 1.5, "#191319");
    seatedBack(ctx, 352, 308, 1.5, "#191319");
  }
  // Vignette and dust in the room.
  alphaRect(ctx, "#07060a", 0, 0, W, 12, 0.55);
  if (opts.dim) alphaRect(ctx, "#07060a", 0, 0, W, H, opts.dim);
}

export function exterior(ctx, t, opts = {}) {
  const night = opts.night ?? false;
  const open = opts.open ?? true;
  const dawn = opts.dawn ?? false;
  if (dawn) {
    bands(ctx, 0, 0, W, 248, [
      [P.blue0, 1], [P.blue1, 0.8], [P.dusk2, 0.9], [P.pink2, 0.9], [P.pink3, 0.5],
    ]);
  } else if (night) {
    bands(ctx, 0, 0, W, 248, [
      [P.night0, 1], [P.night1, 0.9], [P.night2, 0.7], [P.night3, 0.4],
    ]);
    for (let i = 0; i < 45; i++) {
      const x = (i * 137) % W;
      const y = 12 + ((i * 53) % 150);
      px(ctx, i % 8 === 0 ? P.pink2 : P.cream, x, y, 0.3);
    }
  } else {
    bands(ctx, 0, 0, W, 248, [
      [P.dusk0, 0.8], [P.dusk1, 0.8], [P.dusk2, 0.8], [P.dusk3, 0.8], [P.dusk4, 0.45],
    ]);
    cloudBank(ctx, t, { y: 66, alpha: 0.6, speed: 1.8 });
    glow(ctx, 492, 186, 180, 110, P.pink3, 0.22);
    circle(ctx, P.pink3, 492, 184, 18);
  }

  // Distant town and a strip of sea at the end of the street.
  if (night) {
    fill(ctx, "#10151f", 0, 218, W, 30);
    for (let i = 0; i < 11; i++) {
      const bh = 12 + (i * 17) % 32;
      fill(ctx, "#151b27", i * 62, 218 - bh, 58, bh);
      for (let j = 0; j < 3; j++) {
        if ((i + j) % 3) fill(ctx, P.gold2, i * 62 + 9 + j * 17, 218 - bh + 7, 2, 2, 0.5);
      }
    }
  } else {
    fill(ctx, "#5f4551", 0, 224, W, 24);
    for (let i = 0; i < 12; i++) {
      const bh = 10 + (i * 19) % 27;
      fill(ctx, i % 3 ? "#5b4653" : "#4a3a48", i * 56, 224 - bh, 52, bh);
      fill(ctx, "#d39a87", i * 56, 224 - bh, 52, 1, 0.25);
    }
  }

  // Building.
  const bx = 78; const by = 72; const bw = 484; const bh = 244;
  fill(ctx, "#0b090c", bx - 4, by - 4, bw + 8, bh + 8);
  fill(ctx, night ? "#3a3536" : "#b99279", bx, by, bw, bh);
  fill(ctx, night ? "#27242a" : "#8b6658", bx, by + 166, bw, 78);
  // Plaster panels and damp stains.
  for (let i = 0; i < 6; i++) {
    fill(ctx, night ? "#312c31" : "#a67e69", bx + 12 + i * 78, by + 15, 2, 140, 0.33);
  }
  dither(ctx, night ? "#1c1b22" : "#8f6a5c", bx, by, bw, bh, 3, 1, 0.14);
  // Parapet.
  fill(ctx, "#161116", bx - 8, by - 12, bw + 16, 14);
  fill(ctx, night ? "#4c4241" : "#c9a086", bx - 4, by - 9, bw + 8, 4);
  for (let i = 0; i < 13; i++) fill(ctx, "#161116", bx + i * 39, by - 15, 17, 4);

  // Roofline water tank and projector chimney.
  fill(ctx, "#1b1619", 430, 40, 4, 34);
  fill(ctx, "#1b1619", 468, 28, 31, 15);
  fill(ctx, "#4c3b37", 470, 31, 27, 10);
  fill(ctx, "#1b1619", 478, 16, 4, 15);

  // Second-floor windows, mostly dark.
  for (let i = 0; i < 5; i++) {
    const wx = bx + 68 + i * 82;
    fill(ctx, "#171116", wx - 2, by + 28, 34, 42);
    fill(ctx, night ? "#2f2e36" : "#5a4b4e", wx, by + 30, 30, 38);
    if (i === 2) {
      fill(ctx, "#d8a477", wx + 2, by + 32, 26, 34, 0.4);
      fill(ctx, "#1d1518", wx + 12, by + 42, 1, 22, 0.6);
    } else {
      dither(ctx, "#171116", wx, by + 30, 30, 38, 2, 0, 0.4);
    }
    fill(ctx, "#1a1317", wx - 2, by + 50, 34, 2);
  }

  // Vertical neon sign.
  const sx = bx + 18; const sy = by + 38; const sw = 42; const sh = 126;
  fill(ctx, "#1a0c10", sx - 3, sy - 3, sw + 6, sh + 6);
  fill(ctx, open ? "#661e25" : "#2a171b", sx, sy, sw, sh);
  if (open) {
    glow(ctx, sx + sw / 2, sy + sh / 2, 128, 180, P.red3, 0.17 * flicker(t, 3));
    text(ctx, "影", sx + sw / 2, sy + 22, {
      size: 27, color: P.cream, align: "center", shadow: false, threshold: 72,
      alpha: flicker(t, 2),
    });
    text(ctx, "院", sx + sw / 2, sy + 68, {
      size: 27, color: P.cream, align: "center", shadow: false, threshold: 72,
      alpha: flicker(t, 4),
    });
    // A single red bulb under the two characters, so the narrow sign still
    // reads as a lit cinema sign rather than a blank red board.
    fill(ctx, P.red3, sx + sw / 2 - 2, sy + 102, 4, 4, open ? 0.9 : 0.4);
    fill(ctx, "#c44843", sx + 7, sy + 6, 2, sh - 12, 0.3);
  }
  // Marquee.
  fill(ctx, "#1a1113", bx + 84, by + 92, 286, 30);
  fill(ctx, open ? "#4a1a1f" : "#292024", bx + 86, by + 94, 282, 26);
  // Bulbs.
  for (let i = 0; i < 16; i++) {
    const on = open && (Math.sin(t * 2 + i * 1.8) > -0.75);
    fill(ctx, on ? P.warm3 : "#6d5145", bx + 92 + i * 18, by + 90, 2, 2, on ? 0.8 : 0.3);
  }

  // Entrance, awning and posters.
  fill(ctx, "#171116", 268, 162, 108, 154);
  fill(ctx, open ? "#d19a6e" : "#3d3131", 274, 168, 96, 148);
  fill(ctx, "#2a1518", 280, 176, 84, 140);
  if (open) {
    // Warm doorway with a red curtain just inside.
    fill(ctx, "#e1b07f", 286, 184, 72, 132);
    fill(ctx, "#6a2b2d", 300, 188, 44, 128);
    for (let i = 0; i < 4; i++) fill(ctx, "#8b3e3d", 304 + i * 10, 190, 2, 124, 0.55);
    glow(ctx, 322, 250, 210, 180, P.warm2, 0.19);
    fill(ctx, "#7b4e37", 286, 306, 72, 10);
  } else {
    fill(ctx, "#272124", 286, 184, 72, 132);
    for (let i = 0; i < 5; i++) fill(ctx, "#4b3a36", 286, 188 + i * 24, 72, 2, 0.5);
    fill(ctx, "#2c2527", 286, 306, 72, 10);
  }
  // Awning.
  fill(ctx, "#2b1216", 250, 158, 144, 18);
  for (let i = 0; i < 8; i++) {
    fill(ctx, i % 2 ? "#c4a17e" : "#8d3136", 252 + i * 17.5, 160, 18, 10);
  }
  fill(ctx, "#d9ad85", 252, 170, 140, 2, 0.6);
  // The awning is the only readable marquee in the shot, so the name goes
  // here, after the stripes rather than under them.
  text(ctx, "影  院", 322, 160, {
    size: 11, color: open ? P.cream : "#8d7878", align: "center", shadow: true,
    shadowColor: P.ink, letterSpacing: 6, threshold: 70, alpha: open ? 0.92 : 0.5,
  });

  // Poster boxes.
  for (const px0 of [176, 390]) {
    fill(ctx, "#1b1114", px0, 186, 54, 92);
    fill(ctx, "#3c2b2b", px0 + 4, 190, 46, 84);
    // Abstract hand-painted poster: a red sun and a dark sea.
    fill(ctx, "#d9b18d", px0 + 6, 192, 42, 80);
    bands(ctx, px0 + 6, 192, 42, 52, [["#cf8b7e", 1], ["#e6ae92", 1]]);
    circle(ctx, "#b4443f", px0 + 27, 218, 10);
    fill(ctx, "#5b3d43", px0 + 6, 244, 42, 28);
    for (let i = 0; i < 4; i++) fill(ctx, "#e1b190", px0 + 8, 250 + i * 5, 38, 1, 0.35);
    text(ctx, "海", px0 + 9, 228, {
      size: 9, color: "#4b2525", shadow: false, threshold: 60,
    });
    fill(ctx, "#171116", px0 + 4, 274, 46, 2);
  }

  // Street and curb.
  fill(ctx, "#29252a", 0, 316, W, 44);
  fill(ctx, "#4f4a4b", 0, 316, W, 2);
  for (let i = 0; i < 9; i++) {
    fill(ctx, "#454045", i * 82 - ((t * 7) % 82), 342, 42, 2, 0.6);
  }
  if (open) {
    // Red light on the pavement from the sign.
    dither(ctx, "#7c2e32", 86, 318, 120, 28, 3, 1, 0.2);
  }
  // Bicycle, left leaning against the wall.
  drawBicycle(ctx, 552, 312, 1, night ? "#4d4b51" : "#4a3c37");

  // Light haze and grain are applied by the compositor.
}

export function drawBicycle(ctx, x, y, scale = 1, color = "#403936") {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale, scale);
  circle(ctx, color, -30, -12, 14, 0.9);
  circle(ctx, P.ink, -30, -12, 12, 0.9);
  circle(ctx, color, 30, -12, 14, 0.9);
  circle(ctx, P.ink, 30, -12, 12, 0.9);
  line(ctx, color, -30, -12, -4, -36, 2);
  line(ctx, color, -4, -36, 8, -12, 2);
  line(ctx, color, -4, -36, 24, -35, 2);
  line(ctx, color, 8, -12, 30, -12, 2);
  line(ctx, color, 24, -35, 30, -12, 2);
  line(ctx, color, -22, -41, -4, -36, 2);
  fill(ctx, color, -27, -44, 10, 2);
  fill(ctx, color, 22, -38, 11, 2);
  fill(ctx, color, 17, -40, 3, 4);
  line(ctx, color, 8, -12, 4, -22, 1);
  fill(ctx, "#b3463f", 10, -24, 9, 4, 0.8);
  ctx.restore();
}

export function lobby(ctx, t, opts = {}) {
  const warm = opts.warm ?? 1;
  fill(ctx, "#100b10", 0, 0, W, H);
  // Floor and wall.
  fill(ctx, "#3e2927", 0, 0, W, 312);
  fill(ctx, "#24191b", 0, 0, W, 58);
  fill(ctx, "#2b1c1d", 0, 312, W, 48);
  for (let i = 0; i < 6; i++) {
    fill(ctx, "#4a302b", 0, 302 + i * 10, W, 1, 0.55);
  }
  for (let i = 0; i < 14; i++) {
    fill(ctx, "#35211f", i * 50, 312, 1, 48, 0.4);
  }
  // Ceiling and hanging lamp.
  fill(ctx, "#171015", 0, 0, W, 24);
  fill(ctx, "#24161a", 42, 24, 5, 18);
  fill(ctx, "#c99a66", 30, 42, 30, 5);
  glow(ctx, 45, 48, 190, 150, P.warm2, 0.14 * warm);
  // Poster wall.
  const arts = [
    [72, 86, 92, 126, "#d5a17f", "#9b3b39"],
    [190, 86, 92, 126, "#caa88c", "#556d78"],
  ];
  for (const [x, y, w, h, bg, accent] of arts) {
    fill(ctx, "#1a1013", x - 4, y - 4, w + 8, h + 8);
    fill(ctx, "#412a29", x, y, w, h);
    fill(ctx, bg, x + 4, y + 4, w - 8, h - 8);
    dither(ctx, "#80605c", x + 4, y + 4, w - 8, h - 8, 3, 0, 0.2);
    if (accent === "#9b3b39") {
      circle(ctx, accent, x + w / 2, y + 42, 20);
      fill(ctx, "#4d3438", x + 5, y + 71, w - 10, 48);
      for (let i = 0; i < 4; i++) fill(ctx, P.cream2, x + 9, y + 80 + i * 8, w - 18, 1, 0.35);
    } else {
      fill(ctx, accent, x + 5, y + 5, w - 10, 60);
      fill(ctx, "#d7b09b", x + w / 2 - 9, y + 35, 18, 50);
      fill(ctx, "#2f2528", x + w / 2 - 6, y + 28, 12, 12);
    }
    text(ctx, "影院", x + 10, y + h - 22, {
      size: 9, color: "#3b2020", shadow: false, threshold: 55,
    });
  }

  // Ticket booth on the right.
  const bx = 408; const by = 148;
  fill(ctx, "#1c1114", bx - 4, by - 4, 174, 150);
  fill(ctx, "#5d3b32", bx, by, 166, 146);
  fill(ctx, "#765144", bx + 6, by + 6, 154, 136);
  fill(ctx, "#201517", bx + 16, by + 18, 82, 54);
  fill(ctx, warm ? "#e5b47e" : "#4d3f3d", bx + 20, by + 22, 74, 46);
  fill(ctx, "#2c1a1b", bx + 20, by + 68, 74, 4);
  text(ctx, "售票", bx + 30, by + 32, {
    size: 12, color: "#5d2b27", shadow: false, threshold: 58,
  });
  text(ctx, "ADMIT ONE", bx + 42, by + 47, {
    size: 6, color: "#7a4035", shadow: false, threshold: 55,
  });
  // Glass reflection.
  poly(ctx, "#ffe1b5", [[bx + 23, by + 22], [bx + 45, by + 22], [bx + 30, by + 66], [bx + 23, by + 66]], 0.09);
  // Counter and bell.
  fill(ctx, "#251619", bx + 4, by + 86, 158, 8);
  fill(ctx, "#9a6d50", bx + 8, by + 86, 150, 2);
  fill(ctx, "#b28a57", bx + 126, by + 78, 9, 7);
  circle(ctx, "#d7b268", bx + 130, by + 76, 3);
  fill(ctx, "#3a2626", bx + 12, by + 106, 142, 34);
  fill(ctx, "#5d3b32", bx + 12, by + 106, 142, 3);
  // Poster tube / flowers.
  fill(ctx, "#2c1b1c", bx + 10, by + 64, 2, 22);
  fill(ctx, "#9d4a45", bx + 6, by + 60, 10, 6);
  // Curtain doorway on the left.
  fill(ctx, "#1a1013", 298, 104, 88, 206);
  fill(ctx, "#2e171b", 304, 110, 76, 200);
  curtain(ctx, 310, 116, 64, 194, { dark: "#4a1a20", mid: "#74292d", hi: "#a2433f" });
  fill(ctx, "#1c1114", 294, 96, 96, 10);
  for (let i = 0; i < 7; i++) {
    fill(ctx, i % 2 ? "#8c3b39" : "#d0aa7d", 298 + i * 14, 98, 14, 6);
  }
  // Wall clock (stopped at 7:10, the recurring dusk).
  circle(ctx, "#201315", 558, 108, 22);
  circle(ctx, "#d8c2a2", 558, 108, 19);
  line(ctx, "#4b3030", 558, 108, 558, 94, 1);
  line(ctx, "#4b3030", 558, 108, 567, 112, 1);
  fill(ctx, "#4b3030", 557, 107, 2, 2);
  // Dust and warm falloff.
  dust(ctx, t, 30, 34, 560, 280, 22, P.warm3, 0.7);
}

export function booth(ctx, t, opts = {}) {
  const dark = opts.dark ?? false;
  fill(ctx, "#0b0a0e", 0, 0, W, H);
  // Walls.
  fill(ctx, dark ? "#1a2024" : "#2d2b27", 0, 0, W, 304);
  fill(ctx, dark ? "#11161a" : "#211d1b", 0, 0, W, 28);
  fill(ctx, dark ? "#202a2c" : "#3e3a32", 0, 304, W, 56);
  dither(ctx, dark ? "#14191d" : "#25221e", 0, 28, W, 240, 3, 0, 0.2);
  // Window into the auditorium.
  const wx = 62; const wy = 62; const ww = 232; const wh = 126;
  fill(ctx, "#08070a", wx - 7, wy - 7, ww + 14, wh + 14);
  fill(ctx, "#191419", wx, wy, ww, wh);
  if (opts.window === "screen") {
    // The screen is seen through the booth glass, softly out of focus.
    bands(ctx, wx + 6, wy + 6, ww - 12, wh - 12, [
      [P.dusk1, 0.9], [P.dusk2, 0.9], [P.pink2, 0.9], [P.pink3, 0.8],
    ]);
    glow(ctx, wx + ww * 0.62, wy + wh * 0.38, 120, 90, P.pink3, 0.32);
    for (let i = 0; i < 12; i++) {
      fill(ctx, P.dusk0, wx + 6, wy + 74 + i * 4, ww - 12, 1, 0.22);
    }
    // Blurred seat tops.
    for (let i = 0; i < 4; i++) {
      ellipse(ctx, "#3a1b20", wx + 24 + i * 54, wy + 118, 25, 9, 0.7);
    }
    fill(ctx, P.pink3, wx + 6, wy + 6, ww - 12, 2, 0.25);
  } else if (opts.window === "night") {
    fill(ctx, P.night1, wx + 6, wy + 6, ww - 12, wh - 12);
    for (let i = 0; i < 13; i++) {
      const bh = 8 + (i * 13) % 40;
      fill(ctx, "#131a26", wx + 8 + i * 16, wy + wh - 8 - bh, 13, bh);
      if (i % 3 === 0) fill(ctx, P.gold2, wx + 11 + i * 16, wy + wh - 16, 2, 2, 0.6);
    }
    fill(ctx, "#0f1018", wx + 6, wy + 76, ww - 12, 2);
  } else {
    fill(ctx, P.night0, wx + 6, wy + 6, ww - 12, wh - 12);
    for (let i = 0; i < 20; i++) px(ctx, P.cream, wx + 10 + (i * 37) % (ww - 20), wy + 10 + (i * 23) % (wh - 20), 0.3);
  }
  // Window frame and glass reflection.
  fill(ctx, "#191216", wx - 4, wy - 4, ww + 8, 4);
  fill(ctx, "#191216", wx - 4, wy + wh, ww + 8, 4);
  fill(ctx, "#191216", wx - 4, wy, 4, wh);
  fill(ctx, "#191216", wx + ww, wy, 4, wh);
  poly(ctx, P.cream, [[wx + 10, wy + 10], [wx + 56, wy + 10], [wx + 26, wy + wh - 12], [wx + 10, wy + wh - 12]], 0.045);
  // Projector.
  drawProjector(ctx, 338, 258, 1.15, t, dark);
  // Desk, notes, reels.
  fill(ctx, "#251b1a", 300, 274, 302, 50);
  fill(ctx, "#4a342a", 300, 274, 302, 4);
  fill(ctx, "#2b1e1c", 300, 304, 302, 24);
  for (let i = 0; i < 4; i++) fill(ctx, "#5c4436", 316 + i * 68, 318, 46, 1, 0.35);
  paperNote(ctx, 324, 286, 48, 22);
  paperNote(ctx, 450, 288, 38, 18);
  // Shelf with reels.
  fill(ctx, "#241817", 76, 214, 164, 5);
  for (let i = 0; i < 4; i++) {
    ellipse(ctx, "#0b0a0c", 94 + i * 38, 202, 14, 14);
    ring(ctx, "#7a6150", 94 + i * 38, 202, 11, 2, 0.8);
    circle(ctx, "#2e2b2a", 94 + i * 38, 202, 5);
    fill(ctx, "#9a7b5b", 93 + i * 38, 201, 1, 1, 0.7);
  }
  // Red recording lamp.
  fill(ctx, "#1e1113", 526, 54, 55, 30);
  fill(ctx, "#2f1b1d", 530, 58, 47, 22);
  const on = dark ? Math.sin(t * 2.1) > -0.55 : true;
  circle(ctx, on ? P.red3 : "#4c2d2d", 542, 69, 4);
  if (on) glow(ctx, 542, 69, 50, 50, P.red3, 0.32);
  text(ctx, "REC", 552, 63, {
    size: 8, color: on ? P.cream : "#725454", shadow: false, threshold: 60,
  });
  // Wall schedule.
  fill(ctx, "#1b1215", 514, 112, 78, 84);
  fill(ctx, "#d4c3a9", 517, 115, 72, 78);
  for (let i = 0; i < 6; i++) {
    fill(ctx, "#6e5a4b", 522, 124 + i * 10, 30 + (i * 7) % 30, 1, 0.5);
  }
  text(ctx, "今日放映", 522, 117, {
    size: 6, color: "#5c3b31", shadow: false, threshold: 55,
  });
  // Warm desk lamp.
  fill(ctx, "#3d2b22", 592, 256, 4, 42);
  poly(ctx, "#8c6546", [[570, 254], [602, 254], [596, 266], [576, 266]]);
  fill(ctx, "#f1c982", 572, 265, 28, 2, 0.9);
  glow(ctx, 586, 278, 110, 100, P.warm2, dark ? 0.12 : 0.2);
  dust(ctx, t, 40, 40, 540, 240, 18, dark ? P.cream2 : P.warm3, 0.55);
}

function paperNote(ctx, x, y, w, h) {
  fill(ctx, "#d9c8ae", x, y, w, h);
  fill(ctx, "#b8a48b", x, y + h - 1, w, 1);
  for (let i = 0; i < 3; i++) fill(ctx, "#7b6253", x + 4, y + 5 + i * 5, w - 10 - i * 4, 1, 0.55);
}

export function drawProjector(ctx, x, y, scale = 1, t = 0, dark = false) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale, scale);
  // Body.
  fill(ctx, "#0c0a0c", -52, -26, 102, 52);
  fill(ctx, dark ? "#2f3536" : "#46423b", -48, -22, 94, 44);
  fill(ctx, dark ? "#3f4849" : "#625b4e", -46, -20, 90, 4);
  // Two reels.
  for (const rx of [-30, 22]) {
    ellipse(ctx, "#111013", rx, -38, 26, 26);
    ellipse(ctx, dark ? "#242b2c" : "#34322f", rx, -38, 23, 23);
    ring(ctx, "#8b7660", rx, -38, 18, 2, 0.8);
    ring(ctx, "#6b5948", rx, -38, 11, 1, 0.55);
    circle(ctx, "#191719", rx, -38, 4);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      fill(ctx, "#8f785f", rx + Math.cos(a) * 15, -38 + Math.sin(a) * 15, 2, 2, 0.5);
    }
  }
  // Lens and heat glow.
  fill(ctx, "#111013", 46, -10, 18, 14);
  fill(ctx, dark ? "#4c5a5a" : "#7e705e", 48, -8, 14, 10);
  circle(ctx, "#e9c889", 61, -3, 5, 0.9);
  glow(ctx, 63, -3, 60, 40, P.warm3, 0.25);
  // Controls and a strip of film.
  for (let i = 0; i < 3; i++) circle(ctx, P.red2, -18 + i * 12, 14, 2, 0.7);
  line(ctx, "#1a1718", -42, 8, 6, 8, 2);
  for (let i = 0; i < 7; i++) fill(ctx, P.ink, -38 + i * 7, 6, 3, 3, 0.8);
  ctx.restore();
}

export function doorwaySilhouette(ctx, x, y, scale = 1, color = "#120d11") {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale, scale);
  ellipse(ctx, color, 0, -76, 10, 11);
  fill(ctx, color, -13, -66, 26, 54);
  fill(ctx, color, -10, -14, 8, 16);
  fill(ctx, color, 2, -14, 8, 16);
  ctx.restore();
}

export { drawPerson, screenSea as seaOnScreen, text, grain };
