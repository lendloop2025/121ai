"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

const NAV = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#markets", label: "Markets" },
  { href: "#security", label: "Security" },
  { href: "#faq", label: "FAQ" },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-colors"
      style={{
        height: 72,
        background: scrolled ? "rgba(10,10,11,0.75)" : "transparent",
        backdropFilter: scrolled ? "saturate(160%) blur(14px)" : undefined,
        WebkitBackdropFilter: scrolled ? "saturate(160%) blur(14px)" : undefined,
        borderBottom: scrolled
          ? "1px solid var(--cb-border)"
          : "1px solid transparent",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-full flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md bg-gradient-to-br from-[var(--cb-sky)] to-[var(--cb-blue)] flex items-center justify-center shadow-[0_0_18px_var(--cb-blue-glow)]">
            <span className="w-2 h-2 rounded-full bg-[#02050F]" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-semibold text-[15px] text-[var(--cb-text)]">121.ai</span>
            <span className="text-[10px] cb-mono tracking-[0.18em] text-[var(--cb-text-subtle)]">
              BY LENDLOOP
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="px-3 py-2 rounded-full text-[var(--cb-text-muted)] hover:text-[var(--cb-text)] hover:bg-white/5 transition"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 h-10 inline-flex items-center rounded-full text-sm font-medium text-[var(--cb-text-muted)] hover:text-[var(--cb-text)] transition"
          >
            Sign in
          </Link>
          <Link href="/register" className="cb-btn-lime cb-btn-sm">
            Get started <ArrowRight size={14} />
          </Link>
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          className="md:hidden p-2 rounded-md text-[var(--cb-text)]"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div
          className="md:hidden border-t border-[var(--cb-border)]"
          style={{ background: "rgba(10,10,11,0.95)" }}
          onClick={() => setOpen(false)}
        >
          <div className="px-6 py-4 space-y-2">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="block py-2 text-sm font-medium text-[var(--cb-text-muted)]"
              >
                {n.label}
              </a>
            ))}
            <div className="pt-3 flex gap-2">
              <Link
                href="/login"
                className="cb-btn-ghost cb-btn-sm flex-1"
              >
                Sign in
              </Link>
              <Link href="/register" className="cb-btn-lime cb-btn-sm flex-1">
                Get started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
