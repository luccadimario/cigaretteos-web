import type { Metadata } from "next";
import { Silkscreen, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

/* Silkscreen sits on an 8px grid, which is the same grid the kernel's
   hand-drawn 8x16 console font sits on. */
const display = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
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
