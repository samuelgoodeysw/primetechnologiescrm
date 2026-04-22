// HR > Employees — list view.
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAppState } from "@/state/AppState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/odoo/Tag";

export default function EmployeesPage() {
  const { state } = useAppState();
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const s = q.toLowerCase();
    return state.employees.filter((e) => !s || e.name.toLowerCase().includes(s) || e.empNo.toLowerCase().includes(s) || e.designation.toLowerCase().includes(s));
  }, [state.employees, q]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-4 py-2 border-b border-rule bg-surface flex items-center gap-3">
        <div className="text-[12px] text-muted-foreground">HR <span className="mx-1">›</span> <span className="text-foreground font-medium">Employees</span></div>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" className="h-7 px-3 text-[12px] font-semibold">+ Create</Button>
        </div>
      </div>
      <div className="px-4 h-12 border-b border-rule bg-surface-alt flex items-center gap-3">
        <div className="relative w-60">
          <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search employees…" className="h-7 pl-7 text-[12px]" />
        </div>
        <div className="ml-auto text-[12px] text-muted-foreground tabular-nums">1-{rows.length} / {rows.length}</div>
      </div>
      <div className="flex-1 overflow-auto bg-surface">
        <table className="w-full text-[13px]">
          <thead className="sticky top-0 bg-surface-alt border-b border-rule text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-8 px-2 py-2"><input type="checkbox" /></th>
              <th className="w-10 px-2 py-2"></th>
              <th className="px-2 py-2 text-left font-semibold">Name</th>
              <th className="px-2 py-2 text-left font-semibold">Employee #</th>
              <th className="px-2 py-2 text-left font-semibold">Designation</th>
              <th className="px-2 py-2 text-left font-semibold">Department</th>
              <th className="px-2 py-2 text-left font-semibold">Division</th>
              <th className="px-2 py-2 text-left font-semibold">Location</th>
              <th className="px-2 py-2 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-b border-rule hover:bg-surface-hover h-8">
                <td className="px-2"><input type="checkbox" /></td>
                <td className="px-2">
                  <div className="h-6 w-6 rounded-full bg-navy text-primary-foreground text-[10px] font-semibold flex items-center justify-center">{e.initials}</div>
                </td>
                <td className="px-2 font-medium text-navy">{e.name}</td>
                <td className="px-2 text-muted-foreground tabular-nums">{e.empNo}</td>
                <td className="px-2">{e.designation}</td>
                <td className="px-2 text-muted-foreground">{e.department}</td>
                <td className="px-2 text-muted-foreground">{e.division ?? "—"}</td>
                <td className="px-2 text-muted-foreground">{e.location}</td>
                <td className="px-2"><Tag tone={e.status === "Active" ? "green" : e.status === "On Leave" ? "amber" : "grey"}>{e.status}</Tag></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
