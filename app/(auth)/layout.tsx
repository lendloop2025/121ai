import Link from "next/link";
import { AuthSceneLoader } from "./_auth-scene-loader";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="auth-cinematic">
      {/* Full-bleed eclipse orb — the centrepiece, behind everything */}
      <div aria-hidden className="auth-orb-stage">
        <AuthSceneLoader />
      </div>

      {/* Centre scrim keeps the eclipse core dark enough to read text over,
          and a soft edge vignette deepens the corners into pure black. */}
      <div aria-hidden className="auth-vignette" />

      {/* Minimal top nav */}
      <header className="auth-topbar auth-fade-soft">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-7 h-7 rounded-md bg-gradient-to-br from-[var(--cb-sky)] to-[var(--cb-blue)] flex items-center justify-center shadow-[0_0_18px_var(--cb-blue-glow)] transition-transform group-hover:scale-110">
            <span className="w-2 h-2 rounded-full bg-black" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-semibold text-[15px] text-[var(--cb-text)]">121.ai</span>
            <span className="text-[10px] cb-mono tracking-[0.18em] text-[var(--cb-text-subtle)]">
              BY LENDLOOP
            </span>
          </span>
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-[var(--cb-text-muted)] hover:text-[var(--cb-text)] transition inline-flex items-center gap-1.5 group"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">←</span>
          Back to site
        </Link>
      </header>

      {/* Centred, symmetrical form column floating over the orb */}
      <main className="auth-main">
        <div className="auth-card-wrap auth-rise-soft">
          <div className="cb-glass-mock auth-card relative p-7 sm:p-9">
            {children}
          </div>
          <p
            className="mt-5 text-center text-[12px] text-[var(--cb-text-subtle)] auth-fade-soft"
            style={{ animationDelay: "650ms" }}
          >
            Capital is at risk. Demo platform — not yet authorised by the Central Bank of Ireland.
          </p>
        </div>
      </main>
    </div>
  );
}
