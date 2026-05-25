import { createService } from "@/lib/db/client";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const svc = createService();
  const { data: users } = await svc.from("users")
    .select("id, email, first_name, last_name, role, status, created_at")
    .order("created_at", { ascending: false }).limit(100);

  return (
    <div className="space-y-4">
      <header>
        <span className="adm-kicker">Registry</span>
        <h1 className="mt-1 text-[26px] font-bold tracking-tight">Users</h1>
      </header>
      <div className="adm-card overflow-x-auto">
        <table className="adm-table">
          <thead>
            <tr><th>Email</th><th>Name</th><th>Role</th><th>Status</th><th>Joined</th></tr>
          </thead>
          <tbody>
            {users?.map(u => (
              <tr key={u.id}>
                <td className="adm-mono text-[var(--adm-text)]">{u.email}</td>
                <td>{u.first_name ?? "—"} {u.last_name ?? ""}</td>
                <td className="capitalize text-[var(--adm-text-muted)]">{u.role}</td>
                <td><StatusPill status={u.status} /></td>
                <td className="text-[var(--adm-text-muted)]">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone = status === "verified" || status === "active"
    ? "adm-pill-good"
    : status.startsWith("pending")
    ? "adm-pill-warn"
    : status === "rejected" || status === "suspended"
    ? "adm-pill-danger"
    : "";
  return <span className={`adm-pill ${tone}`}>{status.replace(/_/g, " ")}</span>;
}
