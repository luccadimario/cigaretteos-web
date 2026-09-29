/* Page content, kept apart from layout so it is easy to edit as the kernel
   grows. Milestones mirror the plan in the repo. */

export const REPO = "https://github.com/rylanmalarchick/cigaretteOS";

export type MilestoneState = "yes" | "now" | "no";

export const milestones: {
  n: string;
  label: string;
  state: MilestoneState;
  word: string;
}[] = [
  { n: "01", label: "Boot, and fill the screen with nicotine yellow", state: "yes", word: "Burnt" },
  { n: "02", label: "Draw the cigarette and burn it to the filter", state: "yes", word: "Burnt" },
  { n: "03", label: "Text: an 8×16 bitmap font on the framebuffer", state: "yes", word: "Burnt" },
  { n: "04", label: "GDT, IDT, PIC, PIT, keyboard on IRQ 1", state: "yes", word: "Burnt" },
  { n: "05", label: "The ash shell and the Bum oracle", state: "now", word: "Lit" },
  { n: "06", label: "Paging, physical allocator, the 1 MiB heap", state: "no", word: "Unlit" },
  { n: "07", label: "Scheduler: vowel weighting and smoke breaks", state: "no", word: "Unlit" },
];

/* The deliberate defects, rewritten as the warnings on the side of the
   pack. Real packs rotate their warnings; here all six apply at once. */
export const warnings: { lead: string; body: string }[] = [
  {
    lead: "This operating system burns down.",
    body: "A cigarette shrinks with uptime. At the filter the kernel halts, and rebooting lights another. The pack holds twenty, counted in CMOS so it survives a power cycle on real hardware.",
  },
  {
    lead: "malloc rounds every request up to one megabyte.",
    body: "free prints ok and does nothing. You get sixteen allocations. A failed one doubles the next request, because the allocator believes in the martingale.",
  },
  {
    lead: "The Bum is not a licensed financial advisor.",
    body: "A word-level Markov chain compiled into the kernel, seeded from keypress timing. Every answer ends with odds between 91% and 99%. Double or nothing deletes the answer and a random file.",
  },
  {
    lead: "This kernel coughs.",
    body: "At random it flips one byte in video memory and drives the PC speaker through PIT channel 2. It coughs more often as the cigarette gets shorter.",
  },
  {
    lead: "Vowel weighting may starve processes named \u201crhythm\u201d.",
    body: "CPU time is shared in proportion to the vowels in a process name, with a mandatory five-minute smoke break every ten minutes. At zero chips a process is killed.",
  },
  {
    lead: "Kernel panics are printed as lottery numbers.",
    body: "Six numbers that encode the real fault vector. The information is all there. Recovering it is your problem.",
  },
];

/* The tar and nicotine line old packs printed on the side. Real values. */
export const tarNicotine = {
  tar: "0xffffffff80000000",
  tarNote: "kernel base",
  nicotine: "250.04 Hz",
  nicotineNote: "PIT, divisor 4772",
};

export const specs: [string, string][] = [
  ["Target", "x86-64, freestanding, no libc"],
  ["Bootloader", "Limine 10.8.5, protocol base revision 5"],
  ["Kernel base", "0xffffffff80000000, higher half"],
  ["Privilege", "Ring 0 only. No userspace, no syscalls — yet"],
  ["Descriptors", "3-entry GDT, CS = 0x08; 256-gate IDT"],
  ["Interrupts", "8259 PIC remapped to vectors 32–47"],
  ["Timer", "PIT channel 0, divisor 4772 → 250.04 Hz"],
  ["Keyboard", "IRQ 1, scancode set 1, 63-byte lock-free ring"],
  ["Console", "8×16 bitmap font, 95 glyphs drawn by hand"],
  ["Heap", "1 MiB arena, first-fit, coalescing, 16-byte aligned"],
  ["Idle cost", "1.5% host CPU — the loop halts"],
  ["Languages", "C11 for the kernel, C++20 for the demo"],
];
