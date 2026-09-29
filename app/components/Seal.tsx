"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cigarette from "./Cigarette";
import { jukebox } from "@/lib/jukebox";
import { FRAG, VERT } from "./burnShaders";
import styles from "./Seal.module.css";

/* The sealed pack.
 *
 * A sheet of cigarette paper covers the viewport, drawn by a WebGL shader
 * so the burn can be a noise-threshold dissolve rather than an expanding
 * circle. Light the cigarette and the sheet burns away from its ember. */

const DURATION_MS = 2600;
const FROM = -0.28; /* threshold before anything has caught  */
const TO = 1.34; /* threshold once the sheet is gone      */

type Props = { onOpen: () => void };

type GL = {
  gl: WebGLRenderingContext;
  u: {
    res: WebGLUniformLocation | null;
    ignition: WebGLUniformLocation | null;
    progress: WebGLUniformLocation | null;
    maxD: WebGLUniformLocation | null;
    seed: WebGLUniformLocation | null;
  };
};

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function Seal({ onOpen }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stampRef = useRef<HTMLDivElement | null>(null);
  const emberRef = useRef<HTMLButtonElement | null>(null);
  const glRef = useRef<GL | null>(null);
  const burningRef = useRef(false);
  const seedRef = useRef(0);

  const [lit, setLit] = useState(false);
  const [fading, setFading] = useState(false);
  const [painted, setPainted] = useState(false);

  const finish = useCallback(() => {
    document.documentElement.style.overflow = "";
    onOpen();
  }, [onOpen]);

  /* ---- draw ---------------------------------------------------------- */

  const draw = useCallback(
    (progress: number, ignition: [number, number]) => {
      const ctx = glRef.current;
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;
      const { gl, u } = ctx;

      const w = canvas.width;
      const h = canvas.height;
      const aspect = w / h;

      /* the furthest corner, so distance normalises to 0..1 */
      const ix = ignition[0] * aspect;
      const iy = ignition[1];
      const maxD = Math.max(
        Math.hypot(ix - 0, iy - 0),
        Math.hypot(ix - aspect, iy - 0),
        Math.hypot(ix - 0, iy - 1),
        Math.hypot(ix - aspect, iy - 1),
      );

      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform2f(u.res, w, h);
      gl.uniform2f(u.ignition, ignition[0], ignition[1]);
      gl.uniform1f(u.progress, progress);
      gl.uniform1f(u.maxD, maxD || 1);
      gl.uniform1f(u.seed, seedRef.current);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    [],
  );

  /* ---- set up --------------------------------------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    seedRef.current = Math.random() * 100;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    });

    /* No WebGL means no gate — never trap someone behind a broken effect. */
    if (!gl) {
      finish();
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) {
      finish();
      return;
    }

    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      finish();
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    glRef.current = {
      gl,
      u: {
        res: gl.getUniformLocation(prog, "uRes"),
        ignition: gl.getUniformLocation(prog, "uIgnition"),
        progress: gl.getUniformLocation(prog, "uProgress"),
        maxD: gl.getUniformLocation(prog, "uMaxD"),
        seed: gl.getUniformLocation(prog, "uSeed"),
      },
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      if (!burningRef.current) draw(FROM, [0.5, 0.5]);
    };

    resize();
    /* Hand over from the CSS paper to the shader only once a frame of the
       shader's paper is actually on screen. */
    requestAnimationFrame(() => setPainted(true));
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("resize", resize);

    const lost = (e: Event) => {
      e.preventDefault();
      finish();
    };
    canvas.addEventListener("webglcontextlost", lost);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("webglcontextlost", lost);
      document.documentElement.style.overflow = "";
    };
  }, [draw, finish]);

  /* ---- burn ----------------------------------------------------------- */

  const burn = useCallback(
    (ignition: [number, number]) => {
      if (burningRef.current) return;
      burningRef.current = true;

      let start: number | null = null;

      const frame = (now: number) => {
        if (start === null) start = now;
        const p = Math.min(1, (now - start) / DURATION_MS);

        /* slow to catch, then runs away — like paper actually does */
        const eased = p * p * (0.35 + 0.65 * p);
        draw(FROM + (TO - FROM) * eased, ignition);

        if (stampRef.current) {
          stampRef.current.style.opacity = String(Math.max(0, 1 - p * 2.6));
        }

        if (p < 1) {
          requestAnimationFrame(frame);
        } else {
          setFading(true);
          window.setTimeout(finish, 320);
        }
      };

      requestAnimationFrame(frame);
    },
    [draw, finish],
  );

  const light = useCallback(() => {
    if (burningRef.current) return;

    /* The only moment a browser will let audio start is inside the gesture
       itself, so create and resume the context here rather than later. */
    jukebox.unlock();
    setLit(true);

    /* Burn outward from the ember itself. The SVG puts the ember near the
       left end of the cigarette, hence the offset rather than the centre. */
    const box = emberRef.current?.getBoundingClientRect();
    const x = box ? box.left + box.width * 0.09 : window.innerWidth / 2;
    const y = box ? box.top + box.height * 0.5 : window.innerHeight - 90;

    const uv: [number, number] = [
      x / window.innerWidth,
      1 - y / window.innerHeight, /* GL's y runs the other way */
    ];

    window.setTimeout(() => burn(uv), 620);
  }, [burn]);

  return (
    <div
      className={styles.seal}
      data-seal="true"
      data-fading={fading}
      data-painted={painted}
      aria-label="Sealed pack. Light the cigarette to open the site."
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

      <div ref={stampRef} className={styles.stamp}>
        <p className={styles.mark}>
          cigarette<em>OS</em>
        </p>
        <p className={styles.sub}>20 boots &middot; king size &middot; ring&nbsp;0</p>

        <div className={styles.warning}>
          <h2>{"Surgeon General's Warning"}</h2>
          <p>
            This operating system has no memory protection, no user mode and
            one allocator that rounds every request up to a megabyte. Writing
            to an unmapped address will page fault. That part works.
          </p>
        </div>
      </div>

      <div className={styles.lighterWrap}>
        <button
          ref={emberRef}
          type="button"
          className={styles.lightBtn}
          onClick={light}
          disabled={lit}
          aria-label="Light the cigarette to open the site"
        >
          <Cigarette lit={lit} />
          <span className={styles.hint}>{lit ? "burning" : "Light it"}</span>
        </button>

        <button
          type="button"
          className={styles.skip}
          onClick={() => {
            jukebox.unlock();
            finish();
          }}
        >
          Skip the ceremony
        </button>
      </div>
    </div>
  );
}
