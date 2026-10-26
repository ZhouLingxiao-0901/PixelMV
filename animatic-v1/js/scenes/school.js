import { PAL } from "../../../js/engine/palette.js";
import { drawText } from "../../../js/engine/pixeltext.js";
import { clamp, envelope, lerp, smoothstep } from "../../../js/engine/util.js";
import {
  C, W, H, fill, vBands, dither, pixelCircle, glow, drawSpriteScaled,
  drawSpritePortrait, drawSnow, drawRain, drawDust, drawBirds, drawWindow,
  drawChatPanel, drawPhoneCall, drawVignette,
} from "../art.js";
import { CHAT_MESSAGES, HIGH2_MESSAGES } from "../timeline.js";

/* ---------------------------------------------------------------- gate */

function drawGateShot(ctx, assets, t, opts = {}) {
  const zoom = opts.zoom || 1;
  const panX = opts.panX || 0;
  const night = opts.night || 0;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(W / 2, H / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-W / 2 - panX, -H / 2);

  ctx.drawImage(assets.bg.gate, 0, 0);
  ctx.drawImage(assets.bg.gateFg, 0, 0);

  if (night > 0) {
    ctx.globalAlpha = night;
    fill(ctx, "#101a2d", 0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  // Sun / gate lamp.
  if (night < 0.5) {
    glow(ctx, assets.fx.glowWarm, 626, 132, 200, 200, 0.16);
    glow(ctx, assets.fx.glowWarm, 626, 132, 90, 90, 0.2);
  } else {
    glow(ctx, assets.fx.glowWarm, 344, 190, 160, 160, 0.24);
    glow(ctx, assets.fx.glowMoon, 626, 132, 200, 200, 0.1);
  }

  drawDust(ctx, t, 40, 40, 560, 260, 30, night > 0.5 ? PAL.cool : PAL.warm, 0.75);
  ctx.restore();
}

/* ----------------------------------------------------------- classroom */

function drawClassroomDay(ctx, assets, t, opts = {}) {
  const zoom = opts.zoom || 1;
  const panX = opts.panX || 0;
  const local = opts.local || 0;
  const focusX = opts.focusX ?? W / 2 + panX;
  const focusY = opts.focusY ?? H / 2;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(W / 2, H / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-focusX, -focusY);

  ctx.drawImage(assets.bg.classroom, 0, 0);
  glow(ctx, assets.fx.glowWarm, 520, 150, 320, 250, 0.09);

  const floorY = 320;
  const maleSeat = 330;
  const femaleSeat = 468;

  // Female, seated and writing, then looking up.
  const look = smoothstep(clamp((local - 4.8) / 0.8));
  const femaleFrame = look > 0.5
    ? `look_side_${Math.floor(t * 3) % 2}`
    : `sit_side_${Math.floor(t * 2) % 2}`;
  drawSpriteScaled(ctx, assets.sprites, "female", femaleFrame, femaleSeat, floorY, 1, { flipX: true });

  // Male enters and sits.
  if (local < 0.3) {
    // still off-screen
  } else if (local < 4.4) {
    const q = smoothstep(clamp((local - 0.3) / 4.1));
    const x = lerp(54, maleSeat, q);
    const frame = Math.floor((local - 0.3) * 9) % 6;
    const bob = frame === 1 || frame === 4 ? -1 : 0;
    drawSpriteScaled(ctx, assets.sprites, "male", `walk_side_${frame}`, x, floorY + bob, 1);
  } else {
    const maleLook = smoothstep(clamp((local - 5.1) / 0.7));
    const frame = maleLook > 0.5
      ? `look_side_${Math.floor(t * 3) % 2}`
      : `sit_side_${Math.floor(t * 2) % 2}`;
    drawSpriteScaled(ctx, assets.sprites, "male", frame, maleSeat, floorY, 1);
  }

  // Eye contact and an almost-spoken answer.
  if (look > 0) {
    const bx = femaleSeat + Math.sin(t * 2.3) * 0.5;
    ctx.globalAlpha = look * (0.55 + 0.2 * Math.sin(t * 4));
    fill(ctx, PAL.warm, bx - 2, 274, 1, 1);
    fill(ctx, PAL.warm, maleSeat - 2, 274, 1, 1);
    ctx.globalAlpha = 1;
  }
  if (local > 9.45 && local < 10.25) {
    // A single dark pixel: she has started to answer, but the cut arrives.
    fill(ctx, PAL.skinDeep, femaleSeat - 3, 273, 3, 1);
  }

  ctx.drawImage(assets.bg.classroomFg, 0, 8);
  drawDust(ctx, t, 340, 60, 280, 210, 30, PAL.warm, 0.9);
  ctx.restore();
}

function drawNightClassroom(ctx, assets, t, opts = {}) {
  const zoom = opts.zoom || 1;
  const panX = opts.panX || 0;
  const local = opts.local || 0;
  const focusX = opts.focusX ?? W / 2 + panX;
  const focusY = opts.focusY ?? H / 2;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(W / 2, H / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-focusX, -focusY);

  ctx.drawImage(assets.bg.classroom, 0, 0);
  ctx.globalAlpha = 0.62;
  fill(ctx, "#0b1426", 0, 0, W, H);
  ctx.globalAlpha = 1;

  // Cold window light, warm desk lamps.
  glow(ctx, assets.fx.glowBlue, 540, 150, 260, 240, 0.18);
  glow(ctx, assets.fx.glowWarm, 302, 256, 160, 150, 0.3);
  glow(ctx, assets.fx.glowWarm, 504, 256, 160, 150, 0.28);

  const floorY = 320;
  const maleSeat = 330;
  const femaleSeat = 468;

  drawSpriteScaled(ctx, assets.sprites, "male", `sit_side_${Math.floor(t * 1.4) % 4}`, maleSeat, floorY, 1);
  drawSpriteScaled(ctx, assets.sprites, "female", `sit_side_${Math.floor(t * 1.2 + 1) % 4}`, femaleSeat, floorY, 1, { flipX: true });

  // Desk lamps.
  for (const lx of [286, 488]) {
    fill(ctx, "#2a2433", lx, 246, 22, 5);
    fill(ctx, "#4a3a30", lx + 9, 251, 3, 20);
    fill(ctx, "#d9a441", lx + 2, 238, 17, 8);
    fill(ctx, "#ffd9a0", lx + 4, 245, 13, 2);
    glow(ctx, assets.fx.glowWarm, lx + 10, 248, 82, 72, 0.22);
  }

  // Open books and pencils.
  fill(ctx, "#d8cfbe", 296, 278, 34, 8);
  fill(ctx, "#f2eee2", 298, 279, 30, 6);
  fill(ctx, "#b4a992", 314, 280, 1, 5);
  fill(ctx, "#d8cfbe", 438, 278, 34, 8);
  fill(ctx, "#f2eee2", 440, 279, 30, 6);
  fill(ctx, "#b4a992", 456, 280, 1, 5);
  fill(ctx, PAL.warmDk, 338, 286, 10, 1);

  // A folded note travels between them.
  if (local > 6.4 && local < 9.2) {
    const q = smoothstep(clamp((local - 6.4) / 2.6));
    const nx = lerp(354, 438, q);
    const ny = 292 - Math.sin(q * Math.PI) * 18;
    fill(ctx, "#e8d8c8", nx, ny, 9, 6);
    fill(ctx, "#c8b6a4", nx + 1, ny + 1, 7, 1);
    fill(ctx, "#a89178", nx + 4, ny + 3, 3, 1);
  }
  if (local > 8.6 && local < 12) {
    // She smiles; a tiny warm catchlight at the eye.
    ctx.globalAlpha = 0.7;
    fill(ctx, PAL.warm, femaleSeat - 5, 272, 1, 1);
    ctx.globalAlpha = 1;
  }

  // Lower the near desk row so the seated figures read above it.
  ctx.drawImage(assets.bg.classroomFg, 0, 18);

  // Wall clock hands.
  const clockX = 166;
  const clockY = 38;
  fill(ctx, "#2a2433", clockX, clockY, 1, 8);
  fill(ctx, "#2a2433", clockX, clockY, 6, 1);

  drawDust(ctx, t, 320, 70, 280, 200, 22, PAL.warm, 0.6);
  ctx.restore();
}

/* ---------------------------------------------------------- bedrooms */

function drawBedroomSplit(ctx, assets, t, opts = {}) {
  const zoom = opts.zoom || 1;
  const phoneDown = opts.phoneDown || false;
  const warm = opts.warm || 0;
  const local = opts.local || 0;
  const charScale = opts.charScale || 1;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(W / 2, H / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-W / 2, -H / 2);

  ctx.drawImage(assets.bg.bedroomMale, 0, 0);
  ctx.drawImage(assets.bg.bedroomFemale, 320, 0);

  drawRain(ctx, t, 196, 38, 100, 124, 22);
  drawRain(ctx, t, 334, 38, 100, 124, 20);

  glow(ctx, assets.fx.glowWarm, 300, 182, 54, 54, 0.1);
  glow(ctx, assets.fx.glowWarm, 430, 184, 54, 54, 0.09);

  const floorY = 324;
  const maleX = 140;
  const femaleX = 520;

  const blinkM = (t % 3.4) > 3.2;
  const blinkF = ((t + 1.4) % 4.1) > 3.9;
  let maleFrame;
  let femaleFrame;
  if (phoneDown) {
    maleFrame = `look_front_${Math.floor(t * 2) % 2}`;
    femaleFrame = `look_front_${Math.floor(t * 2 + 1) % 2}`;
  } else {
    maleFrame = blinkM ? `phone_front_${2 + Math.floor(t * 12) % 2}` : `phone_front_${Math.floor(t * 3) % 2}`;
    femaleFrame = blinkF ? `phone_front_${2 + Math.floor(t * 12 + 1) % 2}` : `phone_front_${Math.floor(t * 3 + 1) % 2}`;
  }

  drawSpriteScaled(ctx, assets.sprites, "male", maleFrame, maleX, floorY, charScale);
  drawSpriteScaled(ctx, assets.sprites, "female", femaleFrame, femaleX, floorY, charScale);

  if (!phoneDown) {
    glow(ctx, assets.fx.glowBlue, maleX, 292, 58, 58, 0.32);
    glow(ctx, assets.fx.glowBlue, femaleX, 292, 58, 58, 0.32);
  }
  if (warm > 0) {
    glow(ctx, assets.fx.glowWarm, maleX, 280, 120, 110, 0.12 * warm);
    glow(ctx, assets.fx.glowWarm, femaleX, 280, 120, 110, 0.12 * warm);
  }

  ctx.drawImage(assets.bg.bedroomMaleFg, 0, 8);
  ctx.drawImage(assets.bg.bedroomFemaleFg, 320, 8);

  // Small pandemic-era detail: a mask on each nightstand.
  fill(ctx, "#cfe3ea", 286, 266, 10, 5);
  fill(ctx, "#9fc6d8", 286, 269, 10, 1);
  fill(ctx, "#9fc6d8", 284, 267, 2, 1);
  fill(ctx, "#9fc6d8", 296, 267, 2, 1);
  fill(ctx, "#cfe3ea", 388, 266, 10, 5);
  fill(ctx, "#9fc6d8", 388, 269, 10, 1);
  fill(ctx, "#9fc6d8", 386, 267, 2, 1);
  fill(ctx, "#9fc6d8", 398, 267, 2, 1);

  // Same moon over both rooms.
  if (phoneDown || local > 24) {
    const breathe = 0.7 + 0.3 * Math.sin(t * 0.7);
    glow(ctx, assets.fx.glowMoon, 250, 86, 90, 90, 0.3 * breathe);
    glow(ctx, assets.fx.glowMoon, 390, 90, 90, 90, 0.3 * breathe);
    glow(ctx, assets.fx.glowMoon, 250, 86, 170, 170, 0.06);
    glow(ctx, assets.fx.glowMoon, 390, 90, 170, 170, 0.06);
  }

  fill(ctx, "#111624", 319, 0, 2, H);
  ctx.globalAlpha = 0.22;
  fill(ctx, PAL.coolMid, 321, 0, 1, H);
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawPhoneDial(ctx, t) {
  fill(ctx, "#080b13", 0, 0, W, H);
  dither(ctx, "#121826", 0, 0, W, H, 3, 1);
  drawPhoneCall(ctx, { x: 204, y: 18, w: 232, h: 326, seconds: 0, connected: false, label: "拨号" });
  // Thumb over the call button.
  fill(ctx, PAL.skin, 306, 302, 16, 9);
  fill(ctx, PAL.skinSh, 306, 309, 16, 2);
  fill(ctx, PAL.skin, 320, 298, 4, 7);
  ctx.globalAlpha = 0.35 + 0.15 * Math.sin(t * 4);
  fill(ctx, PAL.warm, 318, 306, 3, 1);
  ctx.globalAlpha = 1;
  drawVignette(ctx, 0.34);
}

/* ------------------------------------------------------------ corridor */

function drawCorridor(ctx, assets, t, opts = {}) {
  const pan = opts.pan || 0;
  const close = opts.close || false;

  if (close) {
    vBands(ctx, 0, 0, W, 250, [
      ["#b8a88d", 1],
      ["#a29178", 1],
      ["#8b7b67", 0.7],
    ]);
    fill(ctx, "#6d5b47", 0, 250, W, 110);
    fill(ctx, "#7d6a52", 0, 250, W, 3);
    // Windows and light shafts.
    for (let i = 0; i < 3; i++) {
      const wx = 40 + i * 230 - pan * 0.7;
      fill(ctx, "#d9e1da", wx, 60, 150, 120);
      fill(ctx, "#2a2433", wx, 60, 150, 4);
      fill(ctx, "#2a2433", wx, 176, 150, 4);
      fill(ctx, "#2a2433", wx + 72, 60, 4, 120);
      ctx.globalAlpha = 0.12;
      fill(ctx, PAL.warm, wx - 20, 180, 190, 120);
      ctx.globalAlpha = 1;
    }
    drawDust(ctx, t, 80, 60, 480, 240, 26, PAL.warm, 0.8);
    drawVignette(ctx, 0.25);
    return;
  }

  // One-point corridor.  Nested frames read as depth without vector lines.
  vBands(ctx, 0, 0, W, 250, [
    ["#b4a386", 1],
    ["#9d8b72", 1],
    ["#87775f", 1],
  ]);
  fill(ctx, "#6d5b47", 0, 250, W, 110);
  fill(ctx, "#7d6a52", 0, 250, W, 3);
  fill(ctx, "#2d3238", 0, 0, W, 38);
  for (let i = 0; i < 6; i++) {
    const inset = i * 26;
    fill(ctx, i % 2 ? "#a08e73" : "#ae9d80", inset, 38 + inset * 0.2, W - inset * 2, 220 - inset * 0.4);
  }
  fill(ctx, "#5d4d3c", 292, 142, 56, 108);
  fill(ctx, "#2a2433", 298, 150, 44, 90);
  fill(ctx, "#d9b879", 316, 170, 2, 2);

  // Side doors and windows.
  const doors = [
    { x: 34, y: 86, w: 72, h: 190 },
    { x: 534, y: 92, w: 72, h: 184 },
    { x: 138, y: 118, w: 40, h: 140 },
    { x: 462, y: 120, w: 38, h: 138 },
  ];
  for (const d of doors) {
    const dx = d.x - pan * 0.6;
    fill(ctx, "#4a3a30", dx, d.y, d.w, d.h);
    fill(ctx, "#6b5443", dx, d.y, d.w, 3);
    fill(ctx, "#2a2433", dx + d.w * 0.16, d.y + 14, d.w * 0.68, d.h * 0.34);
    fill(ctx, "#a9c7d2", dx + d.w * 0.2, d.y + 18, d.w * 0.6, d.h * 0.28);
    fill(ctx, "#d9b879", dx + d.w - 12, d.y + d.h * 0.55, 3, 3);
    // Class plaque: no invented class number, just a small marker.
    fill(ctx, "#d8cfbe", dx + d.w * 0.32, d.y - 12, d.w * 0.36, 9);
    fill(ctx, "#7a6a5b", dx + d.w * 0.36, d.y - 9, d.w * 0.28, 1);
  }

  // Windows on the left wall.
  for (let i = 0; i < 2; i++) {
    const wx = 16 + i * 34 - pan * 0.4;
    fill(ctx, "#2a2433", wx, 82 + i * 16, 20 - i * 4, 118 - i * 18);
    fill(ctx, "#a9c7d2", wx + 3, 86 + i * 16, 14 - i * 3, 108 - i * 16);
  }

  // Light pools.
  ctx.globalAlpha = 0.09;
  fill(ctx, PAL.warm, 0, 260, 280, 90);
  ctx.globalAlpha = 1;

  drawDust(ctx, t, 60, 50, 520, 240, 28, PAL.warm, 0.7);
  drawVignette(ctx, 0.22);
}

/* --------------------------------------------------------------- park */

function drawPark(ctx, assets, t, globalT, walkPhase = 0) {
  const scroll = (t * 12) % 640;
  vBands(ctx, 0, 0, W, 230, [
    ["#8fa5b2", 1],
    ["#b1b7ac", 1],
    ["#d0c1a2", 1],
  ]);
  pixelCircle(ctx, "#ffe0a8", 540, 82, 20);
  drawBirds(ctx, globalT, 300, 48, 4, "#3a3344");

  // Far city.
  for (let i = 0; i < 10; i++) {
    const bh = 24 + (i * 19) % 52;
    fill(ctx, "#8a9290", 12 + i * 66 - scroll * 0.08, 224 - bh, 50, bh);
  }

  // Tree bands with parallax.
  for (let i = 0; i < 7; i++) {
    const tx = i * 118 - scroll * 0.22;
    fill(ctx, "#4a3a30", tx, 166, 10, 78);
    fill(ctx, "#3f5d4a", tx - 28, 138, 66, 40);
    fill(ctx, "#5f7f5c", tx - 12, 120, 48, 34);
    fill(ctx, "#88a06e", tx + 2, 114, 26, 20);
  }
  for (let i = 0; i < 8; i++) {
    const tx = i * 96 - scroll * 0.38 + 36;
    fill(ctx, "#4a3a30", tx, 192, 7, 58);
    fill(ctx, "#3f5d4a", tx - 18, 174, 44, 30);
    fill(ctx, "#5f7f5c", tx - 8, 164, 28, 22);
  }

  // Grass, path, dappled light.
  fill(ctx, "#5f7f5c", 0, 232, W, 54);
  fill(ctx, "#6f8a62", 0, 232, W, 3);
  fill(ctx, "#8d7b5e", 0, 286, W, 74);
  fill(ctx, "#7c6b51", 0, 286, W, 3);
  dither(ctx, "#6f8a62", 0, 238, W, 44, 3, 1);
  dither(ctx, "#a08b69", 0, 294, W, 58, 4, 0);

  // Bench on the far side.
  fill(ctx, "#4a3a30", 78 - scroll * 0.18, 268, 116, 6);
  fill(ctx, "#6b5443", 78 - scroll * 0.18, 262, 116, 6);
  fill(ctx, "#4a3a30", 88 - scroll * 0.18, 274, 5, 26);
  fill(ctx, "#4a3a30", 176 - scroll * 0.18, 274, 5, 26);

  // Sun shafts and floating seeds.
  ctx.globalAlpha = 0.08;
  fill(ctx, PAL.warm, 360, 100, 120, 200);
  ctx.globalAlpha = 1;
  drawDust(ctx, globalT, 0, 100, W, 180, 30, PAL.warm, 0.8);

  // Two students walking together.  The match cut to the mountain keeps
  // these exact positions and the same walk phase.
  const walk = Math.floor(globalT * 6.4) % 6;
  const bob = walk === 1 || walk === 4 ? -1 : 0;
  drawSpriteScaled(ctx, assets.sprites, "male", `walk_side_${walk}`, 250, 318 + bob, 1.6, {
    image: assets.variants.casualMale,
  });
  drawSpriteScaled(ctx, assets.sprites, "female", `walk_side_${(walk + 2) % 6}`, 392, 318 + bob, 1.6, {
    image: assets.variants.casualFemale,
  });

  // A shared drink in the woman's hand.
  fill(ctx, "#d8cfbe", 414, 258, 8, 13);
  fill(ctx, "#e8d8c8", 414, 258, 8, 2);
  fill(ctx, "#b4473e", 416, 250, 2, 9);

  drawVignette(ctx, 0.2);
}

/* ---------------------------------------------------------- factories */

export function createFirstMeet(assets) {
  return {
    id: "firstMeet",
    draw(ctx, t) {
      if (t < 6.0) {
        const q = smoothstep(clamp(t / 6.0));
        drawGateShot(ctx, assets, t, { zoom: 1.0 + q * 0.05, panX: q * 8 });
        // A few leaves in the foreground.
        for (let i = 0; i < 6; i++) {
          const x = ((i * 113 + t * (8 + i)) % 700) - 30;
          const y = 250 + Math.sin(t * 0.8 + i) * 16 + i * 7;
          fill(ctx, i % 2 ? PAL.warmMid : PAL.redSoft, x, y, 2, 1);
        }
      } else if (t < 16.8) {
        const ct = t - 6.0;
        if (ct < 5.0) {
          const q = smoothstep(clamp(ct / 5.0));
          drawClassroomDay(ctx, assets, t, {
            zoom: 1.0 + q * 0.07,
            panX: 24 - q * 14,
            local: ct,
          });
        } else {
          // Close two-shot over the desks: the name question, the half-spoken
          // answer, then the cut before the name.  A slow push keeps it alive.
          const q = smoothstep(clamp((ct - 5.0) / 5.8));
          drawClassroomDay(ctx, assets, t, {
            zoom: 2.9 + q * 0.14,
            focusX: 399,
            focusY: 296,
            local: ct,
          });
        }
      } else {
        fill(ctx, "#000", 0, 0, W, H);
      }
    },
  };
}

export function createPandemic(assets) {
  return {
    id: "pandemic",
    draw(ctx, t, globalT) {
      const local = globalT - 34.243;
      if (local < 12.0) {
        drawBedroomSplit(ctx, assets, t, { phoneDown: false, local });
      } else if (local < 20.0) {
        drawBedroomSplit(ctx, assets, t, { phoneDown: false, local, zoom: 1.02 });
        ctx.globalAlpha = 0.45;
        fill(ctx, "#050810", 0, 0, W, H);
        ctx.globalAlpha = 1;
        drawChatPanel(ctx, {
          x: 132, y: 30, w: 376, h: 300, t: globalT,
          messages: CHAT_MESSAGES, title: "聊天",
        });
        drawVignette(ctx, 0.2);
      } else {
        drawBedroomSplit(ctx, assets, t, {
          phoneDown: local > 24.4,
          local,
          zoom: 1.0 + smoothstep(clamp((local - 20) / 8.2)) * 0.05,
          warm: smoothstep(clamp((local - 23.5) / 2)) * 0.7,
        });
      }
    },
  };
}

function drawWideBedroom(ctx, assets, t, local) {
  const q = smoothstep(clamp(local / 4.8));
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  // Push in toward the room rather than showing the whole empty set.
  ctx.translate(W / 2, H);
  ctx.scale(1.32 + q * 0.08, 1.32 + q * 0.08);
  ctx.translate(-W / 2 - (30 - q * 26), -H);

  // The supplied bedroom is 320 px wide.  Extend it to a full 16:9 room with
  // the same wall, floor, and palette, so this shot reads as a wide space
  // rather than a half-frame with black beside it.
  fill(ctx, "#2b344b", 318, 0, 322, 292);
  for (let x = 326; x < W; x += 30) {
    fill(ctx, "#262f45", x, 0, 1, 292);
    fill(ctx, "#303a51", x + 1, 0, 1, 292);
  }
  fill(ctx, "#1a2035", 318, 292, 322, 68);
  fill(ctx, "#20283c", 318, 288, 322, 5);
  fill(ctx, "#151b2d", 318, 324, 322, 36);
  fill(ctx, "#1e2740", 318, 0, 5, 360);

  // A wardrobe, a closed door, and a small poster on the extension.
  fill(ctx, "#3a2e27", 424, 106, 116, 186);
  fill(ctx, "#4a3a30", 424, 102, 116, 8);
  fill(ctx, "#2b211d", 432, 116, 48, 164);
  fill(ctx, "#2b211d", 486, 116, 46, 164);
  fill(ctx, "#5c493d", 476, 190, 3, 12);
  fill(ctx, "#5c493d", 484, 190, 3, 12);
  fill(ctx, "#2a2433", 562, 132, 54, 160);
  fill(ctx, "#3b3444", 566, 138, 46, 150);
  fill(ctx, "#d9b879", 602, 210, 3, 3);
  fill(ctx, "#2a2433", 352, 82, 52, 62);
  fill(ctx, "#8a7a68", 356, 86, 44, 54);
  fill(ctx, "#3f5d4a", 358, 110, 40, 28);
  fill(ctx, "#ffd9a0", 384, 90, 9, 9);

  // A floor lamp on the right.
  fill(ctx, "#3a3a3a", 628, 214, 3, 78);
  fill(ctx, "#3a3a3a", 616, 212, 28, 3);
  fill(ctx, "#ffd9a0", 614, 216, 8, 5);
  glow(ctx, assets.fx.glowWarm, 618, 218, 90, 90, 0.12);

  // The original room.
  ctx.drawImage(assets.bg.bedroomMale, 0, 0);
  drawSnow(ctx, t, 196, 38, 100, 124, 30);
  glow(ctx, assets.fx.glowWarm, 300, 182, 52, 52, 0.1);
  glow(ctx, assets.fx.glowBlue, 300, 292, 60, 60, 0.18);

  // He paces in the open floor by the desk.  The bed base sits in front of
  // the left side of the room, so he never stands behind it here.
  const pace = local * 1.55;
  const x = 300 + Math.sin(pace) * 52;
  const dir = Math.cos(pace) >= 0 ? 1 : -1;
  const frame = Math.floor(local * 9) % 6;
  fill(ctx, "#111828", x - 15, 323, 30, 2);
  drawSpriteScaled(ctx, assets.sprites, "male", `walk_side_${frame}`, x, 324, 1, {
    flipX: dir < 0,
  });
  // The phone is already in his hand, its screen a small cold light.
  glow(ctx, assets.fx.glowBlue, x + dir * 9, 299, 34, 34, 0.16);

  ctx.drawImage(assets.bg.bedroomMaleFg, 0, 8);
  ctx.restore();
  drawVignette(ctx, 0.3);
}

export function createConfession(assets) {
  return {
    id: "confession",
    draw(ctx, t, globalT) {
      const local = globalT - 62.439;

      if (local < 4.8) {
        // Wide, restless room.  He paces before sitting.
        drawWideBedroom(ctx, assets, t, local);
        return;
      }

      if (local < 8.2) {
        // Close-up in bed: his face held in the cold light of the phone.
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.translate(W / 2, 220);
        ctx.scale(2.0, 2.0);
        ctx.translate(-160, -260);
        ctx.drawImage(assets.bg.bedroomMale, 0, 0);
        ctx.restore();
        ctx.globalAlpha = 0.34;
        fill(ctx, "#080c16", 0, 0, W, H);
        ctx.globalAlpha = 1;
        glow(ctx, assets.fx.glowWarm, 268, 132, 180, 180, 0.07);
        drawSpritePortrait(ctx, assets.sprites, "male", `phone_front_${Math.floor(t * 3) % 2}`, 320, 198, 6.0, {
          neckRect: [21, 24, 7, 6],
        });

        // The blanket in the lower frame sells that he is sitting up in bed.
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.translate(W / 2, 220);
        ctx.scale(2.0, 2.0);
        ctx.translate(-160, -260);
        ctx.drawImage(assets.bg.bedroomMaleFg, 0, 8);
        ctx.restore();

        // Cold phone light spills upward across the blanket and his face.
        glow(ctx, assets.fx.glowBlue, 320, 300, 250, 170, 0.22);
        glow(ctx, assets.fx.glowBlue, 320, 262, 130, 90, 0.14);
        drawVignette(ctx, 0.36);
        return;
      }

      if (local < 11.592) {
        drawPhoneDial(ctx, t);
        return;
      }

      if (local < 27.1) {
        if (local >= 20.9 && local < 24.7) {
          // "I like you."  The line itself, held on his face.
          ctx.save();
          ctx.imageSmoothingEnabled = false;
          ctx.translate(W / 2, 220);
          ctx.scale(2.0, 2.0);
          ctx.translate(-160, -260);
          ctx.drawImage(assets.bg.bedroomMale, 0, 0);
          ctx.restore();
          ctx.globalAlpha = 0.36;
          fill(ctx, "#080c16", 0, 0, W, H);
          ctx.globalAlpha = 1;
          glow(ctx, assets.fx.glowWarm, 272, 136, 190, 190, 0.08);
          const push = smoothstep(clamp((local - 20.9) / 3.8));
          drawSpritePortrait(ctx, assets.sprites, "male", `phone_front_${Math.floor(t * 3) % 2}`, 320, 198, 6.0 + push * 0.28, {
            neckRect: [21, 24, 7, 6],
          });
          ctx.save();
          ctx.imageSmoothingEnabled = false;
          ctx.translate(W / 2, 220);
          ctx.scale(2.0, 2.0);
          ctx.translate(-160, -260);
          ctx.drawImage(assets.bg.bedroomMaleFg, 0, 8);
          ctx.restore();
          glow(ctx, assets.fx.glowBlue, 320, 300, 250, 170, 0.22);
          glow(ctx, assets.fx.glowBlue, 320, 262, 130, 90, 0.14);
          drawVignette(ctx, 0.36);
          return;
        }

        // Split screen: the call is connected, then the wait.
        const q = smoothstep(clamp((local - 11.592) / 15.5));
        drawBedroomSplit(ctx, assets, t, {
          phoneDown: false,
          local,
          zoom: 1.0 + q * 0.04,
          warm: 0,
          charScale: 1.35,
        });
        // Faint call ring arcs at the start of the connection.
        if (local < 14.2) {
          ctx.globalAlpha = 0.2 + 0.12 * Math.sin(t * 6);
          for (let i = 1; i <= 3; i++) {
            ctx.strokeStyle = PAL.cool;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(140, 286, 12 + i * 7 + (local - 11.592) * 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(520, 286, 12 + i * 7 + (local - 11.592) * 8, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
        return;
      }

      if (local < 31.6) {
        // She answers.  A full-screen close-up, then his reaction.
        const q = smoothstep(clamp((local - 27.1) / 1.2));
        if (local < 29.2) {
          ctx.save();
          ctx.imageSmoothingEnabled = false;
          ctx.translate(W / 2, 220);
          ctx.scale(2.0, 2.0);
          ctx.translate(-160, -260);
          ctx.drawImage(assets.bg.bedroomFemale, 0, 0);
          ctx.restore();
          ctx.globalAlpha = 0.46;
          fill(ctx, "#0d0d18", 0, 0, W, H);
          ctx.globalAlpha = 1;
          glow(ctx, assets.fx.glowWarm, 320, 176, 330, 280, 0.24);
          drawSpritePortrait(ctx, assets.sprites, "female", `look_front_${Math.floor(t * 2) % 2}`, 320, 168, 6.6, {
            neckRect: [21, 27, 8, 7],
          });
          ctx.globalAlpha = q * 0.1;
          fill(ctx, "#ffd9a0", 0, 0, W, H);
          ctx.globalAlpha = 1;
        } else {
          ctx.save();
          ctx.imageSmoothingEnabled = false;
          ctx.translate(W / 2, 220);
          ctx.scale(2.0, 2.0);
          ctx.translate(-160, -260);
          ctx.drawImage(assets.bg.bedroomMale, 0, 0);
          ctx.restore();
          ctx.globalAlpha = 0.5;
          fill(ctx, "#080c16", 0, 0, W, H);
          ctx.globalAlpha = 1;
          glow(ctx, assets.fx.glowBlue, 320, 196, 310, 270, 0.18);
          glow(ctx, assets.fx.glowWarm, 286, 300, 160, 140, 0.1);
          drawSpritePortrait(ctx, assets.sprites, "male", `look_front_${Math.floor(t * 2) % 2}`, 320, 168, 6.6, {
            neckRect: [21, 24, 7, 6],
          });
          ctx.globalAlpha = q * 0.08;
          fill(ctx, "#ffd9a0", 0, 0, W, H);
          ctx.globalAlpha = 1;
        }
        drawVignette(ctx, 0.34);
        return;
      }

      if (local < 48) {
        // The room quietly fills with warmth; neither of them can sleep.
        drawBedroomSplit(ctx, assets, t, {
          phoneDown: true,
          local,
          zoom: 1.0 + smoothstep(clamp((local - 31.6) / 16.4)) * 0.07,
          warm: 1,
        });
        // A low warm wash.
        ctx.globalAlpha = 0.07 + 0.03 * Math.sin(t * 1.1);
        fill(ctx, PAL.warm, 0, 0, W, H);
        ctx.globalAlpha = 1;
        if (local > 39) {
          // Phones lowered; one last look at the ceiling.
          glow(ctx, assets.fx.glowMoon, 250, 86, 140, 140, 0.1);
          glow(ctx, assets.fx.glowMoon, 390, 90, 140, 140, 0.1);
        }
      } else {
        // Late night, snow, and a soft fade toward morning.
        drawBedroomSplit(ctx, assets, t, {
          phoneDown: true,
          local,
          zoom: 1.06,
          warm: 0.45,
        });
        ctx.globalAlpha = 0.18;
        fill(ctx, "#0a0f1a", 0, 0, W, H);
        ctx.globalAlpha = 1;
        drawSnow(ctx, t, 196, 38, 100, 124, 24);
        drawSnow(ctx, t, 334, 38, 100, 124, 22);
        const fade = smoothstep(clamp((local - 52) / 3.9));
        ctx.globalAlpha = fade * 0.4;
        fill(ctx, PAL.warm, 0, 0, W, H);
        ctx.globalAlpha = 1;
      }
    },
  };
}

export function createClasses(assets) {
  return {
    id: "classes",
    draw(ctx, t, globalT) {
      const local = globalT - 118.343;

      if (local < 7.0) {
        drawCorridor(ctx, assets, t, { pan: local * 10 });
        const walk = Math.floor(globalT * 6.2) % 6;
        const bob = walk === 1 || walk === 4 ? -1 : 0;
        const mx = lerp(150, 258, smoothstep(clamp(local / 6.4)));
        const fx = lerp(492, 392, smoothstep(clamp(local / 6.4)));
        drawSpriteScaled(ctx, assets.sprites, "male", `walk_side_${walk}`, mx, 320 + bob, 1.6);
        drawSpriteScaled(ctx, assets.sprites, "female", `walk_side_${(walk + 3) % 6}`, fx, 320 + bob, 1.6, { flipX: true });
      } else if (local < 14.0) {
        const ct = local - 7.0;
        drawCorridor(ctx, assets, t, { close: true, pan: ct * 16 });
        const walk = Math.floor(globalT * 6.2) % 6;
        const mx = 236 + ct * 12;
        const fx = 408 - ct * 12;
        drawSpriteScaled(ctx, assets.sprites, "male", `walk_side_${walk}`, mx, 322, 2.0);
        drawSpriteScaled(ctx, assets.sprites, "female", `walk_side_${(walk + 3) % 6}`, fx, 322, 2.0, { flipX: true });
        // The almost-glance as they pass.
        if (ct > 2.0 && ct < 4.6) {
          ctx.globalAlpha = 0.65;
          fill(ctx, PAL.warm, 330, 276, 1, 1);
          fill(ctx, PAL.warm, 350, 276, 1, 1);
          ctx.globalAlpha = 1;
          // A hand almost reaches the other's.
          fill(ctx, PAL.skin, 318, 310, 5, 3);
          fill(ctx, PAL.skin, 344, 310, 5, 3);
        }
      } else {
        drawPark(ctx, assets, t, globalT, 0);
      }
    },
  };
}

export function createHigh2(assets) {
  return {
    id: "high2",
    draw(ctx, t, globalT) {
      const local = globalT - 188.743;

      if (local < 12.0) {
        const q = smoothstep(clamp(local / 12));
        drawNightClassroom(ctx, assets, t, {
          zoom: 2.5 + q * 0.12,
          focusX: 399,
          focusY: 272,
          local,
        });
      } else if (local < 18.0) {
        const ct = local - 12.0;
        drawGateShot(ctx, assets, t, { night: 0.8, zoom: 1.04, panX: 8 });
        // Walking out, then parting with a look back.
        const walk = Math.floor(globalT * 6) % 6;
        const mx = 236 - smoothstep(clamp(ct / 5.4)) * 76;
        const fx = 404 + smoothstep(clamp(ct / 5.4)) * 76;
        drawSpriteScaled(ctx, assets.sprites, "male", `walk_side_${walk}`, mx, 326, 1.5, { flipX: ct > 3.2 });
        drawSpriteScaled(ctx, assets.sprites, "female", `walk_side_${(walk + 2) % 6}`, fx, 326, 1.5, { flipX: ct < 3.2 });
        if (ct > 4.2) {
          ctx.globalAlpha = 0.55;
          fill(ctx, PAL.warm, 170, 282, 1, 1);
          fill(ctx, PAL.warm, 468, 282, 1, 1);
          ctx.globalAlpha = 1;
        }
      } else if (local < 23.0) {
        drawBedroomSplit(ctx, assets, t, {
          phoneDown: false,
          local,
          zoom: 1.2,
          warm: 0.2,
        });
        ctx.globalAlpha = 0.55;
        fill(ctx, "#050810", 0, 0, W, H);
        ctx.globalAlpha = 1;
        drawChatPanel(ctx, {
          x: 196, y: 72, w: 248, h: 214, t: globalT,
          messages: HIGH2_MESSAGES, title: "聊天",
        });
        drawVignette(ctx, 0.2);
      } else {
        drawBedroomSplit(ctx, assets, t, {
          phoneDown: true,
          local,
          zoom: 1.08,
          warm: 0.5,
        });
        const a = smoothstep(clamp((local - 23) / 3));
        ctx.globalAlpha = a * 0.08;
        fill(ctx, PAL.warm, 0, 0, W, H);
        ctx.globalAlpha = 1;
      }
    },
  };
}
