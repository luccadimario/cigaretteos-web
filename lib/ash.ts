/* ash, the cigaretteOS shell — the parts of shell.c that make sense in a
   browser. Same command table, same responses, same prompt. The fault dump
   is the real one, captured from a boot. */

export type Line = { text: string; tone?: "dim" | "ember" | "yellow" };

export type Result = {
  lines: Line[];
  clear?: boolean;
  halt?: boolean;
};

const FAULT = (addr: string): Line[] => [
  { text: "" },
  { text: "*** #PF page fault", tone: "ember" },
  { text: "    vector 14   error 0x0" },
  { text: "    rip    0xffffffff800028a1" },
  { text: "    rsp    0xffff80000ff98f70" },
  { text: "    rflags 0x10282" },
  { text: `    cr2    ${addr}` },
  { text: "    cause  page not present, on a read" },
  { text: "    halted.", tone: "dim" },
];

/* A few addresses that are actually mapped, so peek is not just a trap. */
const MAPPED: Record<string, string> = {
  "0xffffffff80000000": "0xae",
  "0xffffffff80000001": "0xd1",
  "0xffffffff80000002": "0xe7",
  "0xffffffff80000003": "0x9d",
};

function pad(v: number, n: number) {
  return `0x${v.toString(16).padStart(n, "0")}`;
}

function parseNum(s: string): number {
  if (!s) return NaN;
  return s.startsWith("0x") || s.startsWith("0X")
    ? parseInt(s.slice(2), 16)
    : parseInt(s, 10);
}

export const COMMANDS: { name: string; help: string }[] = [
  { name: "help", help: "this" },
  { name: "echo", help: "say something back" },
  { name: "clear", help: "wipe the screen" },
  { name: "peek", help: "peek <addr>" },
  { name: "poke", help: "poke <addr> <byte>" },
  { name: "die", help: "triple fault on purpose" },
  { name: "light", help: "smoke one to the filter" },
  { name: "uptime", help: "total smoketime" },
  { name: "demo", help: "pong. not wired up here yet" },
];

export function run(input: string, bootedAt: number): Result {
  const argv = input.trim().split(/\s+/).filter(Boolean);
  if (argv.length === 0) return { lines: [] };

  const [cmd, ...args] = argv;

  switch (cmd) {
    case "help":
      return {
        lines: COMMANDS.map((c) => ({
          text: `  ${c.name.padEnd(8)}${c.help}`,
        })),
      };

    case "echo":
      return { lines: [{ text: args.join(" ") }] };

    case "clear":
      return { lines: [], clear: true };

    case "peek": {
      if (args.length < 1) return { lines: [{ text: "usage: peek <addr>" }] };
      const key = args[0].toLowerCase();
      if (MAPPED[key]) {
        return { lines: [{ text: `${key} = ${MAPPED[key]}` }] };
      }
      const n = parseNum(args[0]);
      return { lines: FAULT(isNaN(n) ? "0x0" : pad(n, 16)), halt: true };
    }

    case "poke": {
      if (args.length < 2)
        return { lines: [{ text: "usage: poke <addr> <byte>" }] };
      const n = parseNum(args[0]);
      return { lines: FAULT(isNaN(n) ? "0x0" : pad(n, 16)), halt: true };
    }

    case "die":
      return {
        lines: [
          { text: "stubbing it out.", tone: "dim" },
          { text: "" },
          { text: "*** TRIPLE FAULT", tone: "ember" },
          { text: "    the machine gave up." },
          { text: "    tonight's numbers: 08 14 0e 0d 20 2a", tone: "yellow" },
        ],
        halt: true,
      };

    case "uptime": {
      const s = Math.floor((Date.now() - bootedAt) / 1000);
      const m = Math.floor(s / 60);
      return {
        lines: [{ text: `smoking for ${m}m ${String(s % 60).padStart(2, "0")}s` }],
      };
    }

    case "light":
      return { lines: [] }; /* handled by the terminal, it animates */

    case "demo":
      return {
        lines: [
          { text: "pong runs on the real kernel, not in here.", tone: "dim" },
          { text: "build it and type demo. instructions below." },
        ],
      };

    default:
      return { lines: [{ text: `${cmd}: never heard of it` }] };
  }
}

/* The cigarette that `light` burns down, one frame per step. */
export function cigaretteFrame(step: number, total: number): string {
  const LEN = 34;
  const burnt = Math.min(LEN, Math.floor((step / total) * LEN));
  const left = LEN - burnt;
  return `  ${"~".repeat(Math.min(3, burnt))}${burnt > 0 ? "(" : " "}${"=".repeat(left)}${"|".repeat(6)}`;
}
