import { createService } from "@/lib/db/client";
import { approveKycAction, rejectKycAction } from "@/app/actions/admin";
import { formatDate, formatEur } from "@/lib/utils";

// Admin review should always reflect the latest submissions.
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  pending_admin_approval: "Ready for review",
  pending_address_proof: "Identity in, assessment pending",
  pending_identity: "Awaiting documents",
};

export default async function PendingKycPage() {
  const svc = createService();
  const { data: pending } = await svc.from("users")
    .select("id, email, first_name, last_name, status, created_at, identity_doc_type, nci_program, nci_year, mobile_e164, date_of_birth, city, country")
    .in("status", ["pending_admin_approval", "pending_address_proof", "pending_identity"])
    .order("created_at", { ascending: true });

  // Pull each applicant's submitted documents, assessment, and computed score so
  // the admin has everything needed to make a decision on one screen.
  const reviews = await Promise.all((pending ?? []).map(async (u) => {
    const [{ data: docs }, { data: assessment }, { data: score }] = await Promise.all([
      svc.from("documents")
        .select("id, kind, status, storage_path, original_filename, mime_type")
        .eq("user_id", u.id).order("created_at", { ascending: true }),
      svc.from("borrower_assessments")
        .select("*").eq("user_id", u.id)
        .order("submitted_at", { ascending: false }).limit(1).maybeSingle(),
      svc.from("credit_scores")
        .select("total_score, computed_at").eq("user_id", u.id)
        .order("computed_at", { ascending: false }).limit(1).maybeSingle(),
    ]);

    const docsWithUrls = await Promise.all((docs ?? []).map(async (d) => {
      const { data: signed } = await svc.storage.from("documents").createSignedUrl(d.storage_path, 60 * 60);
      return { ...d, url: signed?.signedUrl ?? null };
    }));

    return { user: u, docs: docsWithUrls, assessment, score };
  }));

  return (
    <div className="space-y-4">
      <header>
        <span className="adm-kicker">Verification queue</span>
        <h1 className="mt-1 text-[26px] font-bold tracking-tight">Pending KYC reviews</h1>
      </header>
      {reviews.length ? (
        <div className="space-y-4">
          {reviews.map(({ user: u, docs, assessment, score }) => {
            const readyForReview = u.status === "pending_admin_approval";
            return (
              <div key={u.id} className="adm-card p-5 space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-lg text-[var(--adm-text)]">{u.first_name ?? "—"} {u.last_name ?? ""}</div>
                    <div className="adm-mono text-xs text-[var(--adm-text-muted)]">{u.email}</div>
                    <div className="text-xs text-[var(--adm-text-subtle)] mt-0.5">
                      Submitted {formatDate(u.created_at)} · {STATUS_LABELS[u.status] ?? u.status.replace(/_/g, " ")}
                    </div>
                  </div>
                  {score?.total_score != null && (
                    <div className="text-right shrink-0">
                      <div className="adm-kicker">Initial score</div>
                      <div className="text-3xl font-bold adm-mono text-[var(--adm-amber)]">{score.total_score}<span className="text-sm text-[var(--adm-text-subtle)]">/100</span></div>
                    </div>
                  )}
                </div>

                {/* Personal details */}
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 text-sm border-t border-[var(--adm-border)] pt-4">
                  <Field label="Program" value={u.nci_program ? `${u.nci_program} (Yr ${u.nci_year ?? "—"})` : "—"} />
                  <Field label="Mobile" value={u.mobile_e164 ?? "—"} />
                  <Field label="Date of birth" value={u.date_of_birth ? formatDate(u.date_of_birth) : "—"} />
                  <Field label="Location" value={[u.city, u.country].filter(Boolean).join(", ") || "—"} />
                </dl>

                {/* Identity documents */}
                <div className="border-t border-[var(--adm-border)] pt-4">
                  <div className="adm-kicker mb-2">
                    Identity documents{u.identity_doc_type ? ` · ${u.identity_doc_type.replace(/_/g, " ")}` : ""}
                  </div>
                  {docs.length ? (
                    <div className="flex flex-wrap gap-3">
                      {docs.map((d) => (
                        <a
                          key={d.id}
                          href={d.url ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center gap-1.5 group"
                        >
                          {d.mime_type?.startsWith("image/") && d.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={d.url} alt={d.kind} className="w-28 h-20 object-cover rounded-lg border border-[var(--adm-border)] transition group-hover:ring-2 group-hover:ring-[var(--adm-magenta)]" />
                          ) : (
                            <div className="w-28 h-20 flex items-center justify-center rounded-lg border border-[var(--adm-border)] bg-white/[0.03] text-xs text-[var(--adm-text-muted)] transition group-hover:ring-2 group-hover:ring-[var(--adm-magenta)]">
                              View file
                            </div>
                          )}
                          <span className="text-xs text-[var(--adm-text-muted)] capitalize">{d.kind.replace(/_/g, " ")}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--adm-text-subtle)]">No documents uploaded yet.</p>
                  )}
                </div>

                {/* Assessment */}
                {assessment && (
                  <div className="border-t border-[var(--adm-border)] pt-4">
                    <div className="adm-kicker mb-2">Borrower assessment</div>
                    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 text-sm">
                      <Field label="Monthly income" value={formatEur(assessment.monthly_income_cents ?? 0)} />
                      <Field label="Monthly expenses" value={formatEur(assessment.monthly_expenses_cents ?? 0)} />
                      <Field label="Existing debt" value={formatEur(assessment.existing_debt_cents ?? 0)} />
                      <Field label="Employment" value={`${(assessment.employment_status ?? "—").replace(/_/g, " ")}${assessment.employment_months != null ? ` · ${assessment.employment_months}mo` : ""}`} />
                      <Field label="Emergency fund" value={assessment.has_emergency_fund ? "Yes" : "No"} />
                      <Field label="IRP / EU passport" value={assessment.has_irp ? "Yes" : "No"} />
                      <Field label="NCI semesters" value={String(assessment.nci_semesters_completed ?? "—")} />
                    </dl>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 border-t border-[var(--adm-border)] pt-4">
                  <form action={approveKycAction}>
                    <input type="hidden" name="user_id" value={u.id} />
                    <button
                      disabled={!readyForReview}
                      className="adm-btn-approve"
                      title={readyForReview ? "Approve and verify this account" : "Applicant has not completed all steps yet"}
                    >
                      Approve
                    </button>
                  </form>
                  <form action={rejectKycAction} className="flex gap-2">
                    <input type="hidden" name="user_id" value={u.id} />
                    <input name="reason" placeholder="Reason…" className="adm-input !w-44" />
                    <button className="adm-btn-reject">Reject</button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="adm-card p-10 text-center">
          <p className="text-sm text-[var(--adm-text-muted)]">Queue clear — nothing pending review.</p>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="adm-kicker">{label}</dt>
      <dd className="font-medium text-[var(--adm-text)] mt-0.5">{value}</dd>
    </div>
  );
}
