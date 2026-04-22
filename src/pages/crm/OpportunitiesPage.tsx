// CRM > Opportunities — list view (default) and Kanban via ?view=kanban.
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronUp, ChevronDown, Search, Filter, ListTree, Star, ChevronRight, ChevronLeft, List, LayoutGrid, BarChart3, Calendar } from "lucide-react";
import { useAppState } from "@/state/AppState";
import { Tag } from "@/components/odoo/Tag";
import { fmtAED, fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Opportunity, OpportunityStage } from "@/state/types";
import { OPP_STAGES_FULL, stageTone } from "@/state/crm";
import { CreateOpportunityDialog } from "./CreateOpportunityDialog";
import { OpportunityKanban } from "./OpportunityKanban";

type SortKey = "name" | "client" | "consultant" | "value" | "stage" | "engineer" | "expectedClose";

export default function OpportunitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") === "kanban" ? "kanban" : "list";
  const navigate = useNavigate();
  const { state, clientById, employeeById } = useAppState();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, boolean>>({});
  const [groupBy, setGroupBy] = useState<"" | "stage" | "engineer" | "consultant" | "client">("");
  const [sortKey, setSortKey] = useState<SortKey>("expectedClose");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [createOpen, setCreateOpen] = useState(false);

  const me = state.currentUserId;

  const filtered = useMemo(() => {
    let rows = state.opportunities.slice();
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((o) => {
        const c = clientById(o.clientId);
        return o.name.toLowerCase().includes(q) || c?.name.toLowerCase().includes(q);
      });
    }
    if (filters.mine) rows = rows.filter((o) => o.engineerId === me);
    if (filters.month) rows = rows.filter((o) => o.expectedClose.startsWith("2026-04") || o.expectedClose.startsWith("2026-05"));
    if (filters.hot) rows = rows.filter((o) => o.tags?.includes("Hot"));
    if (filters.lost) rows = rows.filter((o) => o.stage === "Lost");
    return rows;
  }, [state.opportunities, search, filters, clientById, me]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const A = sortVal(a, sortKey, clientById, employeeById);
      const B = sortVal(b, sortKey, clientById, employeeById);
      if (A < B) return -1 * dir;
      if (A > B) return 1 * dir;
      return 0;
    });
  }, [filtered, sortKey, sortDir, clientById, employeeById]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  }

  const grouped = useMemo(() => {
    if (!groupBy) return null;
    const map: Record<string, Opportunity[]> = {};
    sorted.forEach((o) => {
      let k: string;
      switch (groupBy) {
        case "stage": k = o.stage; break;
        case "engineer": k = employeeById(o.engineerId)?.name ?? "—"; break;
        case "consultant": k = o.consultant; break;
        case "client": k = clientById(o.clientId)?.name ?? "—"; break;
      }
      (map[k] ||= []).push(o);
    });
    return map;
  }, [sorted, groupBy, employeeById, clientById]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Action bar */}
      <div className="flex items-center gap-2 h-10 px-4 border-b border-rule bg-surface">
        <Button size="sm" onClick={() => setCreateOpen(true)} className="h-7 px-3 text-[12px] font-semibold">+ Create</Button>
        <button className="text-[12px] text-muted-foreground hover:text-foreground px-2 h-7 rounded-sm hover:bg-surface-hover">⌄ Action</button>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1 text-[12px] text-muted-foreground tabular-nums">
            <span>1-{sorted.length} / {sorted.length}</span>
            <button className="h-6 w-6 hover:bg-surface-hover rounded-sm grid place-items-center"><ChevronLeft className="h-3.5 w-3.5" /></button>
            <button className="h-6 w-6 hover:bg-surface-hover rounded-sm grid place-items-center"><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
          <div className="flex items-center border border-rule rounded-sm overflow-hidden">
            {([
              { v: "list", Icon: List }, { v: "kanban", Icon: LayoutGrid },
              { v: "graph", Icon: BarChart3 }, { v: "calendar", Icon: Calendar },
            ] as const).map(({ v, Icon }) => (
              <button key={v}
                onClick={() => setSearchParams(v === "list" ? {} : { view: v })}
                className={cn("h-7 w-7 grid place-items-center transition-colors",
                  view === v ? "bg-navy text-primary-foreground" : "text-muted-foreground hover:bg-surface-hover")}>
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 h-10 px-4 border-b border-rule bg-surface-alt flex-wrap">
        <div className="flex items-center gap-1.5 w-60">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search opportunities…"
            className="bg-transparent outline-none text-[13px] flex-1 placeholder:text-muted-foreground" />
        </div>
        <ChipGroup icon={Filter} label="Filters" chips={[
          { label: "My Opportunities", active: !!filters.mine, onClick: () => setFilters((f) => ({ ...f, mine: !f.mine })) },
          { label: "This Month",       active: !!filters.month, onClick: () => setFilters((f) => ({ ...f, month: !f.month })) },
          { label: "Hot Leads",        active: !!filters.hot,   onClick: () => setFilters((f) => ({ ...f, hot: !f.hot })) },
          { label: "Lost",             active: !!filters.lost,  onClick: () => setFilters((f) => ({ ...f, lost: !f.lost })) },
        ]} />
        <ChipGroup icon={ListTree} label="Group By" chips={[
          { label: "Stage",      active: groupBy === "stage",      onClick: () => setGroupBy(groupBy === "stage" ? "" : "stage") },
          { label: "Engineer",   active: groupBy === "engineer",   onClick: () => setGroupBy(groupBy === "engineer" ? "" : "engineer") },
          { label: "Consultant", active: groupBy === "consultant", onClick: () => setGroupBy(groupBy === "consultant" ? "" : "consultant") },
          { label: "Client",     active: groupBy === "client",     onClick: () => setGroupBy(groupBy === "client" ? "" : "client") },
        ]} />
        <button className="ml-auto text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1">
          <Star className="h-3.5 w-3.5" /> Favorites
        </button>
      </div>

      {/* Body */}
      {view === "kanban" ? (
        <OpportunityKanban opportunities={sorted} />
      ) : (
        <div className="flex-1 overflow-auto bg-surface">
          <table className="w-full text-[13px] tabular-nums">
            <thead className="sticky top-0 bg-surface-alt border-b border-rule z-10">
              <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="w-8 px-2 py-2"><input type="checkbox" /></th>
                <Th k="name"          label="Opportunity"   sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("name")} />
                <Th k="client"        label="Client"        sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("client")} />
                <Th k="consultant"    label="Consultant"    sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("consultant")} />
                <Th k="value"         label="Value (AED)"   align="right" sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("value")} />
                <Th k="stage"         label="Stage"         sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("stage")} />
                <Th k="engineer"      label="Engineer"      sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("engineer")} />
                <th className="px-3 py-2 text-left font-semibold">Next Activity</th>
                <Th k="expectedClose" label="Expected Close" sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("expectedClose")} />
              </tr>
            </thead>
            <tbody>
              {!grouped && sorted.map((o) => <OppRow key={o.id} o={o} onOpen={() => navigate(`/crm/opportunities/${o.id}`)} />)}
              {grouped && Object.entries(grouped).map(([groupName, items]) => (
                <GroupRows key={groupName} name={groupName} items={items} navigate={navigate} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateOpportunityDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

function sortVal(o: Opportunity, k: SortKey, clientById: (id: string) => any, employeeById: (id: string) => any) {
  switch (k) {
    case "name": return o.name;
    case "client": return clientById(o.clientId)?.name ?? "";
    case "consultant": return o.consultant;
    case "value": return o.value;
    case "stage": return o.stage;
    case "engineer": return employeeById(o.engineerId)?.name ?? "";
    case "expectedClose": return o.expectedClose;
  }
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

function OppRow({ o, onOpen }: { o: Opportunity; onOpen: () => void }) {
  const { clientById, employeeById } = useAppState();
  const client = clientById(o.clientId);
  const eng = employeeById(o.engineerId);
  return (
    <tr onClick={onOpen} className="border-b border-rule hover:bg-surface-hover cursor-pointer h-8">
      <td className="px-2" onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
      <td className="px-3 font-medium text-foreground">{o.name}</td>
      <td className="px-3 text-foreground">{client?.name}</td>
      <td className="px-3 text-muted-foreground">{o.consultant}</td>
      <td className="px-3 text-right font-medium">{fmtAED(o.value).replace("AED ", "")}</td>
      <td className="px-3"><Tag tone={stageTone(o.stage)}>{o.stage}</Tag></td>
      <td className="px-3">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-5 w-5 rounded-full bg-navy text-primary-foreground text-[9px] font-semibold grid place-items-center">{eng?.initials}</span>
          <span className="text-foreground">{eng?.name}</span>
        </span>
      </td>
      <td className="px-3 text-muted-foreground">{o.nextActivity || "—"}</td>
      <td className="px-3 text-muted-foreground">{o.stage === "Won" ? `Closed ${fmtDate(o.expectedClose)}` : o.stage === "Lost" ? `Lost ${fmtDate(o.expectedClose)}` : fmtDate(o.expectedClose)}</td>
    </tr>
  );
}

function GroupRows({ name, items, navigate }: { name: string; items: Opportunity[]; navigate: (p: string) => void }) {
  const [open, setOpen] = useState(true);
  const total = items.reduce((s, o) => s + o.value, 0);
  return (
    <>
      <tr className="bg-surface-alt border-b border-rule cursor-pointer" onClick={() => setOpen((v) => !v)}>
        <td colSpan={9} className="px-3 py-1.5">
          <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-foreground">
            {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {name}
            <span className="text-muted-foreground font-normal">({items.length}) — {fmtAED(total, { compact: true })}</span>
          </span>
        </td>
      </tr>
      {open && items.map((o) => <OppRow key={o.id} o={o} onOpen={() => navigate(`/crm/opportunities/${o.id}`)} />)}
    </>
  );
}

interface Chip { label: string; active?: boolean; onClick?: () => void; }
function ChipGroup({ icon: Icon, label, chips }: { icon: typeof Filter; label: string; chips: Chip[] }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}:</span>
      {chips.map((c) => (
        <button key={c.label} onClick={c.onClick}
          className={cn("h-6 px-2 text-[12px] rounded-sm border transition-colors",
            c.active ? "bg-navy text-primary-foreground border-navy" : "bg-surface text-foreground border-rule hover:bg-surface-hover")}>
          {c.label}
        </button>
      ))}
    </div>
  );
}

// Re-export so route can lazy-load
export { OPP_STAGES_FULL };
export type { OpportunityStage };
