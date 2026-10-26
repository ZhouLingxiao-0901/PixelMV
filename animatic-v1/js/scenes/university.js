import { PAL } from "../../../js/engine/palette.js";
import { clamp, smoothstep } from "../../../js/engine/util.js";
import {
  W, H, fill, vBands, dither, pixelCircle, glow, drawSpriteScaled,
  drawSnow, drawDust, drawWindow, drawVignette,
} from "../art.js";

function drawDormHalf(ctx, assets, ox, opts = {}) {
  const female = opts.female;
  const t = opts.t || 0;
  const lightOn = opts.lightOn !== false;

  // Wall, dado rail, floor.
  fill(ctx, female ? "#3d3e49" : "#37414e", ox, 0, 320, 206);
  fill(ctx, female ? "#3a3b46" : "#343c48", ox, 206, 320, 90);
  fill(ctx, female ? "#33343e" : "#2e3642", ox, 203, 320, 3);
  fill(ctx, female ? "#3f3f4a" : "#39424e", ox, 0, 320, 10);
  fill(ctx, "#2b2f3a", ox, 296, 320, 64);
  fill(ctx, "#353a45", ox, 296, 320, 3);
  for (let i = 0; i < 6; i++) {
    fill(ctx, "#252a34", ox + 10 + i * 54, 312 + (i % 3) * 12, 34, 2);
  }

  // A rug softens the empty floor.
  fill(ctx, female ? "#453d48" : "#36424c", ox + 84, 304, 156, 14);
  fill(ctx, female ? "#4d4452" : "#3e4b56", ox + 88, 304, 148, 2);

  // A single cold window, with curtains.
  const wx = female ? ox + 186 : ox + 30;
  drawWindow(ctx, wx, 42, 100, 94, "night", t);
  fill(ctx, female ? "#4a3f46" : "#3c404c", wx - 7, 38, 7, 102);
  fill(ctx, female ? "#4a3f46" : "#3c404c", wx + 100, 38, 7, 102);
  fill(ctx, "#2a2e39", wx - 7, 38, 114, 3);

  // Bed, opposite the window.
  const bx = female ? ox + 10 : ox + 196;
  fill(ctx, "#2b2a33", bx, 252, 104, 44);
  fill(ctx, "#3d3742", bx - 2, 246, 108, 8);
  fill(ctx, "#5b5360", bx + 3, 238, 98, 12);
  fill(ctx, female ? "#8a7d86" : "#7b7b86", bx + 5, 232, 32, 8);
  fill(ctx, female ? "#5a4a58" : "#4a5260", bx + 36, 238, 64, 10);
  fill(ctx, female ? "#6c5a68" : "#566173", bx + 82, 240, 18, 10);
  fill(ctx, "#34303b", bx + 2, 294, 4, 20);
  fill(ctx, "#34303b", bx + 98, 294, 4, 20);

  // Desk and chair under the window.
  const dx = female ? ox + 194 : ox + 26;
  fill(ctx, "#4a3b31", dx, 246, 106, 7);
  fill(ctx, "#3a2e27", dx + 4, 253, 4, 42);
  fill(ctx, "#3a2e27", dx + 96, 253, 4, 42);
  fill(ctx, "#3a3038", dx + 46, 258, 30, 4);
  fill(ctx, "#2f2830", dx + 48, 262, 3, 34);
  fill(ctx, "#2f2830", dx + 72, 262, 3, 34);

  // Lamp and clutter.
  fill(ctx, "#353040", dx + 72, 214, 22, 26);
  fill(ctx, "#4a4556", dx + 70, 238, 26, 3);
  fill(ctx, "#d9a441", dx + 76, 218, 14, 5);
  if (lightOn) {
    glow(ctx, assets.fx.glowWarm, dx + 82, 216, 96, 96, 0.18);
    fill(ctx, "#ffd9a0", dx + 78, 218, 10, 3);
  }
  fill(ctx, "#6b5443", dx + 8, 236, 18, 9);
  fill(ctx, "#8d7058", dx + 9, 233, 16, 3);
  fill(ctx, "#5f5b52", dx + 28, 238, 12, 7);
  fill(ctx, "#c8b6a4", dx + 54, 238, 7, 8);
  fill(ctx, "#8d7058", dx + 55, 236, 5, 2);

  if (female) {
    fill(ctx, "#3f5d4a", dx + 88, 222, 6, 18);
    fill(ctx, "#88a06e", dx + 84, 214, 14, 10);
    fill(ctx, "#3f5d4a", dx + 88, 208, 7, 7);
    // A framed photo above the bed.
    fill(ctx, "#5a4a44", bx + 34, 158, 38, 48);
    fill(ctx, "#8e7f6e", bx + 36, 160, 34, 44);
    fill(ctx, "#c8b6a4", bx + 40, 166, 26, 22);
    fill(ctx, "#6b5a52", bx + 42, 190, 22, 10);
  } else {
    fill(ctx, "#5b4a3e", bx + 22, 210, 30, 26);
    fill(ctx, "#6b5443", bx + 24, 208, 26, 4);
    fill(ctx, "#8d7058", bx + 44, 214, 2, 20);
    // A poster above the bed.
    fill(ctx, "#3f4a5a", bx + 34, 156, 40, 48);
    fill(ctx, "#55647a", bx + 36, 158, 36, 44);
    fill(ctx, "#8fa3ac", bx + 40, 174, 28, 3);
    fill(ctx, "#d8cfbe", bx + 42, 182, 16, 2);
  }

  // The phone, face down on the bed.
  const px = female ? bx + 40 : bx + 56;
  fill(ctx, "#10131b", px, 233, 18, 7);
  fill(ctx, "#2a3144", px + 1, 232, 16, 2);
  if (opts.phoneLit) {
    ctx.globalAlpha = 0.5;
    fill(ctx, "#9fc7d8", px + 2, 234, 14, 4);
    ctx.globalAlpha = 1;
    glow(ctx, assets.fx.glowBlue, px + 9, 238, 40, 40, 0.24);
  }

  // Character standing by the bed, turned toward the phone (or away).
  const cx = female ? ox + 166 : ox + 154;
  const frame = opts.frame || "look_side_0";
  fill(ctx, "rgba(16,20,28,0.55)", cx - 24, 328, 48, 4);
  drawSpriteScaled(ctx, assets.sprites, female ? "female" : "male", frame, cx, 332, 1.6, {
    image: female ? assets.variants.uniFemale : assets.variants.uniMale,
    flipX: female,
  });

  // Cold night grade.
  ctx.globalAlpha = female ? 0.14 : 0.12;
  fill(ctx, "#8aa6c0", ox, 0, 320, H);
  ctx.globalAlpha = 1;
}

function drawSplitDorm(ctx, assets, t, localT) {
  ctx.save();
  const zoom = 1.0 + smoothstep(clamp(localT / 6)) * 0.028;
  ctx.imageSmoothingEnabled = false;
  ctx.translate(W / 2, H / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-W / 2, -H / 2);

  drawDormHalf(ctx, assets, 0, {
    t,
    female: false,
    lightOn: true,
    phoneLit: localT < 4.2,
    frame: localT < 4.2 ? `look_side_${Math.floor(t * 0.9) % 2}` : `look_front_${Math.floor(t * 0.8) % 2}`,
  });
  drawDormHalf(ctx, assets, 320, {
    t,
    female: true,
    lightOn: true,
    phoneLit: localT < 5.1,
    frame: localT < 5.1 ? `look_side_${Math.floor(t * 0.8) % 2}` : `look_front_${Math.floor(t * 0.7) % 2}`,
  });

  // Divider.
  fill(ctx, "#111624", 319, 0, 2, H);
  ctx.globalAlpha = 0.22;
  fill(ctx, PAL.coolMid, 321, 0, 1, H);
  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.globalAlpha = 0.08;
  fill(ctx, "#0d1424", 0, 0, W, H);
  ctx.globalAlpha = 1;
  drawVignette(ctx, 0.32);
}

function drawCampusFork(ctx, assets, t, globalT) {
  vBands(ctx, 0, 0, W, 250, [
    ["#222b42", 1],
    ["#3c4158", 1],
    ["#6a5b63", 1],
    ["#937067", 0.55],
  ]);
  pixelCircle(ctx, "#e8d7b8", 512, 72, 17);
  ctx.globalAlpha = 0.35;
  fill(ctx, "#e8d7b8", 504, 72, 16, 1);
  ctx.globalAlpha = 1;

  // Campus buildings far behind.
  for (let i = 0; i < 9; i++) {
    const bh = 34 + (i * 29) % 70;
    fill(ctx, "#202737", i * 76, 250 - bh, 68, bh);
    for (let j = 0; j < 3; j++) {
      if ((i + j) % 3 !== 0) {
        fill(ctx, "#c7a971", i * 76 + 11 + j * 18, 250 - bh + 10, 3, 4);
      }
    }
  }

  // Lawn, path, trees.
  fill(ctx, "#27372f", 0, 244, W, 116);
  fill(ctx, "#303f33", 0, 244, W, 4);
  dither(ctx, "#22332b", 0, 254, W, 100, 4, 1);
  fill(ctx, "#5c5449", 0, 288, W, 40);
  fill(ctx, "#75695a", 0, 288, W, 3);
  fill(ctx, "#4a433c", 0, 324, W, 36);
  fill(ctx, "#6c6154", 0, 324, W, 2);

  // Path fork.
  fill(ctx, "#6a6053", 250, 286, 34, 54);
  fill(ctx, "#6a6053", 214, 316, 150, 24);
  fill(ctx, "#5b5248", 260, 290, 12, 50);

  for (let i = 0; i < 5; i++) {
    const x = 40 + i * 142;
    fill(ctx, "#2f2b2a", x, 204, 8, 92);
    fill(ctx, "#2f2b2a", x - 6, 214, 20, 4);
    fill(ctx, "#293a30", x - 26, 188, 58, 22);
    fill(ctx, "#33473a", x - 18, 178, 42, 16);
  }
  for (let i = 0; i < 2; i++) {
    const x = 120 + i * 392;
    fill(ctx, "#34343a", x, 184, 4, 110);
    fill(ctx, "#34343a", x, 184, 25, 3);
    fill(ctx, "#ffd9a0", x + 23, 187, 5, 3);
    glow(ctx, assets.fx.glowWarm, x + 26, 188, 96, 96, 0.18);
  }

  // A bench, empty on one side.
  fill(ctx, "#4e4339", 68, 276, 76, 7);
  fill(ctx, "#3b332c", 72, 283, 4, 20);
  fill(ctx, "#3b332c", 136, 283, 4, 20);

  // They stand, then walk apart.  No embrace, no argument.
  const apart = smoothstep(clamp((t - 1.7) / 4.4));
  const mx = 292 - apart * 238;
  const fx = 350 + apart * 236;
  const walk = Math.floor(globalT * 5.4) % 6;
  if (apart < 0.02) {
    drawSpriteScaled(ctx, assets.sprites, "male", `idle_side_${Math.floor(t * 1.2) % 4}`, mx, 330, 1.6, {
      image: assets.variants.uniMale,
    });
    drawSpriteScaled(ctx, assets.sprites, "female", `look_side_${Math.floor(t * 1.1) % 2}`, fx, 330, 1.6, {
      image: assets.variants.uniFemale,
      flipX: true,
    });
  } else {
    drawSpriteScaled(ctx, assets.sprites, "male", `walk_side_${walk}`, mx, 330, 1.6, {
      image: assets.variants.uniMale,
      flipX: true,
    });
    drawSpriteScaled(ctx, assets.sprites, "female", `walk_side_${(walk + 2) % 6}`, fx, 330, 1.6, {
      image: assets.variants.uniFemale,
    });
  }

  // Falling leaves, cold light.
  for (let i = 0; i < 18; i++) {
    const x = (i * 73 + t * 6) % W;
    const y = 120 + ((i * 41 + t * 13) % 210);
    fill(ctx, i % 3 ? "#8a6a4a" : "#a07a52", x, y, 2, 1);
  }
  ctx.globalAlpha = 0.08;
  fill(ctx, "#0d1424", 0, 0, W, H);
  ctx.globalAlpha = 1;
  drawVignette(ctx, 0.34);
}

function drawDormExterior(ctx, assets, t) {
  vBands(ctx, 0, 0, W, 250, [
    ["#0f1626", 1],
    ["#182136", 1],
    ["#232c44", 1],
    ["#2b3046", 0.6],
  ]);
  pixelCircle(ctx, "#e8dcc0", 92, 58, 14);
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 18; i++) {
    fill(ctx, "#e8dcc0", (i * 97) % W, 30 + (i * 31) % 120, 1, 1);
  }
  ctx.globalAlpha = 1;

  // Dorm facade.
  fill(ctx, "#1c2230", 30, 116, 580, 206);
  fill(ctx, "#252c3c", 30, 116, 580, 5);
  fill(ctx, "#141a26", 24, 112, 592, 8);
  fill(ctx, "#171d2a", 30, 300, 580, 22);
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 14; col++) {
      const wx = 54 + col * 40;
      const wy = 136 + row * 34;
      const isHis = row === 2 && col === 5;
      const isHers = row === 2 && col === 9;
      let lit = (row * 7 + col * 3) % 5 < 2;
      if (isHis) lit = t < 12.0;
      if (isHers) lit = t < 10.9;
      fill(ctx, "#0d121c", wx, wy, 21, 17);
      if (lit) {
        fill(ctx, "#d9b879", wx + 1, wy + 1, 19, 15);
        fill(ctx, "#f0d6a2", wx + 3, wy + 3, 8, 6);
        ctx.globalAlpha = 0.14;
        fill(ctx, "#d9b879", wx - 4, wy - 4, 29, 25);
        ctx.globalAlpha = 1;
      } else {
        fill(ctx, "#141a26", wx + 1, wy + 1, 19, 15);
      }
      fill(ctx, "#2a3142", wx, wy + 16, 21, 2);
    }
  }

  // Ground, trees, a single lamp.
  fill(ctx, "#20282c", 0, 322, W, 38);
  fill(ctx, "#2c3536", 0, 322, W, 3);
  for (let i = 0; i < 4; i++) {
    const x = 34 + i * 166;
    fill(ctx, "#242522", x, 222, 9, 108);
    fill(ctx, "#242522", x - 12, 232, 32, 4);
    fill(ctx, "#1e2a26", x - 30, 210, 64, 22);
  }
  fill(ctx, "#35353b", 552, 246, 4, 76);
  fill(ctx, "#35353b", 552, 246, 26, 3);
  fill(ctx, "#ffd9a0", 576, 249, 5, 3);
  glow(ctx, assets.fx.glowWarm, 578, 250, 96, 96, 0.14);

  drawSnow(ctx, t, 0, 0, W, 330, 26);
  drawDust(ctx, t, 0, 140, W, 220, 20, PAL.cool, 0.5);
  drawVignette(ctx, 0.38);
}

export function createBreakup(assets) {
  return {
    id: "breakup",
    draw(ctx, t, globalT) {
      if (t < 6.0) {
        drawSplitDorm(ctx, assets, globalT, t);
      } else if (t < 10.2) {
        drawCampusFork(ctx, assets, t - 6.0, globalT);
      } else {
        drawDormExterior(ctx, assets, t - 10.2);
      }
    },
  };
}
