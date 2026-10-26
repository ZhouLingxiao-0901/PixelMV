import { PAL } from "../../../js/engine/palette.js";
import { clamp, lerp, smoothstep } from "../../../js/engine/util.js";
import {
  W, H, fill, vBands, pixelCircle, glow, drawSpriteScaled,
  drawSnow, drawDust, drawBirds, drawCloud, drawVignette,
} from "../art.js";

export function drawRooftop(ctx, t, opts = {}) {
  const dusk = opts.dusk || 0;
  const pan = opts.pan || 0;

  if (dusk < 0.5) {
    vBands(ctx, 0, 0, W, 250, [
      ["#5d7892", 1],
      ["#9f9a91", 1],
      ["#d7a678", 1],
      ["#efc48e", 0.8],
    ]);
  } else {
    vBands(ctx, 0, 0, W, 250, [
      ["#2b3049", 1],
      ["#4c4559", 1],
      ["#8d5e60", 1],
      ["#c47b5e", 0.7],
    ]);
  }

  pixelCircle(ctx, dusk < 0.5 ? "#ffe0a8" : "#ffc48a", 500 - pan * 0.02, 118, 26);
  drawCloud(ctx, 80 - pan * 0.03, 64, 1.3, "rgba(255,255,255,0.18)");
  drawCloud(ctx, 340 - pan * 0.02, 92, 1.0, "rgba(255,255,255,0.14)");
  drawBirds(ctx, t, 280, 70, 4, dusk < 0.5 ? "#4a5262" : "#2a2433");

  // City below.
  for (let i = 0; i < 16; i++) {
    const bh = 30 + (i * 23) % 94;
    const bx = i * 42 - pan * 0.12;
    fill(ctx, dusk < 0.5 ? "#4f5966" : "#252b3a", bx, 250 - bh, 40, bh);
    if (dusk >= 0.5) {
      for (let wy = 0; wy < 3; wy++) {
        for (let wx = 0; wx < 2; wx++) {
          if ((i + wy + wx) % 3 !== 0) {
            fill(ctx, "#d9b879", bx + 7 + wx * 15, 250 - bh + 10 + wy * 14, 3, 3);
          }
        }
      }
    }
  }

  // Rooftop floor.
  fill(ctx, "#5b5852", 0, 286, W, 74);
  fill(ctx, "#6d6a62", 0, 286, W, 4);
  fill(ctx, "#45423d", 0, 306, W, 54);
  for (let i = 0; i < 9; i++) {
    fill(ctx, "#777168", 20 + i * 72, 296 + (i % 3) * 8, 26, 2);
  }

  // Railing.
  fill(ctx, "#2f3336", 0, 238, W, 3);
  fill(ctx, "#30353a", 0, 264, W, 2);
  for (let i = 0; i < 33; i++) {
    fill(ctx, "#30353a", i * 20 + 4, 238, 2, 62);
  }
  for (let i = 0; i < 6; i++) {
    fill(ctx, "#3c4145", i * 110 + 10, 238, 2, 62);
  }

  // Door and water tank.
  fill(ctx, "#3e3730", 20, 170, 64, 118);
  fill(ctx, "#2a2433", 26, 182, 52, 104);
  fill(ctx, "#6b5443", 78, 224, 3, 4);
  fill(ctx, "#4c514e", 512, 178, 92, 94);
  fill(ctx, "#5e6460", 518, 166, 80, 16);
  fill(ctx, "#3a3f3c", 522, 182, 72, 84);
  fill(ctx, "#6d726c", 530, 190, 28, 4);

  ctx.globalAlpha = 0.14;
  fill(ctx, dusk < 0.5 ? PAL.warm : "#ffb37e", 0, 200, W, 90);
  ctx.globalAlpha = 1;
  drawBirds(ctx, t + 2, 90, 110, 3, dusk < 0.5 ? "#4a5262" : "#2a2433");
}

export function drawStudyAfternoon(ctx, assets, t) {
  ctx.drawImage(assets.bg.classroom, 0, 0);
  ctx.globalAlpha = 0.18;
  fill(ctx, "#ffbd7a", 0, 0, W, H);
  ctx.globalAlpha = 1;
  glow(ctx, assets.fx.glowWarm, 520, 150, 360, 260, 0.12);

  const floorY = 320;
  const look = smoothstep(clamp((t - 6.8) / 1.2));
  const maleFrame = look > 0.5
    ? `look_side_${Math.floor(t * 2.4) % 2}`
    : `sit_side_${Math.floor(t * 1.1) % 4}`;
  const femaleFrame = look > 0.5
    ? `look_side_${Math.floor(t * 2.1) % 2}`
    : `sit_side_${Math.floor(t * 1.3 + 1) % 4}`;
  drawSpriteScaled(ctx, assets.sprites, "male", maleFrame, 330, floorY, 1);
  drawSpriteScaled(ctx, assets.sprites, "female", femaleFrame, 468, floorY, 1, { flipX: true });

  // A folded note and two pencils on the shared desk.
  fill(ctx, "#e8d8c8", 392, 282, 16, 9);
  fill(ctx, "#c8b6a4", 393, 283, 14, 1);
  fill(ctx, "#a89178", 397, 287, 6, 1);
  fill(ctx, "#b4a992", 352, 286, 12, 1);
  fill(ctx, "#b4a992", 446, 286, 12, 1);

  // A small, private smile when their eyes meet.
  if (look > 0) {
    ctx.globalAlpha = look * 0.7;
    fill(ctx, PAL.warm, 468 - 3, 274, 1, 1);
    fill(ctx, PAL.warm, 330 + 3, 274, 1, 1);
    ctx.globalAlpha = 1;
  }

  // Lower the near desk row so the seated figures read above it.
  ctx.drawImage(assets.bg.classroomFg, 0, 18);
  drawDust(ctx, t, 350, 60, 260, 200, 26, PAL.warm, 0.9);
  drawVignette(ctx, 0.18);
}

function drawUmbrella(ctx, cx, cy, r) {
  // A low, pixel-edged umbrella canopy.
  for (let y = -r; y <= 0; y++) {
    const w = Math.round(Math.sqrt(Math.max(0, r * r - y * y)));
    fill(ctx, "#a8433e", cx - w, cy + y, w * 2, 1);
  }
  for (let i = -r; i <= r; i += 8) {
    const yy = cy - Math.round(Math.sqrt(Math.max(0, r * r - i * i)) * 0.55);
    fill(ctx, "#7d2f2f", cx + i, yy, 1, r + yy);
  }
  fill(ctx, "#d3b49a", cx - 1, cy, 2, r + 26);
  fill(ctx, "#6b4a3d", cx - 5, cy + r + 25, 10, 2);
  // Snow on the top.
  ctx.globalAlpha = 0.7;
  for (let i = -r; i <= r; i += 3) {
    const yy = cy - Math.round(Math.sqrt(Math.max(0, r * r - i * i)) * 0.88);
    fill(ctx, "#f2eee2", cx + i, yy, 2, 1);
  }
  ctx.globalAlpha = 1;
}

export function drawWinterWalk(ctx, assets, t, globalT) {
  vBands(ctx, 0, 0, W, 244, [
    ["#3a4055", 1],
    ["#6d6d7e", 1],
    ["#a99d95", 1],
    ["#d3b8a6", 0.7],
  ]);
  pixelCircle(ctx, "#ffe0b0", 500, 92, 20);

  // Dusk buildings.
  for (let i = 0; i < 12; i++) {
    const bh = 42 + (i * 21) % 96;
    const bx = i * 58 - (globalT - 226) * 3;
    fill(ctx, "#3d4152", bx, 244 - bh, 48, bh);
    if (i % 2 === 0) {
      fill(ctx, "#d9b879", bx + 9, 244 - bh + 14, 3, 3);
      fill(ctx, "#d9b879", bx + 26, 244 - bh + 28, 3, 3);
    }
  }

  // Snowy road and sidewalk.
  fill(ctx, "#9aa1a7", 0, 244, W, 30);
  fill(ctx, "#d7d3c8", 0, 244, W, 4);
  fill(ctx, "#5a5f66", 0, 274, W, 40);
  fill(ctx, "#c6c4bc", 0, 274, W, 2);
  fill(ctx, "#4a4e55", 0, 314, W, 46);
  for (let i = 0; i < 14; i++) {
    fill(ctx, "#e7e2d5", i * 54 - ((globalT - 226) * 18) % 54, 318, 28, 2);
  }
  // Streetlights with warm haloes.
  for (let i = 0; i < 3; i++) {
    const bx = 80 + i * 220;
    fill(ctx, "#3d3d42", bx, 156, 4, 120);
    fill(ctx, "#3d3d42", bx, 156, 22, 3);
    fill(ctx, "#ffd9a0", bx + 20, 159, 6, 3);
    glow(ctx, assets.fx.glowWarm, bx + 23, 160, 76, 76, 0.16);
  }
  // Trees.
  for (let i = 0; i < 4; i++) {
    const bx = 34 + i * 182;
    fill(ctx, "#3c322e", bx, 172, 9, 104);
    fill(ctx, "#4a4f4d", bx - 20, 154, 50, 28);
    fill(ctx, "#d7d3c8", bx - 16, 150, 40, 5);
  }

  drawSnow(ctx, t, 0, 0, W, 300, 58);

  const walk = Math.floor(globalT * 6.2) % 6;
  const bob = walk === 1 || walk === 4 ? -1 : 0;
  drawSpriteScaled(ctx, assets.sprites, "male", `walk_side_${walk}`, 260, 316 + bob, 1.7, {
    image: assets.variants.casualMale,
  });
  drawSpriteScaled(ctx, assets.sprites, "female", `walk_side_${(walk + 2) % 6}`, 382, 316 + bob, 1.7, {
    image: assets.variants.casualFemale,
  });
  // A shared umbrella follows them.
  drawUmbrella(ctx, 330, 198 + bob, 58);
  // Her scarf.
  fill(ctx, "#b4473e", 390, 266, 18, 7);
  fill(ctx, "#d97a6c", 392, 266, 14, 2);

  // Warm snow at the feet.
  ctx.globalAlpha = 0.4;
  fill(ctx, PAL.warm, 250, 330, 150, 2);
  ctx.globalAlpha = 1;
  drawVignette(ctx, 0.24);
}

export function drawGateTogether(ctx, assets, t) {
  ctx.drawImage(assets.bg.gate, 0, 0);
  ctx.drawImage(assets.bg.gateFg, 0, 0);
  ctx.globalAlpha = 0.48;
  fill(ctx, "#101a2d", 0, 0, W, H);
  ctx.globalAlpha = 1;
  glow(ctx, assets.fx.glowWarm, 344, 190, 190, 190, 0.24);
  glow(ctx, assets.fx.glowMoon, 626, 132, 130, 130, 0.08);
  drawSnow(ctx, t, 0, 0, W, 260, 34);
  drawDust(ctx, t, 40, 60, 560, 240, 24, PAL.warm, 0.8);

  drawSpriteScaled(ctx, assets.sprites, "male", `idle_side_${Math.floor(t * 1.4) % 4}`, 286, 326, 2.0);
  drawSpriteScaled(ctx, assets.sprites, "female", `look_side_${Math.floor(t * 1.6) % 2}`, 374, 326, 2.0, { flipX: true });
  // Their hands meet between them.
  fill(ctx, PAL.skin, 330, 310, 8, 3);
  fill(ctx, PAL.skinSh, 330, 313, 8, 1);
  // Her hair on his shoulder.
  fill(ctx, "#2a2230", 342, 244, 18, 8);
  drawVignette(ctx, 0.28);
}

function drawMortarboard(ctx, x, y, sway) {
  fill(ctx, "#101019", x - 23, y + 8, 46, 2);
  fill(ctx, "#3a3847", x - 23, y - 4, 46, 4);
  fill(ctx, "#262533", x - 23, y, 46, 3);
  fill(ctx, "#4a4858", x - 23, y + 3, 46, 1);
  fill(ctx, "#2b2939", x - 15, y + 4, 30, 6);
  fill(ctx, "#d9b879", x + 19, y - 3, 2, 2);
  fill(ctx, "#c9a35c", x + 20, y - 1, 1, 14);
  fill(ctx, "#c9a35c", x + 17 + sway, y + 13, 4, 2);
}

function drawGraduateSilhouette(ctx, x, y, h, color) {
  // Background classmates only: shape, no faces, no invented action.
  fill(ctx, color, x - h * 0.2, y - h * 0.66, h * 0.4, h * 0.66);
  fill(ctx, color, x - h * 0.28, y - h * 0.44, h * 0.56, h * 0.2);
  pixelCircle(ctx, color, x, y - h * 0.8, h * 0.12);
  fill(ctx, color, x - h * 0.24, y - h * 0.9, h * 0.48, h * 0.06);
}

export function drawGraduation(ctx, assets, t) {
  ctx.drawImage(assets.bg.gate, 0, 0);
  ctx.drawImage(assets.bg.gateFg, 0, 0);
  // Graduation afternoon: lift the dusk gate toward a warm, crowded light.
  ctx.globalAlpha = 0.2;
  fill(ctx, "#ffd9a0", 0, 0, W, H);
  ctx.globalAlpha = 0.1;
  fill(ctx, "#9fc6d8", 0, 0, W, 120);
  ctx.globalAlpha = 1;
  glow(ctx, assets.fx.glowWarm, 626, 132, 280, 280, 0.14);
  glow(ctx, assets.fx.glowWarm, 320, 120, 460, 280, 0.11);

  // Background classmates in caps.
  ctx.globalAlpha = 0.55;
  drawGraduateSilhouette(ctx, 62, 334, 86, "#232532");
  drawGraduateSilhouette(ctx, 112, 330, 74, "#1d202b");
  drawGraduateSilhouette(ctx, 528, 332, 80, "#232532");
  drawGraduateSilhouette(ctx, 590, 336, 92, "#1b1e29");
  ctx.globalAlpha = 1;

  // Paper planes and confetti, heavier than the quiet gate shot.
  for (let i = 0; i < 10; i++) {
    const q = (t * 0.12 + i * 0.13) % 1;
    const x = 24 + i * 62 + q * 44;
    const y = 126 - q * 80 + (i % 3) * 9;
    fill(ctx, "#f5f1e4", x, y, 8, 2);
    fill(ctx, "#cfc8b7", x + 2, y + 2, 5, 1);
  }
  for (let i = 0; i < 46; i++) {
    const x = (i * 59 + t * 13) % W;
    const y = 24 + ((i * 37 + t * 9) % 210);
    const c = [PAL.warm, PAL.redSoft, PAL.cool, PAL.cream, "#e0a468"][i % 5];
    fill(ctx, c, x, y, i % 4 === 0 ? 3 : 2, 1);
  }

  const walk = Math.floor(t * 1.3) % 4;
  drawSpriteScaled(ctx, assets.sprites, "male", `idle_side_${walk}`, 286, 330, 2.0);
  drawSpriteScaled(ctx, assets.sprites, "female", `look_side_${Math.floor(t * 1.5) % 2}`, 380, 330, 2.0, { flipX: true });

  // Caps, a rolled certificate, and a small bouquet.
  const sway = Math.round(Math.sin(t * 1.8) * 1);
  drawMortarboard(ctx, 286, 222, sway);
  drawMortarboard(ctx, 380, 222, -sway);
  fill(ctx, "#f2eee2", 300, 296, 22, 5);
  fill(ctx, "#d8cfbe", 300, 301, 22, 2);
  fill(ctx, "#b4473e", 310, 295, 3, 9);
  fill(ctx, "#d97a6c", 311, 296, 1, 7);
  // Bouquet in her arm.
  fill(ctx, "#3f5d4a", 398, 286, 3, 20);
  fill(ctx, "#4a6a52", 404, 282, 2, 22);
  pixelCircle(ctx, "#e8c46a", 402, 280, 5);
  pixelCircle(ctx, "#d97a6c", 408, 285, 4);
  pixelCircle(ctx, "#f2eee2", 396, 287, 3);
  fill(ctx, "#d8b48a", 396, 292, 12, 3);

  // A parent's camera on a tripod at the edge of the yard.
  fill(ctx, "#1c2030", 556, 238, 22, 14);
  fill(ctx, "#2b3446", 558, 240, 12, 8);
  fill(ctx, "#a9c7d2", 572, 242, 5, 5);
  fill(ctx, "#1c2030", 566, 252, 3, 22);
  fill(ctx, "#1c2030", 564, 274, 7, 8);
  for (let i = 0; i < 50; i++) {
    fill(ctx, "#1c2030", 566 - Math.round(i * 0.52), 278 + i, 2, 1);
    fill(ctx, "#1c2030", 569 + Math.round(i * 0.52), 278 + i, 2, 1);
    fill(ctx, "#1c2030", 566, 278 + i, 3, 1);
  }
  fill(ctx, "#1c2030", 540, 330, 60, 2);

  // She adjusts his collar; his eyes find hers.
  if (t > 4.0) {
    fill(ctx, PAL.skin, 344, 246, 9, 4);
    fill(ctx, PAL.skinSh, 344, 249, 9, 1);
  }
  const flash = Math.max(0, 1 - Math.abs(t - 8.4) / 0.32);
  if (flash > 0) {
    ctx.globalAlpha = flash * 0.55;
    fill(ctx, "#fff7e2", 0, 0, W, H);
    ctx.globalAlpha = 1;
    ctx.globalAlpha = flash * 0.4;
    fill(ctx, "#fff7e2", 570, 236, 14, 10);
    ctx.globalAlpha = 1;
  }
  drawVignette(ctx, 0.2);
}

export function drawRooftopDusk(ctx, assets, t) {
  drawRooftop(ctx, t, { dusk: 1, pan: t * 2 });

  // Two cups on the ledge.
  fill(ctx, "#d8cfbe", 214, 270, 10, 12);
  fill(ctx, "#f2eee2", 214, 270, 10, 2);
  fill(ctx, "#d8cfbe", 420, 270, 10, 12);
  fill(ctx, "#f2eee2", 420, 270, 10, 2);

  drawSpriteScaled(ctx, assets.sprites, "male", `idle_side_${Math.floor(t * 0.8) % 4}`, 286, 306, 2.1, {
    image: assets.variants.casualMale,
  });
  drawSpriteScaled(ctx, assets.sprites, "female", `look_side_${Math.floor(t * 0.9) % 2}`, 362, 306, 2.1, {
    image: assets.variants.casualFemale,
    flipX: true,
  });
  // His arm around her, and her head on his shoulder.
  fill(ctx, "#3d3930", 318, 256, 30, 9);
  fill(ctx, PAL.skin, 342, 256, 6, 5);
  fill(ctx, "#2a2230", 346, 234, 20, 10);

  ctx.globalAlpha = 0.1 + 0.03 * Math.sin(t);
  fill(ctx, "#ffb37e", 0, 0, W, H);
  ctx.globalAlpha = 1;
  drawVignette(ctx, 0.3);
}

export function createHigh3(assets) {
  return {
    id: "high3",
    draw(ctx, t, globalT) {
      if (t < 5.0) {
        drawRooftop(ctx, t, { dusk: 0, pan: (5 - t) * 8 });
        const q = smoothstep(clamp(t / 3.4));
        const mx = lerp(70, 250, q);
        const fx = lerp(100, 374, q);
        const walk = Math.floor(globalT * 6.4) % 6;
        if (t < 3.4) {
          drawSpriteScaled(ctx, assets.sprites, "male", `walk_side_${walk}`, mx, 306, 1.7, {
            image: assets.variants.casualMale,
          });
          drawSpriteScaled(ctx, assets.sprites, "female", `walk_side_${(walk + 2) % 6}`, fx, 306, 1.7, {
            image: assets.variants.casualFemale,
          });
        } else {
          drawSpriteScaled(ctx, assets.sprites, "male", `idle_side_${Math.floor(t * 1.4) % 4}`, 250, 306, 2.0, {
            image: assets.variants.casualMale,
          });
          drawSpriteScaled(ctx, assets.sprites, "female", `look_side_${Math.floor(t * 1.6) % 2}`, 368, 306, 2.0, {
            image: assets.variants.casualFemale,
            flipX: true,
          });
          fill(ctx, PAL.skin, 318, 288, 8, 3);
        }
        drawDust(ctx, t, 0, 70, W, 220, 26, PAL.warm, 0.7);
        drawVignette(ctx, 0.2);
      } else if (t < 10.0) {
        const ct = t - 5.0;
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        if (ct < 2.6) {
          const z = 1.0 + smoothstep(clamp(ct / 2.6)) * 0.08;
          ctx.translate(W / 2, H / 2);
          ctx.scale(z, z);
          ctx.translate(-W / 2, -H / 2);
        } else {
          // Closer two-shot for the note and the private smile.
          ctx.translate(W / 2, H / 2);
          ctx.scale(2.6, 2.6);
          ctx.translate(-399, -272);
        }
        drawStudyAfternoon(ctx, assets, ct);
        ctx.restore();
      } else if (t < 15.0) {
        drawWinterWalk(ctx, assets, t, globalT);
      } else if (t < 20.0) {
        drawGateTogether(ctx, assets, t);
      } else if (t < 26.0) {
        drawGraduation(ctx, assets, t - 20.0);
      } else {
        drawRooftopDusk(ctx, assets, t - 26.0);
      }
    },
  };
}
