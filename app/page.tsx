import Gate from "./components/Gate";
import Cough from "./components/Cough";
import Stain from "./components/Stain";
import Terminal from "./components/Terminal";
import BurntEdge from "./components/BurntEdge";
import Barcode from "./components/Barcode";
import styles from "./page.module.css";
import { REPO, milestones, specs, tarNicotine, warnings } from "@/lib/content";

const done = milestones.filter((m) => m.state === "yes").length;

export default function Home() {
  return (
    <Gate>
      <Stain />
      <Cough />
      <main className={styles.main}>
        {/* ---------------------------------------------------------- hero */}
        <header className={`${styles.wrap} ${styles.hero}`}>
          <p className={styles.eyebrow}>
            x86-64 &middot; freestanding &middot; boots on real metal
          </p>
          <h1 className={styles.mast}>
            cigarette<em>OS</em>
          </h1>

          <div className={styles.heroGrid}>
            <div className={styles.pitch}>
              <p className={styles.tagline}>One of these is going to kill you.</p>
              <p className={styles.lede}>
                A hobby kernel that is <strong>bad on purpose</strong>. It boots
                into long mode, draws its own font, catches its own page faults
                and runs a shell called <code>ash</code> &mdash; then it burns
                down and halts, because that is what a cigarette does.
              </p>
              <p className={styles.lede}>
                Every joke touches a real subsystem. Nothing is faked, which is
                the only reason any of it is funny.
              </p>
              <div className={styles.actions}>
                <a className={styles.btn} href={REPO}>
                  Source
                </a>
                <a className={`${styles.btn} ${styles.btnGhost}`} href="#build">
                  Build it
                </a>
              </div>
            </div>

            <div className={styles.heroTerm}>
              <Terminal />
              <p className={styles.termNote}>
                Try <code>help</code>, then <code>peek 0xb8000</code>.
              </p>
            </div>
          </div>
        </header>

        {/* ----------------------------------------------------- burn-down */}
        <section className={`${styles.wrap} ${styles.section}`} id="burn">
          <div className={styles.head}>
            <h2 className={styles.h2}>Burn-down</h2>
            <p className={styles.count}>
              {done} of {milestones.length} smoked
            </p>
          </div>

          <div
            className={styles.cig}
            role="img"
            aria-label={`Progress: ${done} of ${milestones.length} milestones complete.`}
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

        {/* -------------------------------------------------------- boots */}
        <section className={`${styles.wrap} ${styles.section}`} id="boots">
          <div className={styles.head}>
            <h2 className={styles.h2}>It boots</h2>
          </div>

          <div className={styles.twoUp}>
            <figure className={styles.figure}>
              <pre className={styles.pre}>
                <span className={styles.c}>$ make run</span>
                {"\n"}gdt: cs reloaded{"\n"}idt: installed{"\n"}pic: remapped to
                32-47{"\n"}pit: 250 hz, interrupts on{"\n"}cigaretteOS: boot ok{"\n"}
              </pre>
              <figcaption className={styles.caption}>
                Serial output from a cold boot, verbatim.
              </figcaption>
            </figure>

            <figure className={styles.figure}>
              <pre className={styles.pre}>
                <span className={styles.c}>ash&gt; peek 0xb8000</span>
                {"\n"}
                <span className={styles.e}>*** #PF page fault</span>
                {"\n"}    rip    0xffffffff800028a1{"\n"}    cr2
                0x00000000000b8000{"\n"}    cause  not present, read
                {"\n"}    halted.{"\n"}
              </pre>
              <figcaption className={styles.caption}>
                Before the IDT existed this was a silent reboot. Now something is
                home to answer.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ------------------------------------------------- the pack band */}
        <div className={styles.band}>
          <BurntEdge seed={7} />
          <section className={styles.paper} id="warnings">
            <div className={styles.wrap}>
              <div className={styles.paperHead}>
                <h2 className={styles.h2Paper}>{"Surgeon General's warnings"}</h2>
                <p className={styles.paperNote}>
                  Real packs rotate their warnings. All six of these apply at
                  once.
                </p>
              </div>

              <div className={styles.warnings}>
                {warnings.map((w) => (
                  <article key={w.lead} className={styles.warning}>
                    <h3>Warning</h3>
                    <p className={styles.wLead}>{w.lead}</p>
                    <p className={styles.wBody}>{w.body}</p>
                  </article>
                ))}
              </div>

              <div className={styles.packGrid}>
                <section className={styles.panel} id="specs" aria-labelledby="contents-h">
                  <h2 id="contents-h" className={styles.panelH}>
                    Contents
                  </h2>
                  <p className={styles.panelSub}>
                    One kernel. Everything here was written from scratch except
                    the bootloader, and every value is real.
                  </p>
                  <dl className={styles.contents}>
                    {specs.map(([k, v]) => (
                      <div key={k} className={styles.row}>
                        <dt>{k}</dt>
                        <span className={styles.leader} aria-hidden="true" />
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <div className={styles.side}>
                  <p className={styles.twenty}>
                    <span className={styles.big20}>20</span>
                    <span className={styles.twentyLabel}>Class A boots</span>
                  </p>

                  <dl className={styles.tar}>
                    <div>
                      <dt>Tar</dt>
                      <dd>
                        <b>{tarNicotine.tar}</b>
                        <small>{tarNicotine.tarNote}</small>
                      </dd>
                    </div>
                    <div>
                      <dt>Nicotine</dt>
                      <dd>
                        <b>{tarNicotine.nicotine}</b>
                        <small>{tarNicotine.nicotineNote}</small>
                      </dd>
                    </div>
                  </dl>

                  <Barcode label="0 0B8000 000000 1" />
                  <p className={styles.fine}>Keep out of reach of production.</p>
                </div>
              </div>
            </div>
          </section>
          <BurntEdge seed={23} flip />
        </div>

        {/* ------------------------------------------------ build + pong */}
        <section className={`${styles.wrap} ${styles.section}`} id="build">
          <div className={styles.twoUp}>
            <div>
              <h2 className={styles.h2}>Build it</h2>
              <p className={styles.p}>
                macOS with Homebrew. Apple&rsquo;s <code>ld64</code> only speaks
                Mach-O, so the linker must be a cross linker &mdash; but the host
                Clang compiles for the target fine.
              </p>
              <pre className={styles.pre}>
                <span className={styles.c}># about 10 MB of tooling</span>
                {"\n"}brew install x86_64-elf-binutils xorriso{"\n\n"}
                <span className={styles.c}># the bootloader</span>
                {"\n"}git clone https://github.com/limine-bootloader/limine \{"\n"}
                {"  "}--branch=v10.x-binary --depth=1{"\n"}make -C limine{"\n\n"}
                <span className={styles.c}># build the ISO and boot it</span>
                {"\n"}make run{"\n"}
              </pre>
            </div>

            <div id="demo">
              <h2 className={styles.h2}>There is Pong in it</h2>
              <p className={styles.p}>
                The <code>demo</code> command hands the framebuffer to a C++20
                scratch pad running Pong &mdash; collision, scoring, and digits
                drawn by scaling the same glyphs the console uses.
              </p>
              <p className={styles.p}>
                No floating point: the interrupt handlers don&rsquo;t save the
                XMM registers, so it&rsquo;s all integers and fixed point, the
                way it was done the first time around.
              </p>
            </div>
          </div>
        </section>

        <footer className={`${styles.wrap} ${styles.footer}`}>
          <span>cigaretteOS. Smoking is bad for you; so is this code.</span>
          <a href={REPO}>github</a>
        </footer>
      </main>
    </Gate>
  );
}
