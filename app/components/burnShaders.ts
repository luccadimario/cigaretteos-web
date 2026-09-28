/* The paper sheet and the burn, as one fullscreen fragment shader.
 *
 * The whole idea is that a NOISE FIELD decides what burns next, not a
 * circle. Each pixel gets a value from "distance to the ember" plus fractal
 * noise; a rising threshold eats everything below it. Because the noise is
 * lumpy, holes open ahead of the main front and merge back into it, which
 * is what paper actually does. A single expanding circle never does.
 *
 * WebGL 1 / GLSL ES 1.00, so it runs everywhere without a polyfill.
 */

export const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const FRAG = `
precision highp float;

varying vec2 vUv;

uniform vec2  uRes;        /* canvas size in px                       */
uniform vec2  uIgnition;   /* where the ember touched, in uv           */
uniform float uProgress;   /* the rising threshold                     */
uniform float uMaxD;       /* furthest corner, so d normalises to 0..1 */
uniform float uSeed;

/* ---- value noise ---------------------------------------------------- */

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21) + uSeed);
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

/* ---- the sheet ------------------------------------------------------ */

vec3 paper(vec2 uv, float aspect) {
  vec2 p = vec2(uv.x * aspect, uv.y);

  vec3 base = mix(
    vec3(0.827, 0.761, 0.604),
    vec3(0.706, 0.631, 0.459),
    clamp(uv.x * 0.55 + (1.0 - uv.y) * 0.55, 0.0, 1.0)
  );

  base *= 0.94 + fbm(p * 5.0) * 0.12;                    /* mottling  */
  base *= 0.975 + hash(floor(p * uRes.y * 0.6)) * 0.05;  /* grain     */
  base *= 0.985 + vnoise(vec2(p.x * 230.0, p.y * 7.0)) * 0.03; /* fibres */

  float d = distance(uv, vec2(0.5));
  base *= 1.0 - smoothstep(0.34, 0.96, d) * 0.30;        /* vignette  */
  return base;
}

/* ---- main ----------------------------------------------------------- */

const float CHAR  = 0.048;   /* width of the charred band              */
const float BLOOM = 0.105;   /* how far the ember glow reaches ahead   */

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 p  = vec2(vUv.x * aspect, vUv.y);
  vec2 ig = vec2(uIgnition.x * aspect, uIgnition.y);

  float d = distance(p, ig) / uMaxD;
  float field = d + (fbm(p * 7.0) - 0.5) * 0.42;

  /* Below the threshold is gone. The smoothstep is the antialiasing on
     the hole's edge -- a hard discard leaves visible stair-stepping. */
  float alpha = smoothstep(uProgress, uProgress + 0.004, field);
  if (alpha <= 0.001) discard;

  vec3 col = paper(vUv, aspect);

  /* e is how far ahead of the front this pixel sits. */
  float e = field - uProgress;

  if (e < CHAR) {
    col = mix(vec3(0.055, 0.032, 0.014), vec3(0.17, 0.105, 0.05), e / CHAR);
  }

  /* The ember rides the char/paper boundary and blooms into both. */
  float line = 1.0 - smoothstep(0.0, CHAR * 0.55, abs(e - CHAR));
  col = mix(col, vec3(1.0, 0.62, 0.16), line * 0.95);

  float glow = 1.0 - smoothstep(0.0, BLOOM, abs(e - CHAR));
  col += vec3(0.60, 0.22, 0.03) * glow * glow * 0.55;

  gl_FragColor = vec4(col, alpha);
}
`;
