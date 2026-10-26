/* Map the edit decision list to the scene modules.
 *
 * Keeping this mapping in one place means a shot can be re-pointed at another
 * renderer without touching the player, and the player never imports the art
 * directly.
 */

import { SHOTS } from "./timeline.js";
import * as cinema from "./scenes/cinema.js";
import * as shore from "./scenes/shore.js";
import * as city from "./scenes/city.js";
import * as memory from "./scenes/memory.js";
import * as finale from "./scenes/finale.js";

const modules = { ...cinema, ...shore, ...city, ...memory, ...finale };

export const RENDERERS = Object.freeze(
  Object.fromEntries(SHOTS.map((shot) => {
    const fn = modules[shot.render];
    if (typeof fn !== "function") {
      throw new Error(`镜头 ${shot.id} 找不到渲染器 ${shot.render}`);
    }
    return [shot.render, fn];
  })),
);

export function rendererFor(shot) {
  return RENDERERS[shot.render];
}
