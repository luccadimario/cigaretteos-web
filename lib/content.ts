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

export const jokes: { kind: string; title: string; body: string }[] = [
  {
    kind: "Timer",
    title: "The OS burns down",
    body: "A cigarette shrinks with uptime. At the filter, the kernel halts. Rebooting lights another. The pack holds twenty, stored in CMOS so it survives a power cycle on real hardware.",
  },
  {
    kind: "Allocator",
    title: "malloc rounds to 1 MiB",
    body: "free prints ok and does nothing. You get sixteen allocations. A failed one doubles the next request, because the allocator believes in the martingale.",
  },
  {
    kind: "Entropy",
    title: "The Bum",
    body: "A word-level Markov chain compiled into the kernel as a C array, sampled with integer maths and seeded from keypress timing. Answers end with odds between 91% and 99%. Double or nothing deletes the answer and a random file.",
  },
  {
    kind: "Interrupt",
    title: "The cough",
    body: "At random the kernel coughs, flips one byte in video memory and drives the PC speaker through PIT channel 2. It gets more frequent as the cigarette gets shorter.",
  },
  {
    kind: "Scheduler",
    title: "Vowel weighting",
    body: "CPU time in proportion to the number of vowels in a process name, with a mandatory five-minute smoke break every ten minutes. Processes bet for time slices. At zero chips they are killed.",
  },
  {
    kind: "Panic",
    title: "Lottery numbers",
    body: "Kernel panics print as six lottery numbers that encode the real fault vector. The information is all there. Recovering it is your problem.",
  },
];

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
