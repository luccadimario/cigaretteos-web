"use client";

import { useEffect } from "react";

/* The cough.
 *
 * The kernel's cough interrupt flips one byte in video memory and gets more
 * frequent as the cigarette burns down. This does the same to the page.
 *
 * Two rules:
 *
 *   It only ever lands on text the reader can actually see. Not the element
 *   being roughly on screen -- the individual character, measured with a
 *   Range, inside the viewport with room to spare. A cough in a paragraph
 *   four screens down is a cough nobody hears.
 *
 *   It never touches anything anyone might copy: no code, no commands, no
 *   addresses, no specs table, not the terminal. A flipped character in a
 *   sentence is a joke; a flipped character in a build command is a bug
 *   that costs someone an afternoon.
 */

const FLIP_MS = 90;              /* gone before you are sure you saw it   */
const EARLY_MS = 55_000;         /* first coughs are rare                 */
const LATE_MS = 16_000;          /* by the end of the cigarette, less so  */
const RAMP_MS = 6 * 60 * 1000;   /* same six minutes as the staining      */
const RETRY_MS = 1_200;          /* nothing visible to cough on: try again */
const EDGE = 48;                 /* keep clear of the viewport edges      */

const SUBS = "@#%&$?!*8B0OQXZ";

const SELECTOR = [
  "main h1", "main h2", "main h3",
  "main p", "main li", "main figcaption",
].join(", ");

function eligible(): HTMLElement[] {
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const out: HTMLElement[] = [];

  document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
    /* never anything copyable */
    if (el.closest("pre, code, table, [data-no-cough]")) return;
    if (el.querySelector("code")) return;
    if ((el.textContent ?? "").trim().length < 4) return;

    /* cheap reject before measuring characters */
    const r = el.getBoundingClientRect();
    if (r.bottom < EDGE || r.top > vh - EDGE) return;
    if (r.right < 0 || r.left > vw) return;

    out.push(el);
  });
  return out;
}

/* Measure the single character with a Range. A long paragraph can be half
   off screen, so the element being visible is not enough. */
function charVisible(node: Text, i: number): boolean {
  const range = document.createRange();
  range.setStart(node, i);
  range.setEnd(node, i + 1);
  const r = range.getBoundingClientRect();
  range.detach?.();

  if (r.width === 0 && r.height === 0) return false;
  return (
    r.top >= EDGE &&
    r.bottom <= window.innerHeight - EDGE &&
    r.left >= 0 &&
    r.right <= window.innerWidth
  );
}

function pickSpot(el: HTMLElement): { node: Text; i: number } | null {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let n = walker.nextNode();
  while (n) {
    if ((n.textContent ?? "").trim().length > 2) nodes.push(n as Text);
    n = walker.nextNode();
  }
  if (!nodes.length) return null;

  for (let tries = 0; tries < 40; tries++) {
    const node = nodes[Math.floor(Math.random() * nodes.length)];
    const text = node.textContent ?? "";
    const i = Math.floor(Math.random() * text.length);
    if (!/[a-z]/i.test(text[i])) continue;
    if (!charVisible(node, i)) continue;
    return { node, i };
  }
  return null;
}

export default function Cough() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const start = Date.now();
    let timer = 0;
    let restore: (() => void) | null = null;

    const schedule = (ms?: number) => {
      if (ms !== undefined) {
        timer = window.setTimeout(cough, ms);
        return;
      }
      const t = Math.min(1, (Date.now() - start) / RAMP_MS);
      const mean = EARLY_MS + (LATE_MS - EARLY_MS) * t;
      timer = window.setTimeout(cough, mean * (0.55 + Math.random() * 0.9));
    };

    function cough() {
      /* Tab in the background: nobody is reading, so do not spend a cough. */
      if (document.hidden) {
        schedule(RETRY_MS);
        return;
      }

      const pool = eligible();
      let spot: { node: Text; i: number } | null = null;

      /* Shuffle so we do not always test the topmost element first. */
      for (let k = pool.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [pool[k], pool[j]] = [pool[j], pool[k]];
      }
      for (const el of pool) {
        spot = pickSpot(el);
        if (spot) break;
      }

      if (!spot) {
        schedule(RETRY_MS);   /* looking at a code block; wait, do not miss */
        return;
      }

      const { node, i } = spot;
      const original = node.textContent ?? "";
      const sub = SUBS[Math.floor(Math.random() * SUBS.length)];
      node.textContent = original.slice(0, i) + sub + original.slice(i + 1);

      restore = () => {
        /* Only put it back if nothing else rewrote the node meanwhile. */
        if ((node.textContent ?? "").length === original.length) {
          node.textContent = original;
        }
        restore = null;
      };
      window.setTimeout(restore, FLIP_MS);

      schedule();
    }

    schedule();

    return () => {
      window.clearTimeout(timer);
      restore?.();
    };
  }, []);

  return null;
}
