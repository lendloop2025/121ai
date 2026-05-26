import Link from "next/link";
import { CheckCircle2, AlertTriangle, ArrowRight, Gauge } from "lucide-react";
import { requireVerified } from "@/lib/auth/session";
import { createService } from "@/lib/db/client";
import {
  maxLoanFromScore,
  MAX_ACTIVE_LOANS_PER_BORROWER,
  ACTIVE_LOAN_STATUSES,
} from "@/lib/scoring/limits";
import { formatEur } from "@/lib/utils";
import BorrowForm from "./borrow-form";

const OPEN_REQUEST_STATUSES = ["open", "partially_funded"] as const;

export default async function BorrowPage() {
  const { user } = await requireVerified();
  const svc = createService();

  const [
    { data: scoreRow },
    { count: activeLoansCount },
    { data: myRequests },
    { data: borrowerLoans },
  ] = await Promise.all([
    svc.from("credit_scores").select("total_score").eq("user_id", user.id)
      .order("computed_at", { ascending: false }).limit(1).maybeSingle(),
    svc.from("loans").select("id", { count: "exact", head: true })
      .eq("borrower_id", user.id).in("status", [...ACTIVE_LOAN_STATUSES]),
    svc.from("loan_requests")
      .select("id, amount_cents, requested_term_months, status, purpose, posted_at, loan_offers(id, status)")
      .eq("borrower_id", user.id)
      .order("posted_at", { ascending: false })
      .limit(10),
    svc.from("loans")
      .select("id, principal_cents, apr_bps, term_months, status, disbursed_at, paid_off_at, lender:users!loans_lender_id_fkey(first_name, last_name)")
      .eq("borrower_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const score = scoreRow?.total_score ?? 0;
  const limit = maxLoanFromScore(score);
  const active = activeLoansCount ?? 0;
  const atMax = active >= MAX_ACTIVE_LOANS_PER_BORROWER;

  if (!scoreRow) {
    return (
      <DarkStage>
        <div className="max-w-lg mx-auto space-y-5">
          <header className="space-y-3">
            <span className="dash-kicker">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--cb-sky)] align-middle mr-2 shadow-[0_0_12px_var(--cb-sky-glow)]" />
              Borrow
            </span>
            <h1 className="cb-display text-[32px] sm:text-[40px] leading-[1.05] text-[var(--cb-text)]">Request a loan</h1>
          </header>
          <div className="dash-card p-6 sm:p-7">
            <p className="text-[var(--cb-text-muted)]">
              You need to complete the borrower assessment before requesting a loan.
            </p>
            <Link href="/onboarding/assessment" className="dash-btn mt-5 inline-flex">
              Complete assessment <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </DarkStage>
    );
  }

  return (
    <DarkStage>
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="space-y-2">
          <span className="dash-kicker">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--cb-sky)] align-middle mr-2 shadow-[0_0_12px_var(--cb-sky-glow)]" />
            Borrow
          </span>
          <h1 className="cb-display text-[32px] sm:text-[44px] font-bold tracking-tight leading-[1.05] text-[var(--cb-text)]">Request a loan</h1>
          <p className="text-[var(--cb-text-muted)] mt-1">
            Once posted, fellow NCI members can offer to fund you. You decide which offer to accept.
          </p>
        </header>

        {/* Active loans status card */}
        <ActiveLoansCard active={active} />

        {/* Score summary */}
        <div className="dash-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="dash-kicker flex items-center gap-1.5">
                <Gauge size={12} className="text-[var(--cb-sky)]" /> Your credit score
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-[32px] font-bold tabular leading-none text-[var(--cb-text)]">{score}</span>
                <span className="text-[var(--cb-text-muted)] text-sm">/ 100 · {limit.riskTier}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="dash-kicker">Maximum amount</div>
              <div className="mt-2 text-[24px] font-bold tabular text-[var(--cb-sky)]">
                {limit.eligible ? formatEur(limit.maxAmountCents) : "Not eligible"}
              </div>
            </div>
          </div>
        </div>

        {atMax ? (
          <div
            className="dash-card p-6"
            style={{ borderColor: "rgba(255,138,91,0.35)" }}
          >
            <p className="text-sm text-[var(--cb-text)]">
              You have reached the maximum of {MAX_ACTIVE_LOANS_PER_BORROWER} active loans.
              Close an existing loan to request a new one.
            </p>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-[var(--cb-sky)] hover:underline">
              View your loans <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <BorrowForm maxAmountEur={limit.maxAmountCents / 100} eligible={limit.eligible} />
        )}

        <YourRequestsSection requests={(myRequests ?? []) as RequestRow[]} loans={(borrowerLoans ?? []) as LoanRow[]} />
      </div>
    </DarkStage>
  );
}

function DarkStage({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="dash-root -mx-4 sm:-mx-6 -my-8 sm:-my-10 px-4 sm:px-8 py-8 sm:py-10 overflow-hidden min-h-[calc(100vh-68px)]">
      <div aria-hidden className="dash-orb dash-orb-blue" style={{ width: 520, height: 520, top: -180, right: -120 }} />
      <div aria-hidden className="dash-orb dash-orb-cyan" style={{ width: 460, height: 460, bottom: -200, left: -160 }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

type RequestRow = {
  id: string;
  amount_cents: number;
  requested_term_months: number;
  status: string;
  purpose: string;
  posted_at: string | null;
  loan_offers?: { id: string; status: string }[];
};

type LoanRow = {
  id: string;
  principal_cents: number;
  apr_bps: number;
  term_months: number;
  status: string;
  disbursed_at: string | null;
  paid_off_at: string | null;
  lender?: { first_name: string | null; last_name: string | null } | { first_name: string | null; last_name: string | null }[] | null;
};

function OfferBadge({ pending, total }: Readonly<{ pending: number; total: number }>) {
  if (pending > 0) {
    return (
      <div className="text-sm font-bold text-[var(--cb-sky)]">
        {pending} pending offer{pending === 1 ? "" : "s"}
      </div>
    );
  }
  if (total > 0) {
    return <div className="text-sm text-[var(--cb-text-subtle)]">No pending offers</div>;
  }
  return <div className="text-sm text-[var(--cb-text-subtle)]">Awaiting offers</div>;
}

function YourRequestsSection({ requests, loans }: Readonly<{ requests: RequestRow[]; loans: LoanRow[] }>) {
  const open = requests.filter(r => OPEN_REQUEST_STATUSES.includes(r.status as any));
  const past = requests.filter(r => !OPEN_REQUEST_STATUSES.includes(r.status as any));

  if (requests.length === 0 && loans.length === 0) return null;

  return (
    <section className="space-y-6">
      {open.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-[var(--cb-text)]">Your open loan requests</h2>
          <div className="grid gap-2">
            {open.map(r => {
              const offers = r.loan_offers ?? [];
              const pendingOffers = offers.filter(o => o.status === "pending").length;
              return (
                <Link key={r.id} href={`/borrow/${r.id}`} className="dash-txn">
                  <div>
                    <div className="font-semibold tabular text-[var(--cb-text)]">
                      {formatEur(r.amount_cents)} · {r.requested_term_months}mo
                    </div>
                    <div className="text-sm text-[var(--cb-text-subtle)] capitalize">
                      {r.purpose.replaceAll("_", " ")} · {r.status.replaceAll("_", " ")}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <OfferBadge pending={pendingOffers} total={offers.length} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {loans.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-[var(--cb-text)]">Your loans</h2>
          <div className="grid gap-2">
            {loans.map(l => {
              const lender = Array.isArray(l.lender) ? l.lender[0] : l.lender;
              const lenderName = `${lender?.first_name ?? ""} ${lender?.last_name?.[0] ?? ""}.`.trim() || "lender";
              return (
                <Link key={l.id} href={`/loans/${l.id}`} className="dash-txn">
                  <div className="min-w-0">
                    <div className="font-semibold tabular text-[var(--cb-text)]">
                      {formatEur(l.principal_cents)} · {(l.apr_bps / 100).toFixed(2)}% · {l.term_months}mo
                    </div>
                    <div className="text-sm text-[var(--cb-text-subtle)]">
                      From {lenderName} · <span className="capitalize">{l.status.replaceAll("_", " ")}</span>
                    </div>
                  </div>
                  <span className="text-sm text-[var(--cb-sky)] font-semibold shrink-0 ml-3">View →</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-[var(--cb-text)]">Previous requests</h2>
          <div className="grid gap-2">
            {past.map(r => (
              <Link key={r.id} href={`/borrow/${r.id}`} className="dash-txn">
                <div>
                  <div className="font-semibold tabular text-[var(--cb-text)]">
                    {formatEur(r.amount_cents)} · {r.requested_term_months}mo
                  </div>
                  <div className="text-sm text-[var(--cb-text-subtle)] capitalize">
                    {r.purpose.replaceAll("_", " ")} · {r.status.replaceAll("_", " ")}
                  </div>
                </div>
                <span className="text-sm text-[var(--cb-text-subtle)] shrink-0 ml-3">View →</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ActiveLoansCard({ active }: Readonly<{ active: number }>) {
  const atMax = active >= MAX_ACTIVE_LOANS_PER_BORROWER;
  const tone = atMax
    ? { color: "#FF8A5B", border: "rgba(255,138,91,0.35)", Icon: AlertTriangle }
    : { color: "#4ADE80", border: "rgba(74,222,128,0.30)", Icon: CheckCircle2 };
  const { Icon } = tone;
  return (
    <div className="dash-card p-5 flex items-center gap-4" style={{ borderColor: tone.border }}>
      <Icon size={22} style={{ color: tone.color }} />
      <div className="flex-1">
        <div className="font-semibold text-[var(--cb-text)]">
          You have {active} of {MAX_ACTIVE_LOANS_PER_BORROWER} active loans
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          {Array.from({ length: MAX_ACTIVE_LOANS_PER_BORROWER }).map((_, i) => (
            <span
              key={`slot-${i + 1}`}
              className="block w-3 h-3 rounded-full"
              style={{
                background: i < active ? tone.color : "var(--cb-border-strong)",
                boxShadow: i < active ? `0 0 10px ${tone.color}` : "none",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
