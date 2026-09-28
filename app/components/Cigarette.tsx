import styles from "./Seal.module.css";

/* The thing you light. A cylinder is far easier to draw convincingly than
   a lighter, and lighting the product to open the page ties the gate to
   what the page is about. */
export default function Cigarette({ lit }: { lit: boolean }) {
  return (
    <svg
      className={styles.cig}
      viewBox="0 0 268 56"
      width="268"
      height="56"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="cigPaper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FBF7EE" />
          <stop offset="0.42" stopColor="#EDE6D6" />
          <stop offset="1" stopColor="#CFC5AF" />
        </linearGradient>

        <linearGradient id="cigFilter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E0B265" />
          <stop offset="0.45" stopColor="#C89A4E" />
          <stop offset="1" stopColor="#9E762F" />
        </linearGradient>

        <radialGradient id="cigEmber" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF0B8" />
          <stop offset="0.35" stopColor="#FFB03A" />
          <stop offset="0.72" stopColor="#FF6A1A" />
          <stop offset="1" stopColor="#8A2A04" />
        </radialGradient>

        <pattern
          id="cigWeave"
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
        >
          <rect width="5" height="5" fill="none" />
          <path d="M0 0 V5" stroke="rgba(90,58,12,0.20)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* filter, right end */}
      <rect x="180" y="18" width="70" height="21" rx="3" fill="url(#cigFilter)" />
      <rect x="180" y="18" width="70" height="21" rx="3" fill="url(#cigWeave)" />
      <rect x="180" y="18" width="2.5" height="21" fill="rgba(90,58,12,0.45)" />

      {/* paper body */}
      <rect x="34" y="18" width="147" height="21" rx="2" fill="url(#cigPaper)" />
      <rect x="34" y="20.5" width="147" height="2" fill="rgba(255,255,255,0.55)" />
      {/* the two gold bands */}
      <rect x="172" y="18" width="1.5" height="21" fill="rgba(160,120,40,0.55)" />
      <rect x="176" y="18" width="1.5" height="21" fill="rgba(160,120,40,0.55)" />

      {/* burnt tip, only once lit */}
      <g className={styles.ash} data-lit={lit}>
        <rect x="20" y="18" width="16" height="21" rx="2" fill="#4A4640" />
        <rect x="20" y="18" width="16" height="21" rx="2" fill="url(#cigWeave)" opacity="0.5" />
      </g>

      {/* the ember */}
      <g className={styles.ember} data-lit={lit}>
        <ellipse cx="21" cy="28.5" rx="9" ry="11" fill="url(#cigEmber)" />
        <ellipse cx="20" cy="28.5" rx="4" ry="6" fill="#FFF2C6" opacity="0.85" />
      </g>

      {/* smoke */}
      <g className={styles.smoke} data-lit={lit}>
        <path d="M18 14 q-5 -8 1 -14 q5 -6 0 -12" />
        <path d="M24 12 q6 -7 1 -13 q-4 -6 1 -11" />
      </g>
    </svg>
  );
}
