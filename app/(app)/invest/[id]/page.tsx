import { requireVerified } from "@/lib/auth/session";
import { createService } from "@/lib/db/client";
import { formatEur, formatBps, maskName } from "@/lib/utils";
import { calcMonthlyPayment } from "@/lib/finance/amortization";
import OfferForm from "./offer-form";
import { acceptCounterOfferAction } from "@/app/actions/lend";

function DarkStage({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="dash-root -mx-4 sm:-mx-6 -my-8 sm:-my-10 px-4 sm:px-8 py-8 sm:py-10 overflow-hidden min-h-[calc(100vh-68px)]">
      <div aria-hidden className="dash-orb dash-orb-blue" style={{ width: 520, height: 520, top: -180, right: -120 }} />
      <div aria-hidden className="dash-orb dash-orb-cyan" style={{ width: 460, height: 460, bottom: -200, left: -160 }} />
      <div className="relative z-10">{children}</div>
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

export default async function InvestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, profile } = await requireVerified();
  const svc = createService();

  const { data: req } = await svc.from("loan_requests")
    .select("*, users!loan_requests_borrower_id_fkey(first_name, last_name)")
    .eq("id", id).single();
  if (!req) return <DarkStage><p className="text-sm text-[#FF8A5B]">Loan request not found.</p></DarkStage>;
  if (req.borrower_id === user.id) return <DarkStage><p className="text-sm text-[#FF8A5B]">You cannot offer to fund your own request.</p></DarkStage>;
  if (req.community_id !== profile.community_id) return <DarkStage><p className="text-sm text-[#FF8A5B]">Out of community.</p></DarkStage>;
  if (!["open", "partially_funded"].includes(req.status)) return <DarkStage><p className="text-sm text-[#FF8A5B]">This request is no longer open.</p></DarkStage>;

  const { data: scoreRow } = await svc.from("credit_scores")
    .select("*").eq("user_id", req.borrower_id)
    .order("computed_at", { ascending: false }).limit(1).maybeSingle();

  const { data: assessment } = await svc.from("borrower_assessments")
    .select("monthly_income_cents").eq("user_id", req.borrower_id)
    .order("submitted_at", { ascending: false }).limit(1).maybeSingle();

  const { data: wallet } = await svc.from("wallets")
    .select("available_balance_cents").eq("user_id", user.id).single();

  const { data: counterOffers } = await svc.from("loan_offers")
    .select("id, amount_cents, apr_bps, term_months, message_to_borrower, status, created_at")
    .eq("request_id", id)
    .eq("lender_id", user.id)
    .eq("proposed_by_borrower", true)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const monthlyAtMaxApr = calcMonthlyPayment(req.amount_cents, req.max_apr_bps, req.requested_term_months);
  const incomeCents = assessment?.monthly_income_cents ?? 0;
  const affordabilityPct = incomeCents > 0 ? (monthlyAtMaxApr / incomeCents) * 100 : null;

  const u = (req as any).users;
  const maskedName = maskName(`${u?.first_name ?? ""} ${u?.last_name ?? ""}`.trim());
  const borrowerHandle = `${maskedName || "Borrower"} #${String(req.borrower_id).slice(0, 8)}`;

  const components = scoreRow ? [
    { label: "Identity", value: scoreRow.identity_score, max: 20 },
    { label: "Income", value: scoreRow.income_score, max: 25 },
    { label: "Stability", value: scoreRow.stability_score, max: 15 },
    { label: "Financial", value: scoreRow.financial_score, max: 20 },
    { label: "Reputation", value: scoreRow.reputation_score, max: 20 },
  ] : [];

  const affordTone = affordabilityPct == null ? "muted" :
    affordabilityPct < 30 ? "good" : affordabilityPct < 50 ? "warn" : "bad";
  const affordColor =
    affordTone === "good" ? "#4ADE80" :
    affordTone === "warn" ? "#FACC15" :
    affordTone === "bad" ? "#FF8A5B" : "var(--cb-text-muted)";

  return (
    <DarkStage>
      <div className="space-y-6">
        <div>
          <div className="dash-kicker">Loan request from</div>
          <h1 className="cb-display mt-1 text-[28px] sm:text-[40px] font-bold tracking-tight tabular text-[var(--cb-text)]">{borrowerHandle}</h1>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="dash-card p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="dash-kicker">Requested</div>
                  <div className="text-4xl font-bold text-[var(--cb-sky)] tabular mt-1">{formatEur(req.amount_cents)}</div>
                </div>
                <DarkScoreBadge score={scoreRow?.total_score} />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-[var(--cb-border)]">
                <div>
                  <div className="dash-kicker">Term</div>
                  <div className="font-semibold tabular text-lg mt-0.5 text-[var(--cb-text)]">{req.requested_term_months} mo</div>
                </div>
                <div>
                  <div className="dash-kicker">Max APR</div>
                  <div className="font-semibold tabular text-lg mt-0.5 text-[var(--cb-text)]">{formatBps(req.max_apr_bps)}</div>
                </div>
                <div>
                  <div className="dash-kicker">Purpose</div>
                  <div className="font-semibold capitalize text-lg mt-0.5 text-[var(--cb-text)]">{req.purpose.replaceAll("_", " ")}</div>
                </div>
              </div>
              {req.purpose_description && (
                <p className="text-sm text-[var(--cb-text-muted)] mt-4 whitespace-pre-wrap leading-relaxed">{req.purpose_description}</p>
              )}
            </div>

            <div className="dash-card p-5 sm:p-6">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--cb-text)]">Borrower credit score</h2>
                <div className="text-3xl font-bold text-[var(--cb-sky)] tabular">
                  {scoreRow?.total_score ?? "—"}<span className="text-base text-[var(--cb-text-subtle)]">/100</span>
                </div>
              </div>
              <div className="space-y-3">
                {components.map(c => (
                  <div key={c.label}>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--cb-text-muted)]">{c.label}</span>
                      <span className="font-medium tabular text-[var(--cb-text)]">{c.value} / {c.max}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--cb-sky)] to-[var(--cb-blue)]"
                        style={{ width: `${(c.value / c.max) * 100}%`, boxShadow: "0 0 10px var(--cb-sky-glow)" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dash-card p-5 sm:p-6">
              <h2 className="text-lg font-semibold mb-3 text-[var(--cb-text)]">Affordability check</h2>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="dash-kicker">Monthly repayment at max APR</div>
                  <div className="text-2xl font-bold tabular mt-1 text-[var(--cb-text)]">{formatEur(monthlyAtMaxApr)}</div>
                </div>
                {affordabilityPct !== null && (
                  <div className="text-2xl font-bold tabular" style={{ color: affordColor }}>
                    {affordabilityPct.toFixed(1)}%
                  </div>
                )}
              </div>
              <p className="text-sm text-[var(--cb-text-muted)] mt-3">
                {affordabilityPct === null
                  ? "Borrower has not declared income."
                  : `Of the borrower's declared monthly income. Comfortable threshold is under 30%.`}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 space-y-4">
              {counterOffers && counterOffers.length > 0 && (
                <div className="dash-card p-5 sm:p-6" style={{ borderColor: "var(--cb-border-strong)" }}>
                  <h2 className="text-lg font-semibold text-[var(--cb-sky)]">
                    Borrower countered your offer
                  </h2>
                  <p className="text-sm text-[var(--cb-text-muted)] mt-1 mb-3">
                    Review the borrower's terms below. Accepting opens the agreement to sign.
                  </p>
                  <ul className="space-y-3">
                    {counterOffers.map((c: any) => (
                      <li key={c.id} className="p-3 rounded-xl border border-[var(--cb-border)] bg-white/[0.03]">
                        <div className="text-sm font-semibold tabular text-[var(--cb-text)]">
                          {formatEur(c.amount_cents)} at {formatBps(c.apr_bps)} APR · {c.term_months}mo
                        </div>
                        {c.message_to_borrower && (
                          <p className="text-xs italic text-[var(--cb-text-subtle)] mt-1">
                            "{c.message_to_borrower}"
                          </p>
                        )}
                        <form action={acceptCounterOfferAction} className="mt-3">
                          <input type="hidden" name="offer_id" value={c.id} />
                          <button className="cb-btn-lime w-full !h-10 text-sm">
                            Accept counter & sign agreement
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="dash-card glass-input p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-[var(--cb-text)]">Make your offer</h2>
                <p className="text-sm text-[var(--cb-text-muted)] mt-1 mb-4">
                  You set the APR, you pick the amount. The borrower decides whether to accept.
                </p>
                <OfferForm
                  requestId={id}
                  maxApr={req.max_apr_bps / 100}
                  maxAmount={Math.min(req.amount_cents, wallet?.available_balance_cents ?? 0) / 100}
                  defaultTerm={req.requested_term_months}
                  walletEur={(wallet?.available_balance_cents ?? 0) / 100}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DarkStage>
  );
}
