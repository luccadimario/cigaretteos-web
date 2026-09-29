"use client";

import { useEffect, useState } from "react";
import Ambience from "./Ambience";
import Seal from "./Seal";

/* The site is always in the DOM — the seal just covers it. That keeps the
   content in the server-rendered HTML for crawlers and screen readers, and
   means opening the pack is a removal, not a load. */
export default function Gate({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (m.matches) setOpen(true);
  }, []);

  return (
    <>
      {children}
      {open && <Ambience />}
      {!open && <Seal onOpen={() => setOpen(true)} />}
    </>
  );
}
