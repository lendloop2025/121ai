import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { logoutAction } from "@/app/actions/auth";
import { AdminNav } from "./_admin-nav";

// Admin screens must always reflect live database state (pending KYC, users,
// loans, audit log). Without this, Next.js can serve a prerendered/cached
// version that never shows newly-registered applicants. Applies to all nested
// /admin/* segments.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="adm-root flex flex-col">
      {/* Ambient command-deck glows */}
      <div aria-hidden className="adm-orb adm-orb-magenta" style={{ width: 520, height: 520, top: -200, left: "50%", marginLeft: -260 }} />
      <div aria-hidden className="adm-orb adm-orb-orange" style={{ width: 420, height: 420, bottom: -160, right: -120 }} />
      <div aria-hidden className="adm-orb adm-orb-blue" style={{ width: 420, height: 420, bottom: -180, left: -140 }} />

      <header className="adm-topbar">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="adm-brand text-lg">121.ai</Link>
            <span className="adm-badge"><span className="dot" /> Intelligence</span>
          </div>
          <AdminNav className="hidden md:flex gap-1" />
          <form action={logoutAction}>
            <button className="adm-btn-ghost">Sign out</button>
          </form>
        </div>
        {/* Mobile nav row */}
        <AdminNav className="md:hidden flex gap-1 overflow-x-auto px-4 pb-3 -mt-1" itemClassName="shrink-0" />
      </header>

      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-4 py-8">{children}</main>
    </div>
  );
}
