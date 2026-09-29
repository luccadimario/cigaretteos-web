"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cigaretteFrame, run, type Line } from "@/lib/ash";
import styles from "./Terminal.module.css";

/* A faithful re-creation of ash. The command table and the responses come
   from shell.c; the fault dump is captured from a real boot. The kernel
   itself is 64-bit, and no browser emulator does long mode, so this is the
   honest version rather than a pretend one. */

const BANNER: Line[] = [
  { text: "cigaretteOS", tone: "yellow" },
  { text: "one of these is going to kill you", tone: "dim" },
  { text: "" },
  { text: "type 'help'" },
  { text: "" },
];

type Entry = Line & { echo?: boolean };

export default function Terminal() {
  const [lines, setLines] = useState<Entry[]>(BANNER);
  const [value, setValue] = useState("");
  const [halted, setHalted] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState(-1);

  const screenRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const bootedAt = useRef(Date.now());
  const burning = useRef(false);

  const push = useCallback((add: Entry[]) => {
    setLines((prev) => [...prev, ...add]);
  }, []);

  useEffect(() => {
    const el = screenRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  /* `light` animates in place: one line, rewritten as it burns down. */
  const light = useCallback(() => {
    if (burning.current) return;
    burning.current = true;

    const TOTAL = 26;
    let step = 0;
    push([{ text: cigaretteFrame(0, TOTAL), tone: "yellow" }]);

    const tick = window.setInterval(() => {
      step += 1;
      setLines((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          text: cigaretteFrame(step, TOTAL),
          tone: step >= TOTAL ? "dim" : "yellow",
        };
        return next;
      });
      if (step >= TOTAL) {
        window.clearInterval(tick);
        burning.current = false;
        push([{ text: "burned out.", tone: "dim" }, { text: "" }]);
      }
    }, 110);
  }, [push]);

  const submit = useCallback(() => {
    const input = value;
    setValue("");
    if (input.trim()) {
      setHistory((h) => [input, ...h].slice(0, 40));
    }
    setHIndex(-1);

    push([{ text: `ash> ${input}`, echo: true }]);

    const res = run(input, bootedAt.current);

    if (res.clear) {
      setLines([]);
      return;
    }
    if (input.trim() === "light") {
      light();
      return;
    }
    if (res.lines.length) push(res.lines);
    if (res.halt) setHalted(true);
  }, [value, push, light]);

  const reset = useCallback(() => {
    setLines(BANNER);
    setHalted(false);
    bootedAt.current = Date.now();
    inputRef.current?.focus();
  }, []);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const i = Math.min(hIndex + 1, history.length - 1);
      if (i >= 0) {
        setHIndex(i);
        setValue(history[i]);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const i = hIndex - 1;
      setHIndex(i);
      setValue(i >= 0 ? history[i] : "");
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <span className={styles.barName}>ash</span>
        <span>{halted ? "halted" : "ring 0"}</span>
      </div>

      <div
        ref={screenRef}
        className={styles.screen}
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((l, i) => (
          <div
            key={i}
            className={
              l.echo
                ? styles.echo
                : l.tone === "dim"
                  ? styles.dim
                  : l.tone === "ember"
                    ? styles.ember
                    : l.tone === "yellow"
                      ? styles.yellow
                      : styles.line
            }
          >
            {l.text || " "}
          </div>
        ))}

        {halted ? (
          <div className={styles.inputRow}>
            <button type="button" className={styles.reset} onClick={reset}>
              Light another
            </button>
          </div>
        ) : (
          <div className={styles.inputRow}>
            <span className={styles.prompt}>ash&gt;&nbsp;</span>
            <input
              ref={inputRef}
              id="ash-input"
              className={styles.input}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKey}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              aria-label="ash shell input"
            />
          </div>
        )}
      </div>
    </div>
  );
}
