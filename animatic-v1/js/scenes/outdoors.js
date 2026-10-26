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

function drawMountainBackdrop(ctx, t, opts = {}) {
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

function drawTrailWide(ctx, t, globalT, assets) {
  drawMountainBackdrop(ctx, t, { scroll: 20 });

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

  const q = smoothstep(clamp((globalT - 168.9) / 9.0));
  const [mx, my] = pointAt(q);
  const [fx, fy] = pointAt(Math.max(0, q - 0.035));
  const walk = Math.floor(globalT * 5.2) % 6;
  drawSpriteScaled(ctx, assets.sprites, "male", `walk_side_${walk}`, mx, my - 2, 1, {
    image: assets.variants.casualMale,
  });
  drawSpriteScaled(ctx, assets.sprites, "female", `walk_side_${(walk + 2) % 6}`, fx, fy - 2, 1, {
    image: assets.variants.casualFemale,
  });

  // Heights: a few tiny birds, wind in the grass.
  for (let i = 0; i < 12; i++) {
    fill(ctx, "#6f8a62", (i * 61 + Math.sin(t + i) * 4) % W, 322 + (i % 3), 2, 1);
  }
  drawVignette(ctx, 0.18);
}

function drawSummit(ctx, t) {
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

function drawKiss(ctx, t) {
  // The world goes soft and warm; two silhouettes meet.
  vBands(ctx, 0, 0, W, H, [
    ["#b38882", 1],
    ["#d5a07f", 1],
    ["#e7bb8e", 1],
    ["#f2d1a2", 0.7],
  ]);
  pixelCircle(ctx, "#fff0c8", 330, 170, 84);

  // A few suggestion-of-trees at the edges.
  fill(ctx, "#5b4a45", 0, 210, 120, 150);
  fill(ctx, "#6a554b", 540, 210, 100, 150);
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 10; i++) {
    fill(ctx, "#8a6a5c", i * 18, 160 + (i % 4) * 18, 2, 80);
  }
  ctx.globalAlpha = 1;

  const lean = smoothstep(clamp((t - 26.15) / 1.05));
  const cxL = lerp(286, 298, lean);
  const cxR = lerp(362, 350, lean);
  const cy = 172;

  // Bodies / shoulders.
  fill(ctx, "#2a2230", cxL - 58, cy + 26, 116, 120);
  fill(ctx, "#2a2230", cxR - 56, cy + 28, 112, 118);
  // Necks.
  fill(ctx, "#2a2230", cxL + 2, cy + 18, 18, 22);
  fill(ctx, "#2a2230", cxR - 20, cy + 18, 18, 22);

  // Male head: short hair, profile to the right.
  pixelCircle(ctx, "#2a2230", cxL, cy, 30);
  fill(ctx, "#221f2a", cxL - 34, cy - 30, 44, 16);
  fill(ctx, "#221f2a", cxL - 36, cy - 18, 18, 20);
  fill(ctx, "#2a2230", cxL + 27, cy + 2, 9, 8); // nose
  // Female head: long hair, profile to the left.
  pixelCircle(ctx, "#2a2230", cxR, cy + 1, 29);
  fill(ctx, "#221f2a", cxR - 12, cy - 30, 46, 18);
  fill(ctx, "#221f2a", cxR + 18, cy - 22, 18, 62); // hair falling behind
  fill(ctx, "#221f2a", cxR + 28, cy - 4, 8, 48);
  fill(ctx, "#2a2230", cxR - 33, cy + 2, 9, 8); // nose

  // Rim light along the two profiles.
  const rim = 0.55 + 0.12 * Math.sin(t * 2.1);
  ctx.globalAlpha = rim;
  for (let i = -18; i <= 12; i++) {
    const yy = cy + i;
    if (i < -10) fill(ctx, "#ffd9a0", cxL + 25 - Math.abs(i + 12), yy, 1, 1);
    if (i > -14) fill(ctx, "#ffd9a0", cxR - 26 + Math.abs(i + 10), yy, 1, 1);
  }
  ctx.globalAlpha = 1;

  // A hand resting at the shoulder, kept as silhouette.
  fill(ctx, "#2a2230", cxL + 20, cy + 52, 30, 8);
  fill(ctx, "#2a2230", cxR - 44, cy + 58, 24, 7);

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
