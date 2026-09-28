import Gate from "./components/Gate";
import styles from "./page.module.css";
import { REPO, jokes, milestones, specs } from "@/lib/content";

export default function Home() {
  return (
    <Gate>
      <main className={styles.site}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>
            x86-64 &middot; freestanding &middot; boots on real metal
          </p>
          <h1 className={styles.title}>
            cigarette<em>OS</em>
          </h1>
          <p className={styles.tagline}>One of these is going to kill you.</p>

          <p className={styles.lede}>
            A hobby kernel that is <strong>bad on purpose</strong>. It boots
            through Limine into long mode, paints its own framebuffer with a
            font drawn by hand, catches its own page faults, and runs a shell
            called <code>ash</code> &mdash; and then it burns down and halts,
            because that is what a cigarette does.
          </p>
          <p className={styles.lede}>
            The rule: every joke has to touch a real subsystem. The cigarette
            burning down needs a timer, so there is a real PIT driver. The
            oracle needs entropy, so there is real entropy. Nothing is faked,
            which is the only reason any of it is funny.
          </p>

          <div className={styles.actions}>
            <a className={styles.btn} href={REPO}>
              Source
            </a>
            <a className={`${styles.btn} ${styles.btnGhost}`} href="#build">
              Build it
            </a>
          </div>
        </header>

        <section className={styles.section} id="boots">
          <h2 className={styles.h2}>It boots</h2>
          <p className={styles.note}>
            Serial output from a cold boot, verbatim. Every line is a subsystem
            that was a black screen a week ago.
          </p>

          <pre className={styles.pre}>
            <span className={styles.c}>$ make run</span>
            {"\n"}gdt: cs reloaded{"\n"}idt: installed{"\n"}pic: remapped to
            32-47, all masked{"\n"}pit: 250 hz, irq0+irq1 live, interrupts
            enabled{"\n"}cigaretteOS: boot ok{"\n"}
          </pre>

          <figure className={styles.figure}>
            <pre className={styles.pre}>
              <span className={styles.c}>ash&gt; peek 0xb8000</span>
              {"\n\n"}
              <span className={styles.e}>*** #PF page fault</span>
              {"\n"}    vector 14   error 0x0{"\n"}    rip
              0xffffffff800028a1{"\n"}    rsp    0xffff80000ff98f70{"\n"}
              {"    "}rflags 0x10282{"\n"}    cr2    0x00000000000b8000{"\n"}
              {"    "}cause  page not present, on a read{"\n"}    halted.{"\n"}
            </pre>
            <figcaption className={styles.caption}>
              Reading VGA text memory, which Limine stops mapping at base
              revision 1. Before the interrupt descriptor table existed this
              was a silent reboot: page fault, no handler, double fault, no
              handler, triple fault, machine resets. Now something is home to
              answer.
            </figcaption>
          </figure>
        </section>

        <section className={styles.section} id="burn">
          <h2 className={styles.h2}>Burn-down</h2>
          <p className={styles.note}>
            Progress, measured the only honest way. The ember sits where the
            work actually is.
          </p>

          <div
            className={styles.cig}
            role="img"
            aria-label="Progress: five of seven milestones complete."
          >
            {milestones.map((m) => (
              <span
                key={m.n}
                className={styles.seg}
                data-state={
                  m.state === "yes" ? "burnt" : m.state === "now" ? "burning" : "unlit"
                }
              />
            ))}
            <span className={styles.filter} />
          </div>

          <ol className={styles.milestones}>
            {milestones.map((m) => (
              <li key={m.n} className={styles.milestone} data-done={m.state}>
                <span className={styles.n}>{m.n}</span>
                <span className={styles.label}>{m.label}</span>
                <span className={styles.state}>{m.word}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.section} id="features">
          <h2 className={styles.h2}>Deliberate defects</h2>
          <p className={styles.note}>
            Each of these is a real driver wearing a bad idea. The joke and the
            subsystem are the same code.
          </p>

          <div className={styles.jokes}>
            {jokes.map((j) => (
              <article key={j.title} className={styles.joke}>
                <span className={styles.kind}>{j.kind}</span>
                <h3>{j.title}</h3>
                <p>{j.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} id="specs">
          <h2 className={styles.h2}>What is actually in there</h2>
          <p className={styles.note}>
            No jokes in this table. These are the real numbers, and everything
            in it was written from scratch except the bootloader.
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.specs}>
              <tbody>
                {specs.map(([k, v]) => (
                  <tr key={k}>
                    <th scope="row">{k}</th>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section} id="build">
          <h2 className={styles.h2}>Build it</h2>
          <p className={styles.note}>
            macOS with Homebrew. The linker has to be a cross linker &mdash;
            Apple ships <code>ld64</code>, which only speaks Mach-O &mdash; but
            the host Clang compiles for the target fine, so a full cross GCC is
            optional.
          </p>

          <pre className={styles.pre}>
            <span className={styles.c}># about 10 MB of tooling</span>
            {"\n"}brew install x86_64-elf-binutils xorriso{"\n\n"}
            <span className={styles.c}># the bootloader</span>
            {"\n"}git clone https://github.com/limine-bootloader/limine \{"\n"}
            {"  "}--branch=v10.x-binary --depth=1 &amp;&amp; make -C limine
            {"\n\n"}
            <span className={styles.c}># build the ISO and boot it</span>
            {"\n"}make run{"\n"}
          </pre>

          <p className={styles.p}>
            Press <kbd>Enter</kbd> at the Limine menu. Type <code>help</code>.
            Then type <code>peek 0xb8000</code> and read the fault dump, which
            is the whole point.
          </p>
        </section>

        <section className={styles.section} id="demo">
          <h2 className={styles.h2}>There is Pong in it</h2>
          <p className={styles.p}>
            The <code>demo</code> command hands the framebuffer to a C++20
            scratch pad and runs Pong &mdash; collision, scoring, a win banner,
            digits rendered by scaling the same 8&times;16 glyphs the console
            uses. It allocates through the kernel heap, because{" "}
            <code>new</code> and <code>delete</code> had to be wired to
            something.
          </p>
          <p className={styles.p}>
            No floating point. The kernel builds with <code>-mno-sse</code>,
            since the interrupt handlers do not save the XMM registers.
            Everything is integers and fixed point, which is how it was done
            the first time around.
          </p>
        </section>

        <footer className={styles.footer}>
          <span>
            cigaretteOS &mdash; a hobby kernel. Smoking is bad for you; so is
            this code.
          </span>
          <span>
            <a href={REPO}>github</a>
          </span>
        </footer>
      </main>
    </Gate>
  );
}
