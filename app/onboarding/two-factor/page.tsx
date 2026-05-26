"use client";
import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { startTotpSetupAction, confirmTotpAction, skipTwoFactorAction } from "@/app/actions/onboarding";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="cb-btn-lime w-full disabled:opacity-50 disabled:cursor-not-allowed">{pending ? "Verifying..." : "Verify & continue"}</button>;
}

export default function TwoFactorPage() {
  const [setup, setSetup] = useState<{ qrDataUrl: string; backupCodes: string[] } | null>(null);
  const [state, action] = useActionState(confirmTotpAction, { error: "" } as any);

  useEffect(() => {
    startTotpSetupAction().then(setSetup);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[var(--cb-text)]">Set up two-factor authentication</h1>
      <p className="text-sm text-[var(--cb-text-muted)]">Use Google Authenticator, 1Password, or any TOTP app to scan this QR code.</p>

      {setup ? (
        <>
          <img src={setup.qrDataUrl} alt="2FA QR code" className="mx-auto w-48 h-48 bg-white p-2 rounded-lg" />
          <details className="text-sm text-[var(--cb-text-muted)]">
            <summary className="cursor-pointer font-medium text-[var(--cb-text)]">Backup codes (save these now)</summary>
            <pre className="mt-2 p-3 bg-white/[0.04] border border-[var(--cb-border)] rounded-md text-xs grid grid-cols-2 gap-1 cb-mono text-[var(--cb-text)]">
              {setup.backupCodes.map(c => <span key={c}>{c}</span>)}
            </pre>
          </details>
          <form action={action} className="space-y-3 pt-2 border-t border-[var(--cb-border)]">
            <div>
              <label className="text-sm">Enter the 6-digit code from your app</label>
              <input name="code" placeholder="123456" inputMode="numeric" maxLength={6} required className="cb-mono" />
            </div>
            {state?.error && <p className="text-sm text-[#FF8A5B]">{state.error}</p>}
            <SubmitBtn />
          </form>
          <form action={skipTwoFactorAction}>
            <button
              type="submit"
              className="w-full py-2.5 text-sm font-medium text-[var(--cb-text-muted)] hover:text-[var(--cb-text)] underline underline-offset-4"
            >
              Skip for now
            </button>
          </form>
        </>
      ) : (
        <p className="text-sm text-[var(--cb-text-muted)] text-center">Generating QR…</p>
      )}
    </div>
  );
}
