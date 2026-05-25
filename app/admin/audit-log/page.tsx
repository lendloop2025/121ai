import { createService } from "@/lib/db/client";
import { formatDate } from "@/lib/utils";

export default async function AuditLogPage() {
  const svc = createService();
  const { data: entries } = await svc.from("audit_log").select("*")
    .order("created_at", { ascending: false }).limit(200);

  return (
    <div className="space-y-4">
      <header>
        <span className="adm-kicker">Forensics · last 200 events</span>
        <h1 className="mt-1 text-[26px] font-bold tracking-tight">Audit log</h1>
      </header>
      <div className="adm-card overflow-x-auto">
        <table className="adm-table">
          <thead>
            <tr><th>When</th><th>Action</th><th>Resource</th><th>Actor IP</th></tr>
          </thead>
          <tbody>
            {entries?.map(e => (
              <tr key={e.id}>
                <td className="whitespace-nowrap text-[var(--adm-text-muted)]">{formatDate(e.created_at)}</td>
                <td className="adm-mono text-[var(--adm-amber)]">{e.action_type}</td>
                <td className="adm-mono text-xs text-[var(--adm-text-muted)]">{e.resource_type}/{e.resource_id?.slice(0, 8) ?? "—"}</td>
                <td className="adm-mono text-xs text-[var(--adm-text-subtle)]">{e.actor_ip ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
