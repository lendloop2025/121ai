import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Lock,
  ScanLine,
  Activity,
  Cpu,
  Radar,
  Eye,
  Zap,
  Check,
  Play,
  TrendingUp,
  TrendingDown,
  CornerDownRight,
  Plus,
  Send,
  Wallet,
} from "lucide-react";
import { LandingHeader } from "./_landing/landing-header";
import { FaqAccordion } from "./_landing/faq-accordion";
import { HeroSceneLoader } from "./_landing/hero-scene-loader";
import { StepsSceneLoader } from "./_landing/steps-scene-loader";
import { MarketsSceneLoader } from "./_landing/markets-scene-loader";
import { Reveal } from "./_landing/reveal";

export default function HomePage() {
  return (
    <main className="cracker-root min-h-screen flex flex-col">
      <LandingHeader />

      <CrackerHero />
      <PartnersStrip />
      <StatsBand />
      <BentoFeatures />
      <MarketsSection />
      <HowItWorks />
      <SecurityBento />
      <FaqSection />
      <FinalCta />
      <CrackerFooter />
    </main>
  );
}

/* =========================================================
   HERO — Cracker reference (magenta variant, 3D stage)
   ========================================================= */
function CrackerHero() {
  return (
    <section className="cracker-hero relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      {/* Atmospheric layers */}
      <div aria-hidden className="absolute inset-0 cb-bg-grid opacity-70" />
      <div aria-hidden className="absolute inset-0 cb-bg-noise opacity-40" />
      <div
        aria-hidden
        className="cb-magenta-glow"
        style={{ width: 720, height: 720, top: -160, right: -120 }}
      />
      <div
        aria-hidden
        className="cb-violet-glow"
        style={{ width: 600, height: 600, bottom: -260, left: -160 }}
      />

      {/* Diagonal "wires" mimicking the ref hero — purely decorative */}
      <svg
        aria-hidden
        className="cb-hero-wires cb-wire-anim"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="cb-wire-grad" x1="0" x2="1" y1="0" y2="0.4">
            <stop offset="0%" stopColor="rgba(111,208,255,0)" />
            <stop offset="45%" stopColor="rgba(111,208,255,0.6)" />
            <stop offset="100%" stopColor="rgba(42,107,255,0)" />
          </linearGradient>
        </defs>
        {[
          "M-60 220 C 360 80, 980 540, 1500 360",
          "M-60 360 C 400 200, 1000 680, 1500 520",
          "M-60 520 C 380 360, 1020 740, 1500 660",
          "M-60 660 C 420 540, 980 800, 1500 760",
        ].map((d, i) => (
          <path
            key={i}
            d={d}
            stroke="url(#cb-wire-grad)"
            strokeWidth="1"
            fill="none"
          />
        ))}
      </svg>

      {/* Full-bleed centered 3D globe — lives behind the hero content and
          feathers into the page background on every edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          WebkitMaskImage:
            "radial-gradient(closest-side at 50% 50%, #000 35%, transparent 80%)",
          maskImage:
            "radial-gradient(closest-side at 50% 50%, #000 35%, transparent 80%)",
        }}
      >
        <HeroSceneLoader />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-10 lg:gap-12 items-center">
          {/* ---------------- Left column ---------------- */}
          <Reveal variant="left" className="relative z-10">
            <span className="cb-badge">
              <span className="cb-dot-magenta" />
              Peer-to-peer lending for NCI
            </span>

            <h1
              className="cb-display mt-7"
              style={{ fontSize: "clamp(40px, 5.4vw, 76px)" }}
            >
              We Provide You With
              <br />
              A <span className="cb-shimmer-text">Safe</span> &amp;{" "}
              <span className="cb-shimmer-text">Reliable</span>
              <br />
              Lending Network
            </h1>

            <p className="mt-7 max-w-[540px] text-[17px] leading-[1.7] text-[var(--cb-text-muted)]">
              Unlock the power of <span className="cb-pill-word is-violet">verified</span>{" "}
              members, <span className="cb-pill-word is-cyan">transparent</span> scoring,
              and <span className="cb-pill-word">instant</span> disbursal —
              121.ai matches NCI students with peers willing to fund their next loan, no
              banks in between.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/register" className="cb-btn-magenta">
                Get started <ArrowRight size={18} />
              </Link>
              <Link href="#how-it-works" className="cb-btn-ghost">
                <Play size={14} fill="currentColor" />
                How it works
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <div>
                <div className="text-3xl font-semibold cb-mono text-[var(--cb-text)]">
                  127+
                </div>
                <div className="text-xs text-[var(--cb-text-muted)] mt-1">
                  verified members
                </div>
              </div>
              <div className="h-10 w-px bg-[var(--cb-border)]" />
              <div>
                <div className="text-3xl font-semibold cb-mono text-[var(--cb-sky)] cb-tick-up">
                  0.0%
                </div>
                <div className="text-xs text-[var(--cb-text-muted)] mt-1">
                  default rate
                </div>
              </div>
              <div className="h-10 w-px bg-[var(--cb-border)] hidden sm:block" />
              <div className="hidden sm:block">
                <div className="text-3xl font-semibold cb-mono text-[var(--cb-text)]">
                  €48.2K
                </div>
                <div className="text-xs text-[var(--cb-text-muted)] mt-1">
                  funded to date
                </div>
              </div>
            </div>
          </Reveal>

          {/* ---------------- Right column: glass mockup over the globe ---------------- */}
          <Reveal variant="right" className="relative h-[520px] lg:h-[600px]">
            {/* Main glass dashboard mockup — floats over the centered globe */}
            <DashboardMock />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* Dashboard mockup matching frames 5-6 of the reference, adapted for lending */
function DashboardMock() {
  return (
    <div className="cb-glass-mock absolute right-0 lg:-right-4 bottom-6 lg:bottom-10 w-[340px] lg:w-[420px] p-5">
      {/* Top bar */}
      <div className="flex items-center justify-between text-[11px] cb-mono text-[var(--cb-text-subtle)]">
        <span className="inline-flex items-center gap-2 text-[var(--cb-text)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--cb-magenta)]" />
          121.ai
        </span>
        <span>EUR/LOANS · live</span>
      </div>

      {/* Section title */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-[15px] font-semibold">My Loan Cards</div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[11px] text-[var(--cb-text-muted)] hover:text-[var(--cb-text)]"
        >
          <Plus size={12} /> Add loan
        </button>
      </div>

      {/* Stacked virtual card */}
      <div className="mt-4 relative">
        <div
          className="absolute inset-x-3 -top-2 h-full rounded-2xl bg-gradient-to-br from-[#1A1A24] to-[#0E0E14] border border-[var(--cb-border)]"
          aria-hidden
        />
        <div className="relative rounded-2xl p-4 border border-[var(--cb-border-strong)] bg-gradient-to-br from-[#1F1626] via-[#241228] to-[#1A0E1F]">
          <div className="flex items-center justify-between">
            <span className="cb-mono text-[10px] tracking-[0.18em] uppercase text-[var(--cb-text-subtle)]">
              Active loan
            </span>
            <Wallet size={14} className="text-[var(--cb-magenta)]" />
          </div>
          <div className="mt-6 cb-mono text-[15px] tracking-[0.18em] text-[var(--cb-text-muted)]">
            **** **** 7677 8545
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className="text-[10px] text-[var(--cb-text-subtle)] cb-mono">BALANCE</div>
              <div className="text-2xl font-semibold cb-mono">€1,456</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[var(--cb-text-subtle)] cb-mono">APR</div>
              <div className="text-base font-semibold cb-mono text-[var(--cb-magenta)]">
                8.4%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two action tiles */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="rounded-xl border border-[var(--cb-border)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] p-3 text-left transition"
        >
          <div className="flex items-center gap-2 text-[10px] cb-mono uppercase tracking-wider text-[var(--cb-text-subtle)]">
            <Plus size={11} /> Top Up
          </div>
          <div className="mt-1 text-sm font-semibold">Add funds</div>
        </button>
        <button
          type="button"
          className="rounded-xl border border-[var(--cb-magenta)]/30 p-3 text-left transition hover:border-[var(--cb-magenta)]/60"
          style={{ background: "linear-gradient(180deg, rgba(255,61,165,0.10), rgba(255,61,165,0.02))" }}
        >
          <div className="flex items-center gap-2 text-[10px] cb-mono uppercase tracking-wider text-[var(--cb-magenta)]">
            <Send size={11} /> Repay
          </div>
          <div className="mt-1 text-sm font-semibold">Send €200</div>
        </button>
      </div>

      {/* Mini transactions feed */}
      <div className="mt-5">
        <div className="text-[10px] cb-mono uppercase tracking-[0.18em] text-[var(--cb-text-subtle)]">
          Recent activity
        </div>
        <ul className="mt-3 space-y-2.5">
          {[
            { who: "Anna G.", note: "Loan funded", amt: "+€500", up: true },
            { who: "Mark T.", note: "Repayment", amt: "−€72", up: false },
            { who: "Score", note: "Recomputed +2", amt: "82", up: true },
          ].map((r) => (
            <li key={r.who} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[var(--cb-surface-2)] border border-[var(--cb-border)] inline-flex items-center justify-center text-[10px] cb-mono text-[var(--cb-text-muted)]">
                  {r.who.slice(0, 1)}
                </span>
                <span>
                  <div className="text-[var(--cb-text)] text-[12px]">{r.who}</div>
                  <div className="text-[10px] text-[var(--cb-text-subtle)]">{r.note}</div>
                </span>
              </div>
              <span
                className={`cb-mono text-[12px] ${
                  r.up ? "text-[var(--cb-magenta)]" : "text-[var(--cb-text-muted)]"
                }`}
              >
                {r.amt}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* =========================================================
   PARTNERS STRIP
   ========================================================= */
function PartnersStrip() {
  const items = ["Stripe", "Supabase", "Plaid", "Auth0", "NCI", "Vercel", "Linear"];
  return (
    <section className="border-y border-[var(--cb-border)] py-8 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="cb-mono text-[11px] uppercase tracking-[0.2em] text-[var(--cb-text-subtle)] shrink-0">
          Powered by
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="cb-marquee">
            {[...items, ...items].map((name, i) => (
              <span
                key={i}
                className="text-xl lg:text-2xl font-medium text-[var(--cb-text-muted)] whitespace-nowrap inline-flex items-center gap-3"
              >
                {name}
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--cb-sky)] shadow-[0_0_10px_var(--cb-sky-glow)]" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   STATS BAND
   ========================================================= */
function StatsBand() {
  const stats = [
    { val: "127", label: "Verified members" },
    { val: "€48.2K", label: "Total funded" },
    { val: "9.4%", label: "Avg APR" },
    { val: "0.00%", label: "Default rate" },
  ];
  return (
    <section className="py-20 lg:py-24 relative">
      <Reveal
        variant="stagger"
        className="max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {stats.map((s, i) => (
          <div key={s.label} className="cb-card p-7">
            <div className="text-[10px] cb-mono uppercase tracking-[0.2em] text-[var(--cb-text-subtle)]">
              /{String(i + 1).padStart(2, "0")}
            </div>
            <div className="mt-6 text-5xl lg:text-6xl cb-mono font-semibold cb-shimmer-text">{s.val}</div>
            <div className="mt-3 text-sm text-[var(--cb-text-muted)]">{s.label}</div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

/* =========================================================
   BENTO FEATURES
   ========================================================= */
function BentoFeatures() {
  return (
    <section className="py-24 lg:py-32 relative">
      <div aria-hidden className="cb-lime-glow cb-glow-pulse" style={{ width: 500, height: 500, top: "20%", left: "-10%" }} />
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <SectionHeader
          kicker="Platform"
          title={
            <>
              Everything you need to lend
              <br />
              <span className="text-[var(--cb-text-muted)]">safely, transparently, fast.</span>
            </>
          }
        />

        <Reveal variant="stagger" className="mt-16 grid grid-cols-12 gap-3 auto-rows-[180px]">
          {/* Big lime feature */}
          <div className="cb-card cb-card-lime col-span-12 lg:col-span-6 row-span-2 p-8 lg:p-10 flex flex-col justify-between">
            <div>
              <div className="cb-mono text-[10px] uppercase tracking-[0.2em] text-[#0A0A0B]/60">
                / 01 — Threat-grade verification
              </div>
              <h3 className="cb-display mt-6 text-[40px] lg:text-[56px] text-[#0A0A0B]">
                Real identities,<br />real accountability.
              </h3>
              <p className="mt-5 max-w-[420px] text-[15px] text-[#0A0A0B]/70 leading-relaxed">
                Every member is verified by NCI email, government ID, and live photo capture before they
                can lend or borrow. No bots. No ghost accounts.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#0A0A0B] flex items-center justify-center">
                <ScanLine size={22} className="text-[var(--cb-lime)]" />
              </div>
              <div className="flex-1 cb-rule" />
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0A0A0B]"
              >
                Verify me <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          {/* Tall card */}
          <div className="cb-card col-span-12 sm:col-span-6 lg:col-span-3 row-span-2 p-7 flex flex-col">
            <Cpu size={28} className="text-[var(--cb-lime)]" />
            <div className="mt-auto">
              <div className="cb-mono text-[10px] uppercase tracking-[0.2em] text-[var(--cb-text-subtle)]">
                / 02
              </div>
              <h3 className="mt-2 text-xl font-semibold">Adaptive score engine</h3>
              <p className="mt-3 text-sm text-[var(--cb-text-muted)] leading-relaxed">
                A 0–100 score that learns from every repayment — five factors, recomputed in real time.
              </p>
              <div className="mt-5 flex items-end gap-1.5 h-[60px]">
                {[24, 30, 28, 38, 44, 41, 52, 58, 56, 68, 74, 72].map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-[var(--cb-lime)]/80"
                    style={{ height: `${v}%`, opacity: 0.4 + i / 16 }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Compact */}
          <div className="cb-card col-span-12 sm:col-span-6 lg:col-span-3 row-span-1 p-6 flex items-start justify-between gap-4">
            <div>
              <div className="cb-mono text-[10px] uppercase tracking-[0.2em] text-[var(--cb-text-subtle)]">
                / 03
              </div>
              <h3 className="mt-2 text-base font-semibold">24/7 monitoring</h3>
              <p className="mt-1.5 text-xs text-[var(--cb-text-muted)] leading-relaxed">
                Every loan tracked, every repayment audited.
              </p>
            </div>
            <Radar size={22} className="text-[var(--cb-lime)] shrink-0" />
          </div>

          {/* Compact */}
          <div className="cb-card col-span-12 sm:col-span-6 lg:col-span-3 row-span-1 p-6 flex items-start justify-between gap-4">
            <div>
              <div className="cb-mono text-[10px] uppercase tracking-[0.2em] text-[var(--cb-text-subtle)]">
                / 04
              </div>
              <h3 className="mt-2 text-base font-semibold">Encrypted custody</h3>
              <p className="mt-1.5 text-xs text-[var(--cb-text-muted)] leading-relaxed">
                Funds held with Stripe — a licensed PSP.
              </p>
            </div>
            <Lock size={22} className="text-[var(--cb-lime)] shrink-0" />
          </div>

          {/* Wide */}
          <div className="cb-card col-span-12 lg:col-span-6 row-span-1 p-6 flex items-center justify-between gap-6">
            <div>
              <div className="cb-mono text-[10px] uppercase tracking-[0.2em] text-[var(--cb-text-subtle)]">
                / 05 — Audit trail
              </div>
              <h3 className="mt-2 text-lg font-semibold">Every action recorded, signed, replayable.</h3>
            </div>
            <div className="hidden sm:flex flex-col gap-1.5 cb-mono text-[10px] text-[var(--cb-text-subtle)] text-right">
              <div>2026-05-22 14:02 · ln_8a3 funded</div>
              <div>2026-05-22 14:01 · score recomputed +2</div>
              <div>2026-05-22 13:58 · KYC passed</div>
            </div>
          </div>

          {/* Compact */}
          <div className="cb-card col-span-12 sm:col-span-6 lg:col-span-3 row-span-1 p-6 flex items-start justify-between gap-4">
            <div>
              <div className="cb-mono text-[10px] uppercase tracking-[0.2em] text-[var(--cb-text-subtle)]">
                / 06
              </div>
              <h3 className="mt-2 text-base font-semibold">GDPR-native</h3>
              <p className="mt-1.5 text-xs text-[var(--cb-text-muted)] leading-relaxed">
                Export or erase your data on request.
              </p>
            </div>
            <Eye size={22} className="text-[var(--cb-lime)] shrink-0" />
          </div>

          {/* Compact */}
          <div className="cb-card col-span-12 sm:col-span-6 lg:col-span-3 row-span-1 p-6 flex items-start justify-between gap-4">
            <div>
              <div className="cb-mono text-[10px] uppercase tracking-[0.2em] text-[var(--cb-text-subtle)]">
                / 07
              </div>
              <h3 className="mt-2 text-base font-semibold">Instant disbursal</h3>
              <p className="mt-1.5 text-xs text-[var(--cb-text-muted)] leading-relaxed">
                Funds hit your wallet the moment a loan funds.
              </p>
            </div>
            <Zap size={22} className="text-[var(--cb-lime)] shrink-0" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* =========================================================
   LIVE MARKETS
   ========================================================= */
type Tile = {
  amount: string;
  apr: string;
  term: string;
  score: number;
  funded: number;
  purpose: string;
  trend: "up" | "down" | "flat";
  spark: number[];
};
const TILES: Tile[] = [
  { amount: "€500",   apr: "8.0%",  term: "6 mo",  score: 84, funded: 92,  purpose: "Tuition top-up",   trend: "up",   spark: [2,4,3,5,7,8,9,11] },
  { amount: "€1,200", apr: "11.0%", term: "10 mo", score: 71, funded: 62,  purpose: "Laptop & equip.",  trend: "up",   spark: [5,4,6,8,7,9,10,12] },
  { amount: "€300",   apr: "7.5%",  term: "3 mo",  score: 90, funded: 100, purpose: "Books",            trend: "up",   spark: [3,5,4,6,5,7,8,9] },
  { amount: "€800",   apr: "9.5%",  term: "8 mo",  score: 78, funded: 48,  purpose: "Living costs",     trend: "flat", spark: [4,3,5,4,6,7,6,8] },
  { amount: "€2,000", apr: "12.0%", term: "12 mo", score: 65, funded: 28,  purpose: "Travel home",      trend: "up",   spark: [2,3,2,4,5,6,7,9] },
  { amount: "€450",   apr: "8.5%",  term: "5 mo",  score: 82, funded: 76,  purpose: "Course materials", trend: "up",   spark: [5,6,5,7,8,8,9,10] },
];

function MarketsSection() {
  return (
    <section id="markets" className="py-24 lg:py-32 relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 cb-bg-grid-fine cb-bg-grid-anim opacity-40" />
      <div aria-hidden className="cb-lime-glow cb-glow-pulse" style={{ width: 600, height: 600, bottom: -200, right: -200 }} />
      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10">
        <Reveal className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-[640px]">
            <span className="cb-badge">
              <span className="dot" />
              Live market · euro denominated
            </span>
            <h2 className="cb-display mt-6 text-[44px] lg:text-[72px]">
              The community<br />market for loans.
            </h2>
            <p className="mt-5 text-[var(--cb-text-muted)] text-lg max-w-[480px]">
              Browse open requests like a market — every loan priced in €, every borrower scored,
              every offer transparent.
            </p>
          </div>
          <Link href="/register" className="cb-btn-lime">
            Explore markets <ArrowRight size={16} />
          </Link>
        </Reveal>

        {/* 3D carousel of loan cards — sits between the header and the static grid */}
        <Reveal variant="fade" className="mt-12 relative">
          <div className="relative h-[340px] sm:h-[400px] lg:h-[460px] w-full">
            <MarketsSceneLoader />
          </div>
        </Reveal>

        <Reveal variant="stagger" className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TILES.map((t, i) => (
            <MarketTileCard key={i} t={t} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function MarketTileCard({ t }: { t: Tile }) {
  const trendColor =
    t.trend === "up" ? "text-[var(--cb-lime)]" : t.trend === "down" ? "text-[#FF6B4A]" : "text-[var(--cb-text-subtle)]";
  const TrendIcon = t.trend === "up" ? TrendingUp : t.trend === "down" ? TrendingDown : Activity;
  return (
    <div className="cb-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] cb-mono uppercase tracking-[0.18em] text-[var(--cb-text-subtle)]">
            {t.purpose}
          </div>
          <div className="mt-1 text-2xl font-semibold cb-mono">{t.amount}</div>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center gap-1 text-xs font-semibold cb-mono ${trendColor}`}>
            <TrendIcon size={12} />
            {t.apr}
          </div>
          <div className="text-[11px] text-[var(--cb-text-subtle)] mt-1 cb-mono">{t.term}</div>
        </div>
      </div>

      <Sparkline values={t.spark} />

      <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--cb-text-subtle)] cb-mono">
        <span>FUNDED</span>
        <span className="text-[var(--cb-text)]">{t.funded}%</span>
      </div>
      <div className="mt-1.5 h-[3px] rounded-full overflow-hidden bg-white/10">
        <div className="h-full bg-[var(--cb-lime)]" style={{ width: `${t.funded}%` }} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="px-2 h-6 rounded-full bg-[var(--cb-lime-soft)] border border-[var(--cb-lime)]/30 text-[var(--cb-lime)] inline-flex items-center text-[11px] font-semibold cb-mono">
          Score {t.score}
        </span>
        <span className="text-[var(--cb-lime)] text-xs font-semibold inline-flex items-center gap-1">
          Fund <ArrowRight size={12} />
        </span>
      </div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const w = 220, h = 38;
  const step = w / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 w-full h-[38px]" preserveAspectRatio="none">
      <defs>
        <linearGradient id="cbSpark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#5BA8FF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#5BA8FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke="#5BA8FF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" points={points} />
      <polygon fill="url(#cbSpark)" points={`0,${h} ${points} ${w},${h}`} />
    </svg>
  );
}

/* =========================================================
   HOW IT WORKS
   ========================================================= */
function HowItWorks() {
  const steps = [
    { n: "01", title: "Verify", body: "Sign up with your NCI email, verify ID, and get scored in minutes." },
    { n: "02", title: "Match",  body: "Borrowers post requests. Lenders make offers at fair APR. You choose." },
    { n: "03", title: "Repay",  body: "Loans disburse instantly. Repayments are scheduled and automated." },
  ];
  return (
    <section id="how-it-works" className="relative py-24 lg:py-32 border-t border-[var(--cb-border)] overflow-hidden">
      {/* Concentric wave backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-start justify-center">
        <svg
          className="mt-40 w-[1100px] max-w-none opacity-[0.35]"
          viewBox="-300 -300 600 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="cbWaveFade" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#5BA8FF" stopOpacity="0.55" />
              <stop offset="55%" stopColor="#5BA8FF" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#5BA8FF" stopOpacity="0" />
            </radialGradient>
            <mask id="cbWaveMask">
              <rect x="-300" y="-300" width="600" height="600" fill="url(#cbWaveFade)" />
            </mask>
          </defs>
          <g mask="url(#cbWaveMask)" stroke="#5BA8FF" strokeWidth="0.9">
            {Array.from({ length: 14 }).map((_, i) => (
              <circle key={i} cx="0" cy="0" r={20 + i * 22} fill="none" />
            ))}
          </g>
        </svg>
      </div>
      {/* Central glow */}
      <div
        aria-hidden
        className="cb-lime-glow cb-glow-pulse pointer-events-none"
        style={{ width: 520, height: 520, top: "38%", left: "50%", transform: "translate(-50%, -50%)" }}
      />

      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10">
        <SectionHeader
          kicker="How it works"
          title={
            <>
              Three steps from sign-up to<br />
              <span className="text-[var(--cb-text-muted)]">your first loan.</span>
            </>
          }
        />

        {/* 3D rotating orb constellation */}
        <Reveal variant="fade" className="mt-12 relative">
          <div className="relative h-[300px] sm:h-[360px] lg:h-[420px] w-full">
            <StepsSceneLoader />
          </div>
          {/* Step labels under each orb */}
          <div className="mt-[-40px] grid grid-cols-3 gap-2 text-center">
            {steps.map((s, i) => {
              const active = i === 1;
              return (
                <span
                  key={`label-${s.n}`}
                  className={`cb-mono text-[10px] tracking-[0.3em] ${
                    active ? "text-[var(--cb-lime)]" : "text-[var(--cb-text-subtle)]"
                  }`}
                >
                  {s.title.toUpperCase()}
                </span>
              );
            })}
          </div>
        </Reveal>

        <Reveal variant="stagger" className="mt-14 grid md:grid-cols-3 gap-3">
          {steps.map((s, i) => (
            <div key={s.n} className="cb-card p-8 relative backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="cb-mono text-[var(--cb-lime)] text-sm font-semibold">{s.n}</span>
                <span className="cb-rule flex-1" />
                <CornerDownRight size={16} className="text-[var(--cb-text-subtle)]" />
              </div>
              <h3 className="mt-8 text-3xl font-semibold cb-display">{s.title}</h3>
              <p className="mt-4 text-[var(--cb-text-muted)]">{s.body}</p>
              {i === 2 && (
                <span className="absolute top-6 right-6 cb-mono text-[10px] tracking-[0.2em] text-[var(--cb-lime)]">
                  DONE
                </span>
              )}
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* =========================================================
   SECURITY BENTO — score + security
   ========================================================= */
function SecurityBento() {
  return (
    <section id="security" className="py-24 lg:py-32 border-t border-[var(--cb-border)] relative overflow-hidden">
      <div aria-hidden className="cb-lime-glow cb-glow-pulse" style={{ width: 600, height: 600, top: "10%", right: "-15%" }} />
      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10">
        <SectionHeader
          kicker="Score & limits"
          title={
            <>
              Your community score<br />
              <span className="text-[var(--cb-text-muted)]">unlocks bigger loans.</span>
            </>
          }
        />

        <Reveal variant="stagger" className="mt-16 grid grid-cols-12 gap-3">
          {/* Score gauge */}
          <div className="cb-card col-span-12 lg:col-span-5 p-8 flex flex-col items-center justify-center">
            <ScoreGauge value={72} />
            <div className="mt-4 text-center">
              <div className="cb-mono text-[10px] tracking-[0.2em] text-[var(--cb-text-subtle)]">
                STANDARD TIER
              </div>
              <p className="mt-2 text-sm text-[var(--cb-text-muted)] max-w-[280px]">
                Score is recomputed after every repayment. Successful loans push your limit up.
              </p>
            </div>
          </div>

          {/* Tier table */}
          <div className="cb-card col-span-12 lg:col-span-7 overflow-hidden">
            <div className="px-7 py-5 border-b border-[var(--cb-border)] flex items-center justify-between">
              <div className="cb-mono text-[10px] uppercase tracking-[0.2em] text-[var(--cb-text-subtle)]">
                Loan tiers
              </div>
              <span className="cb-mono text-[10px] text-[var(--cb-lime)]">SCORE → LIMIT</span>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["0–29",   "Not eligible", "High risk"],
                  ["30–49",  "€200",         "Elevated"],
                  ["50–64",  "€500",         "Moderate"],
                  ["65–79",  "€1,000",       "Standard"],
                  ["80–89",  "€1,500",       "Low"],
                  ["90–100", "€2,000",       "Excellent"],
                ].map((row, i) => (
                  <tr key={row[0]} className={i > 0 ? "border-t border-[var(--cb-border)]" : ""}>
                    <td className="px-7 py-4 cb-mono">{row[0]}</td>
                    <td className="px-7 py-4 cb-mono text-[var(--cb-lime)]">{row[1]}</td>
                    <td className="px-7 py-4 text-[var(--cb-text-muted)]">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Security pillars row */}
          {[
            { Icon: Lock,        title: "Stripe custody",   body: "All money movement via a licensed PSP." },
            { Icon: ShieldCheck, title: "GDPR-compliant",   body: "Export and erasure available on request." },
            { Icon: ScanLine,    title: "NCI-only access",  body: "Closed community, real identities verified." },
            { Icon: Activity,    title: "Fully audit-logged", body: "Every action recorded for transparency." },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="cb-card col-span-12 sm:col-span-6 lg:col-span-3 p-6">
              <Icon size={22} className="text-[var(--cb-lime)]" />
              <div className="mt-4 font-semibold">{title}</div>
              <div className="text-sm text-[var(--cb-text-muted)] mt-1.5 leading-relaxed">{body}</div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function ScoreGauge({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const angle = (clamped / 100) * 180;
  const radius = 110, cx = 140, cy = 140;
  const start = polar(cx, cy, radius, 180);
  const end = polar(cx, cy, radius, 180 + angle);
  const trackEnd = polar(cx, cy, radius, 360);
  const largeArc = angle > 180 ? 1 : 0;
  return (
    <div className="mx-auto" style={{ maxWidth: 300 }}>
      <svg viewBox="0 0 280 170" className="w-full h-auto">
        <path
          d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${trackEnd.x} ${trackEnd.y}`}
          stroke="rgba(255,255,255,0.10)" strokeWidth="14" strokeLinecap="round" fill="none"
        />
        <path
          d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`}
          stroke="#5BA8FF" strokeWidth="14" strokeLinecap="round" fill="none"
        />
        <text
          x={cx} y={cy + 4} textAnchor="middle"
          fontFamily="var(--font-mono)" fontWeight={600} fontSize="44" fill="#F6F7F4"
        >
          {clamped}
        </text>
      </svg>
    </div>
  );
}
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/* =========================================================
   FAQ
   ========================================================= */
function FaqSection() {
  return (
    <section id="faq" className="py-24 lg:py-32 border-t border-[var(--cb-border)]">
      <div className="max-w-[820px] mx-auto px-6 lg:px-10">
        <SectionHeader
          kicker="FAQ"
          title={<>Common<br /><span className="text-[var(--cb-text-muted)]">questions.</span></>}
          align="left"
        />
        <Reveal className="mt-12">
          <FaqAccordion />
        </Reveal>
      </div>
    </section>
  );
}

/* =========================================================
   FINAL CTA
   ========================================================= */
function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-[var(--cb-border)]">
      <div aria-hidden className="absolute inset-0 cb-bg-grid cb-bg-grid-anim opacity-90" />
      <div aria-hidden className="cb-lime-glow cb-glow-pulse" style={{ width: 800, height: 800, bottom: -300, left: "50%", transform: "translateX(-50%)" }} />
      <Reveal variant="zoom" className="relative max-w-[1280px] mx-auto px-6 lg:px-10 py-28 lg:py-36 text-center">
        <span className="cb-badge">
          <span className="dot" />
          Closed beta · NCI community
        </span>
        <h2 className="cb-display mt-8 mx-auto max-w-[920px]" style={{ fontSize: "clamp(48px, 7vw, 96px)" }}>
          Ready to <span className="cb-shimmer-text">lend</span> or
          <br />
          <span className="cb-shimmer-text">borrow</span>?
        </h2>
        <p className="mt-7 mx-auto max-w-[440px] text-[var(--cb-text-muted)]">
          Join 127 verified NCI students already lending and borrowing on 121.ai.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register" className="cb-btn-lime">
            Get started <ArrowRight size={18} />
          </Link>
          <Link href="/login" className="cb-btn-ghost">
            Sign in
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

/* =========================================================
   FOOTER
   ========================================================= */
function CrackerFooter() {
  return (
    <footer className="border-t border-[var(--cb-border)]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="text-xl font-bold">
            121.ai <span className="font-normal text-[var(--cb-text-subtle)] text-sm">by LendLoop</span>
          </div>
          <p className="mt-3 text-sm text-[var(--cb-text-muted)] max-w-[360px]">
            Peer-to-peer lending built for the NCI community. Verified members. Transparent scoring.
          </p>
          <div className="mt-6 cb-mono text-[10px] uppercase tracking-[0.2em] text-[var(--cb-text-subtle)]">
            <span className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--cb-lime)] cb-pulse" />
              All systems operational
            </span>
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--cb-text-subtle)] mb-4">Product</div>
          <ul className="space-y-2 text-sm text-[var(--cb-text-muted)]">
            <li><Link href="/#how-it-works" className="hover:text-white">How it works</Link></li>
            <li><Link href="/#markets" className="hover:text-white">Markets</Link></li>
            <li><Link href="/#security" className="hover:text-white">Security</Link></li>
            <li><Link href="/#faq" className="hover:text-white">FAQ</Link></li>
            <li><Link href="/help" className="hover:text-white">Help</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--cb-text-subtle)] mb-4">Legal</div>
          <ul className="space-y-2 text-sm text-[var(--cb-text-muted)]">
            <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-white">Privacy</Link></li>
            <li><Link href="/risk-warning" className="hover:text-white">Risk warning</Link></li>
            <li><Link href="/help" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--cb-border)]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-6 text-xs flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-[var(--cb-text-subtle)] cb-mono">
          <span>© 2026 LendLoop. All rights reserved.</span>
          <span className="max-w-2xl md:text-right">
            Capital at risk. Not protected by deposit insurance. Past performance does not guarantee future returns.
          </span>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   shared bits
   ========================================================= */
function SectionHeader({
  kicker,
  title,
  align = "center",
}: {
  kicker: string;
  title: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <Reveal className={align === "center" ? "text-center max-w-[820px] mx-auto" : ""}>
      <span className="cb-badge">
        <span className="dot" />
        {kicker}
      </span>
      <h2
        className="cb-display mt-6"
        style={{ fontSize: "clamp(36px, 5.6vw, 72px)" }}
      >
        {title}
      </h2>
    </Reveal>
  );
}
