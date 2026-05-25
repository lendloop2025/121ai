import Link from "next/link";
import { redirect } from "next/navigation";
import { createServer, createService } from "@/lib/db/client";
import { nextStepForStatus } from "@/lib/auth/onboarding";

export default async function VerifyEmailPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ sent?: string }> }>) {
  const sp = await searchParams;
  const supabase = await createServer();
  const { data: { user } } = await supabase.auth.getUser();

  // Already signed in? Skip the dead-end and go to whatever step the account is at.
  if (user) {
    const svc = createService();
    const { data: profile } = await svc.from("users").select("status").eq("id", user.id).single();
    if (profile?.status && profile.status !== "pending_email_verification") {
      redirect(nextStepForStatus(profile.status));
    }
  }

  return (
    <div className="text-center space-y-6">
      <span className="cb-badge mx-auto">
        <span className="cb-dot-magenta" />
        One last step
      </span>
      <h1 className="cb-display text-[32px] leading-[1.05] text-[var(--cb-text)]">
        Check your <span className="cb-shimmer-text">inbox</span>
      </h1>
      {sp.sent && (
        <p className="text-sm text-[var(--cb-text-muted)]">
          We sent a verification link to your NCI email. Click it to continue setup.
        </p>
      )}
      <p className="text-xs text-[var(--cb-text-subtle)]">
        For demo accounts pre-seeded by an admin, this step is skipped.
      </p>

      <div className="flex flex-col gap-2 pt-4">
        {user ? (
          <Link href="/onboarding/personal-details" className="cb-btn-lime w-full">
            Continue setup →
          </Link>
        ) : (
          <Link href="/login" className="cb-btn-lime w-full">
            Continue to sign in →
          </Link>
        )}
        <Link href="/" className="cb-btn-ghost w-full">
          Back to home
        </Link>
      </div>
    </div>
  );
}
