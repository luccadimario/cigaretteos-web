import type { Metadata } from "next";
import localFont from "next/font/local";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

/* The kernel's own console font, converted straight out of font.c by
   scripts/mkwebfont.py. Not a font that looks like it — the same bytes the
   operating system draws with, 95 glyphs, 2.8 KB. */
const display = localFont({
  src: [
    { path: "../public/fonts/cigaretteos.woff", weight: "400", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["Courier New", "monospace"],
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "cigaretteOS",
  description:
    "A hobby x86-64 kernel that is bad on purpose. Every joke feature touches a real subsystem.",
  openGraph: {
    title: "cigaretteOS",
    description: "A hobby x86-64 kernel that is bad on purpose.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        {/* Nothing can open the pack without JS, so do not seal it. */}
        <noscript>
          <style>{`[data-seal="true"] { display: none !important; }`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
