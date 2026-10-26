/* Original pixel characters for 《红》.
 *
 * The rig is deliberately small and self-consistent: every shot uses the same
 * 96-px figure, same head shape, same palette and same costume, whether it is
 * an 80-px wide shot or a 5x close-up.  Poses are drawn as local-coordinate
 * pixel shapes; no sprite sheet is rotated or re-scaled between scenes.
 *
 * Heads are drawn on an integer grid with a hand-written silhouette: skull,
 * jaw, chin, ears, a real neck, then hair in two layers (mass behind the face,
 * locks and fringe in front).  Faces are built from symmetric feature blocks
 * so a close-up does not drift off-centre the way scaled-up line art does.
 */

import { P, fill, line, ellipse, dither } from "./art.js";
import {
  drawCrabPerson, drawCrabPortrait, drawCrabEmbrace, drawCrabHand, drawCrabReachingHand,
} from "./crab.js";

/* The two leads are desktop-pet crabs (see crab.js).  The human rig below is
 * kept intact so the switch is one constant; every scene keeps calling
 * drawPerson / drawHand / drawReachingHand exactly as before. */
const CRAB_LEADS = true;

const HIM = {
  skin: P.skin,
  skinSh: P.skinSh,
  skinDeep: P.skinDeep,
  skinHi: "#f8d5b2",
  iris: "#3d434f",
  irisHi: "#646c7e",
  pupil: "#1b1d24",
  lip: "#9c6049",
  hair: "#302b34",
  hairHi: "#4e4654",
  hairDk: "#18151c",
  coat: "#2b3343",
  coatDk: "#1c2230",
  coatHi: "#465368",
  shirt: "#d9cfbd",
  shirtSh: "#b4aa99",
  accent: P.red2,
  accentHi: P.red3,
  trouser: "#252936",
  trouserDk: "#191c26",
  shoe: "#443a33",
  shoeHi: "#6e5b4a",
  sole: "#17161a",
};

const HER = {
  skin: P.skin,
  skinSh: P.skinSh,
  skinDeep: P.skinDeep,
  skinHi: "#f9d7b5",
  iris: "#6f4a39",
  irisHi: "#9b6a4f",
  pupil: "#2a1a14",
  lip: "#a5554b",
  hair: "#3d2a25",
  hairHi: "#6c4a3d",
  hairDk: "#241614",
  coat: "#9c4f45",
  coatDk: "#6d342f",
  coatHi: "#bd6a5a",
  shirt: "#e5d5bf",
  shirtSh: "#c4b29d",
  accent: P.red3,
  accentHi: P.red4,
  skirt: "#35434e",
  skirtDk: "#25313a",
  trouser: "#35434e",
  trouserDk: "#25313a",
  shoe: "#4d342c",
  shoeHi: "#7d5745",
  sole: "#231b19",
};

const OUTFITS = {
  default: {},
  city: {
    him: { coat: "#2f3b4a", coatHi: "#4d5c70", accent: P.red2 },
    her: { coat: "#8a4a43", coatDk: "#5d2f2d", coatHi: "#a96052" },
  },
  winter: {
    him: {
      coat: "#253040", coatHi: "#45546a", shirt: "#c9c2b7",
      accent: "#b8453f", accentHi: "#d86357",
    },
    her: {
      coat: "#8c3f39", coatDk: "#5e2926", coatHi: "#b25e51",
      shirt: "#e8d8c2", accent: "#bf4b44", accentHi: "#e07765",
    },
  },
  cinema: {
    her: { coat: "#88463f", coatDk: "#5b2c29", coatHi: "#ae6051" },
  },
  home: {
    him: { coat: "#3d3b3e", coatDk: "#29272b", coatHi: "#5c585c", shirt: "#c9c0b2" },
    her: { coat: "#8a554c", coatDk: "#5d3934", coatHi: "#ad7265", shirt: "#e8d8c2" },
  },
};

function palette(who, outfit) {
  const base = who === "her" ? HER : HIM;
  const over = OUTFITS[outfit]?.[who] || OUTFITS.default[who] || {};
  return { ...base, ...over };
}

/* ------------------------------------------------------------ pixel shapes */

/** Rasterised horizontal spans of a polygon, one entry per scanline. */
function spansOf(pts) {
  const ys = pts.map((p) => p[1]);
  const y0 = Math.floor(Math.min(...ys));
  const y1 = Math.ceil(Math.max(...ys));
  const rows = [];
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
    const spans = [];
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const xa = Math.ceil(xs[i]);
      const xb = Math.floor(xs[i + 1]);
      if (xb >= xa) spans.push([xa, xb]);
    }
    if (spans.length) rows.push({ y, spans });
  }
  return rows;
}

/** Filled polygon plus a true 1-px outline (not a shifted copy). */
function shape(ctx, color, pts, outline, alpha = 1) {
  const rows = spansOf(pts);
  if (outline) {
    for (const { y, spans } of rows) {
      for (const [xa, xb] of spans) {
        fill(ctx, outline, xa - 1, y, xb - xa + 3, 1, alpha);
      }
    }
    if (rows.length) {
      const first = rows[0];
      const last = rows[rows.length - 1];
      for (const [xa, xb] of first.spans) fill(ctx, outline, xa - 1, first.y - 1, xb - xa + 3, 1, alpha);
      for (const [xa, xb] of last.spans) fill(ctx, outline, xa - 1, last.y + 1, xb - xa + 3, 1, alpha);
    }
  }
  for (const { y, spans } of rows) {
    for (const [xa, xb] of spans) fill(ctx, color, xa, y, xb - xa + 1, 1, alpha);
  }
}

/** A limb drawn as two tapered segments with a 1-px outline and a cuff. */
function limb(ctx, pts, color, width = 6, cuff = null, hand = null) {
  for (let i = 0; i < pts.length - 1; i++) {
    line(ctx, P.ink, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], width + 2);
  }
  for (let i = 0; i < pts.length - 1; i++) {
    line(ctx, color, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], width);
  }
  if (cuff) {
    const a = pts[pts.length - 2];
    const b = pts[pts.length - 1];
    fill(ctx, cuff, b[0] - 2, b[1] - 2, 5, 5, 0.9);
    fill(ctx, color, b[0] - 1, b[1] - 1, 3, 3);
  }
  if (hand) {
    fill(ctx, P.ink, hand[0] - 2, hand[1] - 2, 4, 5);
    fill(ctx, hand[2], hand[0] - 1, hand[1] - 2, 3, 4);
    fill(ctx, hand[3], hand[0], hand[1] + 1, 2, 1, 0.5);
  }
}

/* ------------------------------------------------------------------- heads */

/** Hair mass drawn behind the face.  Hers reaches the chest. */
function backHair(ctx, who, c, cx, cy) {
  if (who === "her") {
    /* Long, with three tapered ends instead of a straight curtain.  The
     * outer edge steps in at the shoulders so the silhouette reads as hair
     * rather than a cape, which is what a rectangle of dark pixels does. */
    shape(ctx, c.hair, [
      [cx - 2, cy - 16], [cx + 3, cy - 16], [cx + 7, cy - 14],
      [cx + 9, cy - 10], [cx + 10, cy - 4], [cx + 10, cy + 4],
      [cx + 9, cy + 12], [cx + 8, cy + 20], [cx + 6, cy + 28],
      [cx + 4, cy + 34], [cx + 3, cy + 26], [cx + 3, cy + 17],
      [cx + 2, cy + 8], [cx - 2, cy + 4], [cx - 3, cy + 11],
      [cx - 4, cy + 19], [cx - 5, cy + 28], [cx - 6, cy + 34],
      [cx - 8, cy + 30], [cx - 9, cy + 21], [cx - 10, cy + 12],
      [cx - 10, cy + 2], [cx - 9, cy - 6], [cx - 7, cy - 12],
    ], P.ink);
    // The inside of the mass is darker; the rim keeps a little light.
    fill(ctx, c.hairDk, cx - 8, cy + 2, 2, 24, 0.55);
    fill(ctx, c.hairDk, cx + 7, cy + 1, 2, 24, 0.55);
    fill(ctx, c.hairDk, cx - 2, cy + 9, 3, 18, 0.32);
    fill(ctx, c.hairHi, cx - 9, cy - 8, 1, 10, 0.5);
    fill(ctx, c.hairHi, cx - 8, cy + 5, 1, 12, 0.22);
    fill(ctx, c.hairHi, cx + 8, cy + 6, 1, 14, 0.16);
    // Three strand seams, so the mass is not one flat block.
    fill(ctx, c.hairDk, cx + 4, cy + 11, 1, 18, 0.3);
    fill(ctx, c.hairDk, cx - 5, cy + 13, 1, 15, 0.28);
  } else {
    // Short hair: a rounded skull with a little volume at the crown.
    shape(ctx, c.hair, [
      [cx - 8, cy - 2], [cx - 9, cy - 8], [cx - 7, cy - 12],
      [cx - 3, cy - 15], [cx + 2, cy - 15], [cx + 6, cy - 13],
      [cx + 8, cy - 9], [cx + 9, cy - 4], [cx + 8, cy - 1],
      [cx + 7, cy - 4], [cx + 4, cy - 7], [cx, cy - 8],
      [cx - 4, cy - 7], [cx - 6, cy - 3],
    ], P.ink);
    fill(ctx, c.hairHi, cx - 5, cy - 13, 6, 1, 0.45);
    fill(ctx, c.hairDk, cx - 1, cy - 10, 3, 6, 0.25);
  }
}

function neck(ctx, c, cx, cy) {
  // A slim neck: the chin ends at cy+6, the collar starts at cy+12.
  fill(ctx, P.ink, cx - 3, cy + 4, 6, 9);
  fill(ctx, c.skin, cx - 2, cy + 5, 5, 7);
  fill(ctx, c.skinHi, cx - 2, cy + 6, 1, 4, 0.3);
  fill(ctx, c.skinSh, cx + 2, cy + 6, 1, 5, 0.3);
  // The jaw casts a soft band; the collar darkens the base.
  fill(ctx, c.skinSh, cx - 2, cy + 7, 5, 1, 0.4);
  fill(ctx, c.skinDeep, cx - 2, cy + 11, 5, 1, 0.35);
}

function ears(ctx, c, cx, cy) {
  for (const s of [-1, 1]) {
    fill(ctx, P.ink, cx + s * 7 - (s < 0 ? 1 : 0), cy - 1, 2, 4);
    fill(ctx, c.skin, cx + s * 7, cy, 1, 3);
    fill(ctx, c.skinSh, cx + s * 7, cy + 1, 1, 1, 0.7);
  }
}

function features(ctx, who, c, cx, cy, expression, blink, mouth, turn = 0, gaze = 0) {
  const isHer = who === "her";
  const brow = isHer ? c.hair : c.hairDk;
  const lash = c.hairDk;
  const ey = cy - 3;                 // first row of the open eye
  const eyeH = 4;                    // open-eye height; the lash sits above
  const closed = blink > 0.5 || expression === "closed" || expression === "kiss";

  /* Anime proportions: five-pixel eyes with a three-pixel iris and one
   * catchlight, a one-pixel nose, a three-pixel mouth.  At this size the eye
   * carries the expression; a larger nose or mouth turns the face back into
   * a mask.  A turned head shifts the features by one pixel and shortens the
   * far eye, so the gaze leaves the lens without a second rig. */
  const eyes = [
    { x: cx - 5 + turn, w: turn > 0 ? 4 : 5 },
    { x: cx + 1 + Math.abs(turn), w: turn < 0 ? 4 : 5 },
  ];
  const bx = cx + turn;

  /* Brows: one pixel.  Inner ends lift for hurt, drop for anger; the
   * default is a soft arch that leaves the forehead open. */
  const browY = cy - 6;
  if (expression === "sad" || expression === "tears" || expression === "hurt") {
    fill(ctx, brow, bx - 6, browY + 1, 2, 1, 0.9);
    fill(ctx, brow, bx - 4, browY, 2, 1, 0.9);
    fill(ctx, brow, bx - 2, browY - 1, 1, 1, 0.9);
    fill(ctx, brow, bx + 2, browY - 1, 1, 1, 0.9);
    fill(ctx, brow, bx + 3, browY, 2, 1, 0.9);
    fill(ctx, brow, bx + 5, browY + 1, 2, 1, 0.9);
  } else if (expression === "angry") {
    fill(ctx, brow, bx - 6, browY, 2, 1);
    fill(ctx, brow, bx - 4, browY + 1, 2, 1);
    fill(ctx, brow, bx - 2, browY + 1, 1, 1);
    fill(ctx, brow, bx + 2, browY + 1, 1, 1);
    fill(ctx, brow, bx + 3, browY + 1, 2, 1);
    fill(ctx, brow, bx + 5, browY, 2, 1);
  } else {
    fill(ctx, brow, bx - 5, browY, 3, 1, 0.62);
    fill(ctx, brow, bx + 2, browY, 3, 1, 0.62);
  }

  /* Eyes.  The lash is a single row; the sclera is warm ivory; the iris is
   * three wide and four tall with one white pixel at its top-left. */
  if (expression === "smile" && !closed) {
    for (const { x, w } of eyes) {
      fill(ctx, lash, x, ey + 1, w, 1);
      fill(ctx, lash, x + 1, ey, w - 2, 1);
      fill(ctx, c.skinSh, x, ey + 2, w, 1, 0.35);
    }
  } else if (closed) {
    for (const { x, w } of eyes) {
      const outerLeft = x < cx;
      fill(ctx, lash, x, ey + 1, w, 1);
      fill(ctx, lash, x + (outerLeft ? 0 : w - 1), ey, 1, 1, 0.8);
      fill(ctx, c.skinSh, x, ey + 2, w, 1, 0.3);
    }
  } else {
    const tall = expression === "surprised" && !closed ? eyeH + 1 : eyeH;
    for (const { x, w } of eyes) {
      const outerLeft = x < cx;
      // Upper lash, one pixel longer on the outer side.
      fill(ctx, lash, x - (outerLeft ? 1 : 0), ey - 1, w + 1, 1);
      // Sclera: warm ivory, not white — pure white reads as a goggle.
      fill(ctx, "#ecdbc2", x, ey, w, tall);
      // Iris: three wide and as tall as the opening, with a dark pupil and
      // a catchlight.  A flat dark block reads as a goggle; the pupil and
      // the lit lower rim are what make it read as an eye.
      const iw = 3;
      const ix = x + Math.max(0, Math.min(w - iw, 1 + gaze));
      fill(ctx, c.iris, ix, ey, iw, tall);
      fill(ctx, c.pupil, ix + 1, ey + 1, 1, tall - 2);
      fill(ctx, c.irisHi, ix, ey + tall - 1, iw, 1, 0.55);
      // Lid shadow across the top row: the eye sits under the brow instead
      // of glowing like a hole in the face.
      fill(ctx, c.hairDk, x, ey, w, 1, 0.18);
      fill(ctx, "#fff8ea", ix, ey, 1, 1, 0.95);
      // Lower lid: a shadow, not a second lash.
      fill(ctx, c.skinSh, x, ey + tall, w, 1, 0.35);
      // Her lash tip catches the light at the outer corner.
      if (isHer) fill(ctx, lash, x + (outerLeft ? -1 : w), ey - 1, 1, 2);
    }
  }

  /* Tears: one strand from each lower lid, visible at close range. */
  if (expression === "tears") {
    fill(ctx, "#d9eef0", eyes[0].x + 1, ey + 3, 1, 3, 0.85);
    fill(ctx, "#d9eef0", eyes[0].x + 1, ey + 6, 1, 1, 0.55);
    fill(ctx, "#d9eef0", eyes[1].x + 2, ey + 3, 1, 2, 0.6);
  }

  /* Nose: one shadow and a lit edge; no nostril at this resolution. */
  const nx = cx + turn;
  fill(ctx, c.skinSh, nx, cy + 1, 1, 1, 0.7);
  fill(ctx, c.skinHi, nx - 1, cy + 1, 1, 1, 0.3);
  fill(ctx, c.skinSh, nx - 1, cy, 1, 1, 0.22);

  /* Mouth: three pixels, corners implied. */
  const my = cy + 3;
  const mx = cx + turn;
  const open = mouth > 0.35;
  if (expression === "smile") {
    fill(ctx, c.lip, mx - 2, my, 1, 1, 0.9);
    fill(ctx, c.lip, mx - 1, my + 1, 3, 1, 0.95);
    fill(ctx, c.lip, mx + 2, my, 1, 1, 0.9);
    fill(ctx, c.skinHi, mx - 1, my + 2, 3, 1, 0.35);
  } else if (expression === "sad" || expression === "tears" || expression === "hurt") {
    fill(ctx, c.lip, mx - 2, my + 1, 1, 1);
    fill(ctx, c.lip, mx - 1, my, 3, 1);
    fill(ctx, c.lip, mx + 2, my + 1, 1, 1);
    fill(ctx, c.skinDeep, mx - 1, my + 2, 3, 1, 0.2);
  } else if (expression === "angry") {
    fill(ctx, c.lip, mx - 2, my, 5, 1);
    fill(ctx, c.skinDeep, mx - 2, my + 1, 1, 1, 0.35);
    fill(ctx, c.skinDeep, mx + 2, my + 1, 1, 1, 0.35);
  } else if (open) {
    fill(ctx, c.lip, mx - 1, my, 3, 2);
    fill(ctx, "#6e3738", mx - 1, my + 1, 3, 1);
    fill(ctx, "#ca8074", mx, my + 1, 1, 1);
    fill(ctx, c.skinDeep, mx - 1, my + 2, 3, 1, 0.3);
  } else if (expression === "kiss") {
    fill(ctx, c.lip, mx - 1, my, 2, 1);
    fill(ctx, c.skinDeep, mx, my + 1, 1, 1, 0.45);
  } else {
    fill(ctx, c.lip, mx - 1, my, 2, 1, 0.75);
    fill(ctx, c.skinDeep, mx, my - 1, 1, 1, 0.12);
    fill(ctx, c.skinSh, mx - 1, my + 1, 2, 1, 0.16);
  }

  /* Blush at cheek level, and the chin plane. */
  if (expression === "smile" || expression === "soft" || expression === "kiss") {
    fill(ctx, P.rose, cx - 6 + turn, cy + 2, 2, 1, 0.22);
    fill(ctx, P.rose, cx + 4 + turn, cy + 2, 2, 1, 0.22);
  }
  fill(ctx, c.skinSh, cx - 1 + turn, cy + 5, 3, 1, 0.22);
}

function headFront(ctx, who, c, expression, blink, mouth, headTilt = 0, silhouette = false, cy = -82, turn = 0, gaze = 0) {
  const cx = Math.round(headTilt);

  backHair(ctx, who, c, cx, cy);
  neck(ctx, c, cx, cy);

  /* Face: 15 px across the temples, a soft cheek and a four-pixel chin.
   * The jaw tapers over four rows instead of one, which is the difference
   * between an adult face and a square. */
  const face = [
    [cx, cy - 10], [cx + 4, cy - 9], [cx + 6, cy - 7], [cx + 7, cy - 4],
    [cx + 7, cy], [cx + 6, cy + 2], [cx + 5, cy + 4], [cx + 3, cy + 5],
    [cx + 1, cy + 6], [cx - 1, cy + 6], [cx - 3, cy + 5], [cx - 5, cy + 4],
    [cx - 6, cy + 2], [cx - 7, cy], [cx - 7, cy - 4], [cx - 6, cy - 7],
    [cx - 4, cy - 9],
  ];
  shape(ctx, c.skin, face, P.ink);

  /* Light from the upper left, always.  Keep the modelling to one-pixel
   * planes; wide bands make a face look dirty rather than lit. */
  fill(ctx, c.skinSh, cx + 4, cy - 5, 2, 7, 0.24);     // right temple
  fill(ctx, c.skinSh, cx + 3, cy + 1, 2, 2, 0.18);     // right cheek
  fill(ctx, c.skinSh, cx - 2, cy + 5, 4, 1, 0.2);      // jaw
  fill(ctx, c.skinHi, cx - 5, cy - 7, 2, 2, 0.24);     // forehead
  fill(ctx, c.skinHi, cx - 5, cy, 1, 2, 0.22);         // left cheek
  fill(ctx, c.skinSh, cx - 1, cy + 5, 3, 1, 0.2);      // under the lip
  fill(ctx, c.skinSh, cx - 5, cy - 8, 10, 1, 0.12);    // hairline shadow

  /* Front hair.  HERS: a long side-swept fringe with three points over the
   * brow and two locks in front of the jaw.  The fringe is a zigzag, not a
   * straight edge; a straight edge is what made the old head look like a
   * helmet. */
  if (who === "her") {
    shape(ctx, c.hair, [
      [cx - 8, cy + 10], [cx - 9, cy + 4], [cx - 9, cy - 2],
      [cx - 8, cy - 8], [cx - 5, cy - 13], [cx - 1, cy - 16],
      [cx + 4, cy - 15], [cx + 7, cy - 12], [cx + 9, cy - 6],
      [cx + 9, cy], [cx + 8, cy + 6], [cx + 7, cy + 11],
      [cx + 7, cy + 9], [cx + 8, cy + 2], [cx + 8, cy - 5],
      [cx + 6, cy - 8], [cx + 4, cy - 9], [cx + 2, cy - 10],
      [cx - 1, cy - 9], [cx - 3, cy - 10], [cx - 5, cy - 8],
      [cx - 7, cy - 3], [cx - 7, cy + 3], [cx - 7, cy + 9],
    ], P.ink);
    // A side parting on her left; the fringe sweeps across to the right.
    fill(ctx, c.hairDk, cx + 3, cy - 14, 1, 4, 0.6);
    fill(ctx, c.hairHi, cx - 6, cy - 14, 5, 1, 0.5);
    fill(ctx, c.hairHi, cx - 8, cy - 9, 1, 8, 0.35);
    fill(ctx, c.hairHi, cx - 7, cy - 6, 1, 10, 0.2);
    fill(ctx, c.hairDk, cx - 8, cy + 1, 1, 9, 0.22);
    fill(ctx, c.hairDk, cx + 8, cy + 1, 1, 10, 0.22);
    fill(ctx, c.hairHi, cx - 9, cy + 2, 1, 8, 0.3);
    fill(ctx, c.hairHi, cx + 8, cy, 1, 6, 0.18);
    // A loose strand over the shoulder, outside the shoulder line.
    shape(ctx, c.hair, [
      [cx - 8, cy + 9], [cx - 6, cy + 9], [cx - 5, cy + 25],
      [cx - 7, cy + 23],
    ], P.ink);
    fill(ctx, c.hairHi, cx - 7, cy + 12, 1, 9, 0.28);
    // A red pin at her left temple: the one warm object in the hair.
    fill(ctx, P.red3, cx - 6, cy - 11, 3, 2);
    fill(ctx, P.red4, cx - 6, cy - 11, 2, 1);
    fill(ctx, c.hairDk, cx - 6, cy - 9, 3, 1);
  } else {
    shape(ctx, c.hair, [
      [cx - 8, cy + 5], [cx - 8, cy - 2], [cx - 7, cy - 8],
      [cx - 5, cy - 13], [cx - 1, cy - 16], [cx + 4, cy - 15],
      [cx + 7, cy - 12], [cx + 9, cy - 6], [cx + 9, cy - 1],
      [cx + 8, cy + 5],
      [cx + 8, cy + 2], [cx + 8, cy - 3], [cx + 7, cy - 6],
      [cx + 5, cy - 9], [cx + 3, cy - 9], [cx + 1, cy - 10],
      [cx - 2, cy - 9], [cx - 5, cy - 9], [cx - 7, cy - 5],
      [cx - 7, cy + 3],
    ], P.ink);
    // A swept quiff: a little more hair on his right, never a helmet line.
    fill(ctx, c.hair, cx + 1, cy - 18, 4, 3);
    fill(ctx, c.hair, cx + 5, cy - 16, 2, 2);
    fill(ctx, c.hairDk, cx + 2, cy - 15, 5, 1, 0.7);
    // Crown sheen and cool rim on the light side; without them a black
    // head disappears into a black room.
    fill(ctx, c.hairHi, cx - 5, cy - 15, 7, 1, 0.45);
    fill(ctx, c.hairHi, cx - 8, cy - 8, 1, 5, 0.32);
    fill(ctx, c.hairHi, cx + 8, cy - 6, 1, 5, 0.2);
    fill(ctx, c.hairDk, cx - 8, cy, 1, 3, 0.4);
    fill(ctx, c.hairDk, cx + 8, cy, 1, 3, 0.4);
    // Sideburns in front of the ears: one narrow strip, not a second lock.
    fill(ctx, c.hair, cx - 8, cy - 2, 1, 3);
    fill(ctx, c.hair, cx + 8, cy - 2, 1, 3);
    fill(ctx, c.hairDk, cx - 8, cy + 1, 1, 1, 0.5);
  }

  // A turned head shows one ear, on the side away from the gaze.  The near
  // ear is hidden by the cheek; drawing both is what makes a front view
  // read as a mask.
  if (who !== "her") {
    if (turn === 0) {
      ears(ctx, c, cx, cy);
    } else {
      const ex = cx - turn * 7;
      fill(ctx, P.ink, ex - (turn > 0 ? 1 : 0), cy - 1, 2, 4);
      fill(ctx, c.skin, ex, cy, 1, 3);
      fill(ctx, c.skinSh, ex, cy + 1, 1, 1, 0.7);
    }
  }

  /* More of the far temple disappears under the hair, and the far eye loses
   * its outer corner.  One or two pixels; at five-times scale they are the
   * difference between a mask and a face that has turned. */
  if (turn !== 0) {
    const fx = turn > 0 ? cx - 6 : cx + 5;
    fill(ctx, c.hair, fx, cy - 4, 2, 8);
    fill(ctx, c.hairDk, fx, cy - 1, 1, 6, 0.25);
  }

  if (silhouette) {
    fill(ctx, c.skinSh, cx - 3, cy + 7, 6, 1, 0.3);
    return;
  }

  features(ctx, who, c, cx, cy, expression, blink, mouth, turn, gaze);
}

function headSide(ctx, who, c, facingRight, expression, blink, mouth, silhouette = false, cy = -82) {
  const dir = facingRight ? 1 : -1;
  const cx = 1 * dir;
  // Profile shapes are written relative to the head centre; every other part
  // of the rig (neck, ear, eye, mouth) already uses cy too.
  const M = (pts) => pts.map(([x, y]) => [cx + x * dir, cy + y]);

  /* Hair behind (hers to the chest). */
  if (who === "her") {
    shape(ctx, c.hair, M([
      [-1, -14], [-5, -13], [-8, -11], [-10, -7], [-11, -1],
      [-11, 6], [-10, 14], [-9, 22], [-7, 29], [-5, 33],
      [-3, 26], [-3, 18], [-2, 10], [-2, 3], [-1, -4], [-1, -10],
    ]), P.ink);
    fill(ctx, c.hairDk, cx - dir * 9, cy + 2, 2, 20, 0.5);
    fill(ctx, c.hairHi, cx - dir * 8, cy - 6, 1, 8, 0.3);
    fill(ctx, c.hairDk, cx - dir * 5, cy + 8, 1, 16, 0.28);
  } else {
    shape(ctx, c.hair, M([
      [-1, -13], [-5, -12], [-7, -9], [-8, -4], [-8, 0],
      [-6, 2], [-4, 1], [-5, -2], [-4, -5], [-2, -9],
    ]), P.ink);
  }

  /* Neck, in profile. */
  fill(ctx, P.ink, cx - dir * 3, cy + 5, 8, 9);
  fill(ctx, c.skin, cx - dir * 2, cy + 6, 6, 7);
  fill(ctx, c.skinSh, cx - dir * 2, cy + 10, 5, 3, 0.35);
  fill(ctx, c.skinDeep, cx - dir * 2, cy + 12, 6, 1, 0.4);

  /* Profile: forehead, brow, small nose, philtrum, lips, chin, jaw. */
  const face = M([
    [0, -9], [2, -8], [4, -7], [5, -5], [6, -3],
    [6, -1], [7, 0], [8, 1], [8, 2], [7, 3],
    [7, 4], [6, 5], [6, 6], [5, 7], [3, 7],
    [1, 7], [-1, 6], [-2, 4], [-3, 1], [-3, -2],
    [-2, -5], [-1, -8],
  ]);
  shape(ctx, c.skin, face, P.ink);

  fill(ctx, c.skinSh, cx - dir * 2, cy + 1, 2, 5, 0.28);
  fill(ctx, c.skinHi, cx + dir * 5, cy - 5, 1, 4, 0.32);
  fill(ctx, c.skinSh, cx + dir * 7, cy + 3, 1, 1, 0.4);

  /* Ear, behind the cheek. */
  fill(ctx, P.ink, cx - dir * 3, cy - 1, 3, 4);
  fill(ctx, c.skin, cx - dir * 2, cy, 2, 3);
  fill(ctx, c.skinSh, cx - dir * 2, cy + 1, 1, 1, 0.6);

  /* Front hair: crown, a fringe swept forward and a lock by the ear. */
  if (who === "her") {
    shape(ctx, c.hair, M([
      [1, -13], [4, -12], [6, -10], [7, -7], [7, -4],
      [8, -2], [7, -2], [5, -3], [3, -4], [1, -5],
      [-1, -5], [-3, -7], [-5, -10], [-4, -13],
    ]), P.ink);
    fill(ctx, c.hairHi, cx + dir * 1, cy - 11, 5, 1, 0.45);
    fill(ctx, c.hairDk, cx - dir * 4, cy - 7, 2, 8, 0.45);
    fill(ctx, P.red3, cx - dir * 4, cy - 8, 3, 2);
    fill(ctx, P.red4, cx - dir * 4, cy - 8, 2, 1);
  } else {
    shape(ctx, c.hair, M([
      [1, -13], [4, -12], [6, -10], [7, -7], [7, -4],
      [6, -3], [4, -4], [2, -5], [0, -5], [-2, -6],
      [-4, -9], [-4, -12],
    ]), P.ink);
    fill(ctx, c.hairHi, cx + dir * 1, cy - 11, 5, 1, 0.4);
    fill(ctx, c.hair, cx - dir * 6, cy - 2, 2, 4);
  }

  if (silhouette) return;

  /* Near eye: four wide, four tall, with a catchlight. */
  const ey = cy - 3;
  const ex = cx + dir * 3;
  const closed = blink > 0.5 || expression === "closed" || expression === "kiss";
  if (expression === "sad" || expression === "tears" || expression === "hurt") {
    fill(ctx, c.hairDk, cx - dir * 1, cy - 6, 3, 1);
    fill(ctx, c.hairDk, cx + dir * 2, cy - 7, 2, 1);
  } else if (expression === "angry") {
    fill(ctx, c.hairDk, cx - dir * 1, cy - 7, 3, 1);
    fill(ctx, c.hairDk, cx + dir * 2, cy - 6, 2, 1);
  } else {
    fill(ctx, c.hairDk, cx - dir * 1, cy - 6, 4, 1);
  }
  if (expression === "smile" && !closed) {
    fill(ctx, c.hairDk, ex - 1, ey, 1, 1);
    fill(ctx, c.hairDk, ex, ey - 1, 2, 1);
    fill(ctx, c.hairDk, ex + 2, ey, 1, 1);
  } else if (closed) {
    fill(ctx, c.skinSh, ex - 1, ey + 2, 5, 1, 0.5);
    fill(ctx, c.hairDk, ex - 1, ey + 2, 4, 1, 0.85);
  } else {
    // A profile eye is narrower than a front one: white at the back,
    // iris against the lid, and the lash carried past the outer corner.
    fill(ctx, "#ecdbc2", ex - 1, ey, 3, 3);
    fill(ctx, c.iris, ex, ey, 2, 3);
    fill(ctx, c.pupil, ex + 1, ey + 1, 1, 1);
    fill(ctx, "#fff8ea", ex, ey, 1, 1, 0.95);
    fill(ctx, c.irisHi, ex, ey + 2, 2, 1, 0.4);
    fill(ctx, c.hairDk, ex - 1, ey - 1, 4, 1);
    fill(ctx, c.skinSh, ex - 1, ey + 3, 3, 1, 0.35);
  }
  if (expression === "tears") {
    fill(ctx, "#d9eef0", ex, ey + 4, 1, 3, 0.8);
    fill(ctx, "#d9eef0", ex, ey + 7, 1, 1, 0.55);
  }

  /* Nose shadow, lips, chin light. */
  fill(ctx, c.skinSh, cx + dir * 7, cy + 2, 1, 1, 0.5);
  fill(ctx, c.skinDeep, cx + dir * 6, cy + 4, 1, 1, 0.35);
  const my = cy + 4;
  if (expression === "smile") {
    fill(ctx, c.lip, cx + dir * 5, my + 1, 2, 1);
    fill(ctx, c.lip, cx + dir * 4, my, 1, 1);
    fill(ctx, c.skinHi, cx + dir * 5, my + 2, 2, 1, 0.3);
  } else if (expression === "sad" || expression === "tears" || expression === "hurt") {
    fill(ctx, c.lip, cx + dir * 5, my, 2, 1);
    fill(ctx, c.lip, cx + dir * 4, my + 1, 1, 1);
  } else if (expression === "angry") {
    fill(ctx, c.lip, cx + dir * 5, my, 3, 1);
  } else if (mouth > 0.35) {
    fill(ctx, c.lip, cx + dir * 5, my, 3, 2);
    fill(ctx, "#6e3738", cx + dir * 5, my + 1, 2, 1);
  } else if (expression === "kiss") {
    fill(ctx, c.lip, cx + dir * 5, my, 2, 1);
  } else {
    fill(ctx, c.lip, cx + dir * 5, my, 3, 1, 0.9);
    fill(ctx, c.skinHi, cx + dir * 5, my + 1, 2, 1, 0.35);
  }
  if (expression === "smile" || expression === "kiss") {
    fill(ctx, P.rose, cx + dir * 4, cy + 2, 1, 1, 0.3);
  }
}


function legFront(ctx, c, x, footX, hip) {
  shape(ctx, c.trouser, [
    [x - 2, hip + 1], [x + 2, hip + 1], [footX + 2, -8], [footX - 2, -8],
  ], P.ink);
  fill(ctx, c.trouserDk, x - 1, hip - 4, 1, 15, 0.45);
  fill(ctx, c.trouserDk, footX - 1, -18, 1, 7, 0.35);
  fill(ctx, P.ink, footX - 3, -8, 7, 6);
  fill(ctx, c.shoe, footX - 2, -7, 6, 4);
  fill(ctx, c.shoeHi, footX - 2, -7, 3, 1);
  fill(ctx, c.sole, footX - 2, -2, 6, 1);
}

function frontBody(ctx, who, c, pose, phase, arm) {
  const t = phase * Math.PI * 2;
  const breathe = Math.round(Math.sin(t) * 0.5);
  const bob = pose === "walk" ? Math.round(-Math.abs(Math.sin(t))) : breathe;
  const shoulder = -69 + bob;
  const hip = -45 + bob;

  /* Legs, hips to shoes.  Slimmer than the coat: the figure tapers from a
   * narrow waist to the ankle instead of standing on two columns. */
  const stride = pose === "walk" ? Math.sin(t) * 4 : 0;
  for (const side of [-1, 1]) {
    const x = side * 6;
    legFront(ctx, c, x, x + stride * side, hip);
  }

  /* Coat: 28 px across the shoulders, a waist and a soft flare at the hem. */
  const torso = [
    [-3, shoulder], [-9, shoulder + 1], [-13, shoulder + 4],
    [-12, -57], [-9, -50], [-9, -41], [-11, -33],
    [11, -33], [9, -41], [9, -50], [12, -57],
    [13, shoulder + 4], [9, shoulder + 1], [3, shoulder],
  ];
  shape(ctx, c.coat, torso, P.ink);

  /* Shirt in the opening, lapels either side. */
  // Her coat is buttoned under the scarf; his falls open over a shirt.
  if (who !== "her") {
    shape(ctx, c.shirt, [
      [-3, shoulder + 3], [3, shoulder + 3], [1, -54], [-1, -54],
    ]);
    fill(ctx, c.shirtSh, 0, -54, 1, 20, 0.5);
    fill(ctx, c.shirtSh, 2, shoulder + 4, 1, 8, 0.3);
  }

  // Lapels: darker wedges from the collar down toward the chest.  They
  // converge at the top button, so the shirt reads as a V, not a pale strip.
  shape(ctx, c.coatDk, [
    [-6, shoulder + 2], [-2, shoulder + 2], [-1, -56], [-6, -57],
  ], null, 0.85);
  shape(ctx, c.coatDk, [
    [6, shoulder + 2], [2, shoulder + 2], [1, -56], [6, -57],
  ], null, 0.85);
  // The coat closes below the shirt; one seam, not a second column.
  fill(ctx, c.coatDk, 0, -54, 1, 20, 0.5);
  fill(ctx, c.coatHi, -10, shoulder + 5, 1, 12, 0.4);
  fill(ctx, c.coatHi, 10, shoulder + 6, 1, 8, 0.25);
  fill(ctx, c.coatDk, 9, shoulder + 8, 2, 14, 0.45);
  fill(ctx, c.coatDk, -9, -48, 1, 8, 0.35);

  /* Pockets, buttons, hem shadow. */
  fill(ctx, c.coatDk, -8, -45, 4, 1, 0.5);
  fill(ctx, c.coatDk, 4, -45, 4, 1, 0.5);
  fill(ctx, c.coatDk, -10, -35, 20, 2, 0.4);
  fill(ctx, c.coatDk, 0, -56, 1, 1, 0.55);
  fill(ctx, c.coatDk, 0, -49, 1, 1, 0.55);
  fill(ctx, P.gold1, 1, -56, 1, 1, 0.35);

  /* Collar / scarf. */
  // Both of them keep something red at the throat; hers is the scarf she
  // leaves on the seat in act four, his is the short collar of his coat.
  if (who === "her") {
    // Wound high round the throat, knotted on her left.  The band is wide
    // enough to read as wool rather than a necktie.
    shape(ctx, c.accent, [
      [-7, shoulder - 1], [-5, shoulder - 4], [5, shoulder - 4],
      [7, shoulder - 1], [6, shoulder + 4], [-6, shoulder + 4],
    ], P.ink);
    fill(ctx, c.accentHi, -5, shoulder - 3, 9, 1, 0.7);
    fill(ctx, c.accentHi, -4, shoulder, 8, 1, 0.25);
    fill(ctx, c.coatDk, -5, shoulder + 3, 11, 1, 0.3);
    // Knot, hanging just over the lapel.
    fill(ctx, c.accent, -7, shoulder + 2, 4, 6);
    fill(ctx, c.accentHi, -7, shoulder + 2, 1, 5, 0.6);
    fill(ctx, c.coatDk, -4, shoulder + 2, 1, 6, 0.35);
    fill(ctx, c.coatDk, -7, -59, 3, 1, 0.2);
  } else {
    shape(ctx, c.accent, [
      [-6, shoulder + 1], [-3, shoulder - 1], [3, shoulder - 1],
      [6, shoulder + 1], [5, shoulder + 4], [-5, shoulder + 4],
    ], P.ink);
    fill(ctx, c.accentHi, -4, shoulder, 7, 1, 0.65);
    fill(ctx, c.coatDk, -5, shoulder + 3, 10, 1, 0.35);
  }

  // A coat collar standing up beside the neck.  This is what stops the neck
  // from reading as a pale post between the jaw and the scarf.
  shape(ctx, c.coatDk, [
    [-7, shoulder + 2], [-4, shoulder + 2], [-3, shoulder - 3], [-6, shoulder - 2],
  ], P.ink);
  shape(ctx, c.coatDk, [
    [7, shoulder + 2], [4, shoulder + 2], [3, shoulder - 3], [6, shoulder - 2],
  ], P.ink);
  fill(ctx, c.coatHi, -6, shoulder - 1, 1, 3, 0.45);
  fill(ctx, c.coatHi, 6, shoulder - 1, 1, 3, 0.25);

  /* Arms. */
  const arms = {
    down: [[-13, shoulder + 4], [-16, -55 + bob], [-15, -43 + bob]],
    reach: [[-13, shoulder + 4], [-19, -57 + bob], [-25, -60 + bob]],
    up: [[-13, shoulder + 4], [-16, -60 + bob], [-18, -72 + bob]],
    phone: [[-13, shoulder + 4], [-17, -59 + bob], [-11, -73 + bob]],
    hold: [[-13, shoulder + 4], [-11, -55 + bob], [-5, -50 + bob]],
    paint: [[13, shoulder + 4], [17, -58 + bob], [15, -70 + bob]],
    record: [[-13, shoulder + 4], [-9, -56 + bob], [-4, -63 + bob]],
  };
  const left = arms[arm] || arms.down;
  const right = arm === "paint"
    ? [[13, shoulder + 4], [16, -54 + bob], [17, -45 + bob]]
    : [[13, shoulder + 4], [16, -54 + bob], [15, -43 + bob]];
  for (const pts of [left, right]) {
    limb(ctx, pts, c.coat, 4, c.coatDk, [pts[2][0], pts[2][1], c.skin, c.skinSh]);
    fill(ctx, c.coatHi, pts[1][0] - 1, pts[1][1] - 3, 1, 5, 0.35);
  }
}

function sideBody(ctx, who, c, pose, phase, arm, facingRight) {
  const dir = facingRight ? 1 : -1;
  const walk = pose === "walk" || pose === "run";
  const stride = walk ? Math.sin(phase * Math.PI * 2) : 0;
  const bob = walk ? Math.round(Math.abs(Math.sin(phase * Math.PI * 2)) * -1) : 0;
  const shoulder = pose === "sit" ? -45 : -69 + bob;
  const hip = pose === "sit" ? -19 : -45 + bob;

  if (pose === "sit") {
    /* Seated: the head is drawn at cy=-56, so the torso is a normal 22 px
     * from shoulder to seat instead of the old stretched 43 px. */
    fill(ctx, P.ink, -6, -19, 14, 9);
    shape(ctx, c.trouser, [
      [-5, -18], [7, -18], [17, -13], [16, -9], [-4, -9],
    ], P.ink);
    fill(ctx, c.trouserDk, 2, -18, 6, 2, 0.35);
    shape(ctx, c.trouser, [
      [13, -12], [19, -12], [20, -2], [15, -2],
    ], P.ink);
    fill(ctx, c.trouserDk, 15, -10, 3, 6, 0.3);
    fill(ctx, P.ink, 12, -4, 9, 4);
    fill(ctx, c.shoe, 13, -3, 7, 3);
    fill(ctx, c.shoeHi, 14, -3, 4, 1);
    fill(ctx, c.sole, 13, -1, 7, 1);
  } else {
    /* Far leg, then near leg. */
    const far = stride * 5;
    shape(ctx, c.trouserDk, [
      [-6, hip + 1], [-1, hip + 1], [-1 - far, -8], [-6 - far, -8],
    ], P.ink);
    fill(ctx, P.ink, -9 - far, -8, 9, 7);
    fill(ctx, c.shoe, -8 - far, -7, 8, 4);
    fill(ctx, c.sole, -9 - far, -2, 9, 1);

    const near = stride * 7;
    shape(ctx, c.trouser, [
      [1, hip + 1], [7, hip + 1], [7 + near, -8], [1 + near, -8],
    ], P.ink);
    fill(ctx, c.trouserDk, 1, hip - 6, 2, 18, 0.4);
    fill(ctx, P.ink, -3 + near, -8, 9, 7);
    fill(ctx, c.shoe, -2 + near, -7, 8, 4);
    fill(ctx, c.shoeHi, -2 + near, -7, 4, 1);
    fill(ctx, c.sole, -3 + near, -2, 9, 1);
  }

  /* Torso in profile. */
  const torso = pose === "sit"
    ? [[-8, -45], [4, -46], [9, -42], [10, -30], [8, -19], [7, -19], [-6, -19], [-8, -30], [-9, -40]]
    : [[-9, shoulder], [3, shoulder - 1], [9, shoulder + 1], [11, shoulder + 4], [10, -49], [8, hip + 1], [3, hip + 2], [-5, hip + 2], [-8, -49], [-9, -58]];
  shape(ctx, c.coat, torso, P.ink);

  if (pose !== "sit") {
    // His coat falls open over a shirt; hers is buttoned under the scarf.
    if (who !== "her") {
      shape(ctx, c.shirt, [[5, shoulder + 1], [10, shoulder + 2], [10, -50], [5, -50]]);
    } else {
      fill(ctx, c.coatHi, 8, shoulder + 6, 1, 12, 0.3);
      fill(ctx, c.coatDk, 5, -50, 1, 18, 0.4);
    }
    fill(ctx, c.coatDk, -8, shoulder + 4, 3, 18, 0.55);
    fill(ctx, c.coatHi, 7, shoulder + 5, 2, 10, 0.35);
  } else {
    if (who !== "her") {
      shape(ctx, c.shirt, [[4, -44], [8, -44], [8, -28], [4, -28]]);
    }
    fill(ctx, c.coatDk, -7, -41, 3, 12, 0.5);
  }
  fill(ctx, c.coatDk, -6, (pose === "sit" ? -37 : -44) + bob, 6, 1, 0.5);
  fill(ctx, c.coatDk, -7, pose === "sit" ? -20 : -31, 15, 1, 0.4);

  /* Near arm.  Seated arms rest low; standing arms swing from the shoulder. */
  let armPts;
  if (pose === "sit") {
    armPts = [[4, -43], [10, -32], [13, -22]];
    if (arm === "hold") armPts = [[4, -43], [11, -31], [16, -22]];
    else if (arm === "paint") armPts = [[4, -43], [12, -36], [17, -40]];
    else if (arm === "down") armPts = [[4, -43], [7, -31], [8, -22]];
    // Seated wipe: the elbow stays low, only the hand comes up to the cheek.
    // (The seated "phone" poses keep their arm down: the handset is drawn
    // separately by the scene.)
    else if (arm === "wipe") armPts = [[4, -43], [9, -49], [6, -55]];
  } else {
    const swing = walk ? Math.sin(phase * Math.PI * 2 + Math.PI) * 5 : 0;
    armPts = [[4, shoulder + 2], [7 + swing, -54 + bob], [8 + swing, hip + 1]];
    if (arm === "reach") armPts = [[4, shoulder + 2], [14, -56 + bob], [24, -58 + bob]];
    else if (arm === "up") armPts = [[4, shoulder + 2], [9, -61 + bob], [11, -73 + bob]];
    else if (arm === "phone") armPts = [[4, shoulder + 2], [10, -58 + bob], [7, -74 + bob]];
    else if (arm === "hold") armPts = [[4, shoulder + 2], [10, -52 + bob], [20, -48 + bob]];
    else if (arm === "holdout") armPts = [[4, shoulder + 2], [10, -53 + bob], [18, -49 + bob]];
    else if (arm === "holdback") armPts = [[4, shoulder + 2], [0, -54 + bob], [-11, -49 + bob]];
    else if (arm === "paint") armPts = [[4, shoulder + 2], [12, -58 + bob], [19, -66 + bob]];
    else if (arm === "record") armPts = [[4, shoulder + 2], [10, -55 + bob], [3, -63 + bob]];
    else if (arm === "point") armPts = [[4, shoulder + 2], [14, -54 + bob], [26, -52 + bob]];
    else if (arm === "plead") armPts = [[4, shoulder + 2], [12, -52 + bob], [18, -44 + bob]];
    else if (arm === "turn") armPts = [[4, shoulder + 2], [9, -54 + bob], [11, -44 + bob]];
  }
  limb(ctx, armPts, c.coat, 4, c.coatDk, [armPts[2][0], armPts[2][1], c.skin, c.skinSh]);
  // One lit edge so the sleeve reads against the coat.
  fill(ctx, c.coatHi, armPts[1][0] + 1, armPts[1][1] - 2, 1, 6, 0.32);

  /* Collar / scarf, wrapped and with the loose end behind. */
  shape(ctx, c.accent, [
    [-6, shoulder - 2], [7, shoulder - 2], [6, shoulder + 3], [-5, shoulder + 3],
  ], P.ink);
  fill(ctx, c.accentHi, -5, shoulder - 1, 9, 1, 0.7);
  fill(ctx, c.coatDk, -5, shoulder + 2, 11, 1, 0.3);
  fill(ctx, c.accent, -6, shoulder + 3, 3, 6);


  /* Thin red cable for him: a character detail, not a glowing effect. */
  if (who === "him") {
    const neckY = pose === "sit" ? -48 : -70;
    line(ctx, P.red2, 1, neckY, 4, neckY + 12, 1, 0.65);
    line(ctx, P.red2, 4, neckY + 12, 2, neckY + 22, 1, 0.45);
  }
}

function backBody(ctx, who, c, phase) {
  const bob = Math.round(Math.sin(phase * Math.PI * 2));
  const hip = -45 + bob;
  const shoulder = -69 + bob;

  for (const side of [-1, 1]) {
    const x = side * 6;
    shape(ctx, c.trouser, [
      [x - 2, hip + 1], [x + 2, hip + 1], [x + 2, -8], [x - 2, -8],
    ], P.ink);
    fill(ctx, P.ink, x - 4, -8, 9, 7);
    fill(ctx, c.shoe, x - 3, -7, 8, 4);
    fill(ctx, c.shoeHi, x - 3, -7, 4, 1);
    fill(ctx, c.sole, x - 3, -2, 8, 1);
  }

  const torso = [
    [-3, shoulder], [3, shoulder], [8, shoulder + 1], [13, shoulder + 4],
    [12, -57], [9, -50], [9, -41], [11, -33],
    [-11, -33], [-9, -41], [-9, -50], [-12, -57],
    [-13, shoulder + 4], [-8, shoulder + 1],
  ];
  shape(ctx, c.coat, torso, P.ink);
  fill(ctx, c.coatDk, 0, shoulder + 1, 1, 28, 0.45);
  fill(ctx, c.coatHi, -9, shoulder + 5, 1, 12, 0.25);
  fill(ctx, c.coatDk, -10, -35, 20, 2, 0.35);

  /* Arms hanging: four pixels wide, tucked close to the coat. */
  for (const side of [-1, 1]) {
    const x = side * 13;
    limb(ctx, [[x, shoulder + 3], [x + side * 2, -55 + bob], [x + side, hip + 2]],
      c.coat, 4, c.coatDk, [x + side, hip + 2, c.skin, c.skinSh]);
  }

  /* Collar and the back of the neck. */
  fill(ctx, P.ink, -5, shoulder - 6, 10, 8);
  fill(ctx, c.skin, -3, shoulder - 6, 7, 7);
  fill(ctx, c.skinSh, -3, shoulder - 2, 7, 3, 0.3);
  shape(ctx, c.accent, [
    [-8, shoulder - 1], [8, shoulder - 1], [7, shoulder + 3], [-7, shoulder + 3],
  ], P.ink);
  fill(ctx, c.accentHi, -6, shoulder, 8, 1, 0.6);

  /* Head, from behind: skull, hair. */
  ellipse(ctx, P.ink, 0, -82, 9, 10);
  ellipse(ctx, c.skinSh, 0, -82, 8, 9);
  if (who === "her") {
    shape(ctx, c.hair, [
      [-9, -93], [9, -93], [10, -88], [10, -79], [9, -69],
      [8, -59], [6, -51], [3, -49], [2, -55], [2, -63],
      [0, -66], [-3, -62], [-3, -54], [-5, -50], [-7, -52],
      [-9, -61], [-10, -71], [-10, -82],
    ], P.ink);
    fill(ctx, c.hairHi, -6, -92, 11, 2, 0.45);
    fill(ctx, c.hairDk, -1, -87, 2, 23, 0.3);
  } else {
    shape(ctx, c.hair, [
      [-8, -93], [8, -93], [9, -88], [9, -81], [7, -75],
      [4, -72], [-4, -72], [-7, -75], [-9, -81], [-9, -88],
    ], P.ink);
    fill(ctx, c.hairHi, -5, -92, 10, 2, 0.4);
  }
}

/* ---------------------------------------------------------------- public */

export function drawPerson(ctx, who, x, y, opts = {}) {
  if (CRAB_LEADS) return drawCrabPerson(ctx, who, x, y, opts);
  const {
    scale = 1,
    facing = "right",
    view = "side",
    pose = "stand",
    phase = 0,
    expression = "soft",
    outfit = "default",
    alpha = 1,
    silhouette = false,
    blink = 0,
    mouth = 0,
    arm = "down",
    headTilt = 0,
    turn = 0,
    gaze = 0,
  } = opts;

  const c = palette(who, outfit);
  if (opts.barefoot) {
    c.shoe = c.skin;
    c.shoeHi = c.skin;
    c.sole = c.skinSh;
  }
  if (silhouette) {
    const one = opts.silhouetteColor || "#141018";
    for (const k of Object.keys(c)) c[k] = one;
  }

  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(Math.round(x), Math.round(y));
  const dir = facing === "left" ? -1 : 1;
  ctx.scale(scale * (view === "side" ? dir : 1), scale);

  /* Seated figures ride 26 px lower so the shoulders clear the seat back. */
  const headCy = pose === "sit" ? -56 : -82;
  if (view === "back") {
    backBody(ctx, who, c, phase);
  } else if (view === "front") {
    frontBody(ctx, who, c, pose, phase, arm);
    headFront(ctx, who, c, expression, blink, mouth, headTilt, silhouette, headCy, turn, gaze);
  } else {
    sideBody(ctx, who, c, pose, phase, arm, dir > 0);
    headSide(ctx, who, c, dir > 0, expression, blink, mouth, silhouette, headCy);
  }
  ctx.restore();
}

export function drawPortrait(ctx, who, cx, headY, opts = {}) {
  if (CRAB_LEADS) return drawCrabPortrait(ctx, who, cx, headY, opts);
  // The same figure is drawn huge with its feet below the frame.  This keeps
  // a close-up literally built from the same pixels as the wide shot.
  const scale = opts.scale ?? 4;
  const feetY = headY + 97 * scale;
  drawPerson(ctx, who, cx, feetY, {
    ...opts,
    scale,
    view: opts.view || "front",
    pose: "stand",
  });
}

/** Two figures in a backlit embrace, built as one silhouette. */
export function drawEmbrace(ctx, x, y, scale, opts = {}) {
  if (CRAB_LEADS) return drawCrabEmbrace(ctx, x, y, scale, opts);
  const color = opts.color || "#151019";
  const alpha = opts.alpha ?? 1;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale, scale);
  // His shoulders, head and jaw.
  shape(ctx, color, [
    [-18, -60], [-12, -66], [-6, -70], [-5, -80], [-8, -88],
    [-5, -95], [2, -98], [8, -94], [9, -85], [7, -76],
    [10, -70], [16, -66], [20, -45], [14, -34], [-14, -34], [-20, -47],
  ]);
  // Her shoulders and head, leaning in, a little higher.
  shape(ctx, color, [
    [8, -56], [14, -63], [15, -74], [18, -84], [24, -90],
    [31, -86], [32, -77], [29, -70], [33, -62], [32, -36], [12, -35],
  ]);
  // Arms crossing each other's backs.
  line(ctx, color, -14, -58, 21, -52, 7);
  line(ctx, color, 31, -57, 0, -47, 6);
  // Her hair, falling past the shoulders.
  shape(ctx, color, [
    [14, -90], [24, -91], [31, -86], [33, -76], [32, -64],
    [29, -55], [26, -52], [26, -63], [23, -72], [18, -78],
  ]);
  // Legs, simplified.
  fill(ctx, color, -14, -35, 11, 35);
  fill(ctx, color, 1, -35, 11, 35);
  fill(ctx, color, 11, -34, 9, 34);
  fill(ctx, color, 22, -35, 8, 35);
  ctx.restore();
}

export function drawHand(ctx, x, y, who = "him", scale = 1, opts = {}) {
  if (CRAB_LEADS) return drawCrabHand(ctx, x, y, who, scale, opts);
  const c = palette(who, opts.outfit || "default");
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale, scale);
  fill(ctx, P.ink, -7, -3, 14, 10);
  fill(ctx, c.skin, -6, -2, 12, 8);
  fill(ctx, c.skinSh, 2, -1, 3, 7, 0.45);
  // Four finger separations, not four teeth.
  for (let i = 0; i < 4; i++) {
    fill(ctx, c.skinSh, -5 + i * 3, 5, 1, 3, 0.65);
    fill(ctx, P.ink, -5 + i * 3, 8, 1, 1, 0.55);
  }
  fill(ctx, c.skinHi, -5, -1, 3, 1, 0.4);
  if (opts.ring) fill(ctx, P.gold2, 1, 1, 2, 1);
  ctx.restore();
}

/** A forearm and open hand seen at the side, used for the film's macro shots.
 *  dir = 1 reaches from the left toward the right, dir = -1 the reverse.
 *  Keeping this separate from the tiny drawHand silhouette means the hands in
 *  close-up use the same wrist, cuff and skin colours as the full figures.
 */
export function drawReachingHand(ctx, x, y, dir = 1, scale = 1, opts = {}) {
  if (CRAB_LEADS) return drawCrabReachingHand(ctx, x, y, dir, scale, opts);
  const c = palette(opts.who || "her", opts.outfit || "default");
  const sleeve = opts.sleeve || c.coat;
  const sleeveHi = opts.sleeveHi || c.coatHi;
  const skin = opts.skin || c.skin;
  const skinSh = opts.skinSh || c.skinSh;
  const skinDeep = opts.skinDeep || c.skinDeep;

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale * dir, scale);

  // Forearm, cuff and the shadow under the wrist.
  fill(ctx, P.ink, -36, -11, 31, 23);
  fill(ctx, sleeve, -35, -10, 29, 21);
  fill(ctx, sleeveHi, -34, -9, 20, 2, 0.8);
  fill(ctx, c.coatDk, -34, 3, 27, 6, 0.35);
  fill(ctx, P.ink, -8, -11, 4, 22);
  fill(ctx, skinSh, -6, -8, 3, 15);

  // Palm.
  fill(ctx, P.ink, -5, -10, 22, 21);
  fill(ctx, skin, -4, -8, 19, 17);
  fill(ctx, c.skinHi, 2, -7, 7, 2, 0.25);
  fill(ctx, skinSh, 5, -7, 10, 16, 0.28);
  fill(ctx, skinSh, 0, 3, 12, 1, 0.4);
  fill(ctx, skinDeep, 1, 7, 5, 1, 0.3);

  // Thumb, raised on the near side.
  fill(ctx, P.ink, 1, -14, 13, 7);
  fill(ctx, skin, 3, -13, 10, 5);
  fill(ctx, skinSh, 4, -10, 8, 1, 0.55);
  fill(ctx, skinDeep, 11, -10, 1, 2, 0.4);

  // Four fingers reaching forward.  They sit shoulder to shoulder with a
  // one-pixel ink seam, so the hand reads as a solid mass instead of a comb.
  // Lengths shorten toward the pinky and the middle finger leads.
  const lens = [12, 16, 15, 10];
  for (let i = 0; i < 4; i++) {
    const fy = -10 + i * 4;
    const len = lens[i];
    fill(ctx, P.ink, 13, fy, len + 2, 4);
    fill(ctx, skin, 14, fy, len, 3);
    fill(ctx, skin, 14 + len, fy + 1, 1, 1);
    fill(ctx, skinSh, 14 + len - 3, fy, 3, 3, 0.45);
    fill(ctx, skinDeep, 22, fy, 1, 1, 0.2);
  }
  // Webbing across the proximal phalanges: the seams only open near the tips,
  // so the hand reads as a mass with fingers rather than a fork.
  fill(ctx, skin, 14, -10, 8, 16);
  fill(ctx, skin, 22, -9, 2, 10);
  fill(ctx, skinSh, 15, -10, 1, 16, 0.18);
  fill(ctx, skinSh, 21, -9, 1, 10, 0.12);
  // Knuckle shading where the fingers leave the palm.
  fill(ctx, skinSh, 15, -10, 1, 16, 0.22);
  if (opts.ring) {
    fill(ctx, P.gold2, 15, -2, 3, 1);
    fill(ctx, P.gold1, 16, -1, 2, 1);
  }
  ctx.restore();
}
