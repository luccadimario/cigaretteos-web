/* The ragged, singed edge where the paper band meets the dark page — what
   the burn left behind. Generated from a fixed seed so the server and the
   browser draw exactly the same edge (a random one would fail hydration). */

function path(seed: number, w: number, h: number, lift: number) {
  let s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;

  let d = `M0 ${h}`;
  for (let x = 0; x <= w; x += 9) {
    const wave = Math.sin(x / 70 + seed) * 5 + Math.sin(x / 23) * 2;
    const y = h * 0.42 + wave + (rnd() - 0.5) * 9 - lift;
    d += ` L${x} ${y.toFixed(1)}`;
  }
  return `${d} L${w} ${h} Z`;
}

export default function BurntEdge({
  flip = false,
  seed = 7,
}: {
  flip?: boolean;
  seed?: number;
}) {
  const W = 1440;
  const H = 40;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      style={{
        display: "block",
        width: "100%",
        height: 40,
        transform: flip ? "scaleY(-1)" : undefined,
        marginBottom: flip ? 0 : -1,
        marginTop: flip ? -1 : 0,
      }}
    >
      {/* scorch, then singe, then the paper itself */}
      <path d={path(seed, W, H, 7)} fill="#1C1108" />
      <path d={path(seed, W, H, 4)} fill="#6B4213" />
      <path d={path(seed, W, H, 0)} fill="#C9B88E" />
    </svg>
  );
}
