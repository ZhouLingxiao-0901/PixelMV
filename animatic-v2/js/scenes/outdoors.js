import { PAL } from "../../../js/engine/palette.js";
import { clamp, lerp, smoothstep } from "../../../js/engine/util.js";
import {
  W, H, fill, vBands, dither, pixelCircle, drawSpriteScaled,
  drawDust, drawBirds, drawCloud, drawVignette,
} from "../art.js";

function ridge(ctx, cx, baseY, height, halfWidth, color, snow = null) {
  for (let y = 0; y < height; y++) {
    const t = y / height;
    const w = Math.round(halfWidth * t);
    fill(ctx, color, cx - w, baseY - height + y, w * 2, 1);
    if (snow && y < height * 0.26 && (y + Math.floor(cx)) % 3 !== 0) {
      fill(ctx, snow, cx - w, baseY - height + y, w * 2, 1);
    }
  }
}

export function drawMountainBackdrop(ctx, t, opts = {}) {
  const scroll = opts.scroll || 0;
  const high = opts.high || 0;

  vBands(ctx, 0, 0, W, 250, [
    ["#5d7892", 1],
    ["#8fa3ac", 1],
    ["#c8b99e", 1],
    ["#e4c39c", 0.7],
  ]);

  pixelCircle(ctx, "#ffe2ad", 512 - scroll * 0.03, 78 + high * 4, 24);
  drawCloud(ctx, 74 - scroll * 0.05, 66, 1.2, "rgba(255,255,255,0.22)");
  drawCloud(ctx, 356 - scroll * 0.04, 104, 1.5, "rgba(255,255,255,0.16)");
  drawBirds(ctx, t, 300, 54, 5, "#4a5262");

  // Far ridge.
  ridge(ctx, 70 - scroll * 0.06, 250, 118, 190, "#6f7f8f", "#c9d0cd");
  ridge(ctx, 286 - scroll * 0.05, 252, 150, 230, "#657787", "#c2cac8");
  ridge(ctx, 548 - scroll * 0.07, 250, 100, 170, "#738392", "#ccd2ce");

  // Mid and near ridges.
  ridge(ctx, 140 - scroll * 0.12, 286, 94, 240, "#4e6656");
  ridge(ctx, 430 - scroll * 0.1, 290, 112, 280, "#435b4c");
  ridge(ctx, 620 - scroll * 0.16, 300, 80, 160, "#3a5044");

  // Near forest silhouette.
  for (let i = 0; i < 22; i++) {
    const x = i * 38 - (scroll * 0.3) % 38 - 20;
    const base = 326 + (i % 4) * 4;
    const h = 34 + (i * 13) % 46;
    fill(ctx, "#2d4036", x, base - h, 3, h);
    for (let j = 0; j < 4; j++) {
      const w = 26 - j * 5;
      fill(ctx, "#33493c", x + 1 - w / 2, base - h + j * 8, w, 5);
    }
  }

  // Foreground slope.
  fill(ctx, "#3a4a3b", 0, 318, W, 42);
  fill(ctx, "#46543f", 0, 318, W, 3);
  dither(ctx, "#526044", 0, 322, W, 38, 3, 1);
}

export function drawTrailWide(ctx, t, globalT, assets, opts = {}) {
  drawMountainBackdrop(ctx, t, { scroll: 20 + (opts.scroll || 0) });

  // Switchback path.
  const pts = [
    [70, 338], [220, 306], [150, 264], [330, 236], [270, 204], [430, 180],
  ];
  const drawPath = (width, color) => {
    for (let s = 0; s < pts.length - 1; s++) {
      const [x0, y0] = pts[s];
      const [x1, y1] = pts[s + 1];
      const steps = 28;
      for (let i = 0; i < steps; i++) {
        const q = i / steps;
        const x = lerp(x0, x1, q);
        const y = lerp(y0, y1, q);
        fill(ctx, color, x - width / 2, y, width, 5);
      }
    }
  };
  drawPath(22, "#6b5b46");
  drawPath(15, "#8b7656");
  drawPath(4, "#a08b69");

  const pointAt = (q) => {
    const total = pts.length - 1;
    const k = clamp(q, 0, 0.9999) * total;
    const i = Math.floor(k);
    const f = k - i;
    return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)];
  };

  const q = opts.progress ?? smoothstep(clamp((globalT - 168.9) / 9.0));
  const [mx, my] = pointAt(q);
  const [fx, fy] = pointAt(Math.max(0, q - 0.035));
  const walk = Math.floor((opts.walkT ?? globalT) * 5.2) % 6;
  const figures = opts.figures !== false;
  if (figures) {
    // V2 holds the wide long enough to need readable walkers; V1's tiny
    // figures made the switchback feel empty.
    const fs = opts.figureScale ?? 1.3;
    drawSpriteScaled(ctx, assets.sprites, "male", `walk_side_${walk}`, mx, my - 2, fs, {
      image: assets.variants.casualMale,
    });
    drawSpriteScaled(ctx, assets.sprites, "female", `walk_side_${(walk + 2) % 6}`, fx, fy - 2, fs, {
      image: assets.variants.casualFemale,
    });
  }

  // Heights: a few tiny birds, wind in the grass.
  for (let i = 0; i < 12; i++) {
    fill(ctx, "#6f8a62", (i * 61 + Math.sin(t + i) * 4) % W, 322 + (i % 3), 2, 1);
  }
  drawVignette(ctx, 0.18);
}

export function drawSummit(ctx, t) {
  drawMountainBackdrop(ctx, t, { scroll: 10, high: 1 });

  // Rock ledge.
  fill(ctx, "#5a5751", 0, 300, W, 60);
  fill(ctx, "#6f6a62", 0, 300, W, 4);
  fill(ctx, "#4c4842", 0, 322, W, 38);
  for (let i = 0; i < 9; i++) {
    fill(ctx, "#7c766b", 20 + i * 74, 312 + (i % 3) * 4, 20, 2);
  }

  // Wind streaks.
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 7; i++) {
    fill(ctx, "#f2eee2", 40 + ((i * 97 + t * 30) % 560), 150 + i * 17, 24, 1);
  }
  ctx.globalAlpha = 1;

  drawBirdPair(ctx, t);
  drawVignette(ctx, 0.2);
}

function drawBirdPair(ctx, t) {
  drawBirds(ctx, t, 420, 88, 3, "#3a3344");
}

export function drawKiss(ctx, t, opts = {}) {
  // The world goes soft and warm; two silhouettes meet.
  vBands(ctx, 0, 0, W, H, [
    ["#b38882", 1],
    ["#d5a07f", 1],
    ["#e7bb8e", 1],
    ["#f2d1a2", 0.7],
  ]);
  pixelCircle(ctx, "#fff0c8", 330, 176, 94);

  // Distant banks at the edges, low enough to leave the profiles clean.
  fill(ctx, "#6a5048", 0, 278, 118, 82);
  fill(ctx, "#75584d", 0, 278, 96, 3);
  fill(ctx, "#644b44", 522, 288, 118, 72);
  fill(ctx, "#71554b", 544, 288, 96, 3);
  ctx.globalAlpha = 0.26;
  for (let i = 0; i < 9; i++) {
    fill(ctx, "#8a6a5c", 12 + i * 12, 248 + (i % 3) * 9, 2, 40);
    fill(ctx, "#8a6a5c", 540 + i * 11, 258 + (i % 3) * 8, 2, 36);
  }
  ctx.globalAlpha = 1;

  const lean = opts.lean ?? smoothstep(clamp((t - 26.15) / 1.05));
  const cy = 176;
  const cxL = lerp(287, 299, lean);
  const cxR = lerp(373, 361, lean);
  const r = 36;

  // Two shoulder masses that merge into one dark silhouette at the bottom.
  for (let y = cy + 24; y < 360; y += 2) {
    const q = (y - (cy + 24)) / (360 - (cy + 24));
    const half = 16 + q * 48;
    fill(ctx, "#2a2230", cxL - 6 - half, y, half * 2, 2);
    fill(ctx, "#2a2230", cxR + 6 - half, y, half * 2, 2);
  }

  // Heads: male profile facing right, female profile facing left.
  pixelCircle(ctx, "#2a2230", cxL, cy, r);
  pixelCircle(ctx, "#2a2230", cxR, cy, r);
  fill(ctx, "#2a2230", cxL + r - 8, cy + 1, 8, 7);   // his nose
  fill(ctx, "#2a2230", cxR - r + 1, cy + 1, 8, 7);   // her nose

  // Hair.
  fill(ctx, "#221f2a", cxL - r + 2, cy - r + 4, r + 8, 12);
  fill(ctx, "#221f2a", cxL - r - 2, cy - r + 10, 12, 26);
  fill(ctx, "#221f2a", cxL - r + 4, cy - r - 2, r - 2, 5);
  fill(ctx, "#221f2a", cxR - 6, cy - r + 2, r + 4, 22);
  fill(ctx, "#221f2a", cxR + r - 6, cy - r + 12, 16, 40);
  fill(ctx, "#221f2a", cxR + r + 2, cy - 2, 8, 70);
  fill(ctx, "#221f2a", cxR + r - 2, cy + 46, 7, 46);
  fill(ctx, "#1d1a24", cxR + 8, cy - r + 4, 3, 14);

  // Rim light along the profiles, top of the heads and facing edges.
  const rim = 0.55 + 0.12 * Math.sin(t * 2.1);
  ctx.globalAlpha = rim;
  for (let i = -r + 6; i <= r - 12; i++) {
    const yy = cy + i;
    const half = Math.sqrt(Math.max(0, r * r - i * i));
    fill(ctx, "#ffd9a0", Math.round(cxL + half - 1), yy, 1, 1);
    fill(ctx, "#ffd9a0", Math.round(cxR - half), yy, 1, 1);
  }
  for (let x = -r + 6; x <= r - 10; x++) {
    const hh = Math.sqrt(Math.max(0, r * r - x * x));
    fill(ctx, "#ffcf92", cxL + x, Math.round(cy - hh), 1, 1);
    fill(ctx, "#ffcf92", cxR + x, Math.round(cy - hh), 1, 1);
  }
  // Warm edge on his shoulder.
  for (let i = 0; i < 22; i++) {
    fill(ctx, "#e8a977", cxL - 34 + i, cy + 32 + i, 1, 1);
  }
  ctx.globalAlpha = 1;

  // A hand resting at the shoulder, kept as silhouette.
  fill(ctx, "#2a2230", cxL + 26, cy + 58, 28, 8);
  fill(ctx, "#2a2230", cxR - 40, cy + 64, 22, 7);

  // Warm dust / fireflies.
  ctx.globalAlpha = 0.55;
  for (let i = 0; i < 24; i++) {
    const x = (i * 61 + t * 9) % W;
    const y = 90 + ((i * 37 + Math.sin(t + i) * 8) % 190);
    fill(ctx, i % 3 ? "#ffe4b0" : "#ffd9a0", x, y, i % 5 === 0 ? 2 : 1, 1);
  }
  ctx.globalAlpha = 1;

  // A soft bloom over the contact point.
  ctx.globalAlpha = 0.1 + 0.03 * Math.sin(t * 2.3);
  fill(ctx, "#fff3d8", 260, 110, 160, 130);
  ctx.globalAlpha = 1;
  drawVignette(ctx, 0.2);
}

export function createHiking(assets) {
  return {
    id: "hiking",
    draw(ctx, t, globalT) {
      if (t < 8.0) {
        drawMountainBackdrop(ctx, t, { scroll: t * 13 });
        fill(ctx, "#7c6a4f", 0, 302, W, 34);
        fill(ctx, "#8f7b5b", 0, 302, W, 3);
        dither(ctx, "#6b5b46", 0, 308, W, 28, 4, 0);
        for (let i = 0; i < 14; i++) {
          const x = i * 52 - (t * 13 * 0.5) % 52;
          fill(ctx, "#435c45", x, 296, 12, 6);
          fill(ctx, "#596e4b", x + 2, 294, 6, 4);
        }
        const walk = Math.floor(globalT * 6.4) % 6;
        const bob = walk === 1 || walk === 4 ? -1 : 0;
        drawSpriteScaled(ctx, assets.sprites, "male", `walk_side_${walk}`, 250, 318 + bob, 1.6, {
          image: assets.variants.casualMale,
        });
        drawSpriteScaled(ctx, assets.sprites, "female", `walk_side_${(walk + 2) % 6}`, 392, 318 + bob, 1.6, {
          image: assets.variants.casualFemale,
        });
        drawDust(ctx, globalT, 0, 90, W, 180, 24, PAL.warm, 0.7);
        drawVignette(ctx, 0.2);
      } else if (t < 16.0) {
        drawTrailWide(ctx, t, globalT, assets);
      } else if (t < 22.0) {
        drawSummit(ctx, t);
        const turn = smoothstep(clamp((t - 20.0) / 1.4));
        const walk = Math.floor(t * 3) % 4;
        drawSpriteScaled(ctx, assets.sprites, "male", `idle_side_${walk}`, 268, 310, 2.0, {
          image: assets.variants.casualMale,
        });
        drawSpriteScaled(ctx, assets.sprites, "female", `${turn > 0.5 ? "look_side" : "idle_side"}_${Math.floor(t * 2.5) % 2}`, 392, 310, 2.0, {
          image: assets.variants.casualFemale,
        });
        // Wind in her hair.
        ctx.globalAlpha = 0.7;
        for (let i = 0; i < 14; i++) {
          fill(ctx, "#2a2230", 416 + i, 206 + ((i * 3 + Math.floor(t * 5)) % 7), 1, 3);
        }
        ctx.globalAlpha = 1;
      } else if (t < 26.2) {
        // The last quiet look before the kiss: stay with them on the summit
        // instead of cutting to oversized portrait crops.
        const q = smoothstep(clamp((t - 22.0) / 4.2));
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.translate(W / 2, H / 2);
        ctx.scale(1.0 + q * 0.14, 1.0 + q * 0.14);
        ctx.translate(-W / 2, -H / 2);
        drawSummit(ctx, t);

        const lean = smoothstep(clamp((t - 24.2) / 1.8));
        const mx = lerp(258, 274, lean);
        const fx = lerp(398, 380, lean);
        drawSpriteScaled(ctx, assets.sprites, "male", `idle_side_${Math.floor(t * 2) % 4}`, mx, 310, 2.4, {
          image: assets.variants.casualMale,
        });
        drawSpriteScaled(ctx, assets.sprites, "female", `look_side_${Math.floor(t * 2) % 2}`, fx, 310, 2.4, {
          image: assets.variants.casualFemale,
          flipX: true,
        });
        // Wind in her hair.
        ctx.globalAlpha = 0.7;
        for (let i = 0; i < 14; i++) {
          fill(ctx, "#2a2230", fx + 24 + i, 206 + ((i * 3 + Math.floor(t * 5)) % 7), 1, 3);
        }
        ctx.globalAlpha = 1;
        ctx.restore();
        drawDust(ctx, t, 0, 70, W, 240, 26, PAL.warm, 0.9);
      } else {
        drawKiss(ctx, t);
      }
    },
  };
}
