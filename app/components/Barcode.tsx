/* A pack barcode. Fixed bars so it renders the same everywhere. */
const BARS = [3,1,2,1,1,3,2,1,1,2,3,1,2,2,1,1,3,1,1,2,1,3,2,1,2,1,1,2,3,1,1,2,2,1,3,1,2,1,1,3];

export default function Barcode({ label }: { label: string }) {
  let x = 0;
  const rects = BARS.map((w, i) => {
    const r = i % 2 === 0 ? <rect key={i} x={x} y={0} width={w} height={34} /> : null;
    x += w;
    return r;
  });
  return (
    <figure style={{ margin: 0, display: "grid", gap: 6, justifyItems: "start" }}>
      <svg viewBox={`0 0 ${x} 34`} width={x * 3} height={48} preserveAspectRatio="none"
           aria-hidden="true" focusable="false" style={{ fill: "#2A1B0C", maxWidth: "100%" }}>
        {rects}
      </svg>
      <figcaption style={{ fontSize: 11, letterSpacing: "0.3em", color: "#4A3718" }}>{label}</figcaption>
    </figure>
  );
}
