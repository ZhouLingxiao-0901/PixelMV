/* Lyric layer for Animatic V2.
 *
 * The original LRC is fetched at runtime; it is never rewritten or cached as a
 * second lyric source.  NetEase's JSON credit lines and the production credits
 * at 04:53+ are ignored.  A display offset may be adjusted here without ever
 * touching the MP3 or the LRC.
 */

export const LRC_URL = "../assets/audio/卢广仲 - 刻在我心底的名字.lrc";

/* The LRC sits inside the candidate section nodes (largest difference is the
 * third chorus, 188.238 in the LRC vs 188.743 in the draft).  A small display
 * delay keeps the line from arriving a frame before the sung phrase. */
export const LYRIC_OFFSET = 0.08;

const FIRST_LYRIC = 33.0;
const LAST_LYRIC = 284.0;
const MAX_HOLD = 7.5;

const CREDIT = /^(作词|作曲|编曲|制作人|混音|管乐|民谣吉他|古典吉他|长笛|长号|法国号|小号|吉他录音|吉他录音师|吉他录音室|吉他录音助理)/;

function parseLrc(text) {
  const markers = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("{")) continue;
    const hits = [...line.matchAll(/\[(\d{1,2}):(\d{2}(?:\.\d{1,3})?)\]/g)];
    if (!hits.length) continue;
    const body = line.replace(/\[[^\]]*\]/g, "").trim();
    for (const hit of hits) {
      const m = Number(hit[1]);
      const s = Number(hit[2]);
      markers.push({ time: m * 60 + s, text: body });
    }
  }
  markers.sort((a, b) => a.time - b.time);

  const entries = [];
  for (let i = 0; i < markers.length; i++) {
    const m = markers[i];
    if (!m.text) continue;
    if (m.time < FIRST_LYRIC || m.time > LAST_LYRIC) continue;
    if (CREDIT.test(m.text)) continue;

    let next = i + 1;
    while (next < markers.length && markers[next].time <= m.time + 0.001) next++;
    const nextTime = next < markers.length ? markers[next].time : m.time + MAX_HOLD;
    // Hold until the next LRC marker, but never park a single line on screen
    // for the whole instrumental tail.
    const rawEnd = Math.min(nextTime - 0.12, m.time + MAX_HOLD);
    entries.push({
      text: m.text,
      sourceStart: m.time,
      start: m.time + LYRIC_OFFSET,
      end: rawEnd + LYRIC_OFFSET,
    });
  }
  return entries;
}

export async function loadLyrics() {
  const res = await fetch(LRC_URL, { cache: "no-store" });
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

export { parseLrc };
