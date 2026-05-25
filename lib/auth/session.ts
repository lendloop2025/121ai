import { createServer, createService } from "@/lib/db/client";
import { redirect } from "next/navigation";
import { nextStepForStatus } from "@/lib/auth/onboarding";

export async function requireUser() {
  const supabase = await createServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireUserProfile() {
  const user = await requireUser();
  const svc = createService();
  const { data: profile } = await svc
    .from("users").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");
  return { user, profile };
}

export async function requireVerified() {
  const { user, profile } = await requireUserProfile();
  // Send half-onboarded users to whatever step they're actually on, rather than
  // dropping everyone on the "Awaiting review" screen.
  if (profile.status !== "verified") redirect(nextStepForStatus(profile.status));
  return { user, profile };
}

export async function requireAdmin() {
  const { user, profile } = await requireUserProfile();
  if (profile.role !== "admin") redirect("/dashboard");
  return { user, profile };
}
