// CRM > Clients — Odoo-style list view.
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, MoreVertical } from "lucide-react";
import { useAppState } from "@/state/AppState";
import { fmtAED, relativeDays } from "@/lib/format";
import { Tag, Dot } from "@/components/odoo/Tag";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Client } from "@/state/types";

function arTone(ar: number): "red" | "amber" | "green" {
  if (ar >= 6_000_000) return "red";
  if (ar >= 3_000_000) return "amber";
  return "green";
}
function scoreTone(s: number): "red" | "amber" | "green" {
  if (s < 65) return "red";
  if (s < 80) return "amber";
  return "green";
}

export default function ClientsPage() {
  const navigate = useNavigate();
  const { state, employeeById } = useAppState();
  const [q, setQ] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | "T1" | "T2" | "T3">("all");

  const rows = useMemo(() => {
    let r: Client[] = [...state.clients];
    if (tierFilter !== "all") r = r.filter((c) => c.tier === tierFilter);
    if (q) {
      const s = q.toLowerCase();
      r = r.filter((c) => c.name.toLowerCase().includes(s) || c.legalName?.toLowerCase().includes(s));
    }
    return r.sort((a, b) => b.arOutstanding - a.arOutstanding);
  }, [state.clients, q, tierFilter]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-4 py-2 border-b border-rule bg-surface flex items-center gap-3">
        <div className="text-[12px] text-muted-foreground">CRM <span className="mx-1">›</span> <span className="text-foreground font-medium">Clients</span></div>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" className="h-7 px-3 text-[12px] font-semibold">+ Create</Button>
          <button className="text-[12px] text-muted-foreground hover:text-foreground px-2 h-7 rounded-sm hover:bg-surface-hover">⌄ Action</button>
        </div>
      </div>

      <div className="px-4 h-12 border-b border-rule bg-surface-alt flex items-center gap-3">
        <div className="relative w-60">
          <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients…" className="h-7 pl-7 text-[12px]" />
        </div>
        <div className="flex items-center gap-1">
          {(["all", "T1", "T2", "T3"] as const).map((t) => (
            <button key={t} onClick={() => setTierFilter(t)}
              className={cn("h-7 px-2.5 text-[12px] rounded-sm border transition-colors",
                tierFilter === t ? "bg-navy text-primary-foreground border-navy" : "bg-surface text-muted-foreground border-rule hover:bg-surface-hover")}>
              {t === "all" ? "All Tiers" : t}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-muted-foreground ml-2">Group by:</span>
        <button className="h-7 px-2 text-[11px] rounded-sm border border-rule bg-surface text-muted-foreground hover:bg-surface-hover">Tier</button>
        <button className="h-7 px-2 text-[11px] rounded-sm border border-rule bg-surface text-muted-foreground hover:bg-surface-hover">Owner</button>
        <div className="ml-auto flex items-center gap-1 text-[12px] text-muted-foreground tabular-nums">
          <span>1-{rows.length} / {rows.length}</span>
          <Star className="h-3.5 w-3.5 ml-2" />
          <MoreVertical className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-surface">
        <table className="w-full text-[13px]">
          <thead className="sticky top-0 bg-surface-alt border-b border-rule text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-8 px-2 py-2"><input type="checkbox" /></th>
              <th className="px-2 py-2 text-left font-semibold">Client Name</th>
              <th className="px-2 py-2 text-left font-semibold">Tier</th>
              <th className="px-2 py-2 text-right font-semibold">Active Projects</th>
              <th className="px-2 py-2 text-right font-semibold">Open Quotes</th>
              <th className="px-2 py-2 text-right font-semibold">AR Outstanding (AED)</th>
              <th className="px-2 py-2 text-center font-semibold">Payment Score</th>
              <th className="px-2 py-2 text-left font-semibold">Relationship Owner</th>
              <th className="px-2 py-2 text-left font-semibold">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const owner = employeeById(c.ownerId);
              return (
                <tr key={c.id} onClick={() => navigate(`/crm/clients/${c.id}`)}
                  className="border-b border-rule hover:bg-surface-hover cursor-pointer h-8">
                  <td className="px-2"><input type="checkbox" onClick={(e) => e.stopPropagation()} /></td>
                  <td className="px-2 font-medium text-navy">{c.name}</td>
                  <td className="px-2"><Tag tone={c.tier === "T1" ? "navy" : c.tier === "T2" ? "grey" : "grey"}>{c.tier}</Tag></td>
                  <td className="px-2 text-right tabular-nums">{c.activeProjects}</td>
                  <td className="px-2 text-right tabular-nums text-muted-foreground">
                    {c.openQuotes} <span className="text-[11px]">({fmtAED(c.openQuotesValue, { compact: true }).replace("AED ", "")})</span>
                  </td>
                  <td className="px-2 text-right tabular-nums">
                    <span className="inline-flex items-center gap-1.5">
                      <Dot tone={arTone(c.arOutstanding)} />
                      <span className={cn("font-medium",
                        arTone(c.arOutstanding) === "red" && "text-danger",
                        arTone(c.arOutstanding) === "amber" && "text-warning",
                      )}>{fmtAED(c.arOutstanding, { compact: true }).replace("AED ", "")}</span>
                    </span>
                  </td>
                  <td className="px-2 text-center">
                    <span className={cn("inline-flex items-center gap-1 tabular-nums font-medium text-[12px]",
                      scoreTone(c.paymentScore) === "red" && "text-danger",
                      scoreTone(c.paymentScore) === "amber" && "text-warning",
                      scoreTone(c.paymentScore) === "green" && "text-success",
                    )}>
                      <Dot tone={scoreTone(c.paymentScore)} />
                      {c.paymentScore}/100
                    </span>
                  </td>
                  <td className="px-2 text-muted-foreground">{owner?.name ?? "—"}</td>
                  <td className="px-2 text-muted-foreground">{c.lastActivityDays === 0 ? "today" : `${c.lastActivityDays}d ago`}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">No clients match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
