"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   🐝 SWARM COMMAND — Landing Page
   ═══════════════════════════════════════════════════════════ */

// ── Typing animation phrases ──
const TYPING_PHRASES = [
  "swarm command — analyze security vulnerabilities across codebase",
  "swarm command --scale 250 — full consensus audit of auth system",
  "swarm command --scale 100 — review migration strategy for DB",
  "swarm command --scale 50 — quick refactor of payment module",
  "swarm command — design distributed caching architecture",
];

// ── Counter animation hook ──
function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// ── Spark particles on click ──
function spawnSparks(x: number, y: number) {
  const colors = ["#f59e0b", "#eab308", "#fbbf24", "#d97706", "#fcd34d"];
  for (let i = 0; i < 12; i++) {
    const spark = document.createElement("div");
    spark.className = "spark";
    const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.5;
    const dist = 40 + Math.random() * 60;
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.background = colors[i % colors.length];
    spark.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    spark.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 700);
  }
}

export default function Home() {
  const [mobileNav, setMobileNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [copied, setCopied] = useState(false);

  // ── Counters ──
  const models = useCounter(16);
  const agents = useCounter(250);
  const layers = useCounter(5);
  const shadow = useCounter(0);

  // ── Cursor glow ──
  const glowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  // ── Scroll: nav shrink + back-to-top ──
  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 60);
      setShowTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // ── Scroll reveal observer ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ── Typing animation ──
  useEffect(() => {
    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      const phrase = TYPING_PHRASES[phraseIdx];
      if (!deleting) {
        charIdx++;
        setTypedText(phrase.slice(0, charIdx));
        if (charIdx === phrase.length) {
          deleting = true;
          timeout = setTimeout(tick, 2200);
          return;
        }
        timeout = setTimeout(tick, 45 + Math.random() * 30);
      } else {
        charIdx--;
        setTypedText(phrase.slice(0, charIdx));
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % TYPING_PHRASES.length;
          timeout = setTimeout(tick, 400);
          return;
        }
        timeout = setTimeout(tick, 25);
      }
    };
    timeout = setTimeout(tick, 1200);
    return () => clearTimeout(timeout);
  }, []);

  // ── Copy handler ──
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(
      "curl -fsSL https://raw.githubusercontent.com/DUBSOpenHub/swarm-command/main/quickstart.sh | bash"
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, []);

  return (
    <>
      {/* Cursor glow */}
      <div ref={glowRef} className="cursor-glow" aria-hidden="true" />

      {/* Hex grid bg */}
      <div className="grid-bg" aria-hidden="true" />

      {/* Back to top */}
      <button
        className={`back-top ${showTop ? "show" : ""}`}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>

      {/* ── NAV ── */}
      <nav className={`swarm-nav ${scrolled ? "scrolled" : ""}`}>
        <a href="#hero" className="nav-logo">
          🐝 swarm command
        </a>
        <ul className={`nav-links ${mobileNav ? "open" : ""}`}>
          <li><a href="#what" onClick={() => setMobileNav(false)}>What</a></li>
          <li><a href="#architecture" onClick={() => setMobileNav(false)}>Architecture</a></li>
          <li><a href="#scaling" onClick={() => setMobileNav(false)}>Scaling</a></li>
          <li><a href="#consensus" onClick={() => setMobileNav(false)}>Consensus</a></li>
          <li><a href="#install" onClick={() => setMobileNav(false)}>Install</a></li>
          <li>
            <a href="https://github.com/DUBSOpenHub/swarm-command" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </li>
        </ul>
        <button
          className="nav-burger"
          aria-label="Toggle navigation"
          onClick={() => setMobileNav(!mobileNav)}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* ── HERO ── */}
      <section id="hero" className="hero-section">
        <div className="swarm-orb swarm-orb-1" aria-hidden="true" />
        <div className="swarm-orb swarm-orb-2" aria-hidden="true" />
        <div className="swarm-orb swarm-orb-3" aria-hidden="true" />

        <div className="hero-content">
          <div>
            <div className="hero-badge">
              <span className="status-dot" aria-hidden="true" />
              Multi-Model · Consensus · Shadow Scoring
            </div>
            <h1
              className="hero-name"
              onClick={(e) => spawnSparks(e.clientX, e.clientY)}
              tabIndex={0}
              aria-label="Click for sparks"
            >
              swarm<br />command<em>.</em>
            </h1>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: ".82rem", color: "var(--muted)", marginBottom: "1.5rem", letterSpacing: ".08em" }}>
              MULTI-MODEL · CONSENSUS · SHADOW SCORING
            </p>
            <div className="hero-typing-wrap">
              <span className="typed-text">{typedText}</span>
              <span className="cursor-blink" />
            </div>
            <p className="hero-desc">
              Launch <strong>50–250+ AI agents</strong> across <strong>16 models</strong> to solve
              complex tasks through hierarchical fan-out, cross-family review, and{" "}
              <strong style={{ color: "var(--amber)" }}>consensus-gated synthesis</strong>.
              One command. <strong style={{ color: "var(--honey)" }}>Collective intelligence</strong>.
            </p>
            {/* Hero inline hierarchy */}
            <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              {["L0: Nexus →", "🎯 Commanders", "→ 📋 Squad Leads", "→ ⚙️ Workers", "→ 🔍 Reviewers"].map((step, i) => (
                <span key={i} style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: ".68rem",
                  padding: ".25rem .55rem",
                  borderRadius: "6px",
                  background: step.includes("Nexus") ? "rgba(245,158,11,.1)" : "rgba(234,179,8,.08)",
                  border: `1px solid ${step.includes("Nexus") ? "rgba(245,158,11,.2)" : "rgba(234,179,8,.15)"}`,
                  color: step.includes("Nexus") ? "var(--amber)" : "var(--subtle)",
                  whiteSpace: "nowrap",
                }}>
                  {step}
                </span>
              ))}
            </div>
            <div className="hero-actions">
              <button className="btn-primary" onClick={handleCopy}>
                {copied ? "✓ Copied!" : "⚡ Copy Install Command"}
              </button>
              <a
                href="https://github.com/DUBSOpenHub/swarm-command"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                </svg>
                View on GitHub →
              </a>
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: ".68rem", color: "var(--muted)", marginTop: "1rem", display: "flex", alignItems: "center", gap: ".4rem", flexWrap: "wrap" }}>
              🐝 Created with 💛 by{" "}
              <a href="https://github.com/greggcochran" target="_blank" rel="noopener noreferrer" style={{ color: "var(--subtle)" }}>Gregg Cochran</a>
              {" "}
              <a href="https://github.com/DUBSOpenHub" target="_blank" rel="noopener noreferrer" style={{ color: "var(--subtle)" }}>@DUBSOpenHub</a>
              {" "}with the{" "}
              <a href="https://docs.github.com/copilot/concepts/agents/about-copilot-cli" target="_blank" rel="noopener noreferrer" style={{ color: "var(--amber)" }}>GitHub Copilot CLI</a>
            </p>
          </div>
          <div>
            <div className="tui-window">
              <div className="tui-titlebar">
                <span className="status-dot" />
                <span className="tui-title">swarm command — copilot cli</span>
              </div>
              <div className="tui-body">
                <div className="tui-msg"><span className="tui-who you">you</span><span className="tui-text">swarm command — audit auth system for vulnerabilities</span></div>
                <div className="tui-msg"><span className="tui-who swarm">nexus</span><span className="tui-text">🐝 <strong>Swarm: sw-20260401</strong> | Scale: SS-100</span></div>
                <div className="tui-msg"><span className="tui-who agent">L1</span><span className="tui-text">5 Commanders dispatched — <code>GPT · Claude · Gemini</code></span></div>
                <div className="tui-msg"><span className="tui-who agent">L2</span><span className="tui-text">15 Squad Leads decomposing tasks...</span></div>
                <div className="tui-divider" />
                <div className="tui-msg"><span className="tui-who agent">L3</span><span className="tui-text">62 Workers executing — <code>explore + task agents</code></span></div>
                <div className="tui-msg"><span className="tui-who agent">L4</span><span className="tui-text">Cross-family review: <strong>consensus 0.84</strong></span></div>
                <div className="tui-msg"><span className="tui-who swarm">nexus</span><span className="tui-text">🐝 <code>SHADOW_SCORE: 0%</code> — all criteria pass ✓</span></div>
                <div className="tui-msg"><span className="tui-who swarm">nexus</span><span className="tui-text"><strong>Synthesis complete</strong> — 89 agents converged</span></div>
              </div>
              <div className="tui-inputbar">
                <span className="tui-prompt">›</span>
                <span className="cursor-blink" />
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator" aria-hidden="true">
          <div className="scroll-line" />
          <span>scroll</span>
        </div>
      </section>

      {/* ── SCALE STATS ── */}
      <section className="swarm-section" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
        <div className="reveal" style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <span className="section-label">The Swarm</span>
          <h2 className="section-title" style={{ textAlign: "center", marginBottom: "1rem" }}>
            <em>16 models</em>, 250+ agents, <em>collective intelligence</em>
          </h2>
          <p className="section-sub" style={{ margin: "0 auto 3rem", textAlign: "center", maxWidth: 600 }}>
            Swarm Command orchestrates a hierarchy of AI agents across multiple model families.
            Every output is validated. Every gap is quantified by the{" "}
            <strong style={{ color: "var(--amber)" }}>shadow score</strong>.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem", maxWidth: 900, margin: "0 auto" }}>
            <div className="stat-card" style={{ textAlign: "center" }} ref={models.ref}>
              <div className="stat-number">{models.count}</div>
              <div className="stat-label">Models</div>
              <p style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: ".4rem", lineHeight: 1.5 }}>Available AI models</p>
            </div>
            <div className="stat-card" style={{ textAlign: "center" }} ref={agents.ref}>
              <div className="stat-number">{agents.count}+</div>
              <div className="stat-label">Agents</div>
              <p style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: ".4rem", lineHeight: 1.5 }}>Maximum swarm size</p>
            </div>
            <div className="stat-card" style={{ textAlign: "center" }} ref={layers.ref}>
              <div className="stat-number">{layers.count}</div>
              <div className="stat-label">Layers</div>
              <p style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: ".4rem", lineHeight: 1.5 }}>Orchestration depth</p>
            </div>
            <div className="stat-card" style={{ textAlign: "center", borderColor: "rgba(132,204,22,.3)", boxShadow: "0 0 30px rgba(132,204,22,.06)" }} ref={shadow.ref}>
              <div className="stat-number" style={{ color: "var(--lime)" }}>{shadow.count}%</div>
              <div className="stat-label">Target Shadow Score</div>
              <p style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: ".4rem", lineHeight: 1.5 }}>Perfect sealed coverage</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT IS SWARM COMMAND ── */}
      <section id="what" className="swarm-section alt-bg">
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
          <div className="reveal">
            <span className="section-label">About</span>
            <h2 className="section-title">What is<br /><em>Swarm Command</em>?</h2>
            <p className="section-sub" style={{ marginBottom: "1.5rem" }}>
              One model gives you one perspective. For high-stakes tasks — security audits,
              architecture reviews, complex migrations — that&apos;s <strong>fragile</strong>.
            </p>
            <p className="section-sub" style={{ marginBottom: "1.5rem" }}>
              Swarm Command <strong>splits, parallelizes, reviews, validates, and converges</strong>.
              Multiple model families attack the same problem from different angles. Cross-family reviewers
              catch what single models miss. Consensus gates ensure quality.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="stat-card">
                <div className="stat-number" style={{ fontSize: "1.5rem" }}>🐝</div>
                <div className="stat-label">Multi-Model</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ fontSize: "1.5rem" }}>🔄</div>
                <div className="stat-label">Consensus</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ fontSize: "1.5rem" }}>🔒</div>
                <div className="stat-label">Shadow Scoring</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ fontSize: "1.5rem" }}>⚡</div>
                <div className="stat-label">One Command</div>
              </div>
            </div>
          </div>
          <div className="reveal" style={{ transitionDelay: ".15s" }}>
            <div className="code-block">
              <div className="code-titlebar">
                <span className="dot dot-r" /><span className="dot dot-y" /><span className="dot dot-g" />
                <span className="code-file">swarm-config.yml</span>
              </div>
              <div className="code-body">
                <pre>{`\n`}<span className="cm"># swarm command configuration</span>{`\n`}<span className="kw">swarm</span><span className="br">:</span>{`\n`}  <span className="fn">default_scale</span><span className="br">:</span> <span className="num">100</span>{`\n`}  <span className="fn">consensus_threshold</span><span className="br">:</span> <span className="num">0.70</span>{`\n`}  <span className="fn">shadow_target</span><span className="br">:</span> <span className="num">0</span>{`\n\n`}<span className="kw">models</span><span className="br">:</span>{`\n`}  <span className="fn">claude-sonnet</span><span className="br">:</span> <span className="str">commander</span>{`\n`}  <span className="fn">gpt-5</span><span className="br">:</span> <span className="str">commander</span>{`\n`}  <span className="fn">gemini-pro</span><span className="br">:</span> <span className="str">commander</span>{`\n`}  <span className="fn">claude-haiku</span><span className="br">:</span> <span className="str">worker</span>{`\n`}  <span className="fn">gpt-mini</span><span className="br">:</span> <span className="str">worker</span>{`\n\n`}<span className="kw">hierarchy</span><span className="br">:</span>{`\n`}  <span className="fn">L0</span><span className="br">:</span> <span className="str">nexus</span>{`\n`}  <span className="fn">L1</span><span className="br">:</span> <span className="str">commanders × 5</span>{`\n`}  <span className="fn">L2</span><span className="br">:</span> <span className="str">squad_leads</span>{`\n`}  <span className="fn">L3</span><span className="br">:</span> <span className="str">workers</span>{`\n`}  <span className="fn">L4</span><span className="br">:</span> <span className="str">reviewers</span></pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="swarm-section">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: "3.5rem" }}>
            <span className="section-label">Features</span>
            <h2 className="section-title">Collective<br />intelligence<em>.</em></h2>
          </div>
          {[
            { num: "01", title: "Hierarchical fan-out", desc: <><strong>One command spawns an army.</strong> The Nexus orchestrator fans out to Commanders, who decompose tasks to Squad Leads, who dispatch Workers — all in parallel across model families.</> },
            { num: "02", title: "Cross-family review", desc: <><strong>Claude reviews GPT&apos;s work. GPT reviews Gemini&apos;s.</strong> L4 Reviewers are always from a different model family than the Workers they validate — eliminating single-model blind spots.</> },
            { num: "03", title: "Consensus-gated synthesis", desc: <><strong>Nothing ships without agreement.</strong> Outputs must reach a configurable consensus threshold (default ≥ 0.70) before they&apos;re merged into the final synthesis.</> },
            { num: "04", title: "Shadow scoring", desc: <><strong>Sealed acceptance criteria contestants never see.</strong> Shadow Score = failures ÷ total × 100. The swarm works blind against hidden quality gates — 0% means perfect.</> },
            { num: "05", title: "Elastic scaling", desc: <><strong>SS-50 for quick tasks. SS-250 for maximum consensus.</strong> Scale presets control agent count, commander diversity, and review depth. Choose the right swarm size for the job.</> },
            { num: "06", title: "Model diversity", desc: <><strong>16 models across multiple families.</strong> Claude, GPT, Gemini, and more — each with different training, reasoning patterns, and blind spots. Diversity is the swarm&apos;s strength.</> },
          ].map((f, i) => (
            <div key={f.num} className="feature-item reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
              <span className="feature-num">{f.num}</span>
              <div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ARCHITECTURE ── */}
      <section id="architecture" className="swarm-section alt-bg">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: "1.5rem" }}>
            <span className="section-label">Architecture</span>
            <h2 className="section-title">The 5-layer <em>hierarchy.</em></h2>
            <p className="section-sub">Five layers, each with a specialized role. Work flows down through fan-out, results flow up through consensus.</p>
          </div>

          {/* Conveyor marquee */}
          <div className="marquee-wrap reveal" style={{ marginBottom: "3rem" }}>
            <div className="marquee-track">
              <div className="marquee-inner" style={{ animationDuration: "35s" }}>
                {["L0: Nexus", "L1: Commanders", "L2: Squad Leads", "L3: Workers", "L4: Reviewers", "Fan-Out ↓", "Consensus ↑", "Shadow Score 🔒",
                  "L0: Nexus", "L1: Commanders", "L2: Squad Leads", "L3: Workers", "L4: Reviewers", "Fan-Out ↓", "Consensus ↑", "Shadow Score 🔒"].map((p, i) => (
                  <span key={i} className="marquee-chip">{p}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="reveal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
            {[
              { layer: "L0", title: "Nexus", desc: "The single orchestrator. Receives the task, selects scale preset, dispatches Commanders, synthesizes final output from consensus results.", agent: "Orchestrator", sealed: true },
              { layer: "L1", title: "Commanders", desc: "5 general-purpose agents from different model families. Each decomposes the task independently, producing competing strategies.", agent: "5 × Different Models" },
              { layer: "L2", title: "Squad Leads", desc: "Break Commander strategies into executable sub-tasks. Assign Workers based on task type (explore vs. task agents).", agent: "Task Decomposers" },
              { layer: "L3", title: "Workers", desc: "The bulk of the swarm. Explore agents research, task agents build. Fast models for throughput, premium models for critical paths.", agent: "Explore + Task Agents" },
              { layer: "L4", title: "Reviewers", desc: "Cross-family validation. A Claude reviewer checks GPT output. A GPT reviewer checks Claude output. No self-grading.", agent: "Cross-Family Validators", sealed: true },
            ].map((p) => (
              <div key={p.layer} className="phase-card">
                <span className="phase-num-label">{p.layer}</span>
                <h3 className="phase-title">{p.title}</h3>
                <p className="phase-desc">{p.desc}</p>
                <span className={`agent-badge ${p.sealed ? "sealed" : ""}`}>{p.agent}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARCHITECTURE SVG ── */}
      <section className="swarm-section">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: "2rem" }}>
            <span className="section-label">System Design</span>
            <h2 className="section-title">Swarm<br />topology<em>.</em></h2>
          </div>
          <div className="arch-svg-wrap reveal">
            <svg viewBox="0 0 1100 520" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Swarm Command architecture diagram">
              {/* L0: Nexus */}
              <rect x="430" y="20" width="240" height="80" rx="18" fill="rgba(245,158,11,.06)" stroke="#f59e0b" strokeWidth="2" />
              <text x="550" y="55" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="700" fill="#f59e0b">🐝 L0: NEXUS</text>
              <text x="550" y="78" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="rgba(245,158,11,.5)">Orchestrator</text>

              {/* Lines from Nexus to Commanders */}
              {[170, 340, 550, 760, 930].map((cx, i) => (
                <line key={`nc-${i}`} x1="550" y1="100" x2={cx} y2="140" stroke="rgba(245,158,11,.3)" strokeWidth="1.5" />
              ))}

              {/* L1: Commanders */}
              {[
                { x: 90, label: "Claude" },
                { x: 280, label: "GPT" },
                { x: 470, label: "Gemini" },
                { x: 660, label: "Mistral" },
                { x: 850, label: "DeepSeek" },
              ].map((c) => (
                <g key={c.label}>
                  <rect x={c.x} y="140" width="160" height="65" rx="14" fill="rgba(234,179,8,.06)" stroke="#eab308" strokeWidth="1.5" />
                  <text x={c.x + 80} y="170" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill="#eab308">🎯 {c.label}</text>
                  <text x={c.x + 80} y="190" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(234,179,8,.4)">Commander</text>
                </g>
              ))}

              {/* Lines from Commanders to Squad Leads */}
              {[200, 450, 700].map((cx, i) => (
                <line key={`cs-${i}`} x1={[170, 550, 930][i]} y1="205" x2={cx} y2="250" stroke="rgba(161,161,170,.2)" strokeWidth="1" />
              ))}

              {/* L2: Squad Leads */}
              <rect x="100" y="250" width="200" height="55" rx="12" fill="rgba(161,161,170,.04)" stroke="rgba(161,161,170,.2)" strokeWidth="1" />
              <text x="200" y="280" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="600" fill="rgba(161,161,170,.7)">📋 L2: Squad Leads</text>
              <text x="200" y="296" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(161,161,170,.35)">Task decomposition</text>

              <rect x="350" y="250" width="200" height="55" rx="12" fill="rgba(161,161,170,.04)" stroke="rgba(161,161,170,.2)" strokeWidth="1" />
              <text x="450" y="280" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="600" fill="rgba(161,161,170,.7)">📋 L2: Squad Leads</text>
              <text x="450" y="296" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(161,161,170,.35)">Task decomposition</text>

              <rect x="600" y="250" width="200" height="55" rx="12" fill="rgba(161,161,170,.04)" stroke="rgba(161,161,170,.2)" strokeWidth="1" />
              <text x="700" y="280" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="600" fill="rgba(161,161,170,.7)">📋 L2: Squad Leads</text>
              <text x="700" y="296" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(161,161,170,.35)">Task decomposition</text>

              {/* Lines to Workers */}
              {[150, 300, 450, 600, 750].map((cx, i) => (
                <line key={`sw-${i}`} x1={[200, 200, 450, 700, 700][i]} y1="305" x2={cx} y2="350" stroke="rgba(161,161,170,.15)" strokeWidth="1" />
              ))}

              {/* L3: Workers */}
              <rect x="50" y="350" width="900" height="55" rx="12" fill="rgba(132,204,22,.04)" stroke="rgba(132,204,22,.2)" strokeWidth="1" />
              <text x="500" y="380" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="600" fill="rgba(132,204,22,.6)">⚙️ L3: Workers — explore agents + task agents across 16 models</text>
              <text x="500" y="396" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(132,204,22,.3)">The bulk of the swarm · Fast models for throughput · Premium for critical paths</text>

              {/* Lines to Reviewers */}
              <line x1="500" y1="405" x2="500" y2="440" stroke="rgba(245,158,11,.25)" strokeWidth="1.5" />

              {/* L4: Reviewers */}
              <rect x="200" y="440" width="600" height="55" rx="12" fill="rgba(245,158,11,.06)" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="500" y="468" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill="#f59e0b">🔍 L4: Reviewers — cross-family validation · consensus gating</text>
              <text x="500" y="486" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(245,158,11,.4)">Claude reviews GPT · GPT reviews Claude · No self-grading</text>
            </svg>
          </div>
        </div>
      </section>

      {/* ── SCALING ── */}
      <section id="scaling" className="swarm-section alt-bg">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: "3rem" }}>
            <span className="section-label">Scale Presets</span>
            <h2 className="section-title">Right-size your <em>swarm.</em></h2>
            <p className="section-sub">Choose the scale that fits your task. More agents means more perspectives, deeper review, and stronger consensus.</p>
          </div>
          <div className="reveal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
            {[
              { icon: "⚡", name: "SS-50", agents: "~52 agents", desc: "Fast focused tasks. Quick code reviews, single-module refactors, targeted bug hunts. Minimal commander diversity, fast turnaround.", speed: "Fast" },
              { icon: "🎯", name: "SS-100", agents: "~89 agents", desc: "Balanced coverage. Architecture reviews, multi-module analysis, security audits. Full commander diversity with moderate review depth.", speed: "Balanced" },
              { icon: "🐝", name: "SS-250", agents: "~316 agents", desc: "Maximum consensus. Full-codebase audits, critical migrations, high-stakes decisions. Every model family represented, deep cross-validation.", speed: "Deep" },
            ].map((a) => (
              <div key={a.name} className="agent-card">
                <div className="agent-icon">{a.icon}<span className="agent-powered" /></div>
                <h3 className="feature-title">{a.name}</h3>
                <span className="agent-role">{a.agents}</span>
                <p className="feature-desc" style={{ maxWidth: "none" }}>{a.desc}</p>
                <span className="agent-model">mode: {a.speed}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONSENSUS FORMULA ── */}
      <section id="consensus" className="swarm-section">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: "3rem" }}>
            <span className="section-label">Core Algorithm</span>
            <h2 className="section-title">Consensus<br />formula<em>.</em></h2>
            <p className="section-sub">
              Every output is scored by reviewers across multiple dimensions. The weighted formula determines
              whether an output achieves consensus, majority, or gets flagged as unique.
            </p>
          </div>
          <div className="sealed-cols reveal">
            <div className="sealed-col">
              <h3>The Formula</h3>
              <div className="code-block" style={{ marginBottom: "1.25rem" }}>
                <div className="code-body">
                  <pre style={{ fontSize: ".82rem", lineHeight: 1.8 }}>
                    <span className="fn">confidence</span> <span className="br">×</span> <span className="num">0.40</span>{`\n`}<span className="br">+</span> <span className="fn">evidence</span>   <span className="br">×</span> <span className="num">0.30</span>{`\n`}<span className="br">+</span> <span className="fn">scope</span>      <span className="br">×</span> <span className="num">0.15</span>{`\n`}<span className="br">+</span> <span className="fn">coverage</span>   <span className="br">×</span> <span className="num">0.15</span>{`\n`}<span className="br">−</span> <span className="kw">conflict_penalty</span>
                  </pre>
                </div>
              </div>
              <p><strong>Confidence (40%):</strong> How strongly do reviewers agree with this output?</p>
              <p><strong>Evidence (30%):</strong> Is the output backed by concrete examples and reasoning?</p>
              <p><strong>Scope (15%):</strong> Does it address the full breadth of the original task?</p>
              <p><strong>Coverage (15%):</strong> How many aspects of the problem space does it touch?</p>
            </div>
            <div className="sealed-col">
              <h3>Thresholds</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1.5rem" }}>
                <div style={{ padding: "1.25rem", background: "rgba(132,204,22,.04)", border: "1px solid rgba(132,204,22,.2)", borderRadius: "12px" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--lime)", fontSize: "1.1rem" }}>CONSENSUS ≥ 0.70</div>
                  <p style={{ fontSize: ".85rem", color: "var(--subtle)", marginTop: ".4rem", lineHeight: 1.6 }}>Strong agreement across reviewers. Output is merged into final synthesis.</p>
                </div>
                <div style={{ padding: "1.25rem", background: "rgba(245,158,11,.04)", border: "1px solid rgba(245,158,11,.2)", borderRadius: "12px" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--amber)", fontSize: "1.1rem" }}>MAJORITY ≥ 0.50</div>
                  <p style={{ fontSize: ".85rem", color: "var(--subtle)", marginTop: ".4rem", lineHeight: 1.6 }}>Moderate agreement. Included with caveats noted in the synthesis.</p>
                </div>
                <div style={{ padding: "1.25rem", background: "rgba(239,68,68,.04)", border: "1px solid rgba(239,68,68,.2)", borderRadius: "12px" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--red)", fontSize: "1.1rem" }}>UNIQUE &lt; 0.50</div>
                  <p style={{ fontSize: ".85rem", color: "var(--subtle)", marginTop: ".4rem", lineHeight: 1.6 }}>Low agreement. Flagged as a minority perspective — may still contain valuable insights.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SHADOW SCORE ── */}
      <section className="swarm-section alt-bg">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: "3rem" }}>
            <span className="section-label">Quality Gate</span>
            <h2 className="section-title">Shadow<br />score<em>.</em></h2>
            <p className="section-sub">
              Sealed acceptance criteria that contestants never see. The{" "}
              <a href="https://github.com/DUBSOpenHub/shadow-score-spec" target="_blank" rel="noopener noreferrer">shadow score</a>
              {" "}measures how well the swarm performs against hidden quality gates.
            </p>
          </div>

          <div className="reveal" style={{ marginTop: "2rem", padding: "1.5rem 2rem", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "12px", maxWidth: 700, margin: "2rem auto 0", textAlign: "left" }}>
            <h3 style={{ fontFamily: "var(--font-mono)", fontSize: ".78rem", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--amber)", marginBottom: ".75rem", fontWeight: 700 }}>
              🔒 Shadow Score Formula
            </h3>
            <p style={{ fontSize: ".88rem", color: "var(--subtle)", lineHeight: 1.7, marginBottom: ".75rem" }}>
              <strong style={{ color: "var(--text)" }}>Shadow Score = failures ÷ total × 100</strong>{" "}
              — the percentage of sealed acceptance criteria the swarm failed to satisfy when working blind.
            </p>
            <div style={{ display: "flex", gap: "1.5rem", fontFamily: "var(--font-mono)", fontSize: ".78rem", flexWrap: "wrap" }}>
              <span><span style={{ color: "var(--lime)", fontWeight: 700 }}>0%</span> <span style={{ color: "var(--muted)" }}>— perfect</span></span>
              <span><span style={{ color: "var(--amber)", fontWeight: 700 }}>≤10%</span> <span style={{ color: "var(--muted)" }}>— team target</span></span>
              <span><span style={{ color: "var(--red)", fontWeight: 700 }}>&gt;25%</span> <span style={{ color: "var(--muted)" }}>— needs review</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SAMPLE SESSION ── */}
      <section className="swarm-section">
        <div className="reveal" style={{ maxWidth: 780, margin: "0 auto" }}>
          <div className="convo-header">sample session — SS-100</div>
          <div className="msg"><span className="msg-who you">you</span><span className="msg-text">swarm command — audit authentication system for security vulnerabilities</span></div>
          <div className="msg"><span className="msg-who swarm">nexus</span><span className="msg-text">🐝 <strong>Swarm: sw-20260325</strong> | Scale: SS-100 | Models: 5 families</span></div>
          <div className="msg"><span className="msg-who agent">L1</span><span className="msg-text"><strong>Commanders dispatched:</strong> Claude-Sonnet, GPT-5, Gemini-Pro, Mistral-Large, DeepSeek-R1</span></div>
          <div className="msg"><span className="msg-who agent">L2</span><span className="msg-text">15 Squad Leads decomposing into <code>47 sub-tasks</code></span></div>
          <div className="msg-gap" />
          <div className="msg"><span className="msg-who agent">L3</span><span className="msg-text"><strong>62 Workers executing</strong> — auth flows, token validation, session mgmt, RBAC, crypto</span></div>
          <div className="msg"><span className="msg-who agent">L4</span><span className="msg-text">Cross-family review: <code>18 reviewers</code> | consensus: <strong>0.84</strong></span></div>
          <div className="msg-gap" />
          <div className="msg"><span className="msg-who swarm">nexus</span><span className="msg-text">🐝 <code>SHADOW_SCORE: 2.3%</code> — 1 sealed criterion missed</span></div>
          <div className="msg"><span className="msg-who swarm">nexus</span><span className="msg-text"><strong>Synthesis complete.</strong> 89 agents converged. 14 findings, 3 critical. Report ready.</span></div>
        </div>
      </section>

      {/* ── INSTALL ── */}
      <section id="install" className="install-section alt-bg">
        <div className="reveal" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="how-flow">
            <div className="how-step">
              <div className="how-step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
                </svg>
              </div>
              <span className="how-step-num">Step 1</span>
              <span className="how-step-label">Install</span>
              <span className="how-step-sub">One-liner quickstart</span>
            </div>
            <div className="how-arrow">
              <svg viewBox="0 0 40 16" fill="none">
                <line x1="0" y1="8" x2="32" y2="8" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" />
                <polygon points="30,4 38,8 30,12" fill="rgba(255,255,255,.12)" />
              </svg>
            </div>
            <div className="how-step">
              <div className="how-step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 9h1l1 2 2-4h1" /><line x1="9" y1="17" x2="15" y2="17" />
                </svg>
              </div>
              <span className="how-step-num">Step 2</span>
              <span className="how-step-label">Describe your task</span>
              <span className="how-step-sub">Plain English, any scope</span>
            </div>
            <div className="how-arrow">
              <svg viewBox="0 0 40 16" fill="none">
                <line x1="0" y1="8" x2="32" y2="8" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" />
                <polygon points="30,4 38,8 30,12" fill="rgba(255,255,255,.12)" />
              </svg>
            </div>
            <div className="how-step">
              <div className="how-step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#84cc16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3v12" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" />
                </svg>
              </div>
              <span className="how-step-num">Step 3</span>
              <span className="how-step-label">Get consensus</span>
              <span className="how-step-sub">Multi-model, validated</span>
            </div>
          </div>

          <h2 className="section-title" style={{ textAlign: "center", fontSize: "clamp(4rem, 12vw, 8rem)", marginBottom: "2.5rem" }}>
            Swarm<span className="footer-gradient">.</span>
          </h2>
          <div className="install-cmd"><span className="comment"># install swarm command</span></div>
          <div className="install-cmd"><span className="prompt">›</span> <span className="cmd">curl -fsSL</span> <span className="arg">https://raw.githubusercontent.com/DUBSOpenHub/swarm-command/main/quickstart.sh</span> <span className="cmd">| bash</span></div>
          <div className="install-cmd">&nbsp;</div>
          <div className="install-cmd"><span className="comment"># launch a swarm</span></div>
          <div className="install-cmd"><span className="prompt">›</span> <span className="cmd">swarm command</span> — audit my authentication system</div>

          <div className="install-steps">
            <div className="install-step">
              <span className="step-num">01</span>
              <p>Install</p>
              <code>curl quickstart.sh | bash</code>
            </div>
            <div className="install-step">
              <span className="step-num">02</span>
              <p>Describe</p>
              <code>swarm command — &lt;your task&gt;</code>
            </div>
            <div className="install-step">
              <span className="step-num">03</span>
              <p>Converge</p>
              <code>consensus-gated synthesis</code>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="swarm-footer" style={{ flexDirection: "column", gap: "1rem", textAlign: "center" }}>
        <span style={{ fontSize: ".92rem" }}>
          <span className="footer-gradient">swarm command</span> — created by{" "}
          <a href="https://github.com/greggcochran" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>Gregg Cochran</a>
          {" "}
          <a href="https://github.com/DUBSOpenHub" target="_blank" rel="noopener noreferrer">@DUBSOpenHub</a>
        </span>
        <span>
          Built with 💛 using the{" "}
          <a href="https://docs.github.com/copilot/concepts/agents/about-copilot-cli" target="_blank" rel="noopener noreferrer">GitHub Copilot CLI</a>
          {" · "}
          <a href="https://github.com/DUBSOpenHub/shadow-score-spec" target="_blank" rel="noopener noreferrer">shadow score spec</a>
          {" · "}
          <a href="https://github.com/DUBSOpenHub/swarm-command" target="_blank" rel="noopener noreferrer">source ↗</a>
        </span>
      </footer>
    </>
  );
}
