// Accounting > AR Aging — portfolio receivables dashboard.
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, AlertTriangle, Download, Send, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { useAppState } from "@/state/AppState";
import { fmtAED } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Tag, Dot } from "@/components/odoo/Tag";
import { cn } from "@/lib/utils";

interface AgedRow {
  clientId: string;
  client: string;
  tier: string;
  ownerId: string;
  paymentScore: number;
  lastContactDays: number;
  b0_30: number; b31_60: number; b61_90: number; b91_120: number; b120: number;
  total: number;
}

// Per the spec: synthesised aging buckets (AED M -> AED) for the top 13 clients.
const AGING: Record<string, [number, number, number, number, number]> = {
  "c-afc":  [1.2, 2.4, 3.1, 4.8, 2.1],
  "c-sob":  [0.8, 1.6, 2.2, 1.9, 0.4],
  "c-mir":  [0.4, 0.9, 1.8, 2.4, 1.2],
  "c-arb":  [0.9, 1.2, 0.8, 2.1, 1.8],
  "c-alec": [2.1, 1.8, 0.9, 0.2, 0.0],
  "c-bjv":  [1.8, 1.6, 1.0, 0.4, 0.0],
  "c-em":   [1.8, 1.4, 0.8, 0.2, 0.0],
  "c-nab":  [1.1, 1.4, 0.7, 0.3, 0.0],
  "c-ald":  [1.0, 0.7, 0.1, 0.0, 0.0],
  "c-nak":  [0.8, 0.9, 0.5, 0.2, 0.0],
  "c-exp":  [1.1, 0.8, 0.0, 0.0, 0.0],
  "c-dam":  [1.4, 0.7, 0.0, 0.0, 0.0],
  "c-azi":  [0.9, 0.4, 0.1, 0.0, 0.0],
};

export default function ARAgingPage() {
  const navigate = useNavigate();
  const { state, employeeById } = useAppState();
  const [asOf] = useState("20 Apr 2026");

  const rows: AgedRow[] = useMemo(() => {
    return state.clients
      .map((c) => {
        const a = AGING[c.id] ?? [0, 0, 0, 0, 0];
        const M = 1_000_000;
        const r: AgedRow = {
          clientId: c.id, client: c.name, tier: c.tier, ownerId: c.ownerId,
          paymentScore: c.paymentScore, lastContactDays: c.lastActivityDays,
          b0_30: a[0] * M, b31_60: a[1] * M, b61_90: a[2] * M, b91_120: a[3] * M, b120: a[4] * M,
          total: (a[0] + a[1] + a[2] + a[3] + a[4]) * M,
        };
        return r;
      })
      .filter((r) => r.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [state.clients]);

  const totals = useMemo(() => {
    const sum = (k: keyof AgedRow) => rows.reduce((s, r) => s + (r[k] as number), 0);
    return {
      total: sum("total"),
      b0_30: sum("b0_30"),
      b31_60: sum("b31_60"),
      b61_90: sum("b61_90"),
      b91_120: sum("b91_120"),
      b120: sum("b120"),
    };
  }, [rows]);

  const arOver60 = totals.b61_90 + totals.b91_120 + totals.b120;
  const arOver90 = totals.b91_120 + totals.b120;
  const dso = 94;

  const chartData = rows.slice(0, 10).map((r) => ({
    name: r.client.length > 16 ? r.client.slice(0, 14) + "…" : r.client,
    "0-30d": r.b0_30 / 1_000_000,
    "31-60d": r.b31_60 / 1_000_000,
    "61-90d": r.b61_90 / 1_000_000,
    "91-120d": r.b91_120 / 1_000_000,
    ">120d": r.b120 / 1_000_000,
  }));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-rule bg-surface flex items-center gap-3 shrink-0">
        <div className="text-[12px] text-muted-foreground">Accounting <span className="mx-1">›</span> <span className="text-foreground font-medium">AR Aging</span></div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5 h-7 px-2 border border-rule rounded-sm text-[12px] text-muted-foreground bg-surface-alt">
            <Calendar className="h-3.5 w-3.5" /> As of {asOf}
          </div>
          <Button size="sm" variant="outline" className="h-7 text-[12px]" onClick={() => toast.success("Report exported")}><Download className="h-3.5 w-3.5 mr-1" />Export</Button>
          <Button size="sm" className="h-7 text-[12px]" onClick={() => toast.success("Report sent")}><Send className="h-3.5 w-3.5 mr-1" />Send Report</Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-surface-alt">
        <div className="p-4 space-y-4 max-w-[1500px]">
          {/* KPI strip */}
          <div className="grid grid-cols-4 gap-3">
            <Kpi label="Total AR Outstanding" value={fmtAED(totals.total, { compact: true })} />
            <Kpi label="AR > 60 days" value={fmtAED(arOver60, { compact: true })} sub={`${Math.round((arOver60 / totals.total) * 100)}% of total`} tone="amber" />
            <Kpi label="AR > 90 days" value={fmtAED(arOver90, { compact: true })} sub={`${Math.round((arOver90 / totals.total) * 100)}% of total`} tone="red" />
            <Kpi label="DSO (weighted)" value={`${dso} days`} sub="benchmark 60d · ⬆ 11d MoM" tone="amber" />
          </div>

          {/* Stacked bar chart */}
          <div className="bg-surface border border-rule rounded-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[12px] font-bold uppercase tracking-wide text-foreground">Aged Receivables — Top 10 Clients</div>
                <div className="text-[11px] text-muted-foreground">All values in AED millions</div>
              </div>
            </div>
            <div style={{ width: "100%", height: 380 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="hsl(var(--rule))" strokeDasharray="2 2" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} label={{ value: "AED M", angle: -90, position: "insideLeft", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ fontSize: 11, padding: "6px 8px" }} formatter={(v: number) => `AED ${v.toFixed(2)}M`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="0-30d" stackId="a" fill="#22c55e" />
                  <Bar dataKey="31-60d" stackId="a" fill="#facc15" />
                  <Bar dataKey="61-90d" stackId="a" fill="#f97316" />
                  <Bar dataKey="91-120d" stackId="a" fill="#ef4444" />
                  <Bar dataKey=">120d" stackId="a" fill="#991b1b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Red alert banner */}
          <div className="border-l-4 border-l-danger border border-danger/30 bg-danger/5 rounded-sm p-3 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-danger shrink-0" />
            <div className="flex-1 text-[13px]">
              <span className="font-semibold text-danger">{fmtAED(arOver90, { compact: true })} at risk (&gt;90 days)</span>
              <span className="text-foreground"> across {rows.filter((r) => r.b91_120 + r.b120 > 0).length} clients. 3 clients account for 74% of aged AR.</span>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-[12px] border-danger text-danger hover:bg-danger/10" onClick={() => toast.success("At-risk list opened")}>View at-risk list</Button>
            <Button size="sm" variant="outline" className="h-7 text-[12px] border-danger text-danger hover:bg-danger/10" onClick={() => toast.success("Drafting escalation letters")}>Draft escalation letters</Button>
          </div>

          {/* Aging table */}
          <div className="bg-surface border border-rule rounded-sm overflow-hidden">
            <div className="px-3 py-2 border-b border-rule bg-surface-alt text-[12px] font-bold uppercase tracking-wide text-foreground">Aging Detail</div>
            <table className="w-full text-[13px] tabular-nums">
              <thead className="bg-surface-alt border-b border-rule text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="w-8 px-2 py-2"><input type="checkbox" /></th>
                  <th className="px-2 py-2 text-left font-semibold">Client</th>
                  <th className="px-2 py-2 text-right font-semibold">Total AR</th>
                  <th className="px-2 py-2 text-right font-semibold text-success">0-30</th>
                  <th className="px-2 py-2 text-right font-semibold text-warning">31-60</th>
                  <th className="px-2 py-2 text-right font-semibold" style={{ color: "#f97316" }}>61-90</th>
                  <th className="px-2 py-2 text-right font-semibold text-danger">91-120</th>
                  <th className="px-2 py-2 text-right font-semibold" style={{ color: "#991b1b" }}>&gt;120</th>
                  <th className="px-2 py-2 text-center font-semibold">Score</th>
                  <th className="px-2 py-2 text-left font-semibold">Last Contact</th>
                  <th className="px-2 py-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const aged = r.b91_120 + r.b120;
                  const flagged = aged > 6_000_000;
                  return (
                    <tr key={r.clientId}
                      className={cn("border-b border-rule hover:bg-surface-hover group h-9", flagged && "bg-danger/5")}>
                      <td className="px-2"><input type="checkbox" /></td>
                      <td className="px-2 font-medium">
                        <button onClick={() => navigate(`/crm/clients/${r.clientId}`)} className="text-navy hover:underline">{r.client}</button>
                        <Tag tone={r.tier === "T1" ? "navy" : "grey"} className="ml-1.5">{r.tier}</Tag>
                      </td>
                      <td className="px-2 text-right font-bold">{(r.total / 1_000_000).toFixed(1)}M</td>
                      <td className="px-2 text-right">{r.b0_30 ? (r.b0_30 / 1_000_000).toFixed(1) : "—"}</td>
                      <td className="px-2 text-right">{r.b31_60 ? (r.b31_60 / 1_000_000).toFixed(1) : "—"}</td>
                      <td className="px-2 text-right">{r.b61_90 ? (r.b61_90 / 1_000_000).toFixed(1) : "—"}</td>
                      <td className={cn("px-2 text-right", r.b91_120 > 0 && "text-danger font-medium")}>{r.b91_120 ? (r.b91_120 / 1_000_000).toFixed(1) : "—"}</td>
                      <td className={cn("px-2 text-right", r.b120 > 0 && "font-medium")} style={r.b120 > 0 ? { color: "#991b1b" } : {}}>{r.b120 ? (r.b120 / 1_000_000).toFixed(1) : "—"}</td>
                      <td className="px-2 text-center">
                        <span className={cn("inline-flex items-center gap-1 font-medium",
                          r.paymentScore < 65 ? "text-danger" : r.paymentScore < 80 ? "text-warning" : "text-success")}>
                          <Dot tone={r.paymentScore < 65 ? "red" : r.paymentScore < 80 ? "amber" : "green"} />
                          {r.paymentScore}
                        </span>
                      </td>
                      <td className="px-2 text-muted-foreground text-[12px]">{r.lastContactDays}d ago</td>
                      <td className="px-2">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => navigate(`/crm/clients/${r.clientId}`)} className="text-[11px] text-mod-crm hover:underline">Open</button>
                          <span className="text-muted-foreground">·</span>
                          <button onClick={() => toast.success("Reminder sent")} className="text-[11px] text-mod-crm hover:underline">Remind</button>
                          <span className="text-muted-foreground">·</span>
                          <button onClick={() => toast.success("Activity logged")} className="text-[11px] text-mod-crm hover:underline">Log</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-surface-alt border-t-2 border-navy text-[12px] font-bold tabular-nums">
                <tr className="h-9">
                  <td></td>
                  <td className="px-2">TOTAL</td>
                  <td className="px-2 text-right">{(totals.total / 1_000_000).toFixed(1)}M</td>
                  <td className="px-2 text-right">{(totals.b0_30 / 1_000_000).toFixed(1)}</td>
                  <td className="px-2 text-right">{(totals.b31_60 / 1_000_000).toFixed(1)}</td>
                  <td className="px-2 text-right">{(totals.b61_90 / 1_000_000).toFixed(1)}</td>
                  <td className="px-2 text-right text-danger">{(totals.b91_120 / 1_000_000).toFixed(1)}</td>
                  <td className="px-2 text-right" style={{ color: "#991b1b" }}>{(totals.b120 / 1_000_000).toFixed(1)}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* AI Insight */}
          <div className="border-2 border-navy bg-surface rounded-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-gold-deep" />
              <span className="text-[12px] font-bold uppercase tracking-wide text-navy">AI Cash Collection Priority</span>
              <span className="text-[11px] text-muted-foreground ml-auto">{asOf}</span>
            </div>
            <p className="text-[13px] text-foreground leading-relaxed">
              Focus collection efforts on these 3 clients to recover maximum cash with minimum relationship risk:
            </p>
            <ol className="text-[13px] text-foreground mt-2 space-y-1.5 list-decimal pl-5">
              <li>
                <span className="font-semibold">Al Futtaim Carillion</span> (AED 6.9M &gt;90d) — T1 strategic; escalate to exec review, don't send harsh legal notice.
              </li>
              <li>
                <span className="font-semibold">Miral Asset Mgmt</span> (AED 3.6M &gt;90d) — T1; 2 outstanding invoices tied to Saadiyat Hotel VO approvals — resolving VO may unlock payment.
              </li>
              <li>
                <span className="font-semibold">Arabtec Construction</span> (AED 3.9M &gt;90d) — T2; payment score 54/100 and deteriorating — consider legal notice, reduce exposure.
              </li>
            </ol>
            <div className="mt-3 text-[12px] text-foreground bg-surface-alt p-2 rounded-sm border border-rule">
              <span className="font-semibold">Combined targeted recovery: AED 14.4M</span> (67% of &gt;90d total) with 2-4 week cycle.
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" className="h-7 text-[12px] bg-navy hover:bg-navy-deep" onClick={() => toast.success("3 escalation drafts generated")}>Generate 3 escalation drafts</Button>
              <Button size="sm" variant="outline" className="h-7 text-[12px]" onClick={() => toast.success("Priority list exported")}>Export priority list</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "red" | "amber" | "green" }) {
  return (
    <div className="bg-surface border border-rule rounded-sm px-4 py-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</div>
      <div className={cn("text-[24px] font-bold tabular-nums mt-1",
        tone === "red" && "text-danger",
        tone === "amber" && "text-warning",
        tone === "green" && "text-success",
        !tone && "text-navy",
      )}>{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}
