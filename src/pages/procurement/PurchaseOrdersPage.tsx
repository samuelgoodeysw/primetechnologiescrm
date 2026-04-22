// Procurement > Purchase Orders — list view.
import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, List } from "lucide-react";
import { toast } from "sonner";
import { Tag, type Tone } from "@/components/odoo/Tag";
import { fmtAED, fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type POStatus =
  | "Draft" | "Sent" | "Acknowledged" | "In Production"
  | "Shipped" | "Received" | "Invoiced" | "Delayed";

const STATUS_TONE: Record<POStatus, Tone> = {
  Draft: "grey",
  Sent: "blue",
  Acknowledged: "blue",
  "In Production": "amber",
  Shipped: "purple",
  Received: "green",
  Invoiced: "green",
  Delayed: "red",
};

interface PORow {
  id: string;
  supplier: string;
  project: string;
  value: number;
  poDate: string;
  expected: string;
  status: POStatus;
}

const ROWS: PORow[] = [
  { id: "PO-2026-0112", supplier: "KingAir (Taiwan)",  project: "Meraas Tower B4",     value: 2_100_000, poDate: "2026-04-14", expected: "2026-04-28", status: "Shipped" },
  { id: "PO-2026-0108", supplier: "Thomas & Betts",    project: "Sobha Hartland 7",    value: 1_400_000, poDate: "2026-04-08", expected: "2026-05-02", status: "Delayed" },
  { id: "PO-2026-0104", supplier: "Vibro-Acoustics",   project: "Saadiyat Hotel",      value:   890_000, poDate: "2026-04-02", expected: "2026-04-25", status: "In Production" },
  { id: "PO-2026-0099", supplier: "ACME",              project: "Expo City Phase 2",   value: 3_200_000, poDate: "2026-03-28", expected: "2026-05-05", status: "Acknowledged" },
  { id: "PO-2026-0095", supplier: "KingAir (Taiwan)",  project: "NEOM Line Plot-42",   value: 1_800_000, poDate: "2026-03-24", expected: "2026-05-15", status: "In Production" },
  { id: "PO-2026-0091", supplier: "Filterine",         project: "ALEC Tower A",        value:   420_000, poDate: "2026-03-20", expected: "2026-04-18", status: "Received" },
  { id: "PO-2026-0088", supplier: "Siemens",           project: "NEOM Line Plot-42",   value: 2_400_000, poDate: "2026-03-15", expected: "2026-05-20", status: "Acknowledged" },
  { id: "PO-2026-0084", supplier: "Vibro-Acoustics",   project: "ALEC Tower A",        value:   310_000, poDate: "2026-03-12", expected: "2026-04-10", status: "Invoiced" },
  { id: "PO-2026-0079", supplier: "Thomas & Betts",    project: "Al Naboodah HQ",      value:   640_000, poDate: "2026-03-08", expected: "2026-04-05", status: "Received" },
  { id: "PO-2026-0075", supplier: "ACME",              project: "Sobha Hartland 7",    value: 1_150_000, poDate: "2026-03-04", expected: "2026-04-28", status: "In Production" },
  { id: "PO-2026-0071", supplier: "KingAir (Taiwan)",  project: "Expo City Phase 2",   value: 1_680_000, poDate: "2026-02-28", expected: "2026-05-12", status: "Sent" },
  { id: "PO-2026-0066", supplier: "Trosten",           project: "Meraas Tower B4",     value:   380_000, poDate: "2026-02-20", expected: "2026-03-18", status: "Invoiced" },
];

type SortKey = "id" | "supplier" | "project" | "value" | "poDate" | "expected" | "status";
type FilterChip = "all" | "open" | "delivered" | "overdue" | "month";

const TODAY = new Date("2026-04-20");

export default function PurchaseOrdersPage() {
  const [sortKey, setSortKey] = useState<SortKey>("poDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterChip>("all");

  const rows = useMemo(() => {
    let r = [...ROWS];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((x) => x.id.toLowerCase().includes(q) || x.supplier.toLowerCase().includes(q));
    }
    if (filter === "open") r = r.filter((x) => !["Received", "Invoiced"].includes(x.status));
    if (filter === "delivered") r = r.filter((x) => ["Received", "Invoiced"].includes(x.status));
    if (filter === "overdue") r = r.filter((x) => x.status === "Delayed" || (new Date(x.expected) < TODAY && !["Received", "Invoiced"].includes(x.status)));
    if (filter === "month") r = r.filter((x) => new Date(x.poDate).getMonth() === TODAY.getMonth() && new Date(x.poDate).getFullYear() === TODAY.getFullYear());

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
        <Button size="sm" onClick={() => toast("Create PO — coming in Phase 2")} className="h-7 px-3 text-[12px] font-semibold">+ Create</Button>
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

      {/* Filter bar */}
      <div className="flex items-center gap-3 h-10 px-4 border-b border-rule bg-surface-alt">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search purchase orders..."
          className="h-7 w-64 px-2 text-[12px] bg-surface border border-rule rounded-sm outline-none focus:border-navy"
        />
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Filter:</span>
          {(["all", "open", "delivered", "overdue", "month"] as FilterChip[]).map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "open" ? "Open POs" : f === "delivered" ? "Delivered" : f === "overdue" ? "Overdue" : "This Month"}
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
              <Th k="id"       label="PO #"             sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("id")} />
              <Th k="supplier" label="Supplier"         sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("supplier")} />
              <Th k="project"  label="Project"          sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("project")} />
              <Th k="value"    label="Value (AED)"  align="right" sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("value")} />
              <Th k="poDate"   label="PO Date"          sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("poDate")} />
              <Th k="expected" label="Expected Delivery" sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("expected")} />
              <Th k="status"   label="Status"           sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("status")} />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const overdueDate = new Date(r.expected) < TODAY && !["Received", "Invoiced"].includes(r.status);
              return (
                <tr
                  key={r.id}
                  onClick={() => toast(`PO detail view coming soon — ${r.id}`)}
                  className={cn(
                    "border-b border-rule cursor-pointer h-8 transition-colors",
                    r.status === "Delayed" && "bg-danger/5 hover:bg-danger/10",
                    (r.status === "Received" || r.status === "Invoiced") && "bg-success/5 hover:bg-success/10",
                    !["Delayed", "Received", "Invoiced"].includes(r.status) && "hover:bg-surface-hover",
                  )}
                >
                  <td className="px-2" onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
                  <td className="px-3 font-medium text-navy">{r.id}</td>
                  <td className="px-3">{r.supplier}</td>
                  <td className="px-3 text-muted-foreground">{r.project}</td>
                  <td className="px-3 text-right font-medium">{fmtAED(r.value).replace("AED ", "")}</td>
                  <td className="px-3 text-muted-foreground">{fmtDate(r.poDate)}</td>
                  <td className={cn("px-3", overdueDate ? "text-danger font-medium" : "text-muted-foreground")}>{fmtDate(r.expected)}</td>
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
