// Customer Invoices — list view shared between /accounting and /sales.
import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, List } from "lucide-react";
import { toast } from "sonner";
import { Tag, type Tone } from "@/components/odoo/Tag";
import { fmtAED, fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Status = "Draft" | "Posted" | "Partially Paid" | "Paid" | "Overdue";

const STATUS_TONE: Record<Status, Tone> = {
  Draft: "grey",
  Posted: "blue",
  "Partially Paid": "amber",
  Paid: "green",
  Overdue: "red",
};

interface InvRow {
  id: string;
  client: string;
  project: string;
  amount: number;
  invoiceDate: string;
  dueDate: string;
  daysOverdue: number | null;
  status: Status;
}

const ROWS: InvRow[] = [
  { id: "INV-2024-089", client: "Al Futtaim Carillion", project: "Meraas Tower B4",         amount: 4_800_000, invoiceDate: "2025-12-18", dueDate: "2026-02-17", daysOverdue: 62, status: "Overdue" },
  { id: "INV-2025-012", client: "Al Futtaim Carillion", project: "Al Futtaim Mall Sharjah", amount: 2_100_000, invoiceDate: "2026-01-05", dueDate: "2026-03-06", daysOverdue: 45, status: "Overdue" },
  { id: "INV-2025-034", client: "Miral Asset Mgmt",     project: "Saadiyat Hotel",          amount: 2_400_000, invoiceDate: "2026-01-22", dueDate: "2026-03-23", daysOverdue: 28, status: "Overdue" },
  { id: "INV-2025-041", client: "Sobha Realty",         project: "Sobha Hartland 7",        amount: 1_900_000, invoiceDate: "2026-02-02", dueDate: "2026-04-03", daysOverdue: 17, status: "Overdue" },
  { id: "INV-2025-045", client: "Al Futtaim Carillion", project: "Festival City Plaza",     amount: 1_800_000, invoiceDate: "2026-02-14", dueDate: "2026-04-15", daysOverdue: 5,  status: "Overdue" },
  { id: "INV-2025-058", client: "Arabtec Construction", project: "Arabtec Marsa Tower",     amount: 2_100_000, invoiceDate: "2026-02-25", dueDate: "2026-04-26", daysOverdue: null, status: "Posted" },
  { id: "INV-2025-067", client: "Al Futtaim Carillion", project: "Carillion Warehouse AD",  amount: 1_200_000, invoiceDate: "2026-02-28", dueDate: "2026-04-29", daysOverdue: null, status: "Posted" },
  { id: "INV-2025-072", client: "ALEC Engineering",     project: "ALEC Tower A",            amount: 2_800_000, invoiceDate: "2026-03-05", dueDate: "2026-05-04", daysOverdue: null, status: "Partially Paid" },
  { id: "INV-2025-078", client: "Al Futtaim Carillion", project: "Al Futtaim Mall Sharjah", amount:   600_000, invoiceDate: "2026-03-12", dueDate: "2026-05-11", daysOverdue: null, status: "Posted" },
  { id: "INV-2025-084", client: "Emaar Construction",   project: "Creek Harbour T4",        amount: 1_400_000, invoiceDate: "2026-03-20", dueDate: "2026-05-19", daysOverdue: null, status: "Posted" },
  { id: "INV-2025-091", client: "Bechtel JV (NEOM)",    project: "NEOM Line Plot-42",       amount: 3_200_000, invoiceDate: "2026-03-28", dueDate: "2026-05-27", daysOverdue: null, status: "Posted" },
  { id: "INV-2025-097", client: "Al Naboodah",          project: "Al Naboodah HQ",          amount:   890_000, invoiceDate: "2026-04-04", dueDate: "2026-06-03", daysOverdue: null, status: "Posted" },
  { id: "INV-2025-102", client: "Nakheel",              project: "Nakheel Deira Islands",   amount: 1_100_000, invoiceDate: "2026-04-10", dueDate: "2026-06-09", daysOverdue: null, status: "Posted" },
  { id: "INV-2025-108", client: "Expo City Dubai",      project: "Expo City Phase 2",       amount: 1_680_000, invoiceDate: "2026-04-16", dueDate: "2026-06-15", daysOverdue: null, status: "Draft" },
];

type SortKey = "id" | "client" | "project" | "amount" | "invoiceDate" | "dueDate" | "daysOverdue" | "status";
type FilterChip = "all" | "draft" | "posted" | "overdue" | "paid" | "month";

const TODAY = new Date("2026-04-20");

export default function CustomerInvoicesPage() {
  const [sortKey, setSortKey] = useState<SortKey>("invoiceDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterChip>("all");

  const rows = useMemo(() => {
    let r = [...ROWS];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((x) => x.id.toLowerCase().includes(q) || x.client.toLowerCase().includes(q) || x.project.toLowerCase().includes(q));
    }
    if (filter === "draft") r = r.filter((x) => x.status === "Draft");
    if (filter === "posted") r = r.filter((x) => x.status === "Posted");
    if (filter === "overdue") r = r.filter((x) => x.status === "Overdue");
    if (filter === "paid") r = r.filter((x) => x.status === "Paid" || x.status === "Partially Paid");
    if (filter === "month") r = r.filter((x) => new Date(x.invoiceDate).getMonth() === TODAY.getMonth() && new Date(x.invoiceDate).getFullYear() === TODAY.getFullYear());

    const dir = sortDir === "asc" ? 1 : -1;
    return r.sort((A, B) => {
      const a = A[sortKey] ?? -Infinity;
      const b = B[sortKey] ?? -Infinity;
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
        <Button size="sm" onClick={() => toast("Create invoice — Phase 2")} className="h-7 px-3 text-[12px] font-semibold">+ Create</Button>
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
        <Kpi label="Total Outstanding" value="AED 61.1M" />
        <Kpi label="Overdue" value="AED 18.0M" tone="red" />
        <Kpi label="Posted This Month" value="AED 14.2M" />
        <Kpi label="Collected This Month" value="AED 9.8M" tone="green" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 h-10 px-4 border-b border-rule bg-surface-alt">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search invoices..."
          className="h-7 w-64 px-2 text-[12px] bg-surface border border-rule rounded-sm outline-none focus:border-navy"
        />
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Filter:</span>
          {(["all", "draft", "posted", "overdue", "paid", "month"] as FilterChip[]).map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "month" ? "This Month" : f.charAt(0).toUpperCase() + f.slice(1)}
            </Chip>
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Group by:</span>
          <Chip>Client</Chip><Chip>Project</Chip><Chip>Status</Chip>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-surface">
        <table className="w-full text-[13px] tabular-nums">
          <thead className="sticky top-0 bg-surface-alt border-b border-rule z-10">
            <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="w-8 px-2 py-2"><input type="checkbox" /></th>
              <Th k="id"          label="Invoice #"        sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("id")} />
              <Th k="client"      label="Client"           sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("client")} />
              <Th k="project"     label="Project"          sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("project")} />
              <Th k="amount"      label="Amount (AED)" align="right" sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("amount")} />
              <Th k="invoiceDate" label="Invoice Date"     sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("invoiceDate")} />
              <Th k="dueDate"     label="Due Date"         sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("dueDate")} />
              <Th k="daysOverdue" label="Days Overdue" align="right" sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("daysOverdue")} />
              <Th k="status"      label="Status"           sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("status")} />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const paid = r.status === "Paid";
              return (
                <tr
                  key={r.id}
                  onClick={() => toast(`Invoice detail — Phase 2 (${r.id})`)}
                  className={cn(
                    "border-b border-rule cursor-pointer h-8 transition-colors",
                    r.status === "Overdue" && "bg-danger/5 hover:bg-danger/10",
                    paid && "italic text-muted-foreground hover:bg-surface-hover",
                    !["Overdue"].includes(r.status) && !paid && "hover:bg-surface-hover",
                  )}
                >
                  <td className="px-2" onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
                  <td className={cn("px-3 font-medium", paid ? "text-muted-foreground" : "text-navy")}>{r.id}</td>
                  <td className="px-3">{r.client}</td>
                  <td className="px-3 text-muted-foreground">{r.project}</td>
                  <td className="px-3 text-right font-medium">{fmtAED(r.amount).replace("AED ", "")}</td>
                  <td className="px-3 text-muted-foreground">{fmtDate(r.invoiceDate)}</td>
                  <td className="px-3 text-muted-foreground">{fmtDate(r.dueDate)}</td>
                  <td className={cn("px-3 text-right", r.daysOverdue != null ? "text-danger font-semibold" : "text-muted-foreground")}>
                    {r.daysOverdue ?? "—"}
                  </td>
                  <td className="px-3"><Tag tone={STATUS_TONE[r.status]}>{r.status}</Tag></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "red" | "green" }) {
  return (
    <div className="bg-surface px-4 py-2 h-[60px] flex flex-col justify-center">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</div>
      <div className={cn(
        "text-[15px] font-bold tabular-nums",
        tone === "red" ? "text-danger" : tone === "green" ? "text-success" : "text-navy",
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
