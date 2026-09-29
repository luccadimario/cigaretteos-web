"use client";

import { useEffect, useState } from "react";
import { jukebox } from "@/lib/jukebox";
import styles from "./Ambience.module.css";

const KEY = "cigaretteos:muted";

/* Mounted once the pack is open. The audio context was already unlocked by
   the click that lit the cigarette, which is the only moment a browser will
   allow it. */
export default function Ambience() {
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let remembered = false;
    try {
      remembered = window.localStorage.getItem(KEY) === "1";
    } catch {
      /* private window, blocked storage — default to on */
    }
    jukebox.muted = remembered;
    setMuted(remembered);
    jukebox.start();
    setReady(jukebox.available);
    return () => jukebox.stop();
  }, []);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    jukebox.setMuted(next);
    try {
      window.localStorage.setItem(KEY, next ? "1" : "0");
    } catch {
      /* nothing to do; the session still works */
    }
  };

  return (
    <>
      {ready && (
        <button
          type="button"
          className={styles.toggle}
          data-on={!muted}
          onClick={toggle}
          aria-pressed={!muted}
          aria-label={muted ? "Play the music" : "Mute the music"}
          title="Erik Satie, Gymnopédie No. 1 (1888). Public domain, synthesised live."
        >
          <span className={styles.bars} aria-hidden="true">
            <i /><i /><i />
          </span>
          {muted ? "Muted" : "Satie"}
        </button>
      )}
    </>
  );
}
