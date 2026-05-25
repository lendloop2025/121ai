import Link from "next/link";
import { ArrowRight, Users, ShieldAlert, Activity, Coins } from "lucide-react";
import { createService } from "@/lib/db/client";
import { formatEur } from "@/lib/utils";
import { NetworkGraph } from "./_network-graph";

export default async function AdminOverviewPage() {
  const svc = createService();
  const [{ count: totalUsers }, { count: pendingKyc }, { count: activeLoans }, { data: ledgerSums }] = await Promise.all([
    svc.from("users").select("*", { count: "exact", head: true }),
    svc.from("users").select("*", { count: "exact", head: true }).in("status", ["pending_admin_approval", "pending_address_proof", "pending_identity"]),
    svc.from("loans").select("*", { count: "exact", head: true }).in("status", ["active", "in_grace"]),
    svc.from("ledger").select("amount_cents").eq("entry_type", "platform_fee"),
  ]);

  const totalFees = ledgerSums?.reduce((s, l) => s + l.amount_cents, 0) ?? 0;

  // Live metrics double as the floating data labels on the network graph.
  const graphNodes = [
    { label: "Subjects", value: String(totalUsers ?? 0) },
    { label: "KYC queue", value: String(pendingKyc ?? 0) },
    { label: "Active loans", value: String(activeLoans ?? 0) },
    { label: "Fees", value: formatEur(totalFees) },
    { label: "Status", value: "ONLINE" },
    { label: "Region", value: "EU-W1" },
  ];

  return (
    <>
      {/* Live relationship web — full-bleed backdrop behind the overview.
          Anchored to the lower portion of the screen and faded at the top so
          the header and metric cards keep a clear, conflict-free zone above
          it. Dimmed and non-interactive. */}
      <div aria-hidden className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[32%] w-full max-w-[1180px] h-[80%] opacity-60"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, black 26%, black 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 26%, black 100%)",
          }}
        >
          <NetworkGraph nodes={graphNodes} className="w-full h-full" />
        </div>
        {/* Vignette keeps the centre legible and sinks the edges into black */}
        <div className="absolute inset-0 bg-[radial-gradient(75%_55%_at_50%_65%,transparent,rgba(2,4,12,0.65))]" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <header>
          <span className="adm-kicker">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--adm-amber)] align-middle mr-2 shadow-[0_0_10px_var(--adm-orange)]" />
            Command deck · live telemetry
          </span>
          <h1 className="mt-2 text-[28px] sm:text-[34px] font-bold tracking-tight">Intelligence overview</h1>
          <p className="mt-1 text-sm text-[var(--adm-text-muted)]">
            Platform-wide relationship graph and operational metrics, refreshed on every load.
          </p>
        </header>

        {/* Metric cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric icon={Users} label="Total users" value={String(totalUsers ?? 0)} accent="blue" />
          <Metric
            icon={ShieldAlert}
            label="Pending KYC"
            value={String(pendingKyc ?? 0)}
            accent="magenta"
            cta={{ href: "/admin/pending-kyc", label: "Review queue" }}
          />
          <Metric icon={Activity} label="Active loans" value={String(activeLoans ?? 0)} accent="orange" />
          <Metric icon={Coins} label="Platform fees" value={formatEur(totalFees)} accent="amber" />
        </section>

        {/* Spacer lets the network graph breathe in the lower half of the screen */}
        <div className="min-h-[42vh]" />
      </div>
    </>
  );
}

const ACCENTS: Record<string, { ring: string; ico: string }> = {
  magenta: { ring: "var(--adm-magenta)", ico: "text-[var(--adm-magenta)]" },
  orange: { ring: "var(--adm-orange)", ico: "text-[var(--adm-orange)]" },
  blue: { ring: "var(--cb-blue)", ico: "text-[var(--cb-sky)]" },
  amber: { ring: "var(--adm-amber)", ico: "text-[var(--adm-amber)]" },
};

function Metric({
  icon: Icon,
  label,
  value,
  accent,
  cta,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  accent: keyof typeof ACCENTS | string;
  cta?: { href: string; label: string };
}) {
  const a = ACCENTS[accent] ?? ACCENTS.blue;
  return (
    <div className="adm-card adm-card-hover adm-card-rule p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="adm-kicker">{label}</span>
        <span
          className={`w-9 h-9 rounded-xl flex items-center justify-center border ${a.ico}`}
          style={{ borderColor: a.ring, background: "rgba(255,255,255,0.03)" }}
        >
          <Icon size={17} />
        </span>
      </div>
      <div className="text-3xl font-bold adm-mono tracking-tight">{value}</div>
      {cta && (
        <Link href={cta.href} className="adm-link text-xs font-semibold inline-flex items-center gap-1 mt-auto">
          {cta.label} <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}
