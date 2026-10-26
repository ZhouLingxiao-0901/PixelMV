/* Sea scenes: the promise, the distance, and the morning after. */

import {
  W, H, P, fill, px, line, poly, ellipse, circle, ring, dither, bands,
  glow, dust, grain, vignette, alphaRect, text, sky, shore, sea, wetSand,
  cloudBank, sun, stars, starsReflection, redThread, ticket,
} from "../art.js";
import { drawPerson, drawHand, drawReachingHand, drawEmbrace } from "../characters.js";

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => v * v * (3 - 2 * v);

function gull(ctx, x, y, s = 1, alpha = 0.6) {
  line(ctx, "#3b3036", x, y, x + 4 * s, y - 2 * s, 1, alpha);
  line(ctx, "#3b3036", x + 4 * s, y - 2 * s, x + 8 * s, y, 1, alpha);
}

function footprints(ctx, x, y, count, dir = 1, alpha = 0.24) {
  for (let i = 0; i < count; i++) {
    const fx = x + i * 13 * dir;
    const fy = y + (i % 3) * 2;
    fill(ctx, "#4f4748", fx, fy, 4, 2, alpha);
    fill(ctx, "#4f4748", fx + 5, fy + 2, 3, 2, alpha * 0.8);
  }
}

export function shoreWalk(ctx, t, shot, local) {
  shore(ctx, t, {
    horizon: 214, sandY: 298, sunX: 474, sunY: 202, sunR: 17,
    pierX: 18, cloudY: 68, cloudAlpha: 0.68,
  });
  // A low bank of cloud catches the last warm light.
  cloudBank(ctx, t * 0.9, { y: 118, alpha: 0.24, color: P.pink2, speed: 1.2 });
  // Long shadows precede them across the wet sand.
  alphaRect(ctx, "#4b4147", 190, 300, 220, 2, 0.16);
  const p = clamp01(local / 2.8);
  const x = 178 + p * 58;
  const bob = Math.sin(t * 2.1) * 1;
  // A crab is 124 px wide at 2x, so the pair needs 184 px between their feet
  // for the two inner pincers to meet with the shells still clearly apart.
  // At the old 60 px she simply covered him and the shot read as one crab.
  const gap = 184;
  ellipse(ctx, "#463d42", x + 4, 316, 56, 5, 0.22);
  ellipse(ctx, "#463d42", x + gap + 4, 318, 50, 5, 0.2);
  drawPerson(ctx, "him", x, 318 + bob, {
    scale: 2, facing: "right", pose: "walk", phase: local * 1.15,
    expression: "smile", outfit: "winter", arm: "holdout", turn: 1,
  });
  drawPerson(ctx, "her", x + gap, 320 - bob, {
    scale: 2, facing: "right", pose: "walk", phase: local * 1.15 + 0.22,
    expression: "smile", outfit: "winter", arm: "holdback", turn: -1,
  });
  // Their footprints run back along the wet sand.
  footprints(ctx, x - 96, 324, 6, 1, 0.2);
  footprints(ctx, x + gap - 76, 326, 6, 1, 0.17);
  // Gulls, very small, keeping their distance.
  gull(ctx, 92 + Math.sin(t * 0.3) * 12, 88, 1.2, 0.45);
  gull(ctx, 118 + Math.sin(t * 0.3 + 0.4) * 12, 97, 0.9, 0.35);
  // A warm film glow over the whole memory.
  alphaRect(ctx, P.pink3, 0, 0, W, H, 0.035);
  dust(ctx, t, 120, 100, 420, 210, 14, P.pink3, 0.25);
  grain(ctx, t, 0.035);
  vignette(ctx, 0.36);
}

export function shoreWide(ctx, t, shot, local) {
  shore(ctx, t, {
    horizon: 208, sandY: 296, sunX: 456, sunY: 196, sunR: 15,
    pierX: 0, cloudY: 60, cloudAlpha: 0.62,
  });
  // A boat, a post, and a person — the scale of the sea does the rest.
  fill(ctx, "#2d2a32", 470, 198, 18, 2, 0.65);
  line(ctx, "#2d2a32", 478, 198, 478, 188, 1, 0.6);
  fill(ctx, P.cream2, 479, 188, 6, 4, 0.35);
  const x = 438 + Math.sin(local * 0.35) * 3;
  drawPerson(ctx, "her", x, 318, {
    scale: 1, view: "back", pose: "stand", phase: local * 0.4,
    outfit: "winter", alpha: 0.9,
  });
  fill(ctx, P.red3, x + 1, 224, 5, 2, 0.7);
  // Her shadow, long and thin.
  alphaRect(ctx, "#4b4146", x + 3, 320, 42, 2, 0.26);
  footprints(ctx, x - 110, 330, 9, 1, 0.18);
  // The wind moves the loose sand.
  for (let i = 0; i < 8; i++) {
    const sx = ((i * 97 + t * 24) % (W + 80)) - 40;
    fill(ctx, "#8d7d79", sx, 322 + (i % 4) * 3, 12 + (i % 3) * 8, 1, 0.12);
  }
  gull(ctx, 180 + Math.sin(t * 0.25) * 9, 76, 1, 0.4);
  gull(ctx, 208 + Math.sin(t * 0.25 + 0.5) * 9, 84, 0.8, 0.3);
  dust(ctx, t, 90, 80, 480, 230, 12, P.pink3, 0.22);
  grain(ctx, t, 0.035);
  vignette(ctx, 0.36);
}

export function bikeToSea(ctx, t, shot, local) {
  sky(ctx, t, { kind: "dusk" });
  cloudBank(ctx, t * 1.4, { y: 58, alpha: 0.62, speed: 1.8 });
  sun(ctx, 500, 196, 15, P.pink3, 0.9);
  // The sea lies beyond a low railing on the right.
  sea(ctx, t, 224, { pathX: 500, kind: "dusk", waves: 12 });
  fill(ctx, "#3b3034", 0, 224, W, 7);
  fill(ctx, "#5d4a42", 0, 224, W, 1, 0.45);
  for (let i = 0; i < 13; i++) {
    fill(ctx, "#2b262b", i * 54 - ((local * 34) % 54), 216, 2, 12);
    fill(ctx, "#4b3c38", i * 54 - ((local * 34) % 54), 216, 1, 9, 0.5);
  }
  line(ctx, "#2b262b", 0, 212, W, 212, 1, 0.5);
  // The road, scrolling under the wheels.
  fill(ctx, "#423a3d", 0, 286, W, 74);
  fill(ctx, "#5a4d4d", 0, 286, W, 3);
  fill(ctx, "#302b2e", 0, 322, W, 5, 0.55);
  for (let i = 0; i < 10; i++) {
    const x = ((i * 74 - local * 74) % (W + 74)) - 37;
    fill(ctx, "#7b6b63", x, 296, 30, 2, 0.38);
  }
  // Telephone poles, clicking past.
  for (let i = 0; i < 3; i++) {
    const x = ((i * 260 - local * 68) % (W + 260)) - 130;
    fill(ctx, "#3a3031", x, 110, 3, 112);
    fill(ctx, "#3a3031", x - 12, 122, 28, 2);
    fill(ctx, "#3a3031", x - 9, 132, 22, 2);
  }
  // The bicycle and its two passengers, moving through the frame.  A crab is
  // 62 px wide before scaling, so the pair rides a long frame: he grips the
  // handlebar at the front hub, she sits behind him and her pincer rests on
  // his shell.  Their feet sit just above the wheel tops, which keeps both
  // wheels and the frame visible instead of burying the bike in shell.
  const bx = 320 + Math.sin(local * 0.35) * 2;
  const road = 318;
  const wheelR = 32;
  const feetY = 292 + Math.sin(t * 3.1) * 1;
  const herX = bx - 58;
  const himX = bx + 58;
  // Shadow.
  ellipse(ctx, "#3d3438", bx, 350, 118, 6, 0.3);
  // Wheels behind the riders.
  for (const wx of [bx - 104, bx + 104]) {
    circle(ctx, "#191517", wx, road, wheelR);
    circle(ctx, "#342d2c", wx, road, wheelR - 3);
    ring(ctx, "#7d6a57", wx, road, wheelR - 6, 2, 0.65);
    ring(ctx, "#4d4239", wx, road, wheelR - 10, 1, 0.4);
    circle(ctx, "#1b1718", wx, road, 3);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + local * 2.4;
      line(ctx, "#8a7660", wx, road, wx + Math.cos(a) * (wheelR - 7), road + Math.sin(a) * (wheelR - 7), 1, 0.28);
    }
    fill(ctx, "#b89262", wx, road - wheelR + 5, 2, (wheelR - 5) * 2, 0.18);
  }
  // Frame: rear hub, her rack, the crank, his saddle, the front hub.
  const crankX = bx - 4;
  const crankY = road - 2;
  line(ctx, "#191517", bx - 104, road, herX, feetY + 2, 4);
  line(ctx, "#191517", herX, feetY + 2, crankX, crankY, 4);
  line(ctx, "#191517", crankX, crankY, himX, feetY + 2, 4);
  line(ctx, "#191517", himX, feetY + 2, bx + 104, road, 4);
  line(ctx, "#191517", bx - 104, road, crankX, crankY, 4);
  line(ctx, "#8e4a3e", bx - 104, road - 1, herX, feetY + 1, 2);
  line(ctx, "#8e4a3e", herX, feetY + 1, crankX, crankY - 1, 2);
  line(ctx, "#8e4a3e", crankX, crankY - 1, himX, feetY + 1, 2);
  line(ctx, "#8e4a3e", himX, feetY + 1, bx + 104, road - 1, 2);
  // Saddle under him; the rear rack carries her.
  fill(ctx, "#1a1517", himX - 13, feetY + 1, 26, 4);
  fill(ctx, "#1a1517", herX - 17, feetY + 1, 34, 3);
  fill(ctx, "#5a4536", herX - 15, feetY + 2, 30, 1, 0.5);
  // Chainring and the pedals turning.
  circle(ctx, "#191517", crankX, crankY, 10);
  circle(ctx, "#6b5a4a", crankX, crankY, 7);
  circle(ctx, "#1b1718", crankX, crankY, 3);
  for (let i = 0; i < 2; i++) {
    const a = local * 3.1 + i * Math.PI;
    line(ctx, "#191517", crankX, crankY, crankX + Math.cos(a) * 14, crankY + Math.sin(a) * 14, 3);
  }
  // Handlebar: a stem up from the front hub to the grip in his pincer.
  const gripX = himX + 38 * 1.42;
  const gripY = feetY - 28 * 1.42;
  line(ctx, "#191517", bx + 104, road, gripX + 3, gripY + 3, 4);
  fill(ctx, "#191517", gripX - 3, gripY - 2, 15, 4);
  fill(ctx, "#8e4a3e", gripX - 1, gripY - 1, 11, 2);
  // Her scarf, snapped straight back by the wind, tied to the top-left of her
  // shell (the crab is shorter than the old rig, so the knot sits lower).
  poly(ctx, P.red2, [[herX - 30, feetY - 76], [herX - 58, feetY - 82], [herX - 80, feetY - 70], [herX - 44, feetY - 64]]);
  fill(ctx, P.red3, herX - 54, feetY - 79, 14, 2, 0.7);
  // He is drawn first so her pincer can land on the near side of his shell.
  drawPerson(ctx, "him", himX, feetY, {
    scale: 1.42, facing: "right", pose: "sit", expression: "smile",
    outfit: "winter", arm: "grip",
  });
  drawPerson(ctx, "her", herX, feetY, {
    scale: 1.42, facing: "right", pose: "sit", expression: "smile",
    outfit: "winter", arm: "reach", turn: 1,
  });
  // A small warm dust trail.
  for (let i = 0; i < 7; i++) {
    const px0 = bx - 132 - i * 13;
    fill(ctx, "#c9a588", px0, 322 + (i % 3) * 3, 10, 1, 0.08);
  }
  dust(ctx, t, 100, 100, 480, 210, 12, P.pink3, 0.2);
  grain(ctx, t, 0.035);
  vignette(ctx, 0.36);
}

export function beachClouds(ctx, t, shot, local) {
  // A low-angle memory: almost all sky, two heads at the bottom of the frame.
  bands(ctx, 0, 0, W, 296, [
    [P.dusk2, 0.85], [P.pink1, 0.9], [P.pink2, 0.9], [P.pink3, 0.8], [P.cloud2, 0.5],
  ]);
  const drift = t * 1.4;
  for (let i = 0; i < 9; i++) {
    const x = ((i * 97 - drift + 60) % (W + 180)) - 90;
    const y = 40 + (i % 4) * 27;
    const s = 0.9 + (i % 3) * 0.35;
    cloudBank(ctx, 0, { y, alpha: 0.001, speed: 0 });
    // Soft hand-built cloud, kept low-contrast so it doesn't read as a sprite.
    ellipse(ctx, P.cloud1, x + 38 * s, y, 48 * s, 9 * s, 0.42);
    ellipse(ctx, P.cloud2, x + 22 * s, y - 4 * s, 30 * s, 8 * s, 0.3);
    ellipse(ctx, P.pink2, x + 63 * s, y + 3 * s, 28 * s, 7 * s, 0.2);
  }
  // One cloud is a little more solid, the one they are looking at.
  cloudBank(ctx, t * 0.5, { y: 112, alpha: 0.36, color: P.cloud1, speed: 1.1 });
  // Sun low on the right, no hard disc, just a warm widening.
  glow(ctx, 512, 216, 260, 180, P.pink3, 0.27);
  // The sea is only a thin blue line.
  fill(ctx, P.sea1, 0, 282, W, 14);
  fill(ctx, P.sea2, 0, 284, W, 2, 0.6);
  for (let i = 0; i < 8; i++) {
    fill(ctx, P.pink3, 40 + i * 72, 285 + (i % 3) * 2, 26, 1, 0.18);
  }
  // Sand, then two heads resting on it.  Both faces sit above the subtitle
  // safe line: chins land near y=278, the lyrics start at 307.
  fill(ctx, "#b18e80", 0, 294, W, 66);
  dither(ctx, "#967568", 0, 294, W, 66, 3, 1, 0.5);
  drawPerson(ctx, "him", 202, 322, {
    scale: 1.42, view: "front", pose: "stand", expression: "smile",
    outfit: "winter", arm: "hold", blink: local % 4.5 > 4.3 ? 1 : 0,
  });
  drawPerson(ctx, "her", 424, 324, {
    scale: 1.42, view: "front", pose: "stand", expression: "smile",
    outfit: "winter", arm: "up", blink: local % 4.1 > 3.95 ? 1 : 0,
  });
  // Sand closes over the shells: only the tops of them and one raised claw
  // stay above the beach.
  fill(ctx, "#b18e80", 0, 290, W, H - 290);
  dither(ctx, "#967568", 0, 290, W, H - 290, 3, 1, 0.5);
  fill(ctx, "#8f4039", 140, 292, 380, 10, 0.35);
  fill(ctx, "#c6a493", 0, 290, W, 1, 0.18);
  // A few grains and a gull.
  for (let i = 0; i < 18; i++) {
    px(ctx, i % 3 ? "#caa995" : P.cream2, (i * 61 + 12) % W, 306 + (i * 17) % 10, 0.4);
  }
  gull(ctx, 266 + Math.sin(t * 0.2) * 6, 70, 1, 0.22);
  gull(ctx, 290 + Math.sin(t * 0.2 + 0.4) * 6, 78, 0.8, 0.18);
  alphaRect(ctx, P.pink3, 0, 0, W, H, 0.04);
  grain(ctx, t, 0.03);
  vignette(ctx, 0.32);
}

export function busNight(ctx, t, shot, local) {
  fill(ctx, "#0b0c13", 0, 0, W, H);
  // The long window.
  fill(ctx, "#171a26", 44, 34, 552, 206);
  fill(ctx, "#05060a", 50, 40, 540, 194);
  ctx.save();
  ctx.beginPath();
  ctx.rect(50, 40, 540, 194);
  ctx.clip();
  // Night landscape, scrolling.
  bands(ctx, 50, 40, 540, 194, [
    [P.night0, 0.8], [P.night1, 0.9], [P.night2, 0.8],
  ]);
  stars(ctx, t, 50, 42, 540, 100, 24, 0.3);
  const scroll = (local * 52) % 900;
  for (let i = 0; i < 7; i++) {
    const x = 50 + ((i * 150 - scroll + 900) % 900) - 80;
    const bh = 22 + (i * 19) % 56;
    fill(ctx, "#0d1220", x, 190 - bh, 120, bh);
    fill(ctx, "#111728", x, 190 - bh, 120, 2, 0.4);
  }
  // Sodium lights and one red sign, smeared by the glass.
  for (let i = 0; i < 9; i++) {
    const x = 50 + ((i * 121 - scroll * 1.3 + 1100) % 1100) - 100;
    const y = 136 + (i % 4) * 18;
    fill(ctx, i % 5 === 0 ? P.red3 : P.gold2, x, y, 2, 2, 0.55);
    glow(ctx, x, y, 36, 20, i % 5 === 0 ? P.red2 : P.gold2, 0.08);
    fill(ctx, i % 5 === 0 ? P.red2 : P.gold1, x - 8, y + 3, 20, 2, 0.06);
  }
  // A low horizon and black sea.
  fill(ctx, "#070a11", 50, 204, 540, 30);
  fill(ctx, P.pink2, 70, 205, 500, 1, 0.12);
  // Interior reflection of the ceiling lights.
  poly(ctx, P.cream, [[110, 40], [170, 40], [120, 234], [94, 234]], 0.025);
  poly(ctx, P.cream, [[410, 40], [450, 40], [430, 234], [390, 234]], 0.018);
  ctx.restore();
  // Window frame.
  fill(ctx, "#0a0a10", 38, 28, 564, 12);
  fill(ctx, "#0a0a10", 38, 234, 564, 12);
  fill(ctx, "#0a0a10", 38, 40, 12, 194);
  fill(ctx, "#0a0a10", 588, 40, 12, 194);
  for (let i = 0; i < 4; i++) fill(ctx, "#0a0a10", 148 + i * 122, 40, 8, 194);
  // Interior: luggage rack and two overhead lamps.
  fill(ctx, "#111018", 0, 0, W, 28);
  fill(ctx, "#29232a", 70, 26, 500, 5);
  for (let i = 0; i < 3; i++) {
    fill(ctx, "#3d3030", 110 + i * 190, 12, 28, 5);
    fill(ctx, P.warm2, 120 + i * 190, 17, 8, 2, 0.45);
    glow(ctx, 124 + i * 190, 20, 70, 40, P.warm2, 0.08);
  }
  // Seat backs.
  fill(ctx, "#121016", 0, 246, W, 114);
  fill(ctx, "#211a20", 20, 246, 604, 10);
  for (let i = 0; i < 5; i++) {
    fill(ctx, "#1b161d", 22 + i * 120, 256, 92, 90);
    fill(ctx, "#2b2025", 26 + i * 120, 260, 84, 72);
    fill(ctx, "#3a2a2b", 26 + i * 120, 260, 84, 3, 0.4);
  }
  // The two of them, from behind, seen against the window.
  const vib = Math.sin(t * 17) > 0.9 ? 1 : 0;
  ctx.save();
  ctx.translate(0, vib);
  // His shoulder and head.
  poly(ctx, "#16121a", [[292, 334], [298, 268], [314, 242], [334, 236], [352, 246], [358, 276], [366, 334]]);
  ellipse(ctx, "#171219", 330, 238, 15, 17);
  fill(ctx, "#242029", 312, 284, 40, 48, 0.35);
  // Her head leaning toward him.
  poly(ctx, "#171219", [[354, 334], [356, 284], [368, 260], [390, 250], [408, 258], [414, 286], [424, 334]]);
  ellipse(ctx, "#1b151b", 389, 252, 14, 16);
  poly(ctx, "#2b2021", [[374, 244], [398, 242], [412, 252], [414, 272], [404, 284], [397, 272], [392, 286], [382, 280], [376, 262]]);
  // The point where her head rests against his shoulder.
  fill(ctx, "#1a141a", 346, 256, 20, 12);
  // Red scarf and a red ticket between her fingers.
  poly(ctx, P.red1, [[366, 286], [410, 280], [420, 294], [378, 300]]);
  fill(ctx, P.red2, 368, 285, 38, 3, 0.65);
  fill(ctx, P.red3, 398, 294, 8, 3, 0.6);
  fill(ctx, "#d9c6aa", 402, 298, 10, 6, 0.55);
  // Window ghost of their faces, very faint.
  ellipse(ctx, "#b88270", 334, 204, 13, 18, 0.07);
  ellipse(ctx, "#b88270", 388, 205, 12, 17, 0.06);
  ctx.restore();
  // A long diagonal reflection on the glass.
  poly(ctx, P.cream, [[74, 42], [104, 42], [56, 228], [40, 228]], 0.04);
  dust(ctx, t, 70, 50, 500, 200, 14, P.cream3, 0.22);
  grain(ctx, t, 0.045);
  vignette(ctx, 0.46);
}

export function beachNightMeteor(ctx, t, shot, local) {
  shore(ctx, t, {
    sky: "night", seaKind: "night", horizon: 212, sandY: 302,
    sun: false, clouds: false, pierX: 6, posts: true,
  });
  // More stars than the earlier nights.
  stars(ctx, t, 0, 0, W, 190, 46, 0.55);
  starsReflection(ctx, t, 220, 214, 240, 78, 20);
  // A red blanket spread under them.  It sits under the legs rather than over
  // the laps: at crab height a lap blanket lands on the mouth.
  poly(ctx, P.red1, [[222, 318], [458, 322], [466, 338], [214, 334]]);
  fill(ctx, P.red2, 226, 318, 222, 2, 0.55);
  for (let i = 0; i < 7; i++) fill(ctx, P.red2, 244 + i * 30, 326, 16, 1, 0.16);
  // Two crabs with room between them: he sits back on one claw, she points at
  // the sky where the meteor was.
  ellipse(ctx, "#463d42", 258, 330, 62, 5, 0.2);
  ellipse(ctx, "#463d42", 422, 332, 60, 5, 0.18);
  drawPerson(ctx, "him", 252, 326, {
    scale: 2, facing: "right", pose: "sit", expression: "soft",
    outfit: "winter", arm: "lean", blink: local % 4.9 > 4.8 ? 1 : 0, alpha: 0.95,
  });
  drawPerson(ctx, "her", 428, 328, {
    scale: 2, facing: "right", pose: "sit",
    expression: local > 0.3 ? "surprised" : "smile",
    mouth: local > 0.3 ? 0.6 : 0,
    outfit: "winter", arm: "up", turn: 1, alpha: 0.95,
  });
  // The lantern hangs from his resting pincer: he set it down on the blanket
  // and kept hold of the ring, which gives that arm something to do.
  const lx = 340;
  glow(ctx, lx, 330, 170, 76, P.warm2, 0.16);
  fill(ctx, "#1b1413", lx - 2, 314, 4, 9);
  fill(ctx, "#c78a4c", lx - 7, 322, 14, 12);
  fill(ctx, P.warm3, lx - 4, 325, 8, 7, 0.85);
  fill(ctx, "#f0d9a8", lx - 1, 326, 2, 4, 0.8);
  fill(ctx, "#1b1413", lx - 9, 334, 18, 4);
  ellipse(ctx, "#5f5145", lx, 341, 30, 3, 0.3);
  // The first meteor: quick, quiet, gone before they can point.
  const m = clamp01((local - 0.35) / 0.85);
  if (m > 0 && m < 1) {
    const mx = 476 - m * 210;
    const my = 30 + m * 82;
    line(ctx, P.cream, mx + 54, my - 20, mx, my, 2, 0.9);
    line(ctx, P.pink3, mx + 30, my - 11, mx + 3, my, 1, 0.55);
    fill(ctx, P.white, mx, my, 2, 2, 1);
    glow(ctx, mx, my, 54, 44, P.pink3, 0.18);
  }
  // A second, fainter one.
  if (local > 1.7) {
    const m2 = clamp01((local - 1.7) / 0.65);
    if (m2 < 1) {
      const mx = 180 - m2 * 70;
      const my = 56 + m2 * 24;
      line(ctx, P.pink2, mx + 22, my - 8, mx, my, 1, 0.45);
      fill(ctx, P.cream, mx, my, 1, 1, 0.7);
    }
  }
  dust(ctx, t, 80, 80, 480, 200, 16, P.cream3, 0.25);
  grain(ctx, t, 0.045);
  vignette(ctx, 0.43);
}

export function handsSand(ctx, t, shot, local) {
  // A one-second insert: skin, sand, salt water, and the almost-touch.
  // Night sand, with the sea only a cold band above it.
  fill(ctx, "#2b2529", 0, 0, W, H);
  bands(ctx, 0, 0, W, 90, [
    ["#3c3f4b", 1], ["#2d3039", 1], ["#231f26", 0.8],
  ]);
  fill(ctx, "#3f4b58", 0, 88, W, 3, 0.6);
  fill(ctx, "#71808b", 0, 90, W, 1, 0.4);
  bands(ctx, 0, 92, W, 268, [
    ["#4c3d3a", 1], ["#3a2f2f", 1], ["#241d20", 1],
  ]);
  dither(ctx, "#5a4842", 0, 92, W, 268, 3, 1, 0.3);
  for (let i = 0; i < 8; i++) {
    const yy = 106 + i * 33;
    fill(ctx, "#5e4a42", 0, yy + Math.sin(t * 0.6 + i) * 1, W, 1, 0.16);
  }
  for (let i = 0; i < 30; i++) {
    px(ctx, i % 4 ? "#7a6458" : "#9d8471", (i * 83 + 17) % W, 100 + (i * 47 + 9) % 250, 0.4);
  }
  // Both forearms come in from the edges and sink into the sand.
  poly(ctx, "#2b3343", [[0, 176], [184, 172], [184, 214], [0, 212]]);
  fill(ctx, "#465368", 0, 176, 184, 2, 0.35);
  fill(ctx, "#1c2230", 0, 208, 184, 8, 0.4);
  for (let i = 0; i < 3; i++) fill(ctx, "#3b4658", 46 + i * 48, 178, 1, 34, 0.3);
  poly(ctx, "#8d5a52", [[448, 176], [W, 180], [W, 216], [448, 218]]);
  fill(ctx, "#a86e60", 448, 176, W - 448, 2, 0.35);
  fill(ctx, "#663c3a", 448, 212, W - 448, 8, 0.4);
  for (let i = 0; i < 3; i++) fill(ctx, "#77453e", 480 + i * 46, 180, 1, 34, 0.3);
  // His claw from the left, hers from the right.  The pincer tips meet.
  drawReachingHand(ctx, 260, 192, 1, 2, {
    who: "him", outfit: "winter", sleeve: "#2b3343", sleeveHi: "#465368",
  });
  drawReachingHand(ctx, 372, 196, -1, 2, {
    who: "her", outfit: "winter", sleeve: "#8d5a52", sleeveHi: "#a86e60",
  });
  // Shadows in the sand under both wrists.
  ellipse(ctx, "#241d20", 256, 220, 44, 6, 0.45);
  ellipse(ctx, "#241d20", 392, 224, 44, 6, 0.45);
  // Red string bracelet on her wrist, where cuff meets claw.
  fill(ctx, P.ink, 394, 178, 8, 36);
  fill(ctx, P.red2, 396, 180, 5, 32, 0.95);
  fill(ctx, P.red3, 397, 180, 1, 32, 0.7);
  fill(ctx, P.red1, 400, 184, 1, 7, 0.8);
  // A glint where the two claws touch.
  fill(ctx, P.cream, 316, 191, 2, 1, 0.55);
  // A thin film of water runs over their hands.
  const wash = clamp01((local - 0.2) / 0.55);
  if (wash > 0) {
    alphaRect(ctx, "#9ab6b6", 0, 228 + wash * 20, W, 8, 0.14 * (1 - wash * 0.4));
    for (let i = 0; i < 9; i++) {
      fill(ctx, P.sea4, 40 + i * 72, 230 + wash * 18 + (i % 3) * 2, 24, 1, 0.3 * (1 - wash));
    }
  }
  // A single red grain, like a spark.
  fill(ctx, P.red3, 336, 204, 2, 2, 0.7);
  grain(ctx, t, 0.035);
  vignette(ctx, 0.4);
}

export function seaSad(ctx, t, shot, local) {
  // The same shore, later, with the warmth taken out of it.
  bands(ctx, 0, 0, W, 214, [
    [P.night1, 0.8], [P.dusk1, 0.85], [P.dusk2, 0.8], [P.pink0, 0.35],
  ]);
  cloudBank(ctx, t * 0.5, { y: 62, alpha: 0.45, color: "#7f6170", speed: 1.0 });
  sea(ctx, t, 214, { kind: "night", waves: 16 });
  wetSand(ctx, t, 300, { color: "#4f4a4d", reflectionX: 450 });
  // A low cold sun has gone; a pale line remains.
  fill(ctx, "#b87f7d", 0, 213, W, 1, 0.35);
  // She sits alone at the edge of the water.
  const x = 378;
  ellipse(ctx, "#3a343a", x + 26, 330, 62, 6, 0.35);
  drawPerson(ctx, "her", x, 332, {
    scale: 2, facing: "right", pose: "sit", expression: "sad",
    outfit: "winter", arm: "hold", blink: local % 4.7 > 4.55 ? 1 : 0,
  });
  // The red cardigan is the only saturated thing left.
  fill(ctx, "#8c3f39", x - 5, 244, 6, 24, 0.8);
  // Hair and wind.
  for (let i = 0; i < 4; i++) {
    line(ctx, "#2f2326", x + 10, 164, x + 24 + i * 3, 156 + i * 3, 1, 0.5);
  }
  // Waves reach for her shoes.
  for (let i = 0; i < 5; i++) {
    const wy = 304 + i * 5;
    fill(ctx, P.sea4, x - 60 + Math.sin(t * 1.2 + i) * 8, wy, 100 - i * 8, 1, 0.16);
  }
  // A red paper boat, very small, already leaving.
  const bx = 486 + Math.sin(t * 0.4) * 3;
  fill(ctx, P.red2, bx, 260, 12, 4);
  fill(ctx, P.red3, bx + 2, 257, 8, 4);
  fill(ctx, P.red1, bx, 264, 12, 1, 0.6);
  // A gull with nowhere to go.
  gull(ctx, 148, 92, 1.1, 0.28);
  alphaRect(ctx, P.night1, 0, 0, W, H, 0.12);
  grain(ctx, t, 0.045);
  vignette(ctx, 0.45);
}

export function dawnBeach(ctx, t, shot, local) {
  shore(ctx, t, {
    sky: "dawn", seaKind: "dusk", horizon: 216, sandY: 302,
    sunX: 510, sunY: 204, sunR: 12, pierX: 0, cloudY: 74, cloudAlpha: 0.48,
    posts: false,
  });
  // The sky still has one star.
  stars(ctx, t, 110, 24, 140, 70, 6, 0.22);
  // Two figures, far apart, both looking at the water.
  drawPerson(ctx, "her", 214, 320, {
    scale: 1, view: "back", pose: "stand", phase: local * 0.35,
    outfit: "winter", alpha: 0.92,
  });
  drawPerson(ctx, "him", 448, 320, {
    scale: 1, view: "back", pose: "stand", phase: local * 0.35 + 0.5,
    outfit: "winter", alpha: 0.92,
  });
  fill(ctx, P.red3, 216, 226, 5, 2, 0.75);
  // Their footprints come together, then separate.
  footprints(ctx, 190, 330, 8, 1, 0.16);
  footprints(ctx, 258, 330, 7, 1, 0.13);
  footprints(ctx, 406, 330, 6, 1, 0.13);
  // A red ticket on the sand, between the two of them and fully in frame.
  fill(ctx, "#3a3038", 290, 341, 54, 4, 0.16);
  ticket(ctx, 292, 316, 52, 25, { title: "影院", sub: "ADMIT ONE" });
  fill(ctx, "#8c6e5f", 292, 319, 52, 1, 0.1);
  // A weak sun, a long wake.
  glow(ctx, 510, 204, 220, 120, P.pink3, 0.15);
  gull(ctx, 330 + Math.sin(t * 0.25) * 8, 88, 1, 0.32);
  gull(ctx, 356 + Math.sin(t * 0.25 + 0.4) * 8, 96, 0.8, 0.24);
  // A little sea mist at the horizon.
  alphaRect(ctx, P.pink3, 0, 208, W, 10, 0.08);
  dust(ctx, t, 100, 110, 460, 200, 10, P.pink3, 0.18);
  grain(ctx, t, 0.035);
  vignette(ctx, 0.34);
}
