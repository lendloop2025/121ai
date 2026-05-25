"use client";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { loginAction } from "@/app/actions/auth";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="cb-btn-lime auth-cta w-full disabled:opacity-50"
    >
      {pending ? "Signing in..." : (<>Sign in <ArrowRight size={16} /></>)}
    </button>
  );
}

export default function LoginPage() {
  const [state, action] = useActionState(loginAction, { error: "" } as any);

  useEffect(() => {
    if (state?.ok) {
      window.location.href = "/dashboard";
    }
  }, [state]);

  return (
    <div className="auth-stagger space-y-7 relative">
      <div>
        <span className="cb-badge">
          <span className="cb-dot-magenta" />
          Welcome back
        </span>
        <h1 className="cb-display mt-5 text-[34px] sm:text-[40px] leading-[1.05] text-[var(--cb-text)]">
          Sign in to <span className="cb-shimmer-text">121.ai</span>
        </h1>
        <p className="text-[var(--cb-text-muted)] mt-3 text-sm">
          Where lenders and borrowers in the NCI community meet.
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="auth-label !mb-0" htmlFor="password">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[var(--cb-sky)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="auth-input"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-[#FFB4B0] bg-[rgba(200,48,42,0.15)] border border-[rgba(200,48,42,0.35)] rounded-[var(--radius-sm)] px-3 py-2">
            {state.error}
          </p>
        )}

        <SubmitBtn />
      </form>

      <div className="auth-divider">
        <span className="px-3 cb-mono uppercase tracking-[0.18em] text-[11px] text-[var(--cb-text-subtle)]">
          New here?
        </span>
      </div>

      <Link href="/register" className="cb-btn-ghost auth-cta w-full">
        Create an account <ArrowRight size={16} />
      </Link>
    </div>
  );
}
