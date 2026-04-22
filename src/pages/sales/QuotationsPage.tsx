// Sales > Quotations — list view.
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, List, BarChart3 } from "lucide-react";
import { useAppState } from "@/state/AppState";
import { Tag, type Tone } from "@/components/odoo/Tag";
import { fmtAED, fmtDate } from "@/lib/format";
import { calcQuote } from "@/state/calc";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuoteStatus } from "@/state/types";

type SortKey = "id" | "client" | "engineer" | "issueDate" | "total" | "margin" | "status";

const STATUS_TONE: Record<QuoteStatus, Tone> = {
  Draft: "grey", Sent: "blue", "Under Discussion": "amber",
  Won: "green", Lost: "red", Expired: "grey",
};

export default function QuotationsPage() {
  const navigate = useNavigate();
  const { state, clientById, employeeById, opportunityById } = useAppState();
  const [sortKey, setSortKey] = useState<SortKey>("issueDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const rows = useMemo(() => {
    const enriched = state.quotes.map((q) => {
      const c = calcQuote(q);
      return { q, total: c.subtotal, margin: c.marginPct };
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return enriched.sort((A, B) => {
      let a: any, b: any;
      switch (sortKey) {
        case "id": a = A.q.id; b = B.q.id; break;
        case "client": a = clientById(A.q.clientId)?.name; b = clientById(B.q.clientId)?.name; break;
        case "engineer": a = employeeById(A.q.engineerId)?.name; b = employeeById(B.q.engineerId)?.name; break;
        case "issueDate": a = A.q.issueDate; b = B.q.issueDate; break;
        case "total": a = A.total; b = B.total; break;
        case "margin": a = A.margin; b = B.margin; break;
        case "status": a = A.q.status; b = B.q.status; break;
      }
      if (a < b) return -1 * dir;
      if (a > b) return 1 * dir;
      return 0;
    });
  }, [state.quotes, sortKey, sortDir, clientById, employeeById]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 h-10 px-4 border-b border-rule bg-surface">
        <Button size="sm" onClick={() => navigate("/sales/quotations/new")} className="h-7 px-3 text-[12px] font-semibold">+ Create</Button>
        <button className="text-[12px] text-muted-foreground hover:text-foreground px-2 h-7 rounded-sm hover:bg-surface-hover">⌄ Action</button>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1 text-[12px] text-muted-foreground tabular-nums">
            <span>1-{rows.length} / {rows.length}</span>
            <button className="h-6 w-6 hover:bg-surface-hover rounded-sm grid place-items-center"><ChevronLeft className="h-3.5 w-3.5" /></button>
            <button className="h-6 w-6 hover:bg-surface-hover rounded-sm grid place-items-center"><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
          <div className="flex items-center border border-rule rounded-sm overflow-hidden">
            <button className="h-7 w-7 grid place-items-center bg-navy text-primary-foreground"><List className="h-3.5 w-3.5" /></button>
            <button className="h-7 w-7 grid place-items-center text-muted-foreground hover:bg-surface-hover"><BarChart3 className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-surface">
        <table className="w-full text-[13px] tabular-nums">
          <thead className="sticky top-0 bg-surface-alt border-b border-rule z-10">
            <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="w-8 px-2 py-2"><input type="checkbox" /></th>
              <Th k="id"        label="Quote #"      sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("id")} />
              <Th k="client"    label="Client"       sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("client")} />
              <th className="px-3 py-2 text-left font-semibold">Opportunity</th>
              <Th k="engineer"  label="Engineer"     sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("engineer")} />
              <Th k="issueDate" label="Issue Date"   sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("issueDate")} />
              <Th k="total"     label="Total (AED)"  align="right" sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("total")} />
              <Th k="margin"    label="Margin %"     align="right" sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("margin")} />
              <Th k="status"    label="Status"       sortKey={sortKey} sortDir={sortDir} onClick={() => toggleSort("status")} />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ q, total, margin }) => {
              const client = clientById(q.clientId);
              const eng = employeeById(q.engineerId);
              const opp = q.opportunityId ? opportunityById(q.opportunityId) : null;
              const expired = q.status === "Expired";
              return (
                <tr key={q.id} onClick={() => navigate(`/sales/quotations/${q.id}`)}
                  className={cn("border-b border-rule hover:bg-surface-hover cursor-pointer h-8", expired && "text-muted-foreground")}>
                  <td className="px-2" onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
                  <td className={cn("px-3 font-medium text-navy", expired && "line-through")}>{q.id}</td>
                  <td className="px-3">{client?.name}</td>
                  <td className="px-3 text-muted-foreground">{opp?.name ?? "—"}</td>
                  <td className="px-3">{eng?.name}</td>
                  <td className="px-3 text-muted-foreground">{fmtDate(q.issueDate)}</td>
                  <td className="px-3 text-right font-medium">{total > 0 ? fmtAED(total).replace("AED ", "") : "—"}</td>
                  <td className="px-3 text-right">{total > 0 ? `${margin.toFixed(1)}%` : "—"}</td>
                  <td className="px-3"><Tag tone={STATUS_TONE[q.status]}>{q.status}</Tag></td>
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
