#!/usr/bin/env node
// Render the film frame-by-frame to PNG for MP4 export.
// Usage: node export_frames.cjs [outDir] [startFrame] [endFrame]
// Needs the local server (http://127.0.0.1:8123/hong/) and the Playwright
// package that ships with the Playwright MCP server.
const fs = require("fs");
const path = require("path");
const { chromium } = require("D:/Nodejs/Cache/_npx/9833c18b2d85bc59/node_modules/playwright");

const FPS = 30;
const URL = "http://127.0.0.1:8123/hong/";
const outDir = path.resolve(process.argv[2] || "D:/PixelMV/hong/export/_frames");
const startFrame = Number(process.argv[3] || 0);
const endArg = Number(process.argv[4] || 0);

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  // The Playwright MCP install drives the system Chrome (channel: "chrome")
  // instead of downloading a bundled Chromium, so match that here.
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(URL, { waitUntil: "domcontentloaded" });

  const duration = await page.evaluate(() =>
    window.__HONG__.whenReady.then(() => window.__HONG__.duration)
  );
  const total = Math.round(duration * FPS);
  const end = endArg > 0 ? Math.min(endArg, total) : total;
  console.log(`duration ${duration.toFixed(3)}s, ${total} frames, rendering ${startFrame}..${end - 1}`);

  // Batches keep the CDP round trips down; PNG at 640x360 is small enough that
  // 40 frames per call still returns quickly.
  const BATCH = 40;
  let done = 0;
  for (let i = startFrame; i < end; i += BATCH) {
    const stop = Math.min(i + BATCH, end);
    const times = [];
    for (let f = i; f < stop; f++) times.push(f / FPS);

    const urls = await page.evaluate((ts) => {
      const h = window.__HONG__;
      const out = [];
      for (const t of ts) {
        h.renderAt(t);
        out.push(h.snapshot());
      }
      return out;
    }, times);

    urls.forEach((url, k) => {
      const frame = i + k;
      const b64 = url.slice(url.indexOf(",") + 1);
      fs.writeFileSync(
        path.join(outDir, `frame_${String(frame).padStart(5, "0")}.png`),
        Buffer.from(b64, "base64")
      );
    });
    done += urls.length;
    if (done % 400 < BATCH || stop === end) console.log(`${done}/${end - startFrame} frames`);
  }

  await browser.close();
  console.log(`done: ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
