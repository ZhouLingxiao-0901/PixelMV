/* End card.  The story is an original interpretation, and says so. */

import {
  W, H, P, fill, line, circle, ellipse, dither, glow, dust, grain,
  vignette, alphaRect, text, ticket,
} from "../art.js";

const clamp01 = (v) => Math.max(0, Math.min(1, v));

export function endCard(ctx, t, shot, local) {
  fill(ctx, "#07060a", 0, 0, W, H);
  // A last ellipse of projector light, fading.
  glow(ctx, 320, 142, 420, 240, P.red1, 0.12);
  glow(ctx, 320, 142, 210, 130, P.red3, 0.045);
  dust(ctx, t, 100, 30, 440, 220, 18, P.warm3, 0.28 * clamp01((2.6 - local) / 1.0));
  // Frame line.
  fill(ctx, "#3d1a1e", 92, 38, 456, 1, 0.5);
  fill(ctx, "#3d1a1e", 92, 322, 456, 1, 0.35);
  // Title.
  const titleA = clamp01(local / 0.7);
  text(ctx, "红", 320, 76, {
    size: 84, color: P.red3, align: "center", bold: true, shadow: true,
    shadowColor: "#1c090c", threshold: 72, alpha: titleA * 0.96,
  });
  fill(ctx, P.red2, 260, 178, 120, 1, 0.4 * titleA);
  text(ctx, "罗 言", 320, 186, {
    size: 12, color: P.cream, align: "center", letterSpacing: 6, threshold: 62,
    alpha: clamp01((local - 0.4) / 0.7) * 0.9,
  });
  text(ctx, "A  PIXEL  MUSIC  FILM", 320, 208, {
    size: 7, color: P.cream2, align: "center", letterSpacing: 4, shadow: false,
    threshold: 55, alpha: clamp01((local - 0.7) / 0.7) * 0.6,
  });
  // The small ticket, the only red object besides the title.
  ticket(ctx, 296, 258, 48, 24, { title: "影院", sub: "ADMIT ONE · 7:10" });
  // The statement itself lives in the About panel; the card stays quiet.
  const ca = clamp01((local - 1.0) / 0.9);
  // Tiny production mark.
  text(ctx, "35MM  ·  2026  ·  影院", 320, 316, {
    size: 6, color: "#8e6d63", align: "center", shadow: false, threshold: 50,
    alpha: ca * 0.45, letterSpacing: 2,
  });
  grain(ctx, t, 0.04);
  vignette(ctx, 0.55);
  // Fade the whole card out at the very end of the song, grain included, so
  // the final frame is true black.
  const out = clamp01((local - 2.30) / 0.66);
  if (out > 0) alphaRect(ctx, P.black, 0, 0, W, H, out);
}
