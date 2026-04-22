// Accounting > Supplier Bills — list view.
import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, List } from "lucide-react";
import { toast } from "sonner";
import { Tag, type Tone } from "@/components/odoo/Tag";
import { fmtAED, fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Status = "Draft" | "Awaiting Payment" | "Scheduled" | "Paid" | "Overdue";

const STATUS_TONE: Record<Status, Tone> = {
  Draft: "grey",
  "Awaiting Payment": "blue",
  Scheduled: "amber",
  Paid: "green",
  Overdue: "red",
};

interface BillRow {
  id: string;
  supplier: string;
  project: string;
  amount: number;
  billDate: string;
  dueDate: string;
  daysToDue: number;
  status: Status;
}

const ROWS: BillRow[] = [
  { id: "BILL-KA-8934", supplier: "KingAir (Taiwan)",  project: "Meraas Tower B4",    amount: 2_100_000, billDate: "2026-04-15", dueDate: "2026-04-24", daysToDue:   4, status: "Awaiting Payment" },
  { id: "BILL-TB-4421", supplier: "Thomas & Betts",    project: "Sobha Hartland 7",   amount: 1_400_000, billDate: "2026-04-10", dueDate: "2026-04-29", daysToDue:   9, status: "Awaiting Payment" },
  { id: "BILL-VA-2285", supplier: "Vibro-Acoustics",   project: "Saadiyat Hotel",     amount:   890_000, billDate: "2026-04-05", dueDate: "2026-05-02", daysToDue:  12, status: "Awaiting Payment" },
  { id: "BILL-AC-7733", supplier: "ACME",              project: "Expo City Phase 2",  amount: 3_200_000, billDate: "2026-03-28", dueDate: "2026-05-08", daysToDue:  18, status: "Scheduled" },
  { id: "BILL-FL-1102", supplier: "Filterine",         project: "NEOM Line Plot-42",  amount:   420_000, billDate: "2026-03-22", dueDate: "2026-05-15", daysToDue:  25, status: "Scheduled" },
  { id: "BILL-SM-0931", supplier: "Siemens",           project: "NEOM Line Plot-42",  amount: 1_800_000, billDate: "2026-03-18", dueDate: "2026-05-20", daysToDue:  30, status: "Scheduled" },
  { id: "BILL-KA-8912", supplier: "KingAir (Taiwan)",  project: "Expo City Phase 2",  amount: 1_680_000, billDate: "2026-03-12", dueDate: "2026-04-10", daysToDue: -10, status: "Overdue" },
  { id: "BILL-VA-2270", supplier: "Vibro-Acoustics",   project: "ALEC Tower A",       amount:   310_000, billDate: "2026-03-08", dueDate: "2026-04-06", daysToDue: -14, status: "Paid" },
  { id: "BILL-TB-4398", supplier: "Thomas & Betts",    project: "Al Naboodah HQ",     amount:   640_000, billDate: "2026-03-05", dueDate: "2026-04-02", daysToDue: -18, status: "Paid" },
  { id: "BILL-AC-7719", supplier: "ACME",              project: "Sobha Hartland 7",   amount: 1_150_000, billDate: "2026-02-28", dueDate: "2026-03-27", daysToDue: -24, status: "Paid" },
];

type SortKey = "id" | "supplier" | "project" | "amount" | "billDate" | "dueDate" | "daysToDue" | "status";
type FilterChip = "all" | "topay" | "overdue" | "paid" | "month";

const TODAY = new Date("2026-04-20");

export default function SupplierBillsPage() {
  const [sortKey, setSortKey] = useState<SortKey>("billDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterChip>("all");

  const rows = useMemo(() => {
    let r = [...ROWS];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((x) => x.id.toLowerCase().includes(q) || x.supplier.toLowerCase().includes(q));
    }
    if (filter === "topay") r = r.filter((x) => ["Awaiting Payment", "Scheduled"].includes(x.status));
    if (filter === "overdue") r = r.filter((x) => x.status === "Overdue");
    if (filter === "paid") r = r.filter((x) => x.status === "Paid");
    if (filter === "month") r = r.filter((x) => new Date(x.billDate).getMonth() === TODAY.getMonth() && new Date(x.billDate).getFullYear() === TODAY.getFullYear());

    const dir = sortDir === "asc" ? 1 : -1;
    return r.sort((A, B) => {
      const a = A[sortKey], b = B[sortKey];
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
        <Button size="sm" onClick={() => toast("Create bill — Phase 2")} className="h-7 px-3 text-[12px] font-semibold">+ Create</Button>
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
        <Kpi label="Total Payables" value="AED 28.4M" />
        <Kpi label="Due This Week" value="AED 6.2M" tone="amber" />
        <Kpi label="Overdue" value="AED 1.8M" tone="red" />
        <Kpi label="Early Pay Discounts" value="AED 142K" tone="green" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 h-10 px-4 border-b border-rule bg-surface-alt">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bills..."
          className="h-7 w-64 px-2 text-[12px] bg-surface border border-rule rounded-sm outline-none focus:border-navy"
        />
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Filter:</span>
          {(["all", "topay", "overdue", "paid", "month"] as FilterChip[]).map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "topay" ? "To Pay" : f === "month" ? "This Month" : f.charAt(0).toUpperCase() + f.slice(1)}
            </Chip>
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Group by:</span>
          <Chip>Supplier</Chip><Chip>Project</Chip><Chip>Status</Chip>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-surface">
        <table className="w-full text-[13px] tabular-nums">
          <thead className="sticky top-0 bg-surface-alt border-b border-rule z-10">
            <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="w-8 px-2 py-2"><input type="checkbox" /></th>
              <Th k="id"        label="Bill #"           sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("id")} />
              <Th k="supplier"  label="Supplier"         sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("supplier")} />
              <Th k="project"   label="Project"          sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("project")} />
              <Th k="amount"    label="Amount (AED)" align="right" sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("amount")} />
              <Th k="billDate"  label="Bill Date"        sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("billDate")} />
              <Th k="dueDate"   label="Due Date"         sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("dueDate")} />
              <Th k="daysToDue" label="Days to Due" align="right" sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("daysToDue")} />
              <Th k="status"    label="Status"           sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("status")} />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const paid = r.status === "Paid";
              const overdue = r.status === "Overdue";
              const dueThisWeek = !paid && !overdue && r.daysToDue >= 0 && r.daysToDue <= 7;
              return (
                <tr
                  key={r.id}
                  onClick={() => toast(`Bill detail — Phase 2 (${r.id})`)}
                  className={cn(
                    "border-b border-rule cursor-pointer h-8 transition-colors",
                    overdue && "bg-danger/5 hover:bg-danger/10",
                    dueThisWeek && "bg-warning/5 hover:bg-warning/10",
                    paid && "italic text-muted-foreground hover:bg-surface-hover",
                    !overdue && !dueThisWeek && !paid && "hover:bg-surface-hover",
                  )}
                >
                  <td className="px-2" onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
                  <td className={cn("px-3 font-medium", paid ? "text-muted-foreground" : "text-navy")}>{r.id}</td>
                  <td className="px-3">{r.supplier}</td>
                  <td className="px-3 text-muted-foreground">{r.project}</td>
                  <td className="px-3 text-right font-medium">{fmtAED(r.amount).replace("AED ", "")}</td>
                  <td className="px-3 text-muted-foreground">{fmtDate(r.billDate)}</td>
                  <td className="px-3 text-muted-foreground">{fmtDate(r.dueDate)}</td>
                  <td className={cn(
                    "px-3 text-right font-medium",
                    paid ? "text-muted-foreground" :
                    r.daysToDue < 0 ? "text-danger" :
                    r.daysToDue <= 7 ? "text-warning" : "text-foreground",
                  )}>
                    {r.daysToDue}
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
