import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUserProfile } from "@/lib/auth/session";
import { nextStepForStatus } from "@/lib/auth/onboarding";

export default async function CompletePage() {
  const { profile } = await requireUserProfile();

  // Only users who have finished every onboarding step (awaiting admin approval)
  // or are fully verified belong here. Anyone earlier in the flow is bounced to
  // the step they still need to complete instead of seeing "Awaiting review".
  if (profile.status !== "verified" && profile.status !== "pending_admin_approval") {
    redirect(nextStepForStatus(profile.status));
  }

  const verified = profile.status === "verified";

  return (
    <div className="text-center space-y-4">
      <h1 className="text-xl font-bold text-[var(--cb-text)]">{verified ? "You're all set!" : "Awaiting review"}</h1>
      <p className="text-sm text-[var(--cb-text-muted)]">
        {verified
          ? "Your account is fully verified. Welcome to 121.ai."
          : "Your documents are with our admin team. You'll get an email when they're approved (usually within minutes during demo)."}
      </p>
      <Link href={verified ? "/dashboard" : "/login"} className="cb-btn-lime inline-flex">
        {verified ? "Go to dashboard" : "Back to sign in"}
      </Link>
    </div>
  );
}
