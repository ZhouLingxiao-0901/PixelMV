/* Cinema scenes: the public rooms of 影院 and the booth above them. */

import {
  W, H, P, fill, px, line, poly, ellipse, circle, ring, dither, bands, glow, dust,
  projectorBeam, projectorFlicker, flicker, grain, vignette, alphaRect, text,
  ticket, leader, paper,
} from "../art.js";
import { drawPerson, drawHand, drawReachingHand } from "../characters.js";
import {
  exterior, lobby, auditorium, booth, drawProjector, seat, screenSea,
  seatedBack, curtain, doorwaySilhouette, drawBicycle,
} from "./common.js";

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => v * v * (3 - 2 * v);

export function leaderFive(ctx, t, shot, local) {
  const count = Math.max(1, 5 - Math.floor(local / 0.44));
  leader(ctx, t, {
    num: String(count),
    label: "影院 · 放映室",
    r: 146,
  });
  // The gate is not quite steady; a vertical scratch runs through the leader.
  fill(ctx, "#b75c4c", 70 + ((t * 9) % 4), 0, 1, H, 0.14);
  fill(ctx, "#8b4038", 540 - ((t * 6) % 3), 0, 1, H, 0.1);
  fill(ctx, "#d3a17e", 0, 0, W, 3, 0.08 + Math.abs(Math.sin(t * 19)) * 0.08);
  fill(ctx, "#d3a17e", 0, H - 3, W, 3, 0.05);
  // Splice marks.
  fill(ctx, P.ink, 0, 88, W, 2, 0.9);
  fill(ctx, P.ink, 0, 90, W, 1, 0.35);
  text(ctx, "35MM  /  1.85:1", 24, 26, {
    size: 7, color: "#8f6655", shadow: false, threshold: 55, alpha: 0.6,
  });
  text(ctx, "REEL 02", W - 24, 26, {
    size: 7, color: "#8f6655", shadow: false, threshold: 55, align: "right", alpha: 0.6,
  });
  if (Math.sin(t * 7.2) > 0.97) fill(ctx, "#d9b18c", 0, 0, W, H, 0.05);
}

export function leaderTitle(ctx, t, shot, local) {
  fill(ctx, P.black, 0, 0, W, H);
  // A dark red frame and a pool of projector light behind the title.
  fill(ctx, "#140c10", 28, 20, W - 56, H - 40);
  fill(ctx, P.ink, 28, 20, W - 56, 1, 0.8);
  fill(ctx, "#412027", 28, 20, W - 56, 2, 0.45);
  glow(ctx, 320, 162, 470, 260, P.red1, 0.17);
  glow(ctx, 320, 162, 240, 160, P.red3, 0.08);
  // Sparse dust in the gate.
  dust(ctx, t, 60, 40, 520, 270, 24, P.warm3, 0.6);
  // Title and subtitle.
  const rise = (1 - ease(clamp01(local / 0.85))) * 7;
  text(ctx, "红", W / 2, 98 + rise, {
    size: 98, color: P.red3, align: "center", bold: true, shadow: true,
    shadowColor: "#2a0e12", threshold: 72, alpha: 0.94,
  });
  dither(ctx, "#8c2d32", 252, 112 + rise, 136, 50, 3, 0, 0.16);
  fill(ctx, P.red2, 232, 214, 176, 1, 0.55);
  fill(ctx, P.gold1, 232, 214, 46, 1, 0.5);
  text(ctx, "A  PIXEL  MUSIC  FILM", W / 2, 226, {
    size: 8, color: P.cream2, align: "center", shadow: false, letterSpacing: 4,
    threshold: 60, alpha: clamp01((local - 0.4) / 0.7) * 0.75,
  });
  text(ctx, "罗 言", W / 2, 250, {
    size: 12, color: P.cream, align: "center", letterSpacing: 6, threshold: 65,
    shadow: true, shadowColor: P.black, alpha: clamp01((local - 0.9) / 0.8),
  });
  text(ctx, "影院  ·  最后一场", W / 2, 304, {
    size: 8, color: "#b18d7e", align: "center", shadow: false, letterSpacing: 3,
    threshold: 58, alpha: clamp01((local - 1.3) / 0.9) * 0.7,
  });
  // Old print texture.
  fill(ctx, "#c18c72", 74, 0, 1, H, 0.06);
  fill(ctx, "#c18c72", 566, 0, 1, H, 0.05);
  for (let i = 0; i < 4; i++) {
    fill(ctx, "#e0b18e", 0, 60 + i * 70 + ((t * 7) % 20), W, 1, 0.02);
  }
  grain(ctx, t, 0.07);
  vignette(ctx, 0.52);
}

export function cinemaNeonWide(ctx, t, shot, local) {
  exterior(ctx, t, { night: false });
  // The last of the sun catches the wet street and the bicycle.
  glow(ctx, 492, 188, 240, 130, P.pink3, 0.14);
  // A few people pass the end of the street, far away.
  const pass = ((local * 14) % 760) - 60;
  drawPerson(ctx, "him", pass, 318, {
    scale: 0.75, facing: "right", pose: "walk", phase: local * 0.8,
    outfit: "city", alpha: 0.45, silhouette: true,
  });
  drawPerson(ctx, "her", pass + 18, 319, {
    scale: 0.7, facing: "right", pose: "walk", phase: local * 0.8 + 0.3,
    outfit: "city", alpha: 0.38, silhouette: true,
  });
  // Warm doorway; someone is already inside.
  glow(ctx, 322, 250, 160, 145, P.warm2, 0.11 * flicker(t, 2));
  const doorGlow = 0.1 + Math.abs(Math.sin(t * 1.7)) * 0.035;
  alphaRect(ctx, P.warm3, 286, 184, 72, 132, doorGlow);
  // Cinema dust and a slightly unsteady neon sign.
  alphaRect(ctx, P.red3, 96, 110, 48, 118, 0.04 * flicker(t, 6));
  grain(ctx, t, 0.035);
  vignette(ctx, 0.36);
}

export function lobbyDoor(ctx, t, shot, local) {
  lobby(ctx, t);
  // She comes out of the auditorium carrying an empty reel.  The red curtain
  // is the only warm shape in the room until she crosses it.
  const p = ease(clamp01(local / 1.7));
  const x = 252 + p * 150;
  const walk = local < 1.7;
  // 1.6x keeps her inside the lobby doorway (96 px wide); at 2x she was wider
  // than the door she steps out of.  The reel and hand ride the same scale.
  const S = 1.6;
  drawPerson(ctx, "her", x, 330, {
    scale: S, facing: "right", pose: walk ? "walk" : "stand",
    phase: local * 1.2, expression: "soft", outfit: "cinema",
    arm: "hold", alpha: 0.98,
  });
  // A 35 mm reel, carried in her near pincer.
  const rx = x + 42 * S;
  const ry = 330 - 35 * S;
  circle(ctx, "#191619", rx, ry, 6 * S);
  circle(ctx, "#4a4038", rx, ry, 4.5 * S);
  ring(ctx, "#8f785f", rx, ry, 3 * S, 2, 0.8);
  circle(ctx, "#1a1719", rx, ry, 2);
  drawHand(ctx, x + 46 * S, 330 - 32 * S, "her", S, { outfit: "cinema" });
  glow(ctx, rx, ry, 60, 60, P.warm2, 0.07);
  // Projected light from the curtain doorway falls on the floor.
  alphaRect(ctx, P.warm2, 282, 288, 122, 26, 0.05);
  dust(ctx, t, 200, 80, 280, 230, 12, P.warm3, 0.4);
  grain(ctx, t, 0.03);
  vignette(ctx, 0.34);
}

export function auditoriumEmpty(ctx, t, shot, local) {
  auditorium(ctx, t, { occupied: "none", rows: 5 });
  // She walks down the aisle, checks the empty seats, then stops.
  const p = clamp01(local / 2.0);
  const y = 286 + ease(p) * 16;
  drawPerson(ctx, "her", 320, y, {
    scale: 1.65, view: "back", pose: "walk", phase: local * 1.4,
    outfit: "cinema", alpha: 0.9,
  });
  // Her ribbon sits on the shell's far side, so the back view still reads as
  // her without a face.
  // The screen is the only real source; the room is almost empty.
  alphaRect(ctx, P.ink, 0, 0, W, H, 0.1);
  dust(ctx, t, 110, 50, 420, 200, 18, P.pink3, 0.4);
  grain(ctx, t, 0.04);
  vignette(ctx, 0.42);
}

export function herEyes(ctx, t, shot, local) {
  // Close-up, built from the same rig as the wide shots.
  fill(ctx, "#0b090d", 0, 0, W, H);
  // Out-of-focus booth: a hot window, reels, and a red safe light.
  bands(ctx, 0, 0, W, H, [
    ["#151017", 0.9], ["#24151a", 0.7], ["#0d0a0e", 1.1],
  ]);
  ctx.save();
  ctx.globalAlpha = 0.75;
  fill(ctx, "#2a1a1e", 388, 22, 252, 180);
  bands(ctx, 398, 32, 232, 160, [
    [P.dusk1, 0.9], [P.dusk2, 0.8], [P.pink2, 0.9], [P.pink3, 0.7],
  ]);
  glow(ctx, 520, 100, 220, 160, P.pink3, 0.2);
  for (let i = 0; i < 9; i++) {
    fill(ctx, P.dusk0, 398, 100 + i * 10, 232, 2, 0.3);
  }
  for (let i = 0; i < 4; i++) {
    ellipse(ctx, "#3b1b20", 424 + i * 58, 190, 30, 12, 0.6);
  }
  ctx.restore();
  // Blurred foreground reel.
  circle(ctx, "#100d11", 48, 40, 54);
  ring(ctx, "#4a3630", 48, 40, 38, 4, 0.4);
  ring(ctx, "#2b201f", 48, 40, 20, 3, 0.4);
  // The window frame catches a pale edge.
  fill(ctx, "#d8a887", 386, 20, 2, 188, 0.22);
  fill(ctx, "#d8a887", 384, 204, 256, 2, 0.14);

  const blink = local > 1.62 && local < 1.78 ? 1 : 0;
  // Wistful rather than blank: the lid is a row lower and the mouth is a
  // small smile, so the first line lands on a look rather than on a mask.
  drawPerson(ctx, "her", 330, 550, {
    scale: 5, view: "front", pose: "stand", expression: "wistful",
    outfit: "cinema", blink, mouth: 0, alpha: 1, turn: 1, gaze: 1,
  });
  // Warm rim along the lit edge of her shell, over the projection window.
  fill(ctx, P.warm3, 481, 44, 2, 200, 0.09);
  fill(ctx, P.pink3, 468, 84, 2, 80, 0.08);
  // Reflections of the screen in her eyes: two tiny, warm rectangles.
  // The shell has turned toward the window, so the highlights travel with it.
  fill(ctx, P.pink3, 267, 150, 4, 2, 0.45);
  fill(ctx, P.pink3, 387, 150, 4, 2, 0.38);
  fill(ctx, P.cream, 268, 150, 2, 1, 0.8);
  fill(ctx, P.cream, 388, 150, 2, 1, 0.72);
  // Film dust between the lens and her face.
  dust(ctx, t, 140, 40, 380, 250, 26, P.warm3, 0.5);
  fill(ctx, "#d9a98c", 0, 0, 2, H, 0.13);
  grain(ctx, t, 0.045);
  vignette(ctx, 0.46);
}

export function boothTears(ctx, t, shot, local) {
  booth(ctx, t, { window: "screen" });
  // No stool: the editing bench itself hides her legs, and a crab shell is
  // too wide to read as sitting on a small seat at this scale.
  // She sits with her back half to the window, letting the tears come.
  const wipe = 1.7 < local && local < 2.0;
  drawPerson(ctx, "her", 462, 350, {
    scale: 3, facing: "left", pose: "sit", expression: "tears",
    outfit: "cinema", arm: wipe ? "wipe" : "hold", blink: local % 3.1 > 2.9 ? 1 : 0,
  });
  // A dark apron of foreground; the projector continues, indifferent.
  fill(ctx, "#0d0a0c", 0, 332, W, 28);
  // Escaping steam from a cup.
  fill(ctx, "#c7b49a", 592, 252, 12, 8);
  fill(ctx, "#5b3f33", 593, 258, 10, 8);
  for (let i = 0; i < 4; i++) {
    const sx = 597 + Math.sin(t * 1.4 + i) * 4;
    fill(ctx, P.cream3, sx, 246 - i * 6, 1, 4, 0.12);
  }
  dust(ctx, t, 280, 40, 310, 230, 16, P.warm3, 0.3);
  grain(ctx, t, 0.04);
  vignette(ctx, 0.38);
}

export function ticketHands(ctx, t, shot, local) {
  // Shallow-focus lobby counter, reduced to warm shapes.
  fill(ctx, "#191015", 0, 0, W, H);
  bands(ctx, 0, 0, W, 250, [
    ["#24151a", 1], ["#3d2022", 1], ["#1b1015", 0.6],
  ]);
  for (let i = 0; i < 7; i++) {
    ellipse(ctx, i % 2 ? "#6f3b32" : "#8c4c3a", 40 + i * 96, 52 + (i % 3) * 30, 38, 20, 0.12);
  }

  // The one-sheet they are about to see, blurred by the shallow focus: the
  // same pink sea that will fill the second act.
  fill(ctx, "#1c1114", 38, 24, 144, 136);
  fill(ctx, "#48252a", 42, 28, 136, 128);
  bands(ctx, 46, 32, 128, 70, [
    ["#e7a58f", 1], ["#d98980", 1], ["#bd7274", 0.8], ["#955a66", 0.6],
  ]);
  fill(ctx, "#42455c", 46, 86, 128, 30, 0.7);
  fill(ctx, "#5d5a72", 46, 86, 128, 2, 0.45);
  circle(ctx, "#f6d8bb", 118, 72, 8, 0.85);
  // Two figures on the sand, no more than warm smudges.
  fill(ctx, "#2a1a22", 66, 100, 7, 11, 0.65);
  fill(ctx, "#2a1a22", 78, 102, 6, 9, 0.6);
  fill(ctx, "#2a1a22", 66, 111, 7, 2, 0.4);
  dither(ctx, "#f3c4ae", 46, 32, 128, 84, 3, 0, 0.12);
  fill(ctx, "#f3c4ae", 38, 24, 144, 136, 0.05);
  fill(ctx, "#a97a63", 48, 156, 124, 4, 0.14);

  // Ticket booth window.  The seller is only a shape behind the glass.
  fill(ctx, "#2f1a1b", 392, 44, 190, 116);
  fill(ctx, "#7d4a37", 400, 52, 174, 100, 0.5);
  glow(ctx, 486, 104, 140, 100, P.warm2, 0.16);
  ellipse(ctx, "#2b1919", 522, 132, 24, 20, 0.5);
  circle(ctx, "#2b1919", 522, 104, 11, 0.5);
  fill(ctx, "#5e3a2c", 478, 46, 3, 112, 0.5);
  fill(ctx, "#c9a37e", 400, 146, 174, 3, 0.18);
  text(ctx, "售 票", 410, 58, {
    size: 7, color: "#e0b894", shadow: false, threshold: 60, alpha: 0.34, letterSpacing: 2,
  });

  // Counter.
  fill(ctx, "#0c090b", 0, 250, W, 110);
  fill(ctx, "#3a241f", 0, 252, W, 70);
  fill(ctx, "#6d4936", 0, 252, W, 3);
  fill(ctx, "#4e3429", 0, 286, W, 1, 0.5);
  dither(ctx, "#291a18", 0, 256, W, 64, 3, 1, 0.2);
  // A little pile of torn stubs on the counter, caught by the warm light.
  for (let i = 0; i < 4; i++) {
    const sx = 482 - i * 3;
    const sy = 300 - i * 5;
    fill(ctx, "#2a1418", sx, sy, 34, 7, 0.9);
    fill(ctx, i % 2 ? "#7e3336" : "#963f3e", sx + 1, sy + 1, 31, 5, 0.7);
    fill(ctx, "#c46a5d", sx + 2, sy + 1, 12, 1, 0.35);
  }

  const reach = ease(clamp01(local / 1.7));
  const herReach = ease(clamp01((local - 0.35) / 1.9));
  // He has been at the counter a moment; she is still arriving.
  const hisX = 440 - reach * 30;
  const herX = 182 + herReach * 20;
  const tx = 258 - reach * 12;
  const yHer = 238;
  const yHis = 240;
  const herJoin = herX - 58;
  const hisJoin = hisX + 58;

  // Forearms come in from both edges of the frame, narrowing with distance.
  poly(ctx, "#9c4f45", [
    [0, yHer - 9], [herJoin * 0.5, yHer - 12], [herJoin, yHer - 17],
    [herJoin, yHer + 17], [herJoin * 0.5, yHer + 13], [0, yHer + 9],
  ]);
  poly(ctx, "#bd6a5a", [
    [0, yHer - 9], [herJoin * 0.5, yHer - 12], [herJoin, yHer - 17],
    [herJoin, yHer - 14], [herJoin * 0.5, yHer - 9], [0, yHer - 7],
  ], 0.6);
  poly(ctx, "#6d3531", [
    [0, yHer + 3], [herJoin * 0.5, yHer + 7], [herJoin, yHer + 10],
    [herJoin, yHer + 17], [herJoin * 0.5, yHer + 13], [0, yHer + 9],
  ], 0.45);
  for (let i = 0; i < 4; i++) {
    const fx = 22 + i * 28;
    const ft = yHer - 8 - (fx / herJoin) * 5;
    fill(ctx, "#7c3d38", fx, ft, 1, 12 + (fx / herJoin) * 10, 0.32);
  }
  poly(ctx, "#2b3343", [
    [hisJoin, yHis - 17], [hisJoin + (W - hisJoin) * 0.5, yHis - 12],
    [W, yHis - 9], [W, yHis + 9], [hisJoin + (W - hisJoin) * 0.5, yHis + 13],
    [hisJoin, yHis + 17],
  ]);
  poly(ctx, "#465368", [
    [hisJoin, yHis - 17], [hisJoin + (W - hisJoin) * 0.5, yHis - 12],
    [W, yHis - 9], [W, yHis - 7], [hisJoin + (W - hisJoin) * 0.5, yHis - 9],
    [hisJoin, yHis - 14],
  ], 0.55);
  poly(ctx, "#1c2230", [
    [hisJoin, yHis + 10], [hisJoin + (W - hisJoin) * 0.5, yHis + 7],
    [W, yHis + 3], [W, yHis + 9], [hisJoin + (W - hisJoin) * 0.5, yHis + 13],
    [hisJoin, yHis + 17],
  ], 0.5);
  for (let i = 0; i < 4; i++) {
    const fx = 500 + i * 28;
    const ft = yHis - 7 - ((fx - hisJoin) / (W - hisJoin)) * 3;
    fill(ctx, "#3b4658", fx, ft, 1, 20 - ((fx - hisJoin) / (W - hisJoin)) * 10, 0.3);
  }

  // The ticket, pushed across the counter before either of them speaks.
  ticket(ctx, tx, 202, 120, 50, {
    title: "影院", sub: "ADMIT ONE", titleSize: 14, subSize: 6,
  });
  dither(ctx, "#ef9b83", tx, 202, 120, 3, 3, 0, 0.26);
  fill(ctx, "#5e2228", tx, 248, 120, 4, 0.45);

  // Her hand and his hand, fingers just touching the two short edges.  The
  // ticket is the only thing they share.
  drawReachingHand(ctx, herX, yHer, 1, 1.6, {
    who: "her", outfit: "cinema", sleeve: "#9c4f45", sleeveHi: "#bd6a5a",
  });
  drawReachingHand(ctx, hisX, yHis, -1, 1.6, {
    who: "him", outfit: "winter", sleeve: "#2b3343", sleeveHi: "#465368",
  });
  // The counter lip sits in front of the hands: they rest on it.
  fill(ctx, "#6d4936", 0, 252, W, 3);
  fill(ctx, "#a9776a", 0, 252, W, 1, 0.35);
  glow(ctx, 320, 232, 180, 84, P.red3, 0.1);
  glow(ctx, 320, 236, 60, 30, P.warm2, 0.06 + Math.sin(local * 2.2) * 0.015);
  dust(ctx, t, 180, 150, 300, 130, 12, P.warm3, 0.3);
  grain(ctx, t, 0.035);
  vignette(ctx, 0.46);
}

export function auditoriumAlone(ctx, t, shot, local) {
  auditorium(ctx, t, { occupied: "none", rows: 5 });
  // The row is closer now: two seats in the foreground, one man, one scarf.
  // His seat, then the empty one beside it.
  seat(ctx, 210, 236, 120, 64, { dark: "#3a141b", mid: "#6b262c", hi: "#a74843" });
  seat(ctx, 342, 236, 120, 64, { dark: "#3a141b", mid: "#6b262c", hi: "#a74843" });
  // Him, backlit by the film; from behind he is only a shell and a rim.
  drawPerson(ctx, "him", 276, 312, {
    scale: 1.6, view: "back", pose: "sit", silhouette: true,
    silhouetteColor: "#1a1218", alpha: 0.95,
  });
  // The screen rim picks out the lit edge of his shell.
  fill(ctx, P.pink3, 226, 228, 2, 44, 0.22);
  fill(ctx, P.pink3, 230, 222, 36, 1, 0.16);
  fill(ctx, P.pink3, 324, 238, 2, 30, 0.1);
  // Her scarf keeps the seat next to him.
  poly(ctx, P.red2, [[372, 276], [404, 274], [412, 284], [400, 290], [382, 286], [370, 282]]);
  fill(ctx, P.red3, 374, 275, 30, 2, 0.75);
  fill(ctx, P.red1, 386, 282, 20, 3, 0.5);
  // One loose end hangs over the armrest.
  poly(ctx, P.red2, [[406, 282], [413, 287], [411, 302], [404, 297]]);
  fill(ctx, P.red4, 407, 286, 2, 12, 0.7);
  // The light on the empty seat is brighter than on him.
  fill(ctx, P.pink3, 378, 278, 24, 1, 0.16);
  fill(ctx, P.pink3, 402, 286, 1, 10, 0.12);
  // A thin line of light on the floor from the exit.
  alphaRect(ctx, P.warm2, 596, 250, 26, 70, 0.05);
  // Screen dims by the end of the line.
  const dim = 0.08 + clamp01(local / 3.2) * 0.14;
  alphaRect(ctx, P.ink, 0, 0, W, H, dim);
  dust(ctx, t, 100, 40, 430, 210, 20, P.pink3, 0.4);
  grain(ctx, t, 0.045);
  vignette(ctx, 0.44);
}

export function lobbyPostcard(ctx, t, shot, local) {
  // A closer lobby: the counter, a hanging lamp, and the poster wall behind.
  fill(ctx, "#120d11", 0, 0, W, H);
  fill(ctx, "#382321", 0, 0, W, 300);
  fill(ctx, "#241619", 0, 0, W, 62);
  dither(ctx, "#2a1a1b", 0, 0, W, 300, 3, 0, 0.2);
  // Out-of-focus posters.
  for (const [x, y, w, h, col] of [[46, 58, 112, 144, "#b76858"], [528, 40, 82, 110, "#657c83"]]) {
    fill(ctx, "#1a1013", x - 4, y - 4, w + 8, h + 8);
    fill(ctx, "#5b3a32", x, y, w, h);
    fill(ctx, col, x + 5, y + 5, w - 10, h - 10, 0.55);
    dither(ctx, "#2c1c1d", x, y, w, h, 3, 0, 0.3);
  }
  // Hanging lamp, pulled over the counter so the light lands on her and the
  // card instead of hanging in the empty half of the room.
  fill(ctx, "#221619", 418, 0, 3, 40);
  fill(ctx, "#6b4a33", 402, 40, 36, 3);
  fill(ctx, "#c39460", 402, 43, 36, 4);
  glow(ctx, 420, 47, 300, 210, P.warm2, 0.2);
  // She sits behind the counter, drawing a postcard.  Drawn before the wood
  // so the counter hides the bottom of her shell and her little legs.
  drawPerson(ctx, "her", 466, 308, {
    scale: 2.2, facing: "left", pose: "sit", expression: "smile",
    outfit: "cinema", arm: "write", blink: local % 4.3 > 4.15 ? 1 : 0,
  });
  // Counter foreground.
  fill(ctx, "#0d0a0c", 0, 286, W, 74);
  fill(ctx, "#4a3024", 0, 288, W, 58);
  fill(ctx, "#8b6147", 0, 288, W, 3);
  fill(ctx, "#6b4834", 0, 322, W, 1, 0.45);
  // A paler patch of wood under the paper and her claw, warmed by the lamp.
  fill(ctx, "#4a3024", 398, 300, 190, 22);
  fill(ctx, "#8b6147", 398, 300, 190, 2);
  glow(ctx, 380, 292, 300, 90, P.warm2, 0.14);
  // Postcard, drawn in her own hand: a pink sea and two figures.
  const cardX = 296; const cardY = 252;
  paper(ctx, cardX, cardY, 116, 54, "#f2e0c5", "#cbb59b");
  bands(ctx, cardX + 5, cardY + 5, 106, 24, [
    [P.dusk2, 1], [P.pink2, 1], [P.pink3, 1],
  ]);
  fill(ctx, P.sea1, cardX + 5, cardY + 29, 106, 20);
  for (let i = 0; i < 4; i++) {
    fill(ctx, P.pink3, cardX + 8, cardY + 32 + i * 4, 98, 1, 0.25);
  }
  circle(ctx, P.pink3, cardX + 82, cardY + 22, 5);
  // Two tiny figures on the beach.
  fill(ctx, "#4b3033", cardX + 42, cardY + 34, 2, 8);
  fill(ctx, "#4b3033", cardX + 57, cardY + 35, 2, 8);
  fill(ctx, "#4b3033", cardX + 39, cardY + 33, 7, 2);
  fill(ctx, "#4b3033", cardX + 55, cardY + 33, 7, 2);
  text(ctx, "海", cardX + 7, cardY + 38, {
    size: 9, color: "#74443b", shadow: false, threshold: 58, alpha: 0.8,
  });
  // A stamp: a tiny red rectangle with a sun.
  fill(ctx, "#d8c2a4", cardX + 92, cardY + 8, 17, 20);
  fill(ctx, P.red2, cardX + 94, cardY + 10, 13, 16);
  circle(ctx, P.pink3, cardX + 100, cardY + 17, 4);
  // The pen is in her claw, its tip on the paper, not floating above it.
  line(ctx, "#1a1214", 380, 258, 362, 274, 3);
  fill(ctx, P.red3, 376, 254, 6, 3);
  fill(ctx, "#1a1214", 364, 273, 3, 3);
  // Her claw, redrawn over the paper so the pen really is held.
  drawHand(ctx, 376, 254, "her", 2.2, { outfit: "cinema" });
  fill(ctx, "#d8c2a2", 534, 270, 18, 16);
  fill(ctx, "#8b5a42", 538, 270, 10, 3);
  // The hanging lamp catches her hair and the paper.
  glow(ctx, cardX + 55, cardY + 20, 170, 100, P.pink3, 0.07);
  dust(ctx, t, 220, 80, 300, 200, 16, P.warm3, 0.35);
  grain(ctx, t, 0.035);
  vignette(ctx, 0.4);
}

export function roofMeteor(ctx, t, shot, local) {
  // Night sky over the cinema roof.
  bands(ctx, 0, 0, W, 260, [
    [P.night0, 1], [P.night1, 0.95], [P.night2, 0.8], [P.dusk1, 0.55],
  ]);
  // Stars, a pale band of cloud, and the sea beyond the town.
  for (let i = 0; i < 58; i++) {
    const x = (i * 137 + 23) % W;
    const y = 12 + ((i * 61) % 160);
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.8 + i));
    fill(ctx, i % 11 === 0 ? P.pink2 : P.cream, x, y, i % 17 === 0 ? 2 : 1, 1, 0.5 * tw);
  }
  for (let i = 0; i < 4; i++) {
    ellipse(ctx, "#3c3b51", 90 + i * 160, 74 + (i % 2) * 18, 78, 10, 0.12);
  }
  fill(ctx, "#111726", 0, 212, W, 54);
  for (let i = 0; i < 13; i++) {
    const bh = 8 + (i * 17) % 30;
    fill(ctx, "#0c111c", i * 52, 212 - bh, 48, bh);
    if (i % 3 === 0) fill(ctx, P.gold2, i * 52 + 12, 212 - bh + 6, 2, 2, 0.4);
  }
  // The roof.
  fill(ctx, "#090a0d", 0, 254, W, 106);
  fill(ctx, "#25252b", 0, 254, W, 5);
  fill(ctx, "#17171c", 0, 259, W, 101);
  for (let i = 0; i < 8; i++) fill(ctx, "#303037", i * 84, 254, 38, 2, 0.35);
  // Water tank and vent pipes.
  fill(ctx, "#111116", 464, 170, 88, 84);
  fill(ctx, "#2b2b31", 468, 174, 80, 76);
  fill(ctx, "#1b1b21", 468, 174, 80, 6);
  for (let i = 0; i < 3; i++) fill(ctx, "#48464a", 476 + i * 24, 180, 2, 70, 0.4);
  fill(ctx, "#111116", 438, 236, 6, 22);
  fill(ctx, "#111116", 568, 236, 6, 22);
  fill(ctx, "#2b2b31", 510, 246, 24, 10);
  fill(ctx, "#15151a", 516, 238, 5, 12);
  // The cinema sign below the parapet, a red glow at the roof edge.
  fill(ctx, "#130d10", 30, 252, 116, 4);
  glow(ctx, 86, 256, 180, 80, P.red2, 0.14 * flicker(t, 5));
  text(ctx, "影院", 44, 258, {
    size: 16, color: P.red3, shadow: false, threshold: 60,
    alpha: 0.34 * flicker(t, 5), letterSpacing: 4,
  });
  // Two crabs on the ledge with a folded blanket between them.  He is the one
  // who catches the meteor; she turns to him when his claw goes up.
  fill(ctx, "#0a090d", 0, 314, W, 10, 0.7);
  poly(ctx, P.red1, [[301, 322], [350, 311], [355, 323], [299, 331]]);
  fill(ctx, P.red2, 305, 313, 42, 2, 0.8);
  fill(ctx, "#a74843", 309, 318, 34, 2, 0.3);
  ellipse(ctx, "#090a0d", 242, 330, 58, 4, 0.5);
  ellipse(ctx, "#090a0d", 408, 331, 58, 4, 0.5);
  drawPerson(ctx, "him", 236, 328, {
    scale: 2, facing: "right", pose: "sit",
    expression: local > 1.2 ? "surprised" : "soft",
    mouth: local > 1.2 ? 0.4 : 0,
    outfit: "winter", arm: "up", alpha: 0.96,
  });
  drawPerson(ctx, "her", 414, 328, {
    scale: 2, facing: "right", pose: "sit", expression: "smirk",
    outfit: "winter", arm: "hold", turn: -1, gaze: -1, alpha: 0.96,
  });
  // The meteor arrives late in the shot.
  const m = clamp01((local - 1.2) / 1.4);
  if (m > 0 && m < 1) {
    const mx = 470 - m * 250;
    const my = 44 + m * 92;
    line(ctx, P.cream, mx + 44, my - 16, mx, my, 2, 0.85);
    line(ctx, P.pink2, mx + 28, my - 10, mx + 4, my + 1, 1, 0.5);
    fill(ctx, P.cream, mx, my, 2, 2, 0.9);
    glow(ctx, mx, my, 40, 40, P.pink3, 0.16);
  }
  dust(ctx, t, 100, 60, 460, 200, 18, P.pink3, 0.35);
  grain(ctx, t, 0.04);
  vignette(ctx, 0.4);
}

export function argumentStart(ctx, t, shot, local) {
  lobby(ctx, t, { warm: 0.8 });
  // Cold street light cuts in from the doorway; the booth stays warm.
  poly(ctx, "#6e91a8", [[0, 0], [92, 0], [186, 360], [0, 360]], 0.05);
  // His bag is already by the door.
  fill(ctx, "#161116", 226, 294, 62, 38);
  fill(ctx, "#3c2b25", 229, 296, 56, 32);
  fill(ctx, "#6b4b39", 229, 296, 56, 3);
  line(ctx, "#171113", 238, 294, 246, 274, 2);
  fill(ctx, "#171113", 244, 272, 8, 5);
  // She steps in and reaches for him; he keeps his eyes on the door.
  const sway = Math.sin(local * 2.1) * 2;
  drawPerson(ctx, "him", 266, 334, {
    scale: 2, facing: "right", pose: "stand", expression: "sad",
    outfit: "city", arm: "down", gaze: 1, alpha: 1,
  });
  drawPerson(ctx, "her", 424 + sway, 334, {
    scale: 2, facing: "left", pose: "stand", expression: "hurt",
    outfit: "cinema", arm: "plead", gaze: -1, alpha: 1,
  });
  // The ticket on the counter between them.
  ticket(ctx, 336, 292, 44, 22, { title: "影院", sub: "7:10" });
  // Their shadows almost meet.
  alphaRect(ctx, P.ink, 280, 320, 92, 4, 0.4);
  // A small red exit lamp above the curtain.
  circle(ctx, P.red3, 342, 82, 3, 0.9);
  glow(ctx, 342, 82, 70, 60, P.red2, 0.14);
  text(ctx, "安全出口", 318, 90, {
    size: 6, color: P.red3, shadow: false, threshold: 55, alpha: 0.55,
  });
  dust(ctx, t, 240, 100, 300, 220, 10, P.warm3, 0.25);
  grain(ctx, t, 0.035);
  vignette(ctx, 0.4);
}

export function argumentClimax(ctx, t, shot, local) {
  lobby(ctx, t, { warm: 0.45 });
  // The street light is colder and the red sign flickers harder.
  poly(ctx, "#6a8499", [[0, 0], [116, 0], [220, 360], [0, 360]], 0.075);
  // Bag by the door, coat half on.
  fill(ctx, "#151015", 218, 288, 64, 44);
  fill(ctx, "#382722", 221, 291, 58, 38);
  fill(ctx, "#634536", 221, 291, 58, 3);
  line(ctx, "#151015", 230, 288, 240, 266, 2);
  // Camera is a little closer and a little less steady.
  // They close the distance as the argument runs; the frame itself shakes.
  const push = Math.min(1, local / 3.2);
  const shakeX = Math.sin(t * 31) > 0.15 ? 2 : -1;
  const shakeY = Math.cos(t * 27) > 0.4 ? 1 : 0;
  ctx.save();
  ctx.translate(shakeX, shakeY);
  drawPerson(ctx, "him", 258 + push * 10, 336, {
    scale: 2, facing: "right", pose: "stand", expression: "hurt",
    outfit: "city", arm: "point", alpha: 1,
  });
  drawPerson(ctx, "her", 424 - push * 8, 336, {
    scale: 2, facing: "left", pose: "stand", expression: "angry",
    outfit: "cinema", arm: "point", alpha: 1,
  });
  ctx.restore();
  // Paper on the counter; the ticket has been pushed aside.
  ticket(ctx, 560, 300, 42, 20, { title: "影院", sub: "ADMIT ONE" });
  // The exit sign bleeds red over the room.
  alphaRect(ctx, P.red2, 292, 74, 100, 26, 0.09);
  glow(ctx, 342, 84, 100, 80, P.red3, 0.2 * flicker(t, 3));
  // A chair knocked slightly out of line.
  seat(ctx, 332, 306, 28, 22, { dark: "#3c151c", mid: "#6b282d", hi: "#a74843" });
  dust(ctx, t, 240, 80, 300, 240, 12, P.red3, 0.2);
  // Hard flashes at the first shout and at "那就别回来了".
  if (local < 0.18) alphaRect(ctx, P.cream, 0, 0, W, H, 0.16 * (1 - local / 0.18));
  if (local > 3.82 && local < 4.06) {
    alphaRect(ctx, P.cream, 0, 0, W, H, 0.2 * (1 - (local - 3.82) / 0.24));
  }
  grain(ctx, t, 0.05);
  vignette(ctx, 0.44);
}

export function aftermathSeats(ctx, t, shot, local) {
  auditorium(ctx, t, { occupied: "none", rows: 5, dim: 0.24 });
  // The beam has stopped; only the screen's afterimage remains.
  alphaRect(ctx, P.ink, 0, 0, W, H, 0.18);
  // A scarf left over the back of a seat.
  poly(ctx, P.red1, [[368, 270], [394, 268], [400, 282], [392, 292], [376, 284], [364, 288]]);
  fill(ctx, P.red2, 370, 269, 22, 2, 0.7);
  fill(ctx, P.red3, 372, 270, 12, 1, 0.55);
  // A program on the next seat.
  fill(ctx, "#d8c5a8", 420, 282, 20, 16);
  fill(ctx, "#a98d70", 420, 282, 20, 2);
  // Exit light, dust, and the long empty rows.
  fill(ctx, P.red2, 610, 96, 3, 20, 0.3);
  glow(ctx, 611, 100, 56, 70, P.red2, 0.1);
  dust(ctx, t, 100, 50, 450, 240, 26, P.cream3, 0.35);
  grain(ctx, t, 0.05);
  vignette(ctx, 0.5);
}

export function aftermathPack(ctx, t, shot, local) {
  booth(ctx, t, { window: "night", dark: true });
  // The desk becomes a packing table: box, cables, reels, a microphone.
  fill(ctx, "#181113", 0, 222, W, 138);
  fill(ctx, "#2c1c1c", 0, 222, W, 3);
  dither(ctx, "#120d0e", 0, 224, W, 136, 3, 1, 0.3);
  // Box.
  fill(ctx, "#201716", 230, 210, 196, 106);
  fill(ctx, "#6f513d", 234, 214, 188, 98);
  fill(ctx, "#a67a54", 234, 214, 188, 5);
  fill(ctx, "#4b3429", 234, 258, 188, 2);
  fill(ctx, "#d9c7ad", 300, 232, 58, 18);
  text(ctx, "声 音", 306, 235, {
    size: 8, color: "#5d4030", shadow: false, threshold: 58,
  });
  // Reels, cable, mic.
  circle(ctx, "#151215", 296, 292, 25);
  circle(ctx, "#403a33", 296, 292, 21);
  ring(ctx, "#8c7257", 296, 292, 14, 2, 0.75);
  circle(ctx, "#171416", 296, 292, 5);
  line(ctx, "#141013", 390, 288, 432, 280, 2);
  line(ctx, "#3c3430", 390, 287, 432, 279, 1);
  fill(ctx, "#171416", 434, 270, 6, 18);
  fill(ctx, "#5a4a3b", 435, 272, 4, 14);
  fill(ctx, "#171416", 421, 298, 30, 4);
  // His hands: one holding the lid, one placing the ticket.
  drawHand(ctx, 470, 250, "him", 3, { outfit: "home" });
  drawHand(ctx, 230, 276, "him", 3, { outfit: "home" });
  ticket(ctx, 336, 276, 44, 22, { title: "影院", sub: "7:10" });
  // He hesitates, then puts it in the box.
  const lift = Math.sin(clamp01(local / 3.4) * Math.PI) * 4;
  fill(ctx, P.ink, 333, 274 - lift, 50, 26, 0.08);
  // A flat waveform on the monitor, and rainless city dark outside.
  line(ctx, "#7d5b49", 512, 184, 594, 184, 1, 0.35);
  for (let i = 0; i < 20; i++) {
    fill(ctx, "#7d5b49", 514 + i * 4, 184 - ((i % 3) === 0 ? 2 : 1), 1, 4, 0.25);
  }
  dust(ctx, t, 210, 180, 280, 120, 10, P.warm3, 0.25);
  grain(ctx, t, 0.04);
  vignette(ctx, 0.44);
}

export function aftermathBooth(ctx, t, shot, local) {
  booth(ctx, t, { window: "screen", dark: true });
  // She is threading the next reel.  The work continues.
  drawPerson(ctx, "her", 414, 330, {
    scale: 3, facing: "left", pose: "stand", expression: "soft",
    outfit: "cinema", arm: "reach", blink: local % 3.7 > 3.55 ? 1 : 0,
  });
  // Film strip from her pincer down to the take-up reel, clear of her shell.
  line(ctx, "#1b1516", 248, 208, 214, 232, 4);
  line(ctx, "#8b7460", 248, 208, 214, 232, 2);
  for (let i = 0; i < 8; i++) {
    fill(ctx, P.ink, 246 - i * 4, 206 + i * 3, 2, 2, 0.7);
  }
  // A cup and a folded newspaper on the desk.
  fill(ctx, "#c9b89d", 512, 282, 18, 12);
  fill(ctx, "#6b4e3a", 514, 284, 14, 2);
  fill(ctx, "#d6c4a8", 540, 286, 30, 14);
  fill(ctx, "#a28b70", 542, 290, 20, 1);
  fill(ctx, "#a28b70", 542, 294, 24, 1);
  // The only warm light is the screen.
  alphaRect(ctx, P.pink3, 60, 60, 240, 130, 0.03);
  dust(ctx, t, 300, 60, 260, 240, 16, P.pink3, 0.3);
  grain(ctx, t, 0.045);
  vignette(ctx, 0.44);
}

export function aftermathDoor(ctx, t, shot, local) {
  exterior(ctx, t, { night: true, open: local < 2.15 });
  // She steps out and turns the sign off.  The neon dies, then the street.
  const p = clamp01(local / 2.3);
  const x = 322 + p * 44;
  // In front of the whole facade she has to be a figure at the door, not half
  // the building: 1.45x is 59% of the doorway's height and fits its width.
  drawPerson(ctx, "her", x, 330, {
    scale: 1.45, facing: "right", pose: p < 0.6 ? "stand" : "walk",
    phase: local * 1.1, expression: "sad", outfit: "winter", arm: "down",
  });
  // The sign shuts off with a physical clunk.
  if (local > 2.1) {
    alphaRect(ctx, P.ink, 0, 0, W, H, 0.12 + clamp01((local - 2.1) / 1.7) * 0.2);
    const dying = clamp01((local - 2.1) / 0.7);
    alphaRect(ctx, P.red3, 92, 110, 44, 118, 0.12 * (1 - dying));
  }
  // The street empties.
  alphaRect(ctx, P.night0, 0, 300, W, 60, 0.12);
  grain(ctx, t, 0.05);
  vignette(ctx, 0.44);
}

export function screeningBooth(ctx, t, shot, local) {
  booth(ctx, t, { window: "screen", dark: true });
  // The projector lamps up; the booth goes from green-dark to warm.
  const on = clamp01((local - 0.55) / 0.4);
  if (on > 0) {
    glow(ctx, 380, 240, 300, 180, P.warm2, 0.13 * on);
    alphaRect(ctx, P.warm3, 56, 54, 248, 142, 0.025 * on);
  }
  drawPerson(ctx, "her", 402, 336, {
    scale: 3, facing: "left", pose: "stand", expression: on ? "soft" : "closed",
    outfit: "cinema", arm: "reach", blink: local % 4.1 > 3.95 ? 1 : 0,
  });
  fill(ctx, P.red3, 388, 84, 7, 3);
  // Hand on the switch.
  drawHand(ctx, 350, 268, "her", 2.2, { outfit: "cinema" });
  // A small "放映中" lamp.
  fill(ctx, "#271518", 520, 56, 56, 20);
  fill(ctx, "#3b2021", 523, 59, 50, 14);
  if (on) {
    circle(ctx, P.red3, 532, 66, 3);
    glow(ctx, 532, 66, 40, 40, P.red3, 0.22);
  }
  text(ctx, "放映中", 540, 60, {
    size: 6, color: on ? P.cream : "#6d5050", shadow: false, threshold: 55,
  });
  // The screen light reaches her face.
  alphaRect(ctx, P.pink3, 56, 54, 250, 150, 0.035 * on);
  dust(ctx, t, 280, 60, 280, 240, 18, P.pink3, 0.35);
  grain(ctx, t, 0.04);
  vignette(ctx, 0.4);
}

export function screeningGlance(ctx, t, shot, local) {
  fill(ctx, "#08070a", 0, 0, W, H);
  // The booth window is a bright rectangle in the dark room.
  const wx = 112; const wy = 46; const ww = 452; const wh = 246;
  fill(ctx, "#1b1216", wx - 10, wy - 10, ww + 20, wh + 20);
  ctx.save();
  ctx.beginPath();
  ctx.rect(wx, wy, ww, wh);
  ctx.clip();
  // Auditorium beyond the glass.
  fill(ctx, "#120d12", wx, wy, ww, wh);
  // The screen, cropped and bright.
  bands(ctx, wx + 6, wy + 12, 160, 150, [
    [P.dusk1, 1], [P.dusk2, 0.9], [P.pink2, 0.9], [P.pink3, 0.7],
  ]);
  glow(ctx, wx + 88, wy + 84, 160, 120, P.pink3, 0.28);
  fill(ctx, P.sea0, wx + 6, wy + 103, 160, 60);
  for (let i = 0; i < 8; i++) {
    fill(ctx, P.pink3, wx + 8, wy + 108 + i * 7, 154, 1, 0.18);
  }
  // Rows of seats, then him.
  for (let r = 0; r < 4; r++) {
    for (let i = 0; i < 6; i++) {
      const sx = wx + 170 + i * 48 - r * 7;
      const sy = wy + 104 + r * 27;
      if (sx > wx + ww - 40) break;
      seat(ctx, sx, sy, 30, 18, { dark: "#3b151c", mid: "#68262b", hi: "#9f413d" });
    }
  }
  drawPerson(ctx, "him", 386, 264, {
    scale: 1.3, view: "back", pose: "sit", silhouette: true,
    silhouetteColor: "#221a20", alpha: 1,
  });
  // The screen light finds the edge of his shell, so the dark shape reads as
  // him and not as another seat.
  fill(ctx, P.pink3, 345, 200, 2, 44, 0.26);
  fill(ctx, P.pink2, 351, 192, 30, 1, 0.16);
  fill(ctx, P.pink3, 339, 240, 4, 2, 0.22);
  alphaRect(ctx, P.ink, wx, wy, ww, wh, 0.16);
  // Projector beam from the booth's own port.
  projectorBeam(ctx, wx + ww - 14, wy + 6, wx + 150, wy + 110, 86, 0.08, P.pink3);
  dust(ctx, t, wx + 40, wy + 20, ww - 80, wh - 40, 22, P.pink3, 0.35);
  // Glass reflection: a diagonal wash and a faint ghost of her face.
  poly(ctx, P.cream, [[wx + 20, wy], [wx + 150, wy], [wx + 40, wy + wh], [wx + 4, wy + wh]], 0.035);
  alphaRect(ctx, "#2b252b", 264, 82, 2, 190, 0.2);
  alphaRect(ctx, "#2b252b", 266, 82, 1, 190, 0.12);
  ctx.restore();
  // Window frame.
  fill(ctx, "#080609", wx - 4, wy - 4, ww + 8, 4);
  fill(ctx, "#080609", wx - 4, wy + wh, ww + 8, 4);
  fill(ctx, "#080609", wx - 4, wy, 4, wh);
  fill(ctx, "#080609", wx + ww, wy, 4, wh);
  fill(ctx, "#c59374", wx - 3, wy, 1, wh, 0.18);
  // Her, in the foreground, out of focus and dark.
  fill(ctx, "#070609", 0, 0, 118, H);
  ellipse(ctx, "#070609", 80, 150, 58, 76);
  poly(ctx, "#070609", [[0, 170], [34, 178], [52, 250], [0, 312]]);
  fill(ctx, "#0a080b", 0, 290, 160, 70);
  // A rim of screen light along her shoulder and cheek.
  line(ctx, "#9e7564", 22, 244, 48, 210, 1, 0.35);
  line(ctx, "#9e7564", 54, 202, 96, 150, 1, 0.25);
  fill(ctx, P.red3, 64, 108, 7, 3, 0.35);
  // Her hand on the glass.
  drawHand(ctx, 128, 206, "her", 2.4, { outfit: "cinema" });
  fill(ctx, P.cream, 128, 203, 12, 1, 0.12);
  grain(ctx, t, 0.045);
  vignette(ctx, 0.46);
}

export function screeningSeats(ctx, t, shot, local) {
  fill(ctx, "#09070b", 0, 0, W, H);
  // The screen is off-frame right; its light is the key.
  bands(ctx, 0, 0, W, H, [
    ["#100a0f", 1], ["#2b141b", 0.6], ["#120b10", 1],
  ]);
  // Seat row, side-on, red velvet in the projector light.
  for (const sx of [168, 280, 392, 504]) {
    seat(ctx, sx, 206, 100, 88, { dark: "#3c151c", mid: "#69262b", hi: "#a84a43" });
    fill(ctx, "#2a1116", sx + 6, 290, 88, 4);
  }
  // Her, then the empty seat, then him.
  drawPerson(ctx, "her", 218, 300, {
    scale: 1.4, facing: "right", pose: "sit", expression: "wistful",
    outfit: "cinema", arm: "hold", blink: local % 3.9 > 3.75 ? 1 : 0,
  });
  drawPerson(ctx, "him", 442, 300, {
    scale: 1.4, facing: "right", pose: "sit", expression: "sad",
    outfit: "winter", arm: "down", blink: local % 4.4 > 4.25 ? 1 : 0,
  });
  // Armrests in front of them: the shells read as seated between them.
  for (const ax of [165, 271, 383, 499]) {
    fill(ctx, "#2a1116", ax, 246, 9, 54);
    fill(ctx, "#6f2c2f", ax + 1, 248, 6, 50);
    fill(ctx, "#a74843", ax + 2, 248, 2, 26, 0.3);
  }
  // Their near claws rest exactly where the armrests are; the middle seat
  // between them has nobody in it.
  // Screen light comes from the right, with a flicker.
  const fl = 0.65 + 0.35 * projectorFlicker(t);
  alphaRect(ctx, P.pink3, 0, 0, W, H, 0.018 * fl);
  poly(ctx, P.pink3, [[W, 0], [W - 150, 0], [W - 30, H], [W, H]], 0.035 * fl);
  dust(ctx, t, 160, 80, 380, 230, 20, P.pink3, 0.3);
  // A thin red thread of light along the empty seat.
  line(ctx, P.red3, 330, 274, 368, 274, 1, 0.18);
  grain(ctx, t, 0.04);
  vignette(ctx, 0.44);
}

export function screeningTicket(ctx, t, shot, local) {
  fill(ctx, "#0b080b", 0, 0, W, H);
  glow(ctx, 330, 110, 540, 300, P.red1, 0.08);
  ctx.save();
  ctx.beginPath();
  ctx.rect(98, 100, 444, 246);
  ctx.clip();
  // The back of an empty seat, close enough to see the plush.
  fill(ctx, "#3a151c", 98, 136, 444, 214);
  fill(ctx, "#67262b", 104, 144, 432, 200);
  ellipse(ctx, "#8e3938", 320, 146, 216, 16);
  ellipse(ctx, "#5c2128", 320, 150, 210, 10, 0.5);
  fill(ctx, "#a74843", 108, 146, 424, 1, 0.35);
  dither(ctx, "#4a1c22", 104, 152, 432, 190, 3, 1, 0.25);
  // Tufting and seams, so the red field reads as upholstery.
  for (const bx of [212, 320, 428]) {
    for (const by of [186, 232]) {
      fill(ctx, "#43181f", bx - 1, by, 4, 2, 0.65);
      fill(ctx, "#a74843", bx, by - 1, 2, 1, 0.4);
    }
  }
  fill(ctx, "#4e1d24", 264, 160, 1, 180, 0.3);
  fill(ctx, "#4e1d24", 376, 160, 1, 180, 0.3);
  fill(ctx, "#8e3938", 104, 328, 432, 1, 0.25);
  fill(ctx, "#2a1116", 98, 330, 444, 16);
  ctx.restore();

  // The red ticket rests in the seam of the seat.
  ticket(ctx, 292, 232, 112, 56, {
    title: "影院", sub: "ADMIT ONE · 7:10", titleSize: 14, subSize: 6,
  });
  fill(ctx, P.red4, 300, 240, 26, 2, 0.35);

  // Her pincer comes in from the left and stops at its edge.  The crab's own
  // forearm is the sleeve; a drawn one only double-exposes it.
  const reach = ease(clamp01(local / 1.8));
  const hx = 214 + reach * 30;
  drawReachingHand(ctx, hx, 266, 1, 1.7, { who: "her", outfit: "cinema" });
  // A second, older ticket edge underneath, almost hidden.
  fill(ctx, "#c7b294", 338, 290, 40, 2, 0.25);
  // Foreground seat back, dark.
  fill(ctx, "#130d11", 0, 300, 98, 60);
  fill(ctx, "#130d11", 542, 290, 98, 70);
  // A shaft of projector light and dust.
  poly(ctx, P.pink3, [[420, 0], [520, 0], [640, 240], [500, 260]], 0.035);
  dust(ctx, t, 220, 80, 300, 200, 18, P.pink3, 0.3);
  // A tiny red glint on the ticket; then it is only paper.
  const glint = Math.max(0, Math.sin(local * 1.5)) * 0.12;
  glow(ctx, 348, 258, 130, 64, P.red3, glint);
  grain(ctx, t, 0.045);
  vignette(ctx, 0.48);
}
