import { PAL } from "../../../js/engine/palette.js";
import { drawText } from "../../../js/engine/pixeltext.js";
import { clamp, envelope, smoothstep } from "../../../js/engine/util.js";
import {
  C, W, H, fill, vBands, dither, pixelCircle, glow, drawSpriteScaled,
  drawWindow, drawDust, drawBirds, drawVignette,
} from "../art.js";

/* ------------------------------------------------------------------ room */

function drawApartment(ctx, assets, t, opts = {}) {
  const zoom = opts.zoom || 1;
  const panX = opts.panX || 0;
  const panY = opts.panY || 0;
  const adultFrame = opts.adultFrame || `sit_side_${Math.floor(t * 0.9) % 4}`;
  const adultAlpha = opts.adultAlpha ?? 1;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(W / 2, H / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-W / 2 - panX, -H / 2 - panY);

  // Wall and floor.
  vBands(ctx, 0, 0, W, 286, [
    ["#3d3c37", 1],
    ["#35342f", 1],
    ["#2c2b28", 0.9],
  ]);
  fill(ctx, "#24272a", 0, 286, W, 14);
  fill(ctx, C.floorWarm, 0, 300, W, 60);
  fill(ctx, "#3b2e27", 0, 300, W, 3);
  for (let i = 0; i < 8; i++) {
    fill(ctx, "#574239", 20 + i * 82, 304, 1, 56);
  }
  dither(ctx, "rgba(0,0,0,0.10)", 0, 322, W, 38, 3, 1);

  // Window and sunrise.
  drawWindow(ctx, 392, 38, 204, 184, "dawn", t);
  fill(ctx, "#2a2433", 384, 30, 10, 200);
  fill(ctx, "#2a2433", 596, 30, 10, 200);
  fill(ctx, "#4b3a35", 374, 28, 12, 210);
  fill(ctx, "#4b3a35", 606, 28, 12, 210);
  glow(ctx, assets.fx.glowWarm, 486, 150, 340, 280, 0.13);
  glow(ctx, assets.fx.glowWarm, 486, 130, 140, 140, 0.16);

  // Left wall shelf and books.
  fill(ctx, C.woodDk, 44, 108, 132, 6);
  fill(ctx, C.wood, 44, 108, 132, 2);
  for (let i = 0; i < 8; i++) {
    const bw = 7 + (i % 3) * 3;
    const bh = 16 + (i % 4) * 4;
    fill(ctx, [PAL.navy, PAL.red, PAL.plum, PAL.green][i % 4], 52 + i * 15, 108 - bh, bw, bh);
    fill(ctx, PAL.cream, 54 + i * 15, 108 - bh + 3, 1, bh - 6);
  }
  // A framed picture.
  fill(ctx, "#2a2433", 66, 148, 84, 62);
  fill(ctx, "#b9aa91", 70, 152, 76, 54);
  fill(ctx, "#8e6f9e", 74, 156, 68, 28);
  fill(ctx, "#3f5d4a", 74, 184, 68, 18);
  fill(ctx, "#ffd9a0", 126, 160, 11, 11);

  // Chair back.
  fill(ctx, "#3d2f2a", 232, 262, 54, 8);
  fill(ctx, "#4a3a30", 238, 270, 8, 52);
  fill(ctx, "#4a3a30", 274, 270, 8, 52);

  // Adult, seated side-on, in the runtime palette-swapped coat.
  if (adultAlpha > 0) {
    drawSpriteScaled(ctx, assets.sprites, "male", adultFrame, 278, 330, 2, {
      image: assets.variants.adultMale,
      alpha: adultAlpha,
    });
    // A slightly older jawline / glasses catchlight.
    fill(ctx, "rgba(34,31,42,0.7)", 292, 236, 7, 1);
    fill(ctx, "rgba(255,255,255,0.38)", 297, 229, 2, 1);
  }

  // Desk and its front panel (occludes the lower body).
  fill(ctx, C.woodDk, 286, 280, 304, 8);
  fill(ctx, C.wood, 286, 276, 304, 5);
  fill(ctx, "#3f3129", 296, 288, 284, 46);
  fill(ctx, "#4a3a30", 296, 288, 284, 2);
  fill(ctx, "#5c493d", 304, 292, 268, 1);
  fill(ctx, C.woodDk, 310, 334, 8, 18);
  fill(ctx, C.woodDk, 560, 334, 8, 18);

  // Desktop objects.
  fill(ctx, "#2a2433", 326, 252, 126, 35);
  fill(ctx, PAL.paperSh, 330, 255, 118, 28);
  fill(ctx, "#4a3a30", 330, 255, 118, 2);
  fill(ctx, "#7a6a5b", 340, 263, 45, 1);
  fill(ctx, "#7a6a5b", 340, 268, 62, 1);
  fill(ctx, "#7a6a5b", 340, 273, 34, 1);
  // A small pressed flower on the page.
  fill(ctx, PAL.redSoft, 420, 266, 4, 4);
  fill(ctx, PAL.greenHi, 424, 269, 3, 1);

  // Mug and steam.
  fill(ctx, "#cfc8b7", 474, 260, 20, 17);
  fill(ctx, "#f2eee2", 476, 260, 16, 2);
  fill(ctx, "#9d978a", 494, 264, 5, 8);
  fill(ctx, "#2b2620", 480, 264, 12, 9);
  ctx.globalAlpha = 0.32 + 0.12 * Math.sin(t * 1.7);
  fill(ctx, "#f2eee2", 480, 252, 1, 6);
  fill(ctx, "#f2eee2", 486, 248, 1, 9);
  fill(ctx, "#f2eee2", 491, 254, 1, 5);
  ctx.globalAlpha = 1;

  // Small plant.
  fill(ctx, "#7a4a3a", 540, 264, 20, 15);
  fill(ctx, "#5c3a2e", 542, 264, 16, 2);
  for (let i = 0; i < 6; i++) {
    fill(ctx, i % 2 ? PAL.greenMid : PAL.green, 544 + i * 3, 246 + (i % 3) * 5, 3, 9);
  }

  // Drawn hand resting on the album.
  if (opts.hand !== false) {
    const hx = 306 + Math.sin(t * 0.55) * 2;
    fill(ctx, "#3b463c", hx - 14, 268, 22, 9);
    fill(ctx, PAL.skin, hx + 4, 266, 26, 8);
    fill(ctx, PAL.skinSh, hx + 4, 272, 26, 2);
    fill(ctx, PAL.skin, hx + 18, 264, 3, 5);
  }

  // Window light on the floor.
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.08;
  fill(ctx, PAL.warm, 374, 286, 250, 66);
  ctx.restore();

  drawDust(ctx, t, 320, 60, 300, 240, 34, PAL.warm, 0.9);

  ctx.restore();
}

function drawAlbumClose(ctx, assets, t, opts = {}) {
  const zoom = opts.zoom || 1;
  const focusX = opts.focusX ?? 320;
  const focusY = opts.focusY ?? 180;
  const photoGlow = opts.photoGlow || 0;

  fill(ctx, "#241d1b", 0, 0, W, H);
  fill(ctx, "#3b2c26", 0, 0, W, 18);
  dither(ctx, "#171313", 0, 0, W, H, 4, 0);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(focusX, focusY);
  ctx.scale(zoom, zoom);
  ctx.translate(-focusX, -focusY);

  // Album cover and pages.
  fill(ctx, "rgba(0,0,0,0.5)", 50, 38, 548, 296);
  fill(ctx, "#5e3e32", 34, 26, 572, 308);
  fill(ctx, "#7b5542", 34, 26, 572, 4);
  fill(ctx, PAL.paper, 55, 43, 530, 274);
  fill(ctx, PAL.paperSh, 55, 43, 530, 4);
  fill(ctx, "#c1ab95", 319, 43, 2, 274);
  fill(ctx, "#b9a38d", 55, 313, 530, 4);

  // Left photo: the school gate, matching the next shot.
  fill(ctx, "#3a2c27", 92, 72, 234, 140);
  ctx.save();
  ctx.beginPath();
  ctx.rect(96, 76, 226, 132);
  ctx.clip();
  const g = assets.bg.gate;
  ctx.drawImage(g, 0, 0, g.width, g.height, 96, 76, 226, 132);
  ctx.restore();
  fill(ctx, "rgba(255,217,160,0.10)", 96, 76, 226, 132);

  // Right page: a smaller classroom photo.
  fill(ctx, "#3a2c27", 352, 78, 190, 116);
  ctx.save();
  ctx.beginPath();
  ctx.rect(356, 82, 182, 108);
  ctx.clip();
  const c = assets.bg.classroom;
  ctx.drawImage(c, 20, 30, 600, 300, 356, 82, 182, 108);
  ctx.restore();
  fill(ctx, "rgba(255,217,160,0.08)", 356, 82, 182, 108);

  // Pencil annotations.
  fill(ctx, "#8c7a66", 98, 224, 154, 1);
  fill(ctx, "#8c7a66", 98, 231, 112, 1);
  fill(ctx, "#8c7a66", 98, 238, 136, 1);
  fill(ctx, "#8c7a66", 358, 208, 156, 1);
  fill(ctx, "#8c7a66", 358, 215, 96, 1);
  fill(ctx, "#8c7a66", 358, 222, 132, 1);

  // Hand turning the page.
  const hand = smoothstep(clamp((t - 0.3) / 1.0));
  if (hand > 0) {
    const hx = 500 - hand * 48;
    const hy = 272 + Math.sin(t * 0.9) * 2;
    fill(ctx, "#3b463c", hx + 10, hy - 4, 42, 13);
    fill(ctx, PAL.skin, hx - 12, hy, 34, 10);
    fill(ctx, PAL.skinSh, hx - 12, hy + 7, 34, 2);
    fill(ctx, PAL.skin, hx - 18, hy - 1, 9, 4);
    fill(ctx, PAL.skin, hx - 18, hy + 4, 9, 4);
  }

  ctx.restore();

  if (photoGlow > 0) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = photoGlow;
    fill(ctx, "#fff3d8", 0, 0, W, H);
    ctx.restore();
  }
}

/* ------------------------------------------------------------- prologue */

export function createPrologue(assets) {
  return {
    id: "prologue",
    draw(ctx, t) {
      if (t < 8.7) {
        // Slow push from the wide room into the desk.
        const q = smoothstep(clamp(t / 8.7));
        const zoom = 1 + q * 0.14;
        const panX = q * 24;
        drawApartment(ctx, assets, t, { zoom, panX, adultFrame: `sit_side_${Math.floor(t * 1.05) % 4}` });
        const open = envelope(t, 4.2, 5.0, 9, 10);
        if (open > 0) {
          ctx.globalAlpha = open * 0.92;
          fill(ctx, PAL.paper, 330, 252, 118, 28);
          fill(ctx, "#4a3a30", 330, 252, 118, 2);
          fill(ctx, "#7a6a5b", 342, 262, 58, 1);
          fill(ctx, "#7a6a5b", 342, 267, 42, 1);
          ctx.globalAlpha = 1;
        }
      } else if (t < 13.2) {
        const q = smoothstep(clamp((t - 8.7) / 4.5));
        drawAlbumClose(ctx, assets, t - 8.7, {
          zoom: 1.0 + q * 0.04,
          focusX: 320,
          focusY: 180,
          photoGlow: 0,
        });
      } else {
        const q = smoothstep(clamp((t - 13.2) / 2.243));
        drawAlbumClose(ctx, assets, t - 8.7, {
          zoom: 1.05 + q * 0.5,
          focusX: 209,
          focusY: 142,
          photoGlow: envelope(t, 13.9, 15.0, 15.443, 16.0) * 0.55,
        });
      }

      // The present-day light bleeds over the last second before the match cut.
      const bloom = envelope(t, 14.2, 15.0, 15.443, 15.443);
      if (bloom > 0) {
        ctx.globalAlpha = bloom * 0.4;
        fill(ctx, "#fff3d8", 0, 0, W, H);
        ctx.globalAlpha = 1;
      }
      drawVignette(ctx, 0.3);
    },
  };
}

/* ---------------------------------------------------------- return / end */

function drawYearbookClose(ctx, t, zoom = 1) {
  fill(ctx, "#241d1b", 0, 0, W, H);
  dither(ctx, "#171313", 0, 0, W, H, 4, 1);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(320, 180);
  ctx.scale(zoom, zoom);
  ctx.translate(-320, -180);

  fill(ctx, "rgba(0,0,0,0.5)", 44, 25, 552, 310);
  fill(ctx, "#5a3d31", 28, 16, 584, 326);
  fill(ctx, "#7b5542", 28, 16, 584, 4);
  fill(ctx, PAL.paper, 48, 32, 544, 296);
  fill(ctx, PAL.paperSh, 48, 32, 544, 3);
  fill(ctx, "#b9a38d", 48, 324, 544, 4);

  drawText(ctx, "毕业纪念册", 320, 40, {
    size: 13,
    color: "#5a463b",
    align: "center",
    letterSpacing: 3,
    threshold: 110,
  });
  fill(ctx, "#a89178", 210, 60, 220, 1);

  // Class photo frame.
  fill(ctx, "#3a2c27", 106, 68, 428, 176);
  fill(ctx, "#75685a", 110, 72, 420, 168);
  fill(ctx, "#c7b9a2", 116, 78, 408, 156);

  // Deterministic rows of tiny graduates.
  const cols = 6;
  const rows = 4;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx === 22) continue;
      const cx = 150 + c * 62;
      const cy = 106 + r * 34;
      const isOurTwo = (r === 2 && c === 2) || (r === 2 && c === 3);
      fill(ctx, isOurTwo ? "#35445f" : "#3b4252", cx - 7, cy + 6, 14, 13);
      fill(ctx, "#e8c3a0", cx - 5, cy - 3, 10, 10);
      fill(ctx, "#2a2433", cx - 6, cy - 6, 12, 5);
      if (isOurTwo) {
        fill(ctx, "#f2b56b", cx - 8, cy + 5, 16, 1);
      }
    }
  }
  // Photo glare.
  ctx.globalAlpha = 0.08;
  fill(ctx, "#ffffff", 118, 80, 404, 18);
  ctx.globalAlpha = 1;

  // The reveal: only placeholders, never real names.
  const a = smoothstep(clamp(t / 0.85));
  ctx.globalAlpha = a;
  drawText(ctx, "【男主名字】", 320, 258, {
    size: 18,
    color: "#4a3730",
    align: "center",
    letterSpacing: 2,
    bold: true,
    threshold: 105,
  });
  drawText(ctx, "【女主名字】", 320, 286, {
    size: 18,
    color: "#4a3730",
    align: "center",
    letterSpacing: 2,
    bold: true,
    threshold: 105,
  });
  ctx.globalAlpha = 1;

  // A faint pressed-flower mark in the corner.
  fill(ctx, PAL.redSoft, 540, 302, 4, 4);
  fill(ctx, PAL.greenHi, 544, 304, 3, 1);

  ctx.restore();
}

function drawCityStreet(ctx, t, opts = {}) {
  const pan = opts.pan || 0;

  vBands(ctx, 0, 0, W, 236, [
    [C.skyDawnTop, 1],
    [C.skyDawnMid, 1.1],
    [C.skyDawnLow, 0.9],
  ]);
  pixelCircle(ctx, "#ffe3ad", 520, 92, 24);
  drawBirds(ctx, t, 330, 56, 5, "#3a3344");

  // Background buildings.
  for (let i = 0; i < 12; i++) {
    const bw = 48 + (i * 13) % 34;
    const bh = 56 + (i * 29) % 118;
    const bx = -pan * 0.15 + i * 58 - 20;
    fill(ctx, i % 3 === 0 ? "#4a4d55" : "#3b3f49", bx, 236 - bh, bw, bh);
    for (let wy = 0; wy < 4; wy++) {
      for (let wx = 0; wx < 3; wx++) {
        if ((i + wy + wx) % 3 !== 0) {
          fill(ctx, "#d9b879", bx + 8 + wx * 13, 236 - bh + 12 + wy * 16, 3, 3);
        }
      }
    }
  }

  // Sidewalk and road.
  fill(ctx, "#6d675e", 0, 236, W, 18);
  fill(ctx, "#4b4845", 0, 254, W, 38);
  fill(ctx, "#2e2c2b", 0, 292, W, 68);
  fill(ctx, "#8c8377", 0, 236, W, 2);
  for (let i = 0; i < 14; i++) {
    fill(ctx, "#57524c", i * 52 - (pan * 0.35) % 52, 258, 24, 2);
  }
  for (let i = 0; i < 8; i++) {
    fill(ctx, "#c8b990", i * 86 - (pan * 0.4) % 86, 316, 40, 3);
  }

  // Trees.
  for (let i = 0; i < 4; i++) {
    const bx = 70 + i * 190 - (pan * 0.28) % 190;
    fill(ctx, "#4a3a30", bx, 196, 8, 46);
    fill(ctx, "#3f5d4a", bx - 18, 168, 46, 30);
    fill(ctx, "#5f7f5c", bx - 10, 154, 32, 24);
    fill(ctx, "#88a06e", bx - 2, 150, 18, 12);
  }

  // Streetlights.
  for (let i = 0; i < 3; i++) {
    const bx = 180 + i * 230 - (pan * 0.2) % 230;
    fill(ctx, "#3a3a3a", bx, 160, 3, 84);
    fill(ctx, "#3a3a3a", bx, 160, 14, 3);
    fill(ctx, "#ffd9a0", bx + 12, 163, 5, 3);
  }

  // Low foreground railing.
  fill(ctx, "#3c3a38", 0, 330, W, 2);
  for (let i = 0; i < 18; i++) {
    fill(ctx, "#3c3a38", i * 40, 310, 2, 24);
  }
  drawVignette(ctx, 0.22);
}

function drawBenchScene(ctx, assets, t) {
  // Morning park, close and quiet.
  vBands(ctx, 0, 0, W, 250, [
    ["#8fa0a4", 1],
    ["#b8b7a7", 1],
    ["#cfc0a4", 1],
  ]);
  // Distant buildings.
  for (let i = 0; i < 10; i++) {
    const bh = 35 + (i * 17) % 65;
    fill(ctx, "#7d8587", 20 + i * 64, 220 - bh, 46, bh);
  }
  // Grass and path.
  fill(ctx, "#5f7f5c", 0, 238, W, 44);
  fill(ctx, "#8d7b5e", 0, 282, W, 78);
  fill(ctx, "#7c6b51", 0, 282, W, 3);
  dither(ctx, "#6f8a62", 0, 244, W, 34, 3, 1);

  // Trees.
  fill(ctx, "#4a3a30", 72, 160, 12, 96);
  fill(ctx, "#3f5d4a", 28, 128, 100, 54);
  fill(ctx, "#5f7f5c", 48, 108, 74, 46);
  fill(ctx, "#88a06e", 68, 100, 44, 30);
  fill(ctx, "#4a3a30", 560, 150, 12, 104);
  fill(ctx, "#3f5d4a", 520, 120, 90, 50);
  fill(ctx, "#5f7f5c", 538, 102, 62, 42);

  // Bench.
  fill(ctx, "#4a3a30", 200, 272, 240, 7);
  fill(ctx, "#6b5443", 200, 266, 240, 7);
  fill(ctx, "#4a3a30", 214, 279, 7, 36);
  fill(ctx, "#4a3a30", 418, 279, 7, 36);
  fill(ctx, "#6b5443", 206, 242, 228, 6);
  fill(ctx, "#4a3a30", 216, 248, 6, 22);
  fill(ctx, "#4a3a30", 418, 248, 6, 22);

  // Adult sitting, variant sprite.
  drawSpriteScaled(ctx, assets.sprites, "male", `sit_side_${Math.floor(t * 0.7) % 4}`, 310, 274, 2, {
    image: assets.variants.adultMale,
  });
  fill(ctx, "#2a2433", 300, 272, 22, 1);

  // Coffee on the bench and a phone showing an old photo.
  fill(ctx, "#d8cfbe", 360, 246, 14, 17);
  fill(ctx, "#f2eee2", 362, 246, 10, 2);
  ctx.globalAlpha = 0.26 + 0.08 * Math.sin(t * 1.4);
  fill(ctx, "#f2eee2", 364, 240, 1, 5);
  fill(ctx, "#f2eee2", 369, 236, 1, 8);
  ctx.globalAlpha = 1;
  fill(ctx, "#0a0f1a", 424, 244, 30, 20);
  fill(ctx, "#1d2436", 427, 247, 24, 14);
  fill(ctx, "#8e6f9e", 429, 249, 20, 6);
  fill(ctx, "#4a3a30", 429, 255, 20, 3);
  fill(ctx, "#ffd9a0", 440, 250, 4, 3);

  drawDust(ctx, t, 80, 80, 500, 190, 24, PAL.warm, 0.7);
  drawVignette(ctx, 0.22);
}

export function createReturn(assets) {
  return {
    id: "return",
    draw(ctx, t) {
      if (t < 7.2) {
        const zoom = 1 + smoothstep(clamp(t / 7.2)) * 0.07;
        drawYearbookClose(ctx, t, zoom);
      } else if (t < 17.2) {
        const q = smoothstep(clamp((t - 7.2) / 10));
        drawApartment(ctx, assets, t, {
          zoom: 1.22 + q * 0.1,
          panX: 28,
          panY: 4,
          adultFrame: `sit_side_${Math.floor(t * 0.7) % 4}`,
          hand: true,
        });
      } else if (t < 19.2) {
        drawAlbumClose(ctx, assets, 10, {
          zoom: 1.25,
          focusX: 330,
          focusY: 220,
          photoGlow: 0,
        });
        const q = smoothstep(clamp((t - 17.2) / 2.0));
        fill(ctx, PAL.paper, 96, 80, 450 * (1 - q * 0.82), 210, "#e8d8c8");
        fill(ctx, "#7b5542", 96, 80, 450 * (1 - q * 0.82), 3);
      } else if (t < 23.026) {
        const q = smoothstep(clamp((t - 19.2) / 3.826));
        drawApartment(ctx, assets, t, {
          zoom: 1.34 + q * 0.08,
          panX: 60,
          panY: 0,
          adultFrame: "look_side_0",
          hand: false,
        });
      } else if (t < 30) {
        drawApartment(ctx, assets, t, {
          zoom: 1.18,
          panX: 48,
          panY: 8,
          adultFrame: `idle_side_${Math.floor(t * 0.8) % 4}`,
          hand: false,
        });
      } else if (t < 38) {
        drawCityStreet(ctx, t, { pan: (t - 30) * 28 });
        // Adult walking through the morning at 2x.
        const frame = Math.floor((t - 30) * 7) % 6;
        drawSpriteScaled(ctx, assets.sprites, "male", `walk_side_${frame}`, 274, 336, 2, {
          image: assets.variants.adultMale,
        });
      } else if (t < 45) {
        drawBenchScene(ctx, assets, t - 38);
      } else if (t < 52) {
        // Quiet close-up against the window.
        vBands(ctx, 0, 0, W, H, [
          ["#252b32", 1],
          ["#3e4345", 1],
          ["#6d675c", 0.8],
        ]);
        drawWindow(ctx, 340, 20, 260, 250, "dawn", t);
        ctx.globalAlpha = 0.22;
        fill(ctx, "#ffd9a0", 0, 0, W, H);
        ctx.globalAlpha = 1;
        drawSpriteScaled(ctx, assets.sprites, "male", `idle_side_${Math.floor(t * 0.8) % 4}`, 312, 268, 3.1, {
          image: assets.variants.adultMale,
        });
        drawDust(ctx, t, 120, 30, 420, 300, 28, PAL.warm, 1);
        drawVignette(ctx, 0.32);
      } else {
        const q = smoothstep(clamp((t - 52) / 8.077));
        drawApartment(ctx, assets, t, {
          zoom: 1.08 + q * 0.08,
          panX: 22 + q * 16,
          panY: 2,
          adultFrame: `idle_side_${Math.floor(t * 0.7) % 4}`,
          hand: false,
        });
      }

      // The final fade is handled by the compositor at 320.166.
    },
  };
}

export function createPost(assets) {
  return {
    id: "post",
    draw(ctx, t, globalT) {
      fill(ctx, "#000", 0, 0, W, H);
      const local = globalT - 320.166;
      // 320.166-322.0 is pure silence and black.
      const a = envelope(local, 1.834, 2.6, 4.2, 4.834);
      if (a > 0) {
        ctx.globalAlpha = a;
        drawText(ctx, "珍惜那些在你生命中的名字", 320, 162, {
          size: 18,
          color: PAL.cream,
          align: "center",
          letterSpacing: 2,
          shadow: true,
          shadowColor: "#000000",
          threshold: 100,
        });
        ctx.globalAlpha = 1;
      }
    },
  };
}
