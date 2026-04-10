"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   🐝 SWARM COMMAND — Landing Page
   Value-focused, bee-themed, scannable.
   ═══════════════════════════════════════════════════════════ */

// ── Animated counter (fires on scroll into view) ──
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - t0) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setCount(Math.round(eased * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// ── Scroll-reveal observer ──
function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("revealed");
        }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ── Scale tiers ──
type ScaleKey = "ss50" | "ss100" | "ss250";

const SCALES: Record<
  ScaleKey,
  { label: string; agents: string; useCase: string; desc: string; cmd: string }
> = {
  ss50: {
    label: "SS-50",
    agents: "~52 agents",
    useCase: "Quick Review",
    desc: "Fast consensus on focused tasks. Code reviews, config checks, quick security scans. Results in minutes.",
    cmd: 'swarm command --scale 50 "review auth module"',
  },
  ss100: {
    label: "SS-100",
    agents: "~89 agents",
    useCase: "Deep Audit",
    desc: "Thorough analysis with full cross-family validation. Architecture reviews, security audits, migration planning.",
    cmd: 'swarm command --scale 100 "audit security posture"',
  },
  ss250: {
    label: "SS-250",
    agents: "~316 agents",
    useCase: "Full Ecosystem Sweep",
    desc: "Maximum swarm density. Every model family at full capacity. Progressive refinement across the entire codebase.",
    cmd: 'swarm command --scale 250 "full ecosystem analysis"',
  },
};

// ── Particles seed (deterministic positions for SSR) ──
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 19.3 + 5) % 95}%`,
  top: `${(i * 13.7 + 8) % 85}%`,
  size: 2 + (i % 4) * 1.5,
  dur: 8 + ((i * 1.7) % 14),
  delay: -((i * 1.3) % 8),
  opacity: 0.15 + (i % 5) * 0.08,
  variant: (i % 4) + 1,
}));

/* ═══════════════════════════════════════════════════════════ */

export default function Home() {
  const [activeScale, setActiveScale] = useState<ScaleKey>("ss100");
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useScrollReveal();

  // Proof counters
  const agentsStat = useCounter(750);
  const modelsStat = useCounter(11);
  const vulnsStat = useCounter(4);

  // Nav background on scroll
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Clipboard
  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const scale = SCALES[activeScale];

  return (
    <>
      {/* ──────────── NAV ──────────── */}
      <nav className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
        <span className="nav-brand">🐝 Swarm Command</span>
        <a href="#install" className="nav-cta">
          Get Started
        </a>
      </nav>

      {/* ──────────── HERO ──────────── */}
      <section className="hero">
        <div className="swarm-field" aria-hidden="true">
          {PARTICLES.map((p, i) => (
            <div
              key={i}
              className={`particle p-${p.variant}`}
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animationDuration: `${p.dur}s`,
                animationDelay: `${p.delay}s`,
                opacity: p.opacity,
              }}
            />
          ))}
        </div>

        <div className="hero-content reveal">
          <span className="badge">🐝 Open Source · Copilot CLI</span>
          <h1>
            One command.
            <br />
            <span className="text-amber">Collective intelligence.</span>
          </h1>
          <div className="hero-props">
            <span className="prop">Multi-model consensus</span>
            <span className="prop-dot">·</span>
            <span className="prop">Cross-validated</span>
            <span className="prop-dot">·</span>
            <span className="prop">Shadow-scored</span>
          </div>

          <div className="terminal">
            <div className="terminal-bar">
              <span className="dot dot-r" />
              <span className="dot dot-y" />
              <span className="dot dot-g" />
              <span className="terminal-title">swarm-command</span>
            </div>
            <pre className="terminal-body">
              <span className="cmd">
                $ swarm command --scale 100 &quot;audit auth system&quot;
              </span>
              {"\n\n"}
              <span className="amber">
                🐝 Hive activated · 89 agents · 11 models · 3 families
              </span>
              {"\n"}
              <span className="bar">
                {"  "}████████████████████████████████
              </span>
              <span className="amber"> consensus: 94%</span>
              {"\n\n"}
              <span className="green">
                {"  ✓ Cross-family validation passed"}
              </span>
              {"\n"}
              <span className="green">{"  ✓ Shadow score: 96/100"}</span>
              {"\n"}
              <span className="green">
                {"  ✓ 3 critical findings synthesized"}
              </span>
              {"\n\n"}
              <span className="result">
                {"  → Final report delivered in 4m 12s"}
              </span>
            </pre>
          </div>
        </div>
      </section>

      {/* ──────────── THE PROBLEM ──────────── */}
      <section className="section section-dark reveal">
        <div className="container narrow">
          <h2 className="section-title">
            One model, one perspective.
            <br />
            <span className="text-amber">That&apos;s fragile.</span>
          </h2>
          <p className="section-body">
            For small tasks, a single AI is fine. But for security audits,
            architecture reviews, and migration strategies — one model means one
            blind spot, one context window, one confident-sounding answer with no
            independent check. You need consensus from independent minds that
            verify each other&apos;s work.
          </p>
        </div>
      </section>

      {/* ──────────── HOW IT WORKS ──────────── */}
      <section className="section honeycomb-bg reveal" id="how">
        <div className="container">
          <h2 className="section-title">How the hive works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-hex">1</div>
              <h3>Describe your task</h3>
              <p>
                One command. Tell the swarm what you need — security audit, code
                review, architecture analysis. Plain English.
              </p>
            </div>
            <div className="step-connector" aria-hidden="true">
              <span>→</span>
            </div>
            <div className="step">
              <div className="step-hex">2</div>
              <h3>The swarm fans out</h3>
              <p>
                Agents from Claude, GPT, and Gemini families compete and
                collaborate. Different models cross-pollinate and review each
                other&apos;s work.
              </p>
            </div>
            <div className="step-connector" aria-hidden="true">
              <span>→</span>
            </div>
            <div className="step">
              <div className="step-hex">3</div>
              <h3>Consensus delivers</h3>
              <p>
                Only findings validated across model families survive. Shadow
                scores gate quality. One synthesized answer emerges from the
                colony.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── WHAT MAKES IT DIFFERENT ──────────── */}
      <section className="section section-dark reveal" id="different">
        <div className="container">
          <h2 className="section-title">What makes the hive different</h2>
          <div className="value-cards">
            <div className="value-card">
              <span className="card-icon">🐝</span>
              <h3>Collective Intelligence</h3>
              <p>
                16 models, not one. Claude Opus &amp; Sonnet. GPT-5.x series.
                Gemini 3 Pro. Claude Haiku. Each brings different strengths —
                together they catch what any single model misses.
              </p>
            </div>
            <div className="value-card">
              <span className="card-icon">🔍</span>
              <h3>Cross-Validated</h3>
              <p>
                Different model families review each other&apos;s work. Claude
                checks GPT. GPT checks Gemini. No echo chambers — only findings
                that survive independent scrutiny make the cut.
              </p>
            </div>
            <div className="value-card">
              <span className="card-icon">🔒</span>
              <h3>Shadow Scored</h3>
              <p>
                Hidden quality gates you can&apos;t game. Every agent is scored
                — failures&nbsp;÷&nbsp;total&nbsp;×&nbsp;100 — and they
                don&apos;t know they&apos;re being watched. Bad work gets caught
                automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── SCALE ──────────── */}
      <section className="section honeycomb-bg reveal" id="scale">
        <div className="container">
          <h2 className="section-title">Scale to your mission</h2>
          <div className="scale-tabs">
            {(Object.keys(SCALES) as ScaleKey[]).map((key) => (
              <button
                key={key}
                className={`scale-tab ${activeScale === key ? "active" : ""}`}
                onClick={() => setActiveScale(key)}
              >
                {SCALES[key].label}
              </button>
            ))}
          </div>
          <div className="scale-panel">
            <div className="scale-header">
              <span className="scale-agents">{scale.agents}</span>
              <span className="scale-use-case">{scale.useCase}</span>
            </div>
            <p className="scale-desc">{scale.desc}</p>
            <div className="scale-command">
              <code>$ {scale.cmd}</code>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── PROOF ──────────── */}
      <section className="section section-dark reveal" id="proof">
        <div className="container">
          <h2 className="section-title">Proof from the hive</h2>
          <div className="proof-grid">
            <div className="proof-stat" ref={agentsStat.ref}>
              <span className="proof-number">
                {agentsStat.count}
                <span className="proof-suffix">+</span>
              </span>
              <span className="proof-label">agents deployed</span>
              <span className="proof-detail">
                across real production sessions
              </span>
            </div>
            <div className="proof-stat" ref={modelsStat.ref}>
              <span className="proof-number">{modelsStat.count}</span>
              <span className="proof-label">model families</span>
              <span className="proof-detail">Claude · GPT · Gemini</span>
            </div>
            <div className="proof-stat" ref={vulnsStat.ref}>
              <span className="proof-number">{vulnsStat.count}</span>
              <span className="proof-label">critical vulns found</span>
              <span className="proof-detail">
                that 250 agents missed on first pass
              </span>
            </div>
          </div>
          <p className="proof-method">
            Progressive refinement:{" "}
            <span className="text-amber">discover</span> →{" "}
            <span className="text-amber">validate</span> →{" "}
            <span className="text-amber">confirm</span>
          </p>
          <code className="proof-formula">
            consensus = confidence×0.40 + evidence×0.30 + scope×0.15 +
            coverage×0.15 − conflict_penalty
          </code>
        </div>
      </section>

      {/* ──────────── INSTALL ──────────── */}
      <section className="section honeycomb-bg reveal" id="install">
        <div className="container narrow">
          <h2 className="section-title">Join the hive 🐝</h2>
          <p className="install-sub">
            One command. Then type <code>swarm command</code>.
          </p>
          <div className="install-block">
            <pre className="install-code">
              <code>
                curl -fsSL
                https://raw.githubusercontent.com/DUBSOpenHub/swarm-command/main/quickstart.sh
                | bash
              </code>
            </pre>
            <button
              className="install-copy"
              onClick={() =>
                copy(
                  "curl -fsSL https://raw.githubusercontent.com/DUBSOpenHub/swarm-command/main/quickstart.sh | bash"
                )
              }
            >
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
          <p className="install-note">
            Requires an active{" "}
            <a
              href="https://github.com/features/copilot/plans"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              Copilot subscription
            </a>
          </p>
        </div>
      </section>

      {/* ──────────── FOOTER ──────────── */}
      <footer className="footer">
        <span className="footer-brand">🐝 Swarm Command</span>
        <span className="footer-sep">·</span>
        <span>Collective intelligence for the Copilot CLI</span>
        <span className="footer-sep">·</span>
        <a
          href="https://github.com/DUBSOpenHub/swarm-command"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          GitHub
        </a>
      </footer>
    </>
  );
}
