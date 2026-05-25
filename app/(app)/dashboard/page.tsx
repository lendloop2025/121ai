import Link from "next/link";
import {
  HandCoins,
  TrendingUp,
  Plus,
  ArrowRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  Sparkles,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
} from "lucide-react";
import { requireVerified } from "@/lib/auth/session";
import { createService } from "@/lib/db/client";
import { formatEur } from "@/lib/utils";
import { BalanceChart, type ChartPoint } from "./_balance-chart";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const { user, profile } = await requireVerified();
  const svc = createService();

  const [
    { data: wallet },
    { data: activeAsLender },
    { data: activeAsBorrower },
    { data: myRequests },
    { data: openRequests, count: communityOpen },
    { data: recentLedger },
    { count: communityActiveLoans },
    { data: weekLedger },
    { data: pendingSignLoans },
    { data: pendingCounterOffers },
    { data: ledgerHistory },
  ] = await Promise.all([
    svc.from("wallets").select("*").eq("user_id", user.id).single(),
    svc.from("loans")
      .select("id, principal_cents, apr_bps, term_months, monthly_payment_cents, status, disbursed_at, first_payment_due_at, paid_off_at, borrower:users!loans_borrower_id_fkey(first_name, last_name)")
      .eq("lender_id", user.id).neq("status", "paid_off")
      .order("created_at", { ascending: false }),
    svc.from("loans")
      .select("id, principal_cents, apr_bps, term_months, monthly_payment_cents, status, disbursed_at, first_payment_due_at, paid_off_at, lender:users!loans_lender_id_fkey(first_name, last_name)")
      .eq("borrower_id", user.id).neq("status", "paid_off")
      .order("created_at", { ascending: false }),
    svc.from("loan_requests")
      .select("id, amount_cents, requested_term_months, status, purpose, loan_offers(id, status)")
      .eq("borrower_id", user.id)
      .in("status", ["open", "partially_funded"])
      .order("posted_at", { ascending: false }),
    svc.from("loan_requests")
      .select("id, amount_cents, requested_term_months, max_apr_bps, score_at_request, purpose, posted_at", { count: "exact" })
      .eq("community_id", profile.community_id)
      .in("status", ["open", "partially_funded"])
      .neq("borrower_id", user.id)
      .order("posted_at", { ascending: false }).limit(3),
    svc.from("ledger").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(5),
    svc.from("loans").select("id", { count: "exact", head: true })
      .eq("community_id", profile.community_id).eq("status", "active"),
    svc.from("ledger")
      .select("amount_cents, entry_type, created_at")
      .eq("community_id", profile.community_id)
      .gte("created_at", new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString())
      .in("entry_type", ["loan_principal_out"]),
    svc.from("loans")
      .select("id, principal_cents, apr_bps, term_months, borrower_id, lender_id, borrower_signed_at, lender_signed_at, borrower:users!loans_borrower_id_fkey(first_name, last_name), lender:users!loans_lender_id_fkey(first_name, last_name)")
      .or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`)
      .eq("status", "pending_signature"),
    svc.from("loan_offers")
      .select("id, request_id, amount_cents, apr_bps, term_months")
      .eq("lender_id", user.id)
      .eq("proposed_by_borrower", true)
      .eq("status", "pending"),
    // History for the portfolio chart — reconstructed into a balance series below.
    svc.from("ledger")
      .select("amount_cents, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(60),
  ]);

  const totalLent = activeAsLender?.reduce((s, l) => s + l.principal_cents, 0) ?? 0;
  const totalBorrowed = activeAsBorrower?.reduce((s, l) => s + l.principal_cents, 0) ?? 0;
  const balance = wallet?.available_balance_cents ?? 0;
  const invested = wallet?.invested_balance_cents ?? 0;
  const total = balance + invested;

  const earningsYtd = (recentLedger ?? [])
    .filter(l => l.entry_type === "repayment_interest")
    .reduce((s, l) => s + Math.abs(l.amount_cents), 0);

  const lentThisWeek = (weekLedger ?? [])
    .reduce((s: number, l: any) => s + Math.abs(l.amount_cents), 0);

  // Reconstruct a portfolio-value series ending at the real current total.
  // Walking newest → oldest, each entry's balance is `running`, then we undo it.
  const series: ChartPoint[] = (() => {
    const rows = (ledgerHistory ?? []) as { amount_cents: number; created_at: string }[];
    if (rows.length === 0) return [];
    let running = total;
    const pts: ChartPoint[] = [];
    for (const r of rows) {
      pts.push({ t: r.created_at, v: running });
      running -= r.amount_cents;
    }
    return pts.reverse();
  })();

  // Daily lending volume across the community for the last 7 days (glowing bars).
  const dayBuckets = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    return { date: d, total: 0 };
  });
  for (const l of (weekLedger ?? []) as any[]) {
    const t = new Date(l.created_at).setHours(0, 0, 0, 0);
    const bucket = dayBuckets.find((b) => b.date.getTime() === t);
    if (bucket) bucket.total += Math.abs(l.amount_cents);
  }
  const maxDay = Math.max(1, ...dayBuckets.map((b) => b.total));

  const walletTail = (wallet?.id ?? user.id).toString().replace(/\D/g, "").slice(-4).padStart(4, "0");
  const hasAction = (pendingSignLoans?.length ?? 0) > 0 || (pendingCounterOffers?.length ?? 0) > 0;

  return (
    <div className="dash-root -mx-4 sm:-mx-6 -my-8 sm:-my-10 px-4 sm:px-8 py-8 sm:py-10 overflow-hidden">
      {/* Ambient neon orbs */}
      <div aria-hidden className="dash-orb dash-orb-blue" style={{ width: 520, height: 520, top: -180, right: -120 }} />
      <div aria-hidden className="dash-orb dash-orb-cyan" style={{ width: 460, height: 460, bottom: -200, left: -160 }} />

      <div className="relative z-10 space-y-6">
        {/* Greeting */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="dash-kicker">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--cb-sky)] align-middle mr-2 shadow-[0_0_12px_var(--cb-sky-glow)]" />
              NCI community · live
            </span>
            <h1 className="cb-display mt-3 text-[32px] sm:text-[44px] leading-[1.05] text-[var(--cb-text)]">
              {greeting()}, <span className="cb-shimmer-text">{profile.first_name}</span>
            </h1>
            <p className="mt-2 text-sm text-[var(--cb-text-muted)]">
              {lentThisWeek > 0
                ? `Your community lent ${formatEur(lentThisWeek)} this week.`
                : (communityOpen ?? 0) > 0
                ? `${communityOpen} open loan request${communityOpen === 1 ? "" : "s"} in your community right now.`
                : "Your NCI community is quiet today."}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/deposit" className="dash-btn">
              <ArrowDownToLine size={15} /> Deposit
            </Link>
            <Link href="/transactions" className="dash-btn-ghost">
              <ArrowUpFromLine size={15} /> Withdraw
            </Link>
          </div>
        </header>

        {/* Action needed */}
        {hasAction && (
          <section className="dash-card p-5 space-y-3" style={{ borderColor: "var(--cb-border-strong)" }}>
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(80% 120% at 0% 0%, rgba(42,107,255,0.18), transparent 60%)" }}
            />
            <h2 className="relative text-sm font-semibold uppercase tracking-[0.12em] text-[var(--cb-sky)]">
              Action needed
            </h2>
            {pendingSignLoans?.map((l: any) => {
              const isLender = l.lender_id === user.id;
              const counter = isLender ? l.borrower : l.lender;
              const youSigned = isLender ? l.lender_signed_at : l.borrower_signed_at;
              const otherSigned = isLender ? l.borrower_signed_at : l.lender_signed_at;
              const counterName = `${counter?.first_name ?? ""} ${counter?.last_name?.[0] ?? ""}.`.trim();
              let label = "Awaiting your signature";
              if (youSigned && !otherSigned) label = `Waiting for ${counterName} to sign`;
              else if (otherSigned && !youSigned) label = `${counterName} has signed — your turn`;
              return (
                <div key={l.id} className="relative flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-[var(--cb-border)]">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--cb-text)]">
                      {label} · {formatEur(l.principal_cents)} at {(l.apr_bps / 100).toFixed(2)}% · {l.term_months}mo
                    </div>
                    <div className="text-xs text-[var(--cb-text-subtle)]">
                      {isLender ? "Borrower" : "Lender"}: {counterName || "—"}
                    </div>
                  </div>
                  <Link href={`/agreements/${l.id}/sign`} className="shrink-0 dash-btn !h-9 !px-4 text-sm">
                    {youSigned ? "View status" : "Review & sign"}
                  </Link>
                </div>
              );
            })}
            {pendingCounterOffers?.map((c: any) => (
              <div key={c.id} className="relative flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-[var(--cb-border)]">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--cb-text)]">
                    Borrower countered your offer · {formatEur(c.amount_cents)} at {(c.apr_bps / 100).toFixed(2)}% · {c.term_months}mo
                  </div>
                  <div className="text-xs text-[var(--cb-text-subtle)]">Review and accept or decline.</div>
                </div>
                <Link href={`/invest/${c.request_id}`} className="shrink-0 dash-btn !h-9 !px-4 text-sm">
                  Review counter
                </Link>
              </div>
            ))}
          </section>
        )}

        {/* Hero + wallet cards */}
        <section className="grid grid-cols-12 gap-5">
          {/* Balance hero + chart */}
          <div className="dash-card dash-hero col-span-12 lg:col-span-8 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="dash-kicker">Total balance</div>
                <div className="mt-2 text-[44px] sm:text-[60px] leading-none font-bold tabular tracking-tight text-[var(--cb-text)]">
                  {formatEur(total)}
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold tabular dash-amt-pos">
                  <ArrowUpRight size={15} /> +{formatEur(earningsYtd)}
                  <span className="text-[var(--cb-text-subtle)] font-normal">earnings YTD</span>
                </div>
              </div>
            </div>

            {/* Mini stat strip */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Available", value: balance },
                { label: "Lent out", value: totalLent },
                { label: "Borrowed", value: totalBorrowed },
                { label: "Earnings YTD", value: earningsYtd },
              ].map((m) => (
                <div key={m.label} className="rounded-xl bg-white/[0.03] border border-[var(--cb-border)] px-3 py-2.5">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--cb-text-subtle)]">{m.label}</div>
                  <div className="mt-1 text-lg font-semibold tabular text-[var(--cb-text)]">{formatEur(m.value)}</div>
                </div>
              ))}
            </div>

            <div className="mt-7 pt-6 border-t border-[var(--cb-border)]">
              <BalanceChart series={series} />
            </div>
          </div>

          {/* Stacked wallet cards */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <div className="group relative flex flex-col">
              {/* Back — Borrowed (indigo) */}
              <WalletCard
                variant="indigo"
                label="Borrowed"
                amount={totalBorrowed}
                sub={`${activeAsBorrower?.length ?? 0} active`}
                tail={walletTail}
                className="z-10"
              />
              {/* Middle — Lent out (cyan) */}
              <WalletCard
                variant="cyan"
                label="Lent out"
                amount={totalLent}
                sub={`${activeAsLender?.length ?? 0} active`}
                tail={walletTail}
                className="z-20 -mt-[104px] transition-[margin] duration-500 group-hover:-mt-[78px]"
              />
              {/* Front — Available (blue) */}
              <WalletCard
                variant="blue"
                label="Available balance"
                amount={balance}
                sub="Ready to lend"
                tail={walletTail}
                primary
                className="z-30 -mt-[104px] transition-[margin] duration-500 group-hover:-mt-[78px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/deposit" className="dash-card dash-card-hover flex flex-col gap-1 p-4">
                <Plus size={16} className="text-[var(--cb-sky)]" />
                <span className="text-sm font-semibold text-[var(--cb-text)]">Top up</span>
                <span className="text-[11px] text-[var(--cb-text-subtle)]">Add funds</span>
              </Link>
              <Link href="/transactions" className="dash-card dash-card-hover flex flex-col gap-1 p-4">
                <Activity size={16} className="text-[var(--cb-sky)]" />
                <span className="text-sm font-semibold text-[var(--cb-text)]">Activity</span>
                <span className="text-[11px] text-[var(--cb-text-subtle)]">All transactions</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="grid grid-cols-12 gap-5">
          <ActionTile
            className="col-span-12 md:col-span-4"
            icon={HandCoins}
            title="Request a loan"
            body="Borrow €100–€2,000 from verified NCI peers. Up to 12 months."
            href="/borrow"
            cta="Request a loan"
          />
          <ActionTile
            className="col-span-12 md:col-span-4"
            icon={TrendingUp}
            title="Lend money"
            body="Earn up to 12% APR funding loans for NCI students."
            live={(communityOpen ?? 0) > 0 ? `${communityOpen} open request${communityOpen === 1 ? "" : "s"} right now` : undefined}
            href="/invest"
            cta="Browse requests"
          />
          <ActionTile
            className="col-span-12 md:col-span-4"
            icon={Sparkles}
            title="Auto-Invest"
            body="Hands-off lending — set your rules and let matching do the work."
            href="/auto-invest"
            cta="Set up Auto-Invest"
          />
        </section>

        {/* Activity + analytics */}
        <section className="grid grid-cols-12 gap-5">
          {/* Recent transactions */}
          <div className="dash-card col-span-12 lg:col-span-7 p-6">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--cb-text)]">Recent activity</h2>
              <Link href="/transactions" className="text-sm font-medium text-[var(--cb-sky)] hover:underline">
                View all →
              </Link>
            </div>
            {recentLedger && recentLedger.length > 0 ? (
              <ul className="space-y-2">
                {recentLedger.map((l) => {
                  const positive = l.amount_cents >= 0;
                  return (
                    <li key={l.id} className="dash-txn">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="dash-txn-ico">
                          {positive ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium capitalize text-[var(--cb-text)] truncate">
                            {l.entry_type.replaceAll("_", " ")}
                          </div>
                          <div className="text-xs text-[var(--cb-text-subtle)] truncate">{l.description ?? "—"}</div>
                        </div>
                      </div>
                      <div className={`tabular text-sm font-semibold shrink-0 ${positive ? "dash-amt-pos" : "dash-amt-neg"}`}>
                        {positive ? "+" : ""}{formatEur(l.amount_cents)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="py-10 text-center">
                <p className="text-sm text-[var(--cb-text-muted)]">No activity yet — top up your wallet to begin.</p>
                <Link href="/deposit" className="dash-btn-ghost mt-4 inline-flex !h-10">
                  <Plus size={14} /> Deposit funds
                </Link>
              </div>
            )}
          </div>

          {/* Community analytics */}
          <div className="dash-card col-span-12 lg:col-span-5 p-6">
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className="text-[var(--cb-sky)]" />
              <h2 className="text-lg font-semibold text-[var(--cb-text)]">Your community</h2>
            </div>
            <div className="dash-kicker mb-4">Lending volume · last 7 days</div>

            {/* glowing bars */}
            <div className="flex items-end justify-between gap-2 h-[120px]">
              {dayBuckets.map((b, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className="dash-bar"
                    style={{
                      height: `${Math.max(4, (b.total / maxDay) * 100)}%`,
                      animationDelay: `${i * 70}ms`,
                    }}
                    title={`${formatEur(b.total)} on ${b.date.toLocaleDateString("en-IE", { weekday: "short" })}`}
                  />
                  <span className="text-[10px] text-[var(--cb-text-subtle)]">
                    {b.date.toLocaleDateString("en-IE", { weekday: "narrow" })}
                  </span>
                </div>
              ))}
            </div>

            <ul className="mt-5 pt-5 border-t border-[var(--cb-border)] space-y-2.5 text-sm">
              <li className="flex justify-between">
                <span className="text-[var(--cb-text-muted)]">Open loan requests</span>
                <span className="font-semibold tabular text-[var(--cb-text)]">{communityOpen ?? 0}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-[var(--cb-text-muted)]">Active loans</span>
                <span className="font-semibold tabular text-[var(--cb-text)]">{communityActiveLoans ?? 0}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-[var(--cb-text-muted)]">Lent this week</span>
                <span className="font-semibold tabular text-[var(--cb-text)]">{formatEur(lentThisWeek)}</span>
              </li>
            </ul>

            {openRequests && openRequests.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--cb-border)]">
                <div className="dash-kicker mb-2">Top requests</div>
                <ul className="space-y-2">
                  {openRequests.map((r) => (
                    <li key={r.id} className="flex items-center justify-between">
                      <Link href={`/invest/${r.id}`} className="text-sm tabular text-[var(--cb-text)] hover:text-[var(--cb-sky)]">
                        {formatEur(r.amount_cents)} · {r.requested_term_months}mo
                      </Link>
                      <span className="text-xs tabular px-2 h-6 inline-flex items-center rounded-full bg-[var(--cb-lime-soft)] border border-[var(--cb-border)] text-[var(--cb-sky)] font-semibold">
                        {r.score_at_request ?? "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Active loans */}
        {((activeAsBorrower?.length ?? 0) > 0 || (activeAsLender?.length ?? 0) > 0) && (
          <section className="dash-card p-6">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--cb-text)]">Your active loans</h2>
              <Link href="/loans" className="text-sm font-medium text-[var(--cb-sky)] hover:underline">
                View all →
              </Link>
            </div>
            <div className="grid gap-2">
              {activeAsBorrower?.map((l: any) => (
                <LoanRow
                  key={l.id}
                  href={`/loans/${l.id}`}
                  title={`Borrowing ${formatEur(l.principal_cents)} · ${(l.apr_bps / 100).toFixed(2)}% · ${l.term_months}mo`}
                  sub={`From ${l.lender?.first_name ?? "lender"} ${l.lender?.last_name?.[0] ?? ""}. · ${formatEur(l.monthly_payment_cents)}/mo · ${l.status.replaceAll("_", " ")}`}
                  tone="neg"
                />
              ))}
              {activeAsLender?.map((l: any) => (
                <LoanRow
                  key={l.id}
                  href={`/loans/${l.id}`}
                  title={`Lending ${formatEur(l.principal_cents)} · ${(l.apr_bps / 100).toFixed(2)}% · ${l.term_months}mo`}
                  sub={`To ${l.borrower?.first_name ?? "borrower"} ${l.borrower?.last_name?.[0] ?? ""}. · ${formatEur(l.monthly_payment_cents)}/mo · ${l.status.replaceAll("_", " ")}`}
                  tone="pos"
                />
              ))}
            </div>
          </section>
        )}

        {/* My requests */}
        {myRequests && myRequests.length > 0 && (
          <section className="dash-card p-6">
            <h2 className="text-lg font-semibold text-[var(--cb-text)] mb-4">Your loan requests</h2>
            <div className="grid gap-2">
              {myRequests.map((r: any) => {
                const offers = r.loan_offers ?? [];
                const pendingOffers = offers.filter((o: any) => o.status === "pending").length;
                return (
                  <Link key={r.id} href={`/borrow/${r.id}`} className="dash-txn">
                    <div className="min-w-0">
                      <div className="font-semibold tabular text-[var(--cb-text)]">
                        {formatEur(r.amount_cents)} · {r.requested_term_months}mo
                      </div>
                      <div className="text-xs text-[var(--cb-text-subtle)] capitalize truncate">
                        {r.purpose.replaceAll("_", " ")} · {r.status.replaceAll("_", " ")}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {pendingOffers > 0 ? (
                        <span className="text-sm font-bold text-[var(--cb-sky)]">
                          {pendingOffers} pending offer{pendingOffers === 1 ? "" : "s"}
                        </span>
                      ) : (
                        <span className="text-sm text-[var(--cb-text-subtle)]">
                          {offers.length > 0 ? "No pending offers" : "Awaiting offers"}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Trust footnote */}
        <div className="flex items-center justify-center gap-2 text-xs text-[var(--cb-text-subtle)]">
          <ShieldCheck size={13} className="text-[var(--cb-sky)]" />
          Stripe-secured · GDPR compliant · Capital at risk
        </div>
      </div>
    </div>
  );
}

/* ---------- local presentational pieces ---------- */

function WalletCard({
  variant,
  label,
  amount,
  sub,
  tail,
  primary = false,
  className = "",
}: {
  variant: "blue" | "cyan" | "indigo";
  label: string;
  amount: number;
  sub: string;
  tail: string;
  primary?: boolean;
  className?: string;
}) {
  return (
    <div className={`dash-cc dash-cc-${variant} ${primary ? "min-h-[176px]" : "min-h-[150px]"} ${className}`}>
      <div className="relative flex items-start justify-between">
        <span className="text-[11px] uppercase tracking-[0.16em] text-white/75">{label}</span>
        <Wallet size={16} className="text-white/85" />
      </div>
      <div className="relative mt-3 flex items-center gap-3">
        <span className="dash-cc-chip" />
        <span className="font-mono text-[13px] tracking-[0.2em] text-white/70">•••• {tail}</span>
      </div>
      <div className="relative mt-4 flex items-end justify-between">
        <div>
          <div className="text-[26px] sm:text-[30px] font-bold tabular leading-none">{formatEur(amount)}</div>
          <div className="mt-1 text-[11px] text-white/65">{sub}</div>
        </div>
        {primary && (
          <span className="text-[11px] font-semibold px-2 h-6 inline-flex items-center rounded-full bg-white/15 border border-white/25">
            Live
          </span>
        )}
      </div>
    </div>
  );
}

function ActionTile({
  icon: Icon,
  title,
  body,
  live,
  href,
  cta,
  className = "",
}: {
  icon: typeof HandCoins;
  title: string;
  body: string;
  live?: string;
  href: string;
  cta: string;
  className?: string;
}) {
  return (
    <Link href={href} className={`dash-card dash-card-hover group p-6 flex flex-col ${className}`}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--cb-lime-soft)] border border-[var(--cb-border)]">
        <Icon size={22} className="text-[var(--cb-sky)]" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-[var(--cb-text)]">{title}</h2>
      <p className="mt-1.5 text-sm text-[var(--cb-text-muted)] flex-1">{body}</p>
      {live && (
        <p className="mt-2 text-xs text-[var(--cb-sky)] inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--cb-sky)] shadow-[0_0_10px_var(--cb-sky-glow)]" />
          {live}
        </p>
      )}
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--cb-sky)]">
        {cta} <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function LoanRow({
  href,
  title,
  sub,
  tone,
}: {
  href: string;
  title: string;
  sub: string;
  tone: "pos" | "neg";
}) {
  return (
    <Link href={href} className="dash-txn">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`dash-txn-ico ${tone === "pos" ? "!text-[#4ADE80] !border-[rgba(74,222,128,0.25)] !bg-[rgba(74,222,128,0.08)]" : ""}`}>
          {tone === "pos" ? <TrendingUp size={17} /> : <HandCoins size={17} />}
        </span>
        <div className="min-w-0">
          <div className="font-semibold tabular text-[var(--cb-text)] truncate">{title}</div>
          <div className="text-xs text-[var(--cb-text-subtle)] truncate capitalize">{sub}</div>
        </div>
      </div>
      <span className="text-sm font-semibold text-[var(--cb-sky)] shrink-0">View →</span>
    </Link>
  );
}
