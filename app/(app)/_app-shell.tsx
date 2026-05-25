"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  HandCoins,
  ReceiptText,
  ArrowLeftRight,
  Sparkles,
  ShieldCheck,
  ArrowDownToLine,
  Bell,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { formatEur } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/invest", label: "Lend", icon: TrendingUp },
  { href: "/borrow", label: "Borrow", icon: HandCoins },
  { href: "/loans", label: "Loans", icon: ReceiptText },
  { href: "/transactions", label: "Activity", icon: ArrowLeftRight },
  { href: "/auto-invest", label: "Auto-Invest", icon: Sparkles },
];

function useActive() {
  const pathname = usePathname() ?? "";
  return (href: string) =>
    href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

function sectionTitle(pathname: string) {
  const hit = NAV.find((n) => (n.href === "/dashboard" ? pathname === n.href : pathname.startsWith(n.href)));
  if (hit) return hit.label;
  if (pathname.startsWith("/deposit")) return "Deposit";
  if (pathname.startsWith("/agreements")) return "Agreements";
  if (pathname.startsWith("/admin")) return "Admin";
  return "121.ai";
}

export function AppShell({
  firstName,
  role,
  initial,
  availableCents,
  investedCents,
  children,
}: {
  firstName: string;
  role: string;
  initial: string;
  availableCents: number;
  investedCents: number;
  children: React.ReactNode;
}) {
  const isActive = useActive();
  const pathname = usePathname() ?? "";

  const Brand = (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <span className="app-avatar !w-9 !h-9 !text-[15px]">1</span>
      <span className="flex flex-col leading-none">
        <span className="font-bold text-[17px] text-[var(--cb-text)]">121.ai</span>
        <span className="text-[10px] font-medium text-[var(--cb-text-subtle)]">by LendLoop</span>
      </span>
    </Link>
  );

  const navLinks = (onClickClose?: () => void) => (
    <>
      {NAV.map((n) => {
        const Icon = n.icon;
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={onClickClose}
            className={`app-nav-item ${isActive(n.href) ? "is-active" : ""}`}
          >
            <Icon size={18} className="app-nav-ico" />
            {n.label}
          </Link>
        );
      })}
      {role === "admin" && (
        <Link href="/admin" className={`app-nav-item ${pathname.startsWith("/admin") ? "is-active" : ""}`}>
          <ShieldCheck size={18} className="app-nav-ico" />
          Admin
        </Link>
      )}
    </>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[264px_1fr] bg-[var(--bg)]">
      {/* ---------- Desktop sidebar ---------- */}
      <aside className="app-sidebar hidden lg:flex flex-col sticky top-0 h-screen p-4 gap-5">
        <div className="px-2 pt-1">{Brand}</div>

        <Link href="/deposit" className="dash-btn w-full">
          <ArrowDownToLine size={16} /> Deposit funds
        </Link>

        <nav className="flex flex-col gap-1">{navLinks()}</nav>

        <div className="mt-auto flex flex-col gap-3">
          {/* Mini financial stats widget */}
          <div className="app-widget p-4">
            <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--cb-text-subtle)]">
              Available
            </div>
            <div className="mt-1 text-xl font-bold tabular text-[var(--cb-text)]">
              {formatEur(availableCents)}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-[var(--cb-text-subtle)]">Invested</span>
              <span className="tabular font-semibold text-[var(--cb-sky)]">{formatEur(investedCents)}</span>
            </div>
          </div>

          {/* Profile card */}
          <div className="app-widget p-3 flex items-center gap-3">
            <span className="app-avatar">{initial}</span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-[var(--cb-text)] truncate">{firstName}</div>
              <div className="text-[11px] text-[var(--cb-text-subtle)] capitalize">{role}</div>
            </div>
            <form action={logoutAction}>
              <button
                title="Sign out"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[var(--cb-text-muted)] hover:text-[var(--cb-text)] hover:bg-white/5"
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ---------- Right column ---------- */}
      <div className="flex flex-col min-h-screen">
        {/* Mobile top nav */}
        <header className="app-topbar lg:hidden sticky top-0 z-40 px-4 py-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            {Brand}
            <div className="flex items-center gap-2">
              <Link href="/transactions" className="app-bell !w-9 !h-9">
                <Bell size={17} />
                <span className="app-bell-dot" />
              </Link>
              <span className="app-avatar !w-9 !h-9 !text-[13px]">{initial}</span>
              <form action={logoutAction}>
                <button className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-[var(--cb-text-muted)] hover:text-[var(--cb-text)] hover:bg-white/5">
                  <LogOut size={16} />
                </button>
              </form>
            </div>
          </div>
          <nav className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`shrink-0 h-8 px-3 inline-flex items-center rounded-full text-[13px] font-medium ${
                  isActive(n.href)
                    ? "bg-gradient-to-b from-[var(--cb-sky)] to-[var(--cb-blue)] text-[#061021]"
                    : "text-[var(--cb-text-muted)] bg-white/[0.04]"
                }`}
              >
                {n.label}
              </Link>
            ))}
            {role === "admin" && (
              <Link
                href="/admin"
                className="shrink-0 h-8 px-3 inline-flex items-center rounded-full text-[13px] font-medium text-[var(--cb-text-muted)] bg-white/[0.04]"
              >
                Admin
              </Link>
            )}
          </nav>
        </header>

        {/* Desktop topbar */}
        <header className="app-topbar hidden lg:flex sticky top-0 z-40 h-[68px] items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-[var(--cb-text)]">{sectionTitle(pathname)}</h2>
            <span className="dash-kicker hidden xl:inline">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--cb-sky)] align-middle mr-2 shadow-[0_0_12px_var(--cb-sky-glow)]" />
              NCI community · live
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/transactions" className="app-bell">
              <Bell size={18} />
              <span className="app-bell-dot" />
            </Link>
            <div className="flex items-center gap-2.5 pl-1">
              <span className="app-avatar">{initial}</span>
              <span className="text-sm font-medium text-[var(--cb-text)]">{firstName}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">{children}</main>

        <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row gap-3 sm:gap-6 items-center justify-between text-xs text-[var(--ink-muted)]">
            <div className="flex flex-wrap gap-4 items-center">
              <span className="inline-flex items-center gap-1.5">Stripe-secured</span>
              <span className="inline-flex items-center gap-1.5">GDPR compliant</span>
              <Link href="/terms" className="hover:text-[var(--ink)]">Terms</Link>
              <Link href="/privacy-policy" className="hover:text-[var(--ink)]">Privacy</Link>
              <Link href="/risk-warning" className="hover:text-[var(--ink)]">Risk warning</Link>
            </div>
            <div className="text-[11px] text-[var(--ink-subtle)] text-center sm:text-right">
              Capital is at risk. Not protected by deposit insurance. Demo platform.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
