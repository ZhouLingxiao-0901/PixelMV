/* Runtime LRC reader for 《红》.
 *
 * The LRC is read from the local project file and never rewritten.  The
 * source begins with three production-credit lines at the same timestamp as
 * the first lyric, plus a short parenthetical translation of "For tonight".
 * Credits are filtered out; parenthetical translations are attached to the
 * preceding line as an optional sub-line instead of being counted as a sung
 * phrase.
 */

import { LRC_SRC } from "./timeline.js";

export const LYRIC_OFFSET = 0.06;
const MAX_HOLD = 5.6;
const MIN_HOLD = 0.55;

const CREDIT = /^(作词|作曲|编曲|制作|出品|营销|发行|OP|SP|混音|母带|录音|吉他|和声|监制|统筹|企划|封面|设计|版权)/i;

function cleanText(raw) {
  return raw
    .replace(/^\s*[：:]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isParenthetical(text) {
  return /^[（(].*[）)]$/.test(text);
}

export function parseLrc(text) {
  const raw = [];
  for (const line of text.split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith("{")) continue;
    const hits = [...s.matchAll(/\[(\d{1,2}):(\d{2}(?:\.\d{1,3})?)\]/g)];
    if (!hits.length) continue;
    const body = cleanText(s.replace(/\[[^\]]*\]/g, ""));
    if (!body) continue;
    for (const h of hits) {
      raw.push({ time: Number(h[1]) * 60 + Number(h[2]), text: body });
    }
  }
  raw.sort((a, b) => a.time - b.time || a.text.length - b.text.length);

  // One sung line per timestamp.  A credit or parenthetical at the same stamp
  // must not replace the actual lyric.
  const byTime = new Map();
  for (const item of raw) {
    const key = item.time.toFixed(3);
    if (!byTime.has(key)) byTime.set(key, []);
    byTime.get(key).push(item.text);
  }

  const picked = [];
  for (const [key, texts] of byTime) {
    let line = texts.find((x) => !CREDIT.test(x) && !isParenthetical(x));
    if (!line) continue;
    const sub = texts.find((x) => isParenthetical(x)) || null;
    picked.push({ time: Number(key), text: line, sub });
  }
  picked.sort((a, b) => a.time - b.time);

  const lines = [];
  for (let i = 0; i < picked.length; i++) {
    const item = picked[i];
    const next = picked[i + 1]?.time ?? item.time + MAX_HOLD + 1;
    const endRaw = Math.min(next - 0.10, item.time + MAX_HOLD);
    const end = Math.max(item.time + MIN_HOLD, endRaw);
    lines.push({
      text: item.text,
      sub: item.sub,
      sourceStart: item.time,
      start: item.time + LYRIC_OFFSET,
      end: end + LYRIC_OFFSET,
    });
  }
  return lines;
}

export async function loadLyrics() {
  const res = await fetch(LRC_SRC, { cache: "no-store" });
  if (!res.ok) throw new Error(`无法读取 LRC（HTTP ${res.status}）`);
  const text = await res.text();
  return parseLrc(text);
}

export function lyricAt(lines, t) {
  for (const line of lines) {
    if (t >= line.start && t < line.end) return line;
  }
  return null;
}

export function lyricIndexAt(lines, t) {
  for (let i = 0; i < lines.length; i++) {
    if (t >= lines[i].start && t < lines[i].end) return i;
  }
  return -1;
}
