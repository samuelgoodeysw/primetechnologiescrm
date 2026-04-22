// HR > Timesheets — list view.
import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, List } from "lucide-react";
import { toast } from "sonner";
import { Tag, type Tone } from "@/components/odoo/Tag";
import { fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Status = "Draft" | "Submitted" | "Approved" | "Rejected";

const STATUS_TONE: Record<Status, Tone> = {
  Draft: "grey",
  Submitted: "blue",
  Approved: "green",
  Rejected: "red",
};

interface TSRow {
  id: string;
  engineer: string;
  week: string;
  project: string;
  hours: number;
  billable: number;
  nonBillable: number;
  status: Status;
  submitted: string | null;
}

const BENCH = "— (on bench)";

const ROWS: TSRow[] = [
  { id: "TS-001", engineer: "R. Kumar",   week: "W16 · 13-19 Apr 2026", project: "Meraas Tower B4",    hours: 42, billable: 40, nonBillable: 2,  status: "Approved",  submitted: "2026-04-20" },
  { id: "TS-002", engineer: "R. Kumar",   week: "W17 · 20-26 Apr 2026", project: "Meraas Tower B4",    hours: 38, billable: 36, nonBillable: 2,  status: "Submitted", submitted: "2026-04-20" },
  { id: "TS-003", engineer: "S. Menon",   week: "W16 · 13-19 Apr 2026", project: "Saadiyat Hotel",     hours: 45, billable: 45, nonBillable: 0,  status: "Approved",  submitted: "2026-04-19" },
  { id: "TS-004", engineer: "S. Menon",   week: "W17 · 20-26 Apr 2026", project: "Saadiyat Hotel",     hours: 40, billable: 38, nonBillable: 2,  status: "Submitted", submitted: "2026-04-20" },
  { id: "TS-005", engineer: "A. Hussain", week: "W16 · 13-19 Apr 2026", project: "DAMAC Lagoons",      hours: 40, billable: 36, nonBillable: 4,  status: "Approved",  submitted: "2026-04-19" },
  { id: "TS-006", engineer: "A. Hussain", week: "W17 · 20-26 Apr 2026", project: "DAMAC Lagoons",      hours: 36, billable: 32, nonBillable: 4,  status: "Submitted", submitted: "2026-04-20" },
  { id: "TS-007", engineer: "V. Pillai",  week: "W16 · 13-19 Apr 2026", project: "Sobha Hartland 7",   hours: 28, billable: 20, nonBillable: 8,  status: "Submitted", submitted: "2026-04-18" },
  { id: "TS-008", engineer: "V. Pillai",  week: "W17 · 20-26 Apr 2026", project: BENCH,                hours: 16, billable: 0,  nonBillable: 16, status: "Draft",     submitted: null },
  { id: "TS-009", engineer: "F. Rahman",  week: "W16 · 13-19 Apr 2026", project: "NEOM Line Plot-42",  hours: 48, billable: 48, nonBillable: 0,  status: "Approved",  submitted: "2026-04-18" },
  { id: "TS-010", engineer: "F. Rahman",  week: "W17 · 20-26 Apr 2026", project: "NEOM Line Plot-42",  hours: 44, billable: 44, nonBillable: 0,  status: "Submitted", submitted: "2026-04-20" },
  { id: "TS-011", engineer: "M. Khan",    week: "W16 · 13-19 Apr 2026", project: "Meraas Tower B4",    hours: 40, billable: 36, nonBillable: 4,  status: "Approved",  submitted: "2026-04-19" },
  { id: "TS-012", engineer: "P. Nair",    week: "W16 · 13-19 Apr 2026", project: "Saadiyat Hotel",     hours: 32, billable: 28, nonBillable: 4,  status: "Approved",  submitted: "2026-04-18" },
  { id: "TS-013", engineer: "R. Patel",   week: "W16 · 13-19 Apr 2026", project: BENCH,                hours: 24, billable: 0,  nonBillable: 24, status: "Submitted", submitted: "2026-04-17" },
  { id: "TS-014", engineer: "A. Verma",   week: "W16 · 13-19 Apr 2026", project: BENCH,                hours: 22, billable: 0,  nonBillable: 22, status: "Submitted", submitted: "2026-04-17" },
];

type SortKey = "engineer" | "week" | "project" | "hours" | "billable" | "nonBillable" | "status" | "submitted";
type FilterChip = "all" | "thisweek" | "pending" | "approved" | "submitted" | "draft";

export default function TimesheetsPage() {
  const [sortKey, setSortKey] = useState<SortKey>("submitted");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterChip>("all");

  const rows = useMemo(() => {
    let r = [...ROWS];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((x) => x.engineer.toLowerCase().includes(q) || x.project.toLowerCase().includes(q));
    }
    if (filter === "thisweek") r = r.filter((x) => x.week.startsWith("W17"));
    if (filter === "pending") r = r.filter((x) => x.status === "Submitted");
    if (filter === "approved") r = r.filter((x) => x.status === "Approved");
    if (filter === "submitted") r = r.filter((x) => x.status === "Submitted");
    if (filter === "draft") r = r.filter((x) => x.status === "Draft");

    const dir = sortDir === "asc" ? 1 : -1;
    return r.sort((A, B) => {
      const a = A[sortKey] ?? "";
      const b = B[sortKey] ?? "";
      if (a < b) return -1 * dir;
      if (a > b) return 1 * dir;
      return 0;
    });
  }, [sortKey, sortDir, search, filter]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 h-10 px-4 border-b border-rule bg-surface">
        <Button size="sm" onClick={() => toast("Create timesheet — Phase 2")} className="h-7 px-3 text-[12px] font-semibold">+ New Timesheet</Button>
        <button className="text-[12px] text-muted-foreground hover:text-foreground px-2 h-7 rounded-sm hover:bg-surface-hover">⌄ Action</button>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1 text-[12px] text-muted-foreground tabular-nums">
            <span>1-{rows.length} / {ROWS.length}</span>
            <button className="h-6 w-6 hover:bg-surface-hover rounded-sm grid place-items-center"><ChevronLeft className="h-3.5 w-3.5" /></button>
            <button className="h-6 w-6 hover:bg-surface-hover rounded-sm grid place-items-center"><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
          <div className="flex items-center border border-rule rounded-sm overflow-hidden">
            <button className="h-7 w-7 grid place-items-center bg-navy text-primary-foreground"><List className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-px bg-rule border-b border-rule">
        <Kpi label="Hours Logged This Week" value="4,680" />
        <Kpi label="Pending Approval" value="23 timesheets" />
        <Kpi label="Utilization This Week" value="84%" tone="green" />
        <Kpi label="Non-Billable Hours" value="12%" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 h-10 px-4 border-b border-rule bg-surface-alt">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search timesheets..."
          className="h-7 w-64 px-2 text-[12px] bg-surface border border-rule rounded-sm outline-none focus:border-navy"
        />
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Filter:</span>
          {([
            ["all", "All"],
            ["thisweek", "This Week"],
            ["pending", "Pending Approval"],
            ["approved", "Approved"],
            ["submitted", "Submitted"],
            ["draft", "Draft"],
          ] as [FilterChip, string][]).map(([f, label]) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{label}</Chip>
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Group by:</span>
          <Chip>Engineer</Chip><Chip>Project</Chip><Chip>Week</Chip><Chip>Status</Chip>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-surface">
        <table className="w-full text-[13px] tabular-nums">
          <thead className="sticky top-0 bg-surface-alt border-b border-rule z-10">
            <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="w-8 px-2 py-2"><input type="checkbox" /></th>
              <Th k="engineer"    label="Engineer"             sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("engineer")} />
              <Th k="week"        label="Week"                 sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("week")} />
              <Th k="project"     label="Project"              sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("project")} />
              <Th k="hours"       label="Hours"       align="right" sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("hours")} />
              <Th k="billable"    label="Billable"    align="right" sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("billable")} />
              <Th k="nonBillable" label="Non-Billable" align="right" sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("nonBillable")} />
              <Th k="status"      label="Status"               sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("status")} />
              <Th k="submitted"   label="Submitted"            sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("submitted")} />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const onBench = r.project === BENCH;
              const heavyNonBillable = r.hours > 0 && r.nonBillable / r.hours > 0.5;
              return (
                <tr
                  key={r.id}
                  onClick={() => toast(`Timesheet detail — Phase 2 (${r.engineer} · ${r.week})`)}
                  className={cn(
                    "border-b border-rule cursor-pointer h-8 transition-colors",
                    onBench ? "bg-muted/40 hover:bg-muted/60" : "hover:bg-surface-hover",
                  )}
                >
                  <td className="px-2" onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
                  <td className="px-3 font-medium text-navy">{r.engineer}</td>
                  <td className="px-3 text-muted-foreground">{r.week}</td>
                  <td className={cn("px-3", onBench ? "italic text-muted-foreground" : "")}>{r.project}</td>
                  <td className="px-3 text-right font-medium">{r.hours}</td>
                  <td className="px-3 text-right">{r.billable}</td>
                  <td className={cn(
                    "px-3 text-right",
                    heavyNonBillable && "bg-warning/15 text-warning font-semibold",
                  )}>{r.nonBillable}</td>
                  <td className="px-3"><Tag tone={STATUS_TONE[r.status]}>{r.status}</Tag></td>
                  <td className="px-3 text-muted-foreground">{r.submitted ? fmtDate(r.submitted) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "red" | "green" | "amber" }) {
  return (
    <div className="bg-surface px-4 py-2 h-[60px] flex flex-col justify-center">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</div>
      <div className={cn(
        "text-[15px] font-bold tabular-nums",
        tone === "red" ? "text-danger" :
        tone === "green" ? "text-success" :
        tone === "amber" ? "text-warning" : "text-navy",
      )}>{value}</div>
    </div>
  );
}

function Th({ k, label, sortKey, sortDir, onClick, align = "left" }: { k: SortKey; label: string; sortKey: SortKey; sortDir: "asc" | "desc"; onClick: () => void; align?: "left" | "right" }) {
  const active = sortKey === k;
  return (
    <th className={cn("px-3 py-2 font-semibold cursor-pointer select-none whitespace-nowrap", align === "right" ? "text-right" : "text-left")} onClick={onClick}>
      <span className="inline-flex items-center gap-1 hover:text-foreground">
        {label}
        {active && (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
      </span>
    </th>
  );
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-6 px-2 text-[12px] rounded-sm border transition-colors",
        active ? "bg-navy text-primary-foreground border-navy" : "bg-surface text-foreground border-rule hover:bg-surface-hover",
      )}
    >
      {children}
    </button>
  );
}
