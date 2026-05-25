"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { registerAction } from "@/app/actions/auth";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="cb-btn-lime auth-cta w-full disabled:opacity-50"
    >
      {pending ? "Creating account..." : (<>Create account <ArrowRight size={16} /></>)}
    </button>
  );
}

export default function RegisterPage() {
  const [state, action] = useActionState(registerAction, { error: "" } as any);
  return (
    <div className="auth-stagger space-y-7 relative">
      <div>
        <span className="cb-badge">
          <span className="cb-dot-magenta" />
          Join the community
        </span>
        <h1 className="cb-display mt-5 text-[34px] sm:text-[40px] leading-[1.05] text-[var(--cb-text)]">
          Create your <span className="cb-shimmer-text">121.ai</span> account
        </h1>
        <p className="text-[var(--cb-text-muted)] mt-3 text-sm">
          Open to current NCI students and staff only.
        </p>
      </div>

      <form action={action} className="space-y-5">
        <div>
          <label htmlFor="email" className="auth-label">NCI email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="x12345678@student.ncirl.ie"
            className="auth-input"
          />
        </div>
        <div>
          <label htmlFor="password" className="auth-label">Password (min 10 characters)</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            className="auth-input"
          />
        </div>

        <fieldset className="space-y-3 pt-1">
          <legend className="sr-only">Consents</legend>
          {[
            {
              name: "consent_terms",
              label: (
                <>
                  I agree to the{" "}
                  <Link href="/terms" className="font-medium text-[var(--cb-sky)] hover:underline">
                    Terms of Service
                  </Link>
                  .
                </>
              ),
            },
            {
              name: "consent_privacy",
              label: (
                <>
                  I agree to the{" "}
                  <Link href="/privacy-policy" className="font-medium text-[var(--cb-sky)] hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </>
              ),
            },
            {
              name: "consent_risk",
              label: (
                <>
                  I understand that <strong>capital is at risk</strong> and not protected by deposit insurance.
                </>
              ),
            },
          ].map((c) => (
            <label
              key={c.name}
              className="!mb-0 flex gap-3 items-start text-[var(--cb-text-muted)] font-normal cursor-pointer"
            >
              <input
                type="checkbox"
                name={c.name}
                required
                className="mt-1 w-[18px] h-[18px] shrink-0 accent-[var(--cb-blue)]"
              />
              <span className="text-sm leading-[1.5] flex-1">{c.label}</span>
            </label>
          ))}
        </fieldset>

        {state?.error && (
          <p className="text-sm text-[#FFB4B0] bg-[rgba(200,48,42,0.15)] border border-[rgba(200,48,42,0.35)] rounded-[var(--radius-sm)] px-3 py-2">
            {state.error}
          </p>
        )}

        <SubmitBtn />
      </form>

      <p className="text-sm text-[var(--cb-text-subtle)] text-center">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[var(--cb-sky)] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
