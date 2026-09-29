/* The jukebox.
 *
 * Erik Satie, Gymnopédie No. 1 (1888). The composition is public domain;
 * only recordings of it are copyrighted. So nothing here is a recording —
 * the notes are written out below and synthesised live with Web Audio: a
 * soft electric-piano voice, a small generated room, and the crackle of a
 * record that has been in a smoky bar too long. No audio file, nothing to
 * license, nothing to download.
 */

/* ---- the score ------------------------------------------------------- */

const BPM = 64;              /* "Lent et douloureux" */
const BEAT = 60 / BPM;
const BARS = 20;             /* 4 bars of vamp, then the phrase twice */
const LOOP_BEATS = BARS * 3; /* 3/4 */

type Ev = { beat: number; midi: number; dur: number; vel: number; tine: number };

/* The left hand alternates two chords the whole way through: G major 7
   and D major 7, bass note on the downbeat, chord on beat two. */
const G = { bass: 43, chord: [59, 62, 66] }; /* G2 | B3 D4 F#4  */
const D = { bass: 38, chord: [57, 61, 66] }; /* D2 | A3 C#4 F#4 */

/* The melody, as [bar offset, beat, midi, beats held]. */
const PHRASE: [number, number, number, number][] = [
  [0, 1, 78, 1], [0, 2, 81, 1],                  /*    F#  A    */
  [1, 0, 79, 1], [1, 1, 78, 1], [1, 2, 73, 1],   /* G  F#  C#   */
  [2, 0, 71, 1], [2, 1, 73, 1], [2, 2, 74, 1],   /* B  C#  D    */
  [3, 0, 69, 3],                                 /* A           */
  [4, 0, 66, 12],                                /* F#, held    */
];

function score(): Ev[] {
  const ev: Ev[] = [];
  for (let bar = 0; bar < BARS; bar++) {
    const h = bar % 2 === 0 ? G : D;
    ev.push({ beat: bar * 3, midi: h.bass, dur: 3, vel: 0.2, tine: 0.1 });
    for (const m of h.chord) {
      ev.push({ beat: bar * 3 + 1, midi: m, dur: 2, vel: 0.065, tine: 0.18 });
    }
  }
  for (const start of [4, 12]) {
    for (const [b, beat, midi, dur] of PHRASE) {
      ev.push({ beat: (start + b) * 3 + beat, midi, dur, vel: 0.15, tine: 0.32 });
    }
  }
  return ev.sort((a, b) => a.beat - b.beat);
}

const SCORE = score();
const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/* ---- the machine ----------------------------------------------------- */

const LEVEL = 0.55;

class Jukebox {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus: GainNode | null = null;
  private crackle: AudioBufferSourceNode | null = null;
  private timer = 0;
  private idx = 0;
  private loopStart = 0;
  private running = false;

  muted = false;

  get available() {
    return this.ctx !== null;
  }

  /* Must be called inside a click: browsers only allow audio to start from
     a user gesture, and a context created later comes up suspended. */
  unlock() {
    if (this.ctx) return;
    type W = typeof window & { webkitAudioContext?: typeof AudioContext };
    const Ctor = window.AudioContext ?? (window as W).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    this.ctx = ctx;

    /* voices -> bus -> warmth -> dry + room -> master -> out */
    const bus = ctx.createGain();
    const warm = ctx.createBiquadFilter();
    warm.type = "lowpass";
    warm.frequency.value = 3200;

    const room = ctx.createConvolver();
    room.buffer = this.impulse(ctx, 2.6);
    const wet = ctx.createGain();
    wet.gain.value = 0.3;

    const master = ctx.createGain();
    master.gain.value = 0.0001;

    bus.connect(warm);
    warm.connect(master);
    warm.connect(room);
    room.connect(wet);
    wet.connect(master);
    master.connect(ctx.destination);

    this.bus = bus;
    this.master = master;
    void ctx.resume();
  }

  /* A room, generated: stereo noise with an exponential tail. */
  private impulse(ctx: AudioContext, seconds: number) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
      }
    }
    return buf;
  }

  /* Surface noise: faint hiss plus sparse pops, looped. */
  private startCrackle() {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const secs = 4;
    const buf = ctx.createBuffer(1, ctx.sampleRate * secs, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      let v = (Math.random() * 2 - 1) * 0.012;
      if (Math.random() < 0.00018) v += (Math.random() * 2 - 1) * 0.55;
      d[i] = v;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.value = 0.35;
    src.connect(hp);
    hp.connect(g);
    g.connect(this.master);
    src.start();
    this.crackle = src;
  }

  /* An electric-piano-ish voice: a sine body, a quick bright "tine" an
     octave up that dies fast, and a slightly detuned triangle for warmth. */
  private note(e: Ev, at: number) {
    const ctx = this.ctx;
    if (!ctx || !this.bus) return;
    const f = hz(e.midi);
    const ring = Math.min(e.dur * BEAT + 1.2, 5.5);

    const body = ctx.createOscillator();
    body.type = "sine";
    body.frequency.value = f;

    const warmth = ctx.createOscillator();
    warmth.type = "triangle";
    warmth.frequency.value = f;
    warmth.detune.value = 4;

    const tine = ctx.createOscillator();
    tine.type = "sine";
    tine.frequency.value = f * 2;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(e.vel, at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at + ring);

    const gw = ctx.createGain();
    gw.gain.value = 0.25;

    const gt = ctx.createGain();
    gt.gain.setValueAtTime(0.0001, at);
    gt.gain.exponentialRampToValueAtTime(e.vel * e.tine, at + 0.005);
    gt.gain.exponentialRampToValueAtTime(0.0001, at + 0.45);

    body.connect(g);
    warmth.connect(gw);
    gw.connect(g);
    tine.connect(gt);
    g.connect(this.bus);
    gt.connect(this.bus);

    for (const o of [body, warmth, tine]) {
      o.start(at);
      o.stop(at + ring + 0.05);
    }
  }

  private tick = () => {
    const ctx = this.ctx;
    if (!ctx) return;
    const horizon = ctx.currentTime + 0.25;
    for (;;) {
      const e = SCORE[this.idx];
      const at = this.loopStart + e.beat * BEAT;
      if (at > horizon) break;
      this.note(e, at);
      this.idx += 1;
      if (this.idx >= SCORE.length) {
        this.idx = 0;
        this.loopStart += LOOP_BEATS * BEAT;
      }
    }
  };

  start() {
    const ctx = this.ctx;
    if (!ctx || !this.master || this.running) return;
    this.running = true;
    this.idx = 0;
    this.loopStart = ctx.currentTime + 0.3;
    this.startCrackle();

    const now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(0.0001, now);
    if (!this.muted) this.master.gain.exponentialRampToValueAtTime(LEVEL, now + 3);

    this.tick();
    this.timer = window.setInterval(this.tick, 40);
  }

  setMuted(m: boolean) {
    this.muted = m;
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), now);
    this.master.gain.exponentialRampToValueAtTime(m ? 0.0001 : LEVEL, now + 0.5);
  }

  stop() {
    window.clearInterval(this.timer);
    this.crackle?.stop();
    this.crackle = null;
    this.running = false;
  }
}

export const jukebox = new Jukebox();
