import { requireUserProfile } from "@/lib/auth/session";
import { createService } from "@/lib/db/client";
import { AppShell } from "./_app-shell";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, profile } = await requireUserProfile();
  const initial = (profile.first_name?.[0] ?? "?").toUpperCase();

  const { data: wallet } = await createService()
    .from("wallets")
    .select("available_balance_cents, invested_balance_cents")
    .eq("user_id", user.id)
    .single();

  return (
    <AppShell
      firstName={profile.first_name ?? "there"}
      role={profile.role ?? "member"}
      initial={initial}
      availableCents={wallet?.available_balance_cents ?? 0}
      investedCents={wallet?.invested_balance_cents ?? 0}
    >
      {children}
    </AppShell>
  );
}
