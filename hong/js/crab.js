/* 桌宠小螃蟹 —— the film's two leads, redrawn as desktop-pet crabs.
 *
 * One shared rig, two palettes: he is orange with a thin red cable, she is
 * pink with a red bow.  The silhouette is deliberately simple — a wide
 * rounded body, two bar eyes, four thread legs, two pincers — so the face
 * reads at 2x and still has room for expressions at 5x.
 *
 * Local coordinates: feet at y = 0, body centred on x = 0, facing +x.
 * The caller places the crab by its feet and scales the whole rig, exactly
 * like the human rig it replaces.
 */

import { P, fill, line } from "./art.js";

const INK = "#1a1117";

const LOOK = {
  him: {
    body: "#e0895c",
    bodyDk: "#b96a44",
    bodyHi: "#f2ab7e",
    leg: "#c0754d",
    legDk: "#8f5236",
    claw: "#e0895c",
    clawDk: "#b96a44",
    clawHi: "#f6b98d",
    eye: "#1a1117",
    eyeHi: "#fff6ea",
    blush: "#c0553d",
    mouth: "#5b2a22",
    iris: "#3d434f",
    accent: P.red2,
    accentHi: P.red3,
  },
  her: {
    body: "#e88ba8",
    bodyDk: "#c4698a",
    bodyHi: "#f7b8ca",
    leg: "#cf7f9b",
    legDk: "#9c5a72",
    claw: "#e88ba8",
    clawDk: "#c4698a",
    clawHi: "#fbc4d4",
    eye: "#1a1117",
    eyeHi: "#fff6ea",
    blush: "#d9506e",
    mouth: "#6e2f3c",
    iris: "#6f4a39",
    accent: P.red3,
    accentHi: P.red4,
  },
};

/* Body geometry, in local pixels.  Wide shell, short thread legs: the first
 * pass was taller than it was wide and the legs read as stilts.  The shell is
 * kept to 62 px so the crabs keep the screen presence of the old rig while
 * still fitting two to a frame in the pair shots. */
const BODY_W = 62;
const BODY_H = 48;
const BODY_TOP = -63;          // bottom sits at -15
const LEG_TOP = -15;           // four short legs, feet at 0
const EYE_W = 6;
const EYE_H = 9;
const EYE_Y = -40;
const MOUTH_Y = -25;

/* Every close-up in the film was composed around the old human eye line.  A
 * crab's eyes sit much lower, so at 4x and up the rig is lifted by exactly the
 * difference; the feet are off-screen in those shots, so the lift never shows. */
const CLOSE_EYE_LINE = -81;

/* ----------------------------------------------------------------- shapes */

/** Integer rounded rectangle, drawn as a solid middle band plus four corner
 * rows.  Filling one scanline at a time left a seam every local pixel at the
 * fractional scales the film uses (1.42x, 1.6x, 3.4x): the shell and the
 * pincers came out looking like corduroy. */
function rrect(ctx, color, x, y, w, h, r = 3, alpha = 1) {
  const cap = Math.min(r - 1, Math.floor(h / 2));
  for (let j = 0; j < cap; j++) {
    const inset = cap - j;
    fill(ctx, color, x + inset, y + j, w - inset * 2, 1, alpha);
    fill(ctx, color, x + inset, y + h - 1 - j, w - inset * 2, 1, alpha);
  }
  if (h - cap * 2 > 0) fill(ctx, color, x, y + cap, w, h - cap * 2, alpha);
}

function drawBody(ctx, c, top, flat, alpha, back = false) {
  const edge = flat || INK;
  rrect(ctx, edge, -BODY_W / 2 - 1, top - 1, BODY_W + 2, BODY_H + 2, 3, alpha);
  rrect(ctx, flat || c.body, -BODY_W / 2, top, BODY_W, BODY_H, 3, alpha);
  if (flat) return;
  if (back) {
    // Seen from behind the shell has no face: a seam down the middle, a
    // centred sheen and the shadow under the rim carry it instead.
    fill(ctx, c.bodyDk, -1, top + 4, 2, BODY_H - 9, 0.16 * alpha);
    fill(ctx, c.bodyHi, -14, top + 1, 28, 2, 0.3 * alpha);
    fill(ctx, c.bodyDk, -24, top + BODY_H - 3, 48, 2, 0.28 * alpha);
    fill(ctx, c.bodyDk, -30, top + 4, 2, BODY_H - 10, 0.16 * alpha);
    fill(ctx, c.bodyDk, 28, top + 4, 2, BODY_H - 10, 0.16 * alpha);
    return;
  }
  fill(ctx, c.bodyHi, -22, top + 1, 34, 2, 0.46 * alpha);
  fill(ctx, c.bodyHi, -29, top + 4, 2, 22, 0.22 * alpha);
  // Three shallow bands give the shell a bottom falloff, so a 5x close-up
  // reads as a rounded body instead of a flat pink tile.
  fill(ctx, c.bodyDk, -29, top + BODY_H - 12, 58, 4, 0.025 * alpha);
  fill(ctx, c.bodyDk, -29, top + BODY_H - 8, 58, 4, 0.045 * alpha);
  fill(ctx, c.bodyDk, -29, top + BODY_H - 4, 58, 4, 0.07 * alpha);
  fill(ctx, c.bodyDk, -26, top + BODY_H - 3, 52, 2, 0.16 * alpha);
  fill(ctx, c.bodyDk, 22, top + 3, 2, BODY_H - 8, 0.18 * alpha);
}

function drawLegs(ctx, c, pose, phase, bob, flat, alpha) {
  const sit = pose === "sit";
  const walk = pose === "walk";
  const xs = [-21, -7, 7, 21];
  xs.forEach((x, i) => {
    let lift = 0;
    if (walk) {
      const s = Math.sin(phase * Math.PI * 2 + (i % 2) * Math.PI);
      lift = s > 0 ? Math.round(s * 2) : 0;
    }
    // Seated, the shell rests on the seat and only the feet show below it.
    const top = (sit ? -9 : LEG_TOP) + bob;
    const bottom = (sit ? 1 : 0) - lift;
    const len = Math.max(2, bottom - top);
    const lean = sit ? (i < 2 ? -1 : 1) : 0;
    fill(ctx, flat || INK, x - 1 + lean, top, 5, len + 1, alpha);
    fill(ctx, flat || c.leg, x + lean, top + 1, 3, len - 1, alpha);
    fill(ctx, flat || c.legDk, x + lean, bottom - 3, 3, 3, alpha);
  });
}

/** A pincer: rounded block, ink notch on the outer edge, one lit pixel. */
function drawClaw(ctx, c, cx, cy, side, flat, alpha) {
  rrect(ctx, flat || INK, cx - 6, cy - 6, 13, 13, 2, alpha);
  rrect(ctx, flat || c.claw, cx - 5, cy - 5, 11, 11, 2, alpha);
  if (flat) return;
  const nx = side > 0 ? cx + 4 : cx - 5;
  fill(ctx, INK, nx, cy - 1, 2, 3, alpha);
  fill(ctx, c.clawDk, cx + (side > 0 ? -5 : 2), cy + 3, 3, 2, 0.35 * alpha);
  fill(ctx, c.clawHi, cx - 3, cy - 4, 4, 2, 0.45 * alpha);
}

/** Forearm stub from the body to a claw that has moved away. */
function drawArm(ctx, c, x0, y0, x1, y1, flat, alpha) {
  const dx = Math.sign(x1 - x0);
  const dy = Math.sign(y1 - y0);
  if (dx === 0) {
    fill(ctx, flat || INK, x0 - 2, Math.min(y0, y1), 5, Math.abs(y1 - y0) + 1, alpha);
    fill(ctx, flat || c.leg, x0 - 1, Math.min(y0, y1), 3, Math.abs(y1 - y0), alpha);
    return;
  }
  if (dy === 0) {
    fill(ctx, flat || INK, Math.min(x0, x1), y0 - 2, Math.abs(x1 - x0) + 1, 5, alpha);
    fill(ctx, flat || c.leg, Math.min(x0, x1), y0 - 1, Math.abs(x1 - x0), 3, alpha);
    return;
  }
  line(ctx, flat || INK, x0, y0, x1, y1, 4, alpha);
  line(ctx, flat || c.leg, x0, y0, x1, y1, 2, alpha);
}

/* ------------------------------------------------------------------- face */

function drawEye(ctx, c, x, y, expression, side, blink, flat, alpha, gaze = 0) {
  const wistful = expression === "wistful";
  const uneasy = expression === "uneasy";
  const sunken = expression === "sad" || expression === "hurt" || expression === "tears";
  const sad = sunken || wistful || uneasy;
  const angry = expression === "angry";
  const happy = expression === "smile" || expression === "kiss";
  const wide = expression === "surprised";

  if (flat) {
    fill(ctx, flat, x, y, EYE_W, EYE_H, alpha);
    return;
  }
  if (happy) {
    // ⌒ — the happy closed eye.
    fill(ctx, INK, x + 1, y + 3, EYE_W - 2, 2, alpha);
    fill(ctx, INK, x, y + 5, 2, 2, alpha);
    fill(ctx, INK, x + EYE_W - 2, y + 5, 2, 2, alpha);
    return;
  }
  if (blink > 0.5 || expression === "closed") {
    fill(ctx, INK, x, y + 5, EYE_W, 2, alpha);
    fill(ctx, c.eyeHi, x + 1, y + 6, 1, 1, 0.5 * alpha);
    return;
  }

  // Wistful drops the upper lid one row: the eye is still open, but the
  // looking has already happened.
  const top = wistful ? y + 1 : y;
  const h = (wide ? EYE_H + 2 : EYE_H) - (wistful ? 1 : 0);
  const w = wide ? EYE_W + 1 : EYE_W;
  for (let j = 0; j < h; j++) {
    let lo = 0;
    let ro = 0;
    if (j === 0 || j === h - 1) { lo = 1; ro = 1; }
    // The outer top corner drops for hurt; the inner one drops for anger.
    if ((sad || angry) && j < 4) {
      const cut = 4 - j;
      const outerIsLeft = side < 0;
      const dropOuter = sad;
      if (dropOuter === outerIsLeft) lo = Math.max(lo, cut);
      else ro = Math.max(ro, cut);
    }
    fill(ctx, INK, x + lo, top + j, w - lo - ro, 1, alpha);
  }
  // Catchlight from the upper left, on both eyes.  The gaze moves it instead
  // of moving the eye, which is enough at 2x and up.
  const glx = x + 1 + (gaze > 0 ? 2 : gaze < 0 ? -1 : 0);
  fill(ctx, c.eyeHi, glx, top + 2, 2, 3, 0.95 * alpha);
  if (sunken) {
    fill(ctx, c.blush, x, top + h, w, 1, 0.25 * alpha);
  }
}

function drawBrow(ctx, c, x, y, side, expression, flat, alpha) {
  if (flat) return;
  if (expression === "surprised") {
    // Both brows ride high and straight: the surprise has to reach the shell,
    // not just the eyes, or a close-up reads as a blink with the mouth open.
    fill(ctx, c.bodyDk, x, y - 3, 4, 1, alpha);
    return;
  }
  if (expression === "smirk") {
    // One brow rides a row higher: the fond, sideways look.
    fill(ctx, c.bodyDk, x, y - (side > 0 ? 2 : 0), 4, 1, alpha);
    return;
  }
  const wistful = expression === "wistful";
  const sad = expression === "sad" || expression === "hurt" || expression === "tears"
    || wistful || expression === "uneasy";
  const angry = expression === "angry";
  if (!sad && !angry) return;
  // Inner end up for hurt, inner end down for anger.
  const up = sad ? -1 : 1;
  const outer = side < 0 ? x - 1 : x + 3;
  const inner = side < 0 ? x + 3 : x - 1;
  fill(ctx, c.bodyDk, outer, y, 2, 1, alpha);
  fill(ctx, c.bodyDk, Math.round((outer + inner) / 2), y + up, 2, 1, alpha);
  // Wistful keeps only the first step, so the worry is a hint.
  if (!wistful) fill(ctx, c.bodyDk, inner, y + up * 2, 2, 1, alpha);
}

function drawMouth(ctx, c, expression, mouth, cx, y, flat, alpha) {
  if (flat) return;
  const sad = expression === "sad" || expression === "hurt" || expression === "tears";
  if (mouth > 0.35 || expression === "surprised") {
    fill(ctx, c.mouth, cx - 1, y, 3, 3, alpha);
    fill(ctx, "#f0a0a0", cx - 1, y + 2, 3, 1, 0.5 * alpha);
  } else if (expression === "smile") {
    fill(ctx, c.mouth, cx - 2, y, 1, 1, alpha);
    fill(ctx, c.mouth, cx - 1, y + 1, 3, 1, alpha);
    fill(ctx, c.mouth, cx + 2, y, 1, 1, alpha);
  } else if (expression === "kiss") {
    // Pursed: two rows wide enough to read at 5x, with a lit lower lip.
    fill(ctx, c.mouth, cx - 1, y, 3, 2, alpha);
    fill(ctx, "#f0a0a0", cx, y + 1, 1, 1, 0.45 * alpha);
  } else if (expression === "smirk") {
    // One corner up; the other stays level.  Reads as fond, not mocking.
    fill(ctx, c.mouth, cx - 1, y + 1, 3, 1, alpha);
    fill(ctx, c.mouth, cx + 2, y, 1, 1, alpha);
  } else if (expression === "pout") {
    fill(ctx, c.mouth, cx - 1, y, 2, 2, alpha);
  } else if (expression === "uneasy") {
    // A line that cannot settle.
    fill(ctx, c.mouth, cx - 2, y, 1, 1, alpha);
    fill(ctx, c.mouth, cx - 1, y + 1, 2, 1, alpha);
    fill(ctx, c.mouth, cx + 1, y, 1, 1, alpha);
    fill(ctx, c.mouth, cx + 2, y + 1, 1, 1, alpha);
  } else if (expression === "wistful") {
    // A small smile that arrives a beat late.
    fill(ctx, c.mouth, cx - 1, y, 3, 1, alpha);
    fill(ctx, c.mouth, cx, y + 1, 1, 1, alpha);
  } else if (sad) {
    fill(ctx, c.mouth, cx - 2, y + 1, 1, 1, alpha);
    fill(ctx, c.mouth, cx - 1, y, 3, 1, alpha);
    fill(ctx, c.mouth, cx + 2, y + 1, 1, 1, alpha);
  } else if (expression === "angry") {
    fill(ctx, c.mouth, cx - 2, y, 5, 1, alpha);
  } else {
    fill(ctx, c.mouth, cx - 1, y, 3, 1, 0.75 * alpha);
  }
}

function drawTears(ctx, c, xl, xr, y, alpha) {
  const drop = "#d9eef0";
  fill(ctx, drop, xl + 1, y + EYE_H + 1, 1, 4, 0.9 * alpha);
  fill(ctx, drop, xl + 1, y + EYE_H + 5, 1, 1, 0.5 * alpha);
  fill(ctx, drop, xr + 3, y + EYE_H + 1, 1, 3, 0.7 * alpha);
  fill(ctx, "#9fd4dc", xl + 1, y + EYE_H + 3, 1, 1, 0.5 * alpha);
}

function drawBlush(ctx, c, top, alpha) {
  // A 6x2 bar became a sticker at 5x. Three rows — short, wide, short — sit
  // closer to the eyes and read as a cheek rather than a side stripe.
  fill(ctx, c.blush, -24, top + 29, 4, 1, 0.2 * alpha);
  fill(ctx, c.blush, -25, top + 30, 6, 2, 0.28 * alpha);
  fill(ctx, c.blush, -24, top + 32, 4, 1, 0.2 * alpha);
  fill(ctx, c.blush, 20, top + 29, 4, 1, 0.2 * alpha);
  fill(ctx, c.blush, 19, top + 30, 6, 2, 0.28 * alpha);
  fill(ctx, c.blush, 20, top + 32, 4, 1, 0.2 * alpha);
}

/* --------------------------------------------------------------- dressing */

function herBow(ctx, top, alpha) {
  // A small ribbon on the shell's top-left: two loops and a knot, 13 px wide.
  const y = top - 6;
  fill(ctx, INK, -23, y, 6, 7, alpha);
  fill(ctx, INK, -16, y, 6, 7, alpha);
  fill(ctx, P.red2, -22, y + 1, 4, 5, alpha);
  fill(ctx, P.red2, -15, y + 1, 4, 5, alpha);
  fill(ctx, P.red3, -22, y + 1, 2, 2, alpha);
  fill(ctx, INK, -19, y + 1, 4, 6, alpha);
  fill(ctx, P.red1, -18, y + 2, 2, 2, alpha);
  fill(ctx, P.red3, -22, y + 6, 10, 1, 0.7 * alpha);
}

function hisCable(ctx, top, alpha) {
  line(ctx, P.red2, 19, top + 1, 23, top + 13, 1, 0.8 * alpha);
  line(ctx, P.red2, 23, top + 13, 19, top + 33, 1, 0.65 * alpha);
  fill(ctx, P.red3, 18, top + 32, 3, 2, 0.9 * alpha);
  fill(ctx, P.red4, 18, top + 32, 1, 1, 0.6 * alpha);
}

/* ---------------------------------------------------------------- public */

function clawTargets(arm, sit) {
  const restY = sit ? -36 : -40;
  const left = [-36, restY];
  const right = [36, restY];
  if (arm === "up") right[0] = 44, right[1] = -70;
  else if (arm === "paint") right[0] = 36, right[1] = -66;
  else if (arm === "reach") right[0] = 50, right[1] = -44;
  else if (arm === "point") right[0] = 52, right[1] = -46;
  else if (arm === "hold") right[0] = 42, right[1] = sit ? -35 : -38;
  else if (arm === "holdout") right[0] = 47, right[1] = sit ? -35 : -38;
  else if (arm === "holdback") left[0] = -45, left[1] = sit ? -35 : -38;
  else if (arm === "plead") { left[0] = -47, left[1] = -50; right[0] = 47, right[1] = -50; }
  else if (arm === "wipe") right[0] = 29, right[1] = -52;
  else if (arm === "write") right[0] = 42, right[1] = -24;
  else if (arm === "phone") right[0] = 23, right[1] = -32;
  else if (arm === "grip") right[0] = 38, right[1] = -28;
  else if (arm === "lean") right[0] = 44, right[1] = -8;
  return { left, right };
}

/** Arms only show when the pincer has left the shell's silhouette; at 34 px the
 * claw is at the rim, which is where a raised or gripping arm starts to read. */
function armNeeded(claw) {
  return Math.abs(claw[0]) >= 34 || claw[1] < -57;
}

/** Forearm from the shell's side to a pincer that has moved away.  The start
 * stays on the shell so a raised claw is attached to something instead of
 * floating above the head. */
function drawArmTo(ctx, c, claw, flat, alpha) {
  const sign = Math.sign(claw[0]) || 1;
  // A raised pincer needs a long enough arm to read as attached: it comes up
  // the outside of the shell rather than starting under the rim.
  const raised = claw[1] < -55;
  const sx = sign * (raised ? 31 : 28);
  const sy = raised ? -42 : Math.max(Math.min(claw[1] + 6, -30), -60);
  drawArm(ctx, c, sx, sy, claw[0], claw[1], flat, alpha);
}

export function drawCrabPerson(ctx, who, x, y, opts = {}) {
  const {
    scale = 1,
    facing = "right",
    view = "side",
    pose = "stand",
    phase = 0,
    expression = "soft",
    alpha = 1,
    silhouette = false,
    blink = 0,
    mouth = 0,
    arm = "down",
    headTilt = 0,
    turn = 0,
    gaze = 0,
  } = opts;

  const c = LOOK[who] || LOOK.him;
  const flat = silhouette ? (opts.silhouetteColor || "#141018") : null;
  const sit = pose === "sit";

  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(Math.round(x), Math.round(y));
  const dir = facing === "left" ? -1 : 1;
  ctx.scale(scale * (view === "side" ? dir : 1), scale);

  const lift = !silhouette && scale >= 4 ? EYE_Y - CLOSE_EYE_LINE : 0;
  if (lift) ctx.translate(0, -lift);

  const bob = pose === "walk" ? Math.round(Math.sin(phase * Math.PI * 4)) : 0;
  const top = BODY_TOP + (sit ? 8 : 0) + bob;
  const back = view === "back";

  // The far pincer sits behind the body; the near one in front.
  const claws = clawTargets(arm, sit);
  const farSide = view === "side" ? -1 : 1;
  const nearSide = view === "side" ? 1 : -1;
  const far = farSide > 0 ? claws.right : claws.left;
  const near = nearSide > 0 ? claws.right : claws.left;

  // A claw raised above the shell has to come in front of the body, or the
  // shell eats the arm and the pincer reads as a flag on a stick.
  const farRaised = far[1] < -55;
  if (!farRaised) {
    if (armNeeded(far)) drawArmTo(ctx, c, far, flat, 0.95);
    drawClaw(ctx, c, far[0], far[1], Math.sign(far[0]), flat, 0.95);
  }

  drawLegs(ctx, c, pose, phase, bob, flat, 1);
  drawBody(ctx, c, top, flat, 1, back);

  if (!back) {
    const fx = turn * 2 + Math.round(headTilt) * 2;
    const ex = [fx - 15, fx + 9];
    const ey = EYE_Y + (sit ? 8 : 0) + bob;
    const mx = fx;
    const my = MOUTH_Y + (sit ? 8 : 0) + bob;

    drawEye(ctx, c, ex[0], ey, expression, -1, blink, flat, 1, gaze);
    drawEye(ctx, c, ex[1], ey, expression, 1, blink, flat, 1, gaze);
    drawBrow(ctx, c, ex[0], ey - 3, -1, expression, flat, 1);
    drawBrow(ctx, c, ex[1], ey - 3, 1, expression, flat, 1);
    if (expression === "tears" && !silhouette) drawTears(ctx, c, ex[0], ex[1], ey, 1);
    drawMouth(ctx, c, expression, mouth, mx, my, flat, 1);
    if (expression === "smile" || expression === "soft" || expression === "kiss"
      || expression === "wistful") {
      // Blush is a hint at 2x and a sticker at 5x, so it fades with the lens.
      drawBlush(ctx, c, top, scale >= 4 ? 0.8 : 1);
    }
    if (!silhouette) {
      if (who === "her") herBow(ctx, top, 1);
      else hisCable(ctx, top, 1);
    }
  } else if (!silhouette) {
    // From behind the accent still shows: the bow and the cable read as the
    // same two characters even when the faces are gone.
    if (who === "her") herBow(ctx, top, 1);
    else hisCable(ctx, top, 1);
  }

  if (armNeeded(near)) drawArmTo(ctx, c, near, flat, 1);
  drawClaw(ctx, c, near[0], near[1], Math.sign(near[0]) || 1, flat, 1);
  if (farRaised) {
    if (armNeeded(far)) drawArmTo(ctx, c, far, flat, 1);
    drawClaw(ctx, c, far[0], far[1], Math.sign(far[0]) || 1, flat, 1);
  }

  ctx.restore();
}

export function drawCrabPortrait(ctx, who, cx, headY, opts = {}) {
  const scale = opts.scale ?? 4;
  const feetY = headY + 73 * scale;
  return drawCrabPerson(ctx, who, cx, feetY, {
    ...opts,
    scale,
    view: opts.view || "front",
    pose: "stand",
  });
}

/** Two crabs leaning into each other, drawn as one silhouette. */
export function drawCrabEmbrace(ctx, x, y, scale, opts = {}) {
  const color = opts.color || "#151019";
  const alpha = opts.alpha ?? 1;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale, scale);
  // Her body, a little higher and to the right.
  rrect(ctx, color, 5, -66, 58, 46, 3);
  // His body, lower and to the left.
  rrect(ctx, color, -42, -56, 60, 46, 3);
  // Claws crossing each other's backs.
  drawArm(ctx, { leg: color, body: color }, -14, -46, 55, -40, color, 1);
  drawArm(ctx, { leg: color, body: color }, 50, -52, -30, -36, color, 1);
  // Legs.
  for (const lx of [-33, -17, 3, 21, 38]) fill(ctx, color, lx, -15, 3, 15);
  ctx.restore();
}

/** A single claw at the end of a sleeve — replaces the human hand close-ups. */
export function drawCrabHand(ctx, x, y, who = "him", scale = 1, opts = {}) {
  const c = LOOK[who] || LOOK.him;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale, scale);
  drawClaw(ctx, c, 0, 0, 1, null, 1);
  ctx.restore();
}

/** A tapered bar, ink-outlined, used for the pincer's jaws. */
function taperedBar(ctx, color, x0, y0, x1, y1, w0, w1, ink, alpha) {
  const n = Math.max(1, Math.abs(x1 - x0));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const y = y0 + (y1 - y0) * t;
    const w = w0 + (w1 - w0) * t;
    const top = Math.round(y - w / 2);
    const h = Math.max(1, Math.round(w));
    fill(ctx, ink, x0 + i, top - 1, 1, h + 2, alpha);
    fill(ctx, color, x0 + i, top, 1, h, alpha);
  }
}

/** A forearm and an open pincer reaching toward the other crab. */
export function drawCrabReachingHand(ctx, x, y, dir = 1, scale = 1, opts = {}) {
  const who = opts.who || "her";
  const c = LOOK[who] || LOOK.her;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale * dir, scale);

  // Forearm: the body colour, tapering in toward the wrist.
  fill(ctx, INK, -42, -10, 31, 20);
  fill(ctx, c.bodyDk, -41, -9, 29, 18);
  fill(ctx, c.bodyHi, -40, -8, 22, 2, 0.5);
  fill(ctx, c.bodyDk, -40, 2, 27, 5, 0.3);
  fill(ctx, INK, -12, -10, 4, 20);
  fill(ctx, c.body, -11, -9, 3, 18);

  // Palm.
  rrect(ctx, INK, -10, -10, 22, 20, 2);
  rrect(ctx, c.claw, -9, -9, 20, 18, 2);

  // Two jaws, closing toward each other.
  taperedBar(ctx, c.claw, 9, -6, 28, -3, 6, 2, INK, 1);
  taperedBar(ctx, c.claw, 9, 6, 27, 3, 6, 2, INK, 1);
  // The seam where the jaws meet the palm, and a lit edge on the upper one.
  fill(ctx, INK, 8, -1, 1, 3, 0.9);
  fill(ctx, c.clawHi, 12, -8, 10, 1, 0.45);
  fill(ctx, c.clawHi, -6, -7, 5, 2, 0.45);
  fill(ctx, c.clawDk, -6, 5, 8, 2, 0.3);
  ctx.restore();
}
