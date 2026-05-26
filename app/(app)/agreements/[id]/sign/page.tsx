"use client";
import { use, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Download } from "lucide-react";
import { signAgreementAction } from "@/app/actions/agreement";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="cb-btn-lime w-full disabled:opacity-50 disabled:cursor-not-allowed">
      {pending ? "Signing..." : "I agree — sign electronically"}
    </button>
  );
}

export default function SignPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params);
  const [state, action] = useActionState(signAgreementAction, { error: "" } as any);

  return (
    <div className="dash-root -mx-4 sm:-mx-6 -my-8 sm:-my-10 px-4 sm:px-8 py-8 sm:py-10 overflow-hidden min-h-[calc(100vh-68px)]">
      <div aria-hidden className="dash-orb dash-orb-blue" style={{ width: 520, height: 520, top: -180, right: -120 }} />
      <div aria-hidden className="dash-orb dash-orb-cyan" style={{ width: 460, height: 460, bottom: -200, left: -160 }} />

      <div className="relative z-10 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="cb-display text-[28px] sm:text-[34px] font-bold text-[var(--cb-text)]">Loan agreement</h1>
          <a
            href={`/api/agreements/${id}/pdf?download=1`}
            download={`loan-agreement-${id.slice(0, 8)}.pdf`}
            className="cb-btn-ghost cb-btn-sm"
          >
            <Download size={15} /> Download PDF
          </a>
        </div>
        <p className="text-sm text-[var(--cb-text-muted)]">
          This agreement was drafted by Claude (Anthropic) for your specific loan terms. Both the borrower and the
          lender must sign electronically before funds are disbursed. You can download the PDF at any time — both
          before signing (draft) and after signing (signed copy with timestamps and IP audit).
        </p>
        <iframe
          title="Loan agreement preview"
          src={`/api/agreements/${id}/pdf?preview=1`}
          className="w-full h-[65vh] border border-[var(--cb-border)] rounded-xl bg-white"
        />

        <form action={action} className="dash-card glass-input space-y-3 p-4 sm:p-5">
          <input type="hidden" name="loan_id" value={id} />
          <label className="flex gap-2 items-start text-sm text-[var(--cb-text-muted)]">
            <input type="checkbox" required className="mt-1 w-4" />
            <span>
              I have read the agreement above and consent to signing it electronically. I understand this constitutes
              a legally binding contract under Irish law (Electronic Commerce Act 2000 / eIDAS).
            </span>
          </label>
          {state?.error && <p className="text-sm text-[#FF8A5B]">{state.error}</p>}
          <SubmitBtn />
        </form>
      </div>
    </div>
  );
}
