"use client";

import { useEffect } from "react";

/* Nicotine staining.
 *
 * The plan has the kernel drift its text colour from white toward yellow and
 * brown with uptime. This does the same thing to the reader: the longer the
 * page is open, the more it yellows. Capped well short of unreadable — the
 * joke is that you notice it eventually, not that you cannot finish a
 * sentence. Nothing moves, so there is nothing for reduced-motion to
 * suppress; it is a slow colour drift. */

const FULL_MS = 6 * 60 * 1000; /* fully stained after six minutes */
const MAX = 0.62; /* never go past this much of the way */

const FRESH = [0xd8, 0xcf, 0xc0]; /* --bone */
const STAINED = [0x9a, 0x82, 0x48]; /* tar on a ceiling */

export default function Stain() {
  useEffect(() => {
    const start = Date.now();
    const root = document.documentElement;

    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / FULL_MS) * MAX;

      const mix = FRESH.map((c, i) => Math.round(c + (STAINED[i] - c) * t));
      root.style.setProperty(
        "--bone",
        `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`,
      );
      /* A film builds over everything, the way it does on a wall. */
      root.style.setProperty("--tar-film", (t * 0.16).toFixed(3));
    };

    tick();
    const id = window.setInterval(tick, 4000);
    return () => {
      window.clearInterval(id);
      root.style.removeProperty("--bone");
      root.style.removeProperty("--tar-film");
    };
  }, []);

  return null;
}
