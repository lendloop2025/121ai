import Link from "next/link";
import { ArrowRight, Filter, Sparkles } from "lucide-react";
import { requireVerified } from "@/lib/auth/session";
import { createService } from "@/lib/db/client";
import { formatEur, maskName } from "@/lib/utils";

type SortKey = "newest" | "amount" | "term" | "score" | "apr";

function timeAgo(iso?: string | null): string {
  if (!iso) return "—";
  const m = (Date.now() - new Date(iso).getTime()) / 60000;
  if (m < 60) return `${Math.max(1, Math.round(m))}m ago`;
  const h = m / 60;
  if (h < 24) return `${Math.round(h)}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default async function InvestPage({ searchParams }: Readonly<{ searchParams: Promise<Record<string, string | undefined>> }>) {
  const sp = await searchParams;
  const sort = (sp.sort ?? "newest") as SortKey;
  const purpose = sp.purpose ?? "all";
  const minScore = sp.min_score ? Number(sp.min_score) : 0;

  const { user, profile } = await requireVerified();
  const svc = createService();

  const [{ data: wallet }, { count: activeLoanCount }, { data: lenderLoans }] = await Promise.all([
    svc.from("wallets").select("available_balance_cents").eq("user_id", user.id).single(),
    svc.from("loans").select("id", { count: "exact", head: true }).eq("lender_id", user.id).neq("status", "paid_off"),
    svc.from("loans").select("principal_cents").eq("lender_id", user.id),
  ]);
  const totalLent = lenderLoans?.reduce((s, l) => s + l.principal_cents, 0) ?? 0;

  let query = svc.from("loan_requests")
    .select("id, borrower_id, amount_cents, requested_term_months, max_apr_bps, purpose, score_at_request, posted_at, funded_amount_cents, users!loan_requests_borrower_id_fkey(first_name, last_name)")
    .eq("community_id", profile.community_id)
    .in("status", ["open", "partially_funded"])
    .neq("borrower_id", user.id)
    .gte("score_at_request", minScore);

  if (purpose !== "all") query = query.eq("purpose", purpose as any);

  switch (sort) {
    case "amount": query = query.order("amount_cents", { ascending: false }); break;
    case "term":   query = query.order("requested_term_months", { ascending: true }); break;
    case "score":  query = query.order("score_at_request", { ascending: false }); break;
    case "apr":    query = query.order("max_apr_bps", { ascending: false }); break;
    default:       query = query.order("posted_at", { ascending: false });
  }

  const { data: requests } = await query;

  const purposes = ["all", "tuition_topup", "laptop_equipment", "emergency", "living_expenses", "travel_home", "other"];

  return (
    <div className="dash-root -mx-4 sm:-mx-6 -my-8 sm:-my-10 px-4 sm:px-8 py-8 sm:py-10 overflow-hidden min-h-[calc(100vh-68px)]">
      <div aria-hidden className="dash-orb dash-orb-blue" style={{ width: 520, height: 520, top: -180, right: -120 }} />
      <div aria-hidden className="dash-orb dash-orb-cyan" style={{ width: 460, height: 460, bottom: -200, left: -160 }} />

      <div className="relative z-10 space-y-8">
        <header className="space-y-4">
          <div>
            <span className="dash-kicker">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--cb-sky)] align-middle mr-2 shadow-[0_0_12px_var(--cb-sky-glow)]" />
              Lend
            </span>
            <h1 className="cb-display mt-2 text-[32px] sm:text-[44px] font-bold tracking-tight leading-[1.05] text-[var(--cb-text)]">Lend money</h1>
            <p className="text-[var(--cb-text-muted)] mt-2 max-w-2xl">
              Earn returns by funding loans for verified NCI peers. You set the APR, you pick the term.
            </p>
          </div>

          {/* Stats strip */}
          <div className="dash-card flex flex-wrap items-center gap-x-8 gap-y-2 px-6 py-3.5 text-sm rounded-full">
            <Stat label="Active loans" value={String(activeLoanCount ?? 0)} />
            <span className="hidden sm:inline w-px h-5 bg-[var(--cb-border)]" />
            <Stat label="Total lent" value={formatEur(totalLent)} mono />
            <span className="hidden sm:inline w-px h-5 bg-[var(--cb-border)]" />
            <Stat label="Wallet" value={formatEur(wallet?.available_balance_cents ?? 0)} mono />
            <Link href="/auto-invest" className="ml-auto inline-flex items-center gap-1.5 text-[var(--cb-sky)] font-semibold hover:underline">
              <Sparkles size={14} /> Auto-Invest
            </Link>
          </div>
        </header>

        {/* Filter bar */}
        <div className="dash-card glass-input p-3 sm:p-4">
          <form className="flex flex-wrap items-end gap-2">
            <PillSelect name="sort" defaultValue={sort} options={[
              { v: "newest", l: "Newest" },
              { v: "amount", l: "Largest amount" },
              { v: "term", l: "Shortest term" },
              { v: "score", l: "Highest score" },
              { v: "apr", l: "Highest APR" },
            ]} />
            <PillSelect name="purpose" defaultValue={purpose} options={purposes.map(p => ({ v: p, l: p === "all" ? "All purposes" : p.replaceAll("_", " ") }))} />
            <PillNumber name="min_score" placeholder="Min score" defaultValue={minScore || ""} />
            <button type="submit" className="dash-btn !h-10">
              <Filter size={14} /> Apply
            </button>
          </form>
        </div>

        {requests?.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {requests.map(r => {
              const fundedPct = Math.min(100, ((r.funded_amount_cents ?? 0) / r.amount_cents) * 100);
              const u = (r as any).users;
              const handle = `${maskName(`${u?.first_name ?? ""} ${u?.last_name ?? ""}`.trim())} #${String(r.borrower_id).slice(0, 8)}`;
              return (
                <Link key={r.id} href={`/invest/${r.id}`} className="group">
                  <div className="dash-card dash-card-hover h-full flex flex-col p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-[var(--cb-text-subtle)] tabular tracking-wide">{handle}</div>
                        <div className="text-[28px] font-bold tabular text-[var(--cb-text)] leading-none mt-1">{formatEur(r.amount_cents)}</div>
                        <div className="text-sm text-[var(--cb-text-muted)] capitalize mt-2 font-medium">{r.purpose.replaceAll("_", " ")}</div>
                      </div>
                      <DarkScoreBadge score={r.score_at_request} />
                    </div>

                    <div className="my-5 h-px bg-[var(--cb-border)]" />

                    <dl className="space-y-2.5 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-[var(--cb-text-muted)]">Term</dt>
                        <dd className="font-medium tabular text-[var(--cb-text)]">{r.requested_term_months} months</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-[var(--cb-text-muted)]">Max APR</dt>
                        <dd className="font-medium tabular text-[var(--cb-text)]">{(r.max_apr_bps / 100).toFixed(1)}%</dd>
                      </div>
                      <div>
                        <div className="flex justify-between">
                          <dt className="text-[var(--cb-text-muted)]">Funded</dt>
                          <dd className="font-medium tabular text-[var(--cb-text)]">{fundedPct.toFixed(0)}%</dd>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[var(--cb-sky)] to-[var(--cb-blue)]"
                            style={{ width: `${fundedPct}%`, boxShadow: "0 0 12px var(--cb-sky-glow)" }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-[var(--cb-text-muted)]">Posted</dt>
                        <dd className="text-[var(--cb-text-subtle)]">{timeAgo(r.posted_at)}</dd>
                      </div>
                    </dl>

                    <div className="mt-6 pt-5 border-t border-[var(--cb-border)]">
                      <span className="inline-flex w-full items-center justify-center gap-2 h-11 rounded-[14px] font-semibold text-[#061021] bg-gradient-to-b from-[var(--cb-sky)] to-[var(--cb-blue)] shadow-[0_10px_26px_-10px_var(--cb-blue-glow)] transition group-hover:brightness-110">
                        Make an offer <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="dash-card p-6">
            <div className="py-10 text-center">
              <h3 className="text-lg font-semibold text-[var(--cb-text)]">No open requests match your filters</h3>
              <p className="text-sm text-[var(--cb-text-muted)] mt-2">Try widening the score range or clearing the purpose filter.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, mono }: Readonly<{ label: string; value: string; mono?: boolean }>) {
  return (
    <div>
      <span className="text-[var(--cb-text-subtle)] text-xs uppercase tracking-wide mr-2">{label}</span>
      <span className={`font-semibold text-[var(--cb-text)] ${mono ? "tabular" : ""}`}>{value}</span>
    </div>
  );
}

function DarkScoreBadge({ score }: Readonly<{ score: number | null | undefined }>) {
  const s = typeof score === "number" ? score : null;
  const tone =
    s === null ? { c: "var(--cb-text-subtle)", bg: "rgba(255,255,255,0.05)", b: "var(--cb-border)" }
    : s >= 80   ? { c: "#4ADE80", bg: "rgba(74,222,128,0.12)", b: "rgba(74,222,128,0.30)" }
    : s >= 60   ? { c: "#FACC15", bg: "rgba(250,204,21,0.12)", b: "rgba(250,204,21,0.30)" }
    :             { c: "#FF8A5B", bg: "rgba(255,138,91,0.12)", b: "rgba(255,138,91,0.30)" };
  const filled = s === null ? 0 : Math.round((s / 100) * 5);
  return (
    <div
      className="inline-flex items-center gap-2 px-3 h-8 text-[13px] rounded-full font-semibold tabular"
      style={{ color: tone.c, background: tone.bg, border: `1px solid ${tone.b}` }}
    >
      <span>{s ?? "—"}</span>
      {s !== null && (
        <span className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map(i => (
            <span key={i} className={`block w-1.5 h-1.5 rounded-full ${i < filled ? "bg-current" : "bg-current opacity-25"}`} />
          ))}
        </span>
      )}
    </div>
  );
}

function PillSelect({
  name,
  defaultValue,
  options,
}: Readonly<{
  name: string;
  defaultValue: string;
  options: { v: string; l: string }[];
}>) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className="!h-10 !px-4 !rounded-full !w-auto !min-w-[160px] capitalize"
    >
      {options.map((o) => (
        <option key={o.v} value={o.v}>{o.l}</option>
      ))}
    </select>
  );
}

function PillNumber({
  name,
  placeholder,
  defaultValue,
}: Readonly<{ name: string; placeholder: string; defaultValue: string | number }>) {
  return (
    <input
      type="number"
      min={0}
      max={100}
      name={name}
      placeholder={placeholder}
      defaultValue={defaultValue}
      className="!h-10 !px-4 !rounded-full !w-[140px]"
    />
  );
}
