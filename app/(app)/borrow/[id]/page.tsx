import { requireVerified } from "@/lib/auth/session";
import { createService } from "@/lib/db/client";
import { formatEur, formatBps } from "@/lib/utils";
import { acceptOfferAction } from "@/app/actions/borrow";
import CounterOfferForm from "./counter-offer-form";

export const dynamic = "force-dynamic";

const NOTICES: Record<string, string> = {
  offer_unavailable: "That offer is no longer available — it may have been withdrawn, rejected, or already accepted.",
  request_closed: "This loan request is no longer open.",
  max_active_loans: "You have reached the maximum of 2 active loans. Close one to accept a new offer.",
  counter_sent: "Counter-offer sent. The lender has been notified — they can now accept or decline.",
  already_countered: "You have already sent a counter-offer for that lender's offer. Waiting on the lender to respond.",
};

function DarkStage({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="dash-root -mx-4 sm:-mx-6 -my-8 sm:-my-10 px-4 sm:px-8 py-8 sm:py-10 overflow-hidden min-h-[calc(100vh-68px)]">
      <div aria-hidden className="dash-orb dash-orb-blue" style={{ width: 520, height: 520, top: -180, right: -120 }} />
      <div aria-hidden className="dash-orb dash-orb-cyan" style={{ width: 460, height: 460, bottom: -200, left: -160 }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default async function LoanRequestDetailPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}>) {
  const { id } = await params;
  const sp = await searchParams;
  const noticeMessage = sp.notice ? NOTICES[sp.notice] : undefined;
  const { user } = await requireVerified();
  const svc = createService();

  const { data: req } = await svc.from("loan_requests").select("*").eq("id", id).single();
  if (!req || req.borrower_id !== user.id) {
    return (
      <DarkStage>
        <p className="text-sm text-[#FF8A5B]">Request not found.</p>
      </DarkStage>
    );
  }
  const { data: offers } = await svc.from("loan_offers")
    .select("*, lender:users!loan_offers_lender_id_fkey(first_name, last_name)")
    .eq("request_id", id).order("created_at", { ascending: false });

  const counteredIds = new Set(
    (offers ?? [])
      .filter((o: any) => o.counter_to_offer_id)
      .map((o: any) => o.counter_to_offer_id),
  );

  return (
    <DarkStage>
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="cb-display text-[28px] sm:text-[34px] font-bold text-[var(--cb-text)]">Your loan request</h1>
        {noticeMessage && (
          <div className="dash-card p-3.5 text-sm text-[var(--cb-sky)]" style={{ borderColor: "var(--cb-border-strong)" }}>
            {noticeMessage}
          </div>
        )}
        <div className="dash-card p-5">
          <div className="text-2xl font-bold tabular text-[var(--cb-text)]">{formatEur(req.amount_cents)}</div>
          <div className="text-sm text-[var(--cb-text-muted)] capitalize">
            {req.purpose.replace(/_/g, " ")} · {req.requested_term_months} months · ≤{formatBps(req.max_apr_bps)} APR
          </div>
          <div className="text-xs text-[var(--cb-text-subtle)] mt-2">
            Status: <span className="font-semibold capitalize text-[var(--cb-text-muted)]">{req.status.replace(/_/g, " ")}</span>
          </div>
        </div>

        <h2 className="font-bold text-[var(--cb-text)]">Offers received ({offers?.length ?? 0})</h2>
        <div className="space-y-2">
          {offers?.length ? offers.map((o: any) => {
            const isCounterFromBorrower = o.proposed_by_borrower === true;
            const wasSuperseded = counteredIds.has(o.id);
            return (
              <div key={o.id} className="dash-card p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-[var(--cb-text)]">
                      {isCounterFromBorrower
                        ? "Your counter-offer"
                        : `${o.lender?.first_name ?? "Anonymous"} ${o.lender?.last_name?.[0] ?? ""}.`}
                    </div>
                    <div className="text-sm tabular text-[var(--cb-text-muted)]">
                      {formatEur(o.amount_cents)} at {formatBps(o.apr_bps)} APR · {o.term_months}mo
                    </div>
                    {o.message_to_borrower && (
                      <div className="text-xs italic text-[var(--cb-text-subtle)] mt-1">"{o.message_to_borrower}"</div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {o.status === "pending" && !isCounterFromBorrower && !wasSuperseded && (
                      <>
                        <form action={acceptOfferAction}>
                          <input type="hidden" name="offer_id" value={o.id} />
                          <button className="dash-btn !h-9 !px-4 text-sm">
                            Accept
                          </button>
                        </form>
                        <CounterOfferForm
                          offerId={o.id}
                          defaultAmountEur={Math.round(o.amount_cents / 100)}
                          defaultAprPct={Math.round(o.apr_bps) / 100}
                          defaultTermMonths={o.term_months}
                          maxAmountEur={Math.round(req.amount_cents / 100)}
                          maxAprPct={Math.round(req.max_apr_bps) / 100}
                        />
                      </>
                    )}
                    {o.status === "pending" && isCounterFromBorrower && (
                      <span className="text-sm text-[var(--cb-sky)] font-semibold">
                        Counter sent — waiting on lender
                      </span>
                    )}
                    {wasSuperseded && o.status !== "accepted" && (
                      <span className="text-sm text-[var(--cb-text-subtle)]">Superseded by your counter</span>
                    )}
                    {o.status === "accepted" && <span className="text-sm font-semibold text-[#4ADE80]">Accepted</span>}
                    {o.status === "rejected" && !wasSuperseded && (
                      <span className="text-sm text-[var(--cb-text-subtle)]">Rejected</span>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : <p className="text-sm text-[var(--cb-text-muted)]">Offers will appear here as lenders submit them.</p>}
        </div>
      </div>
    </DarkStage>
  );
}
