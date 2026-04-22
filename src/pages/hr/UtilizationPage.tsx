// HR > Utilization — heatmap, compliance alerts, bench roster.
import { useMemo, useState } from "react";
import { Sparkles, AlertTriangle, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/odoo/Tag";
import { cn } from "@/lib/utils";
import { fmtAED } from "@/lib/format";

interface EngRow {
  name: string; grade: "Junior" | "Mid" | "Senior" | "Lead";
  division: "HVAC" | "Electrical" | "MEP" | "Automation" | "T&C";
  weeks: number[]; // 12 weekly utilization %
  projects: string[]; // top concurrent projects
}

// 20 engineers x 12 weeks. Shape engineered to tell a visual story.
const ENG: EngRow[] = [
  { name: "R. Kumar",   grade: "Senior", division: "HVAC",       projects: ["Meraas Tower B4", "Al Naboodah HQ"],
    weeks: [87, 92, 88, 90, 85, 89, 91, 88, 90, 87, 89, 88] },
  { name: "S. Menon",   grade: "Lead",   division: "MEP",        projects: ["Saadiyat Hotel", "DAMAC Lagoons"],
    weeks: [98, 102, 95, 99, 105, 100, 96, 103, 98, 101, 97, 99] },
  { name: "A. Hussain", grade: "Senior", division: "Electrical", projects: ["Aldar Yas Villas"],
    weeks: [78, 82, 75, 80, 78, 84, 79, 81, 76, 78, 80, 82] },
  { name: "V. Pillai",  grade: "Mid",    division: "Electrical", projects: ["Bench"],
    weeks: [38, 42, 35, 40, 45, 38, 33, 41, 36, 44, 39, 37] },
  { name: "F. Rahman",  grade: "Senior", division: "Automation", projects: ["NEOM Line P-42", "Creek Harbour T4"],
    weeks: [94, 98, 92, 96, 100, 97, 95, 99, 93, 96, 98, 94] },
  { name: "M. Khan",    grade: "Mid",    division: "MEP",        projects: ["Meraas Tower B4", "Expo City Ph2"],
    weeks: [68, 72, 75, 70, 65, 78, 73, 68, 71, 74, 69, 72] },
  { name: "P. Nair",    grade: "Senior", division: "Automation", projects: ["Saadiyat Hotel"],
    weeks: [55, 48, 62, 50, 58, 52, 60, 47, 54, 49, 56, 51] },
  { name: "D. Thomas",  grade: "Senior", division: "HVAC",       projects: ["Procurement support"],
    weeks: [83, 86, 81, 88, 85, 82, 87, 84, 89, 81, 85, 87] },
  { name: "A. Sharma",  grade: "Senior", division: "MEP",        projects: ["Procurement, 3 projects"],
    weeks: [108, 112, 105, 110, 115, 102, 108, 113, 106, 111, 109, 104] },
  { name: "R. Patel",   grade: "Senior", division: "T&C",        projects: ["Bench — HVAC commissioning"],
    weeks: [22, 28, 25, 20, 24, 22, 28, 25, 22, 27, 24, 23] },
  { name: "A. Verma",   grade: "Mid",    division: "Electrical", projects: ["Bench — Electrical design"],
    weeks: [18, 22, 20, 25, 18, 24, 21, 19, 23, 17, 22, 20] },
  { name: "M. Ali",     grade: "Junior", division: "MEP",        projects: ["Bench — MEP coordination"],
    weeks: [28, 32, 25, 30, 35, 28, 22, 30, 27, 32, 26, 29] },
  { name: "K. Antony",  grade: "Mid",    division: "HVAC",       projects: ["ALEC Tower A"],
    weeks: [78, 82, 76, 84, 80, 78, 85, 79, 82, 77, 84, 81] },
  { name: "S. Bhat",    grade: "Senior", division: "Electrical", projects: ["Sobha Hartland 7"],
    weeks: [88, 92, 85, 90, 94, 87, 91, 89, 93, 86, 90, 88] },
  { name: "T. Kurian",  grade: "Mid",    division: "T&C",        projects: ["Al Naboodah HQ", "QA support"],
    weeks: [72, 75, 78, 70, 76, 73, 79, 74, 71, 77, 75, 72] },
  { name: "B. Hassan",  grade: "Junior", division: "MEP",        projects: ["Logistics, 2 projects"],
    weeks: [62, 65, 58, 70, 64, 67, 60, 68, 63, 66, 69, 61] },
  { name: "K. Abdullah",grade: "Mid",    division: "MEP",        projects: ["NEOM Line P-42"],
    weeks: [85, 88, 90, 86, 92, 87, 89, 91, 84, 88, 86, 90] },
  { name: "R. Singh",   grade: "Senior", division: "T&C",        projects: ["ALEC Tower A"],
    weeks: [80, 83, 78, 85, 81, 79, 84, 82, 86, 80, 78, 83] },
  { name: "J. Lopez",   grade: "Junior", division: "HVAC",       projects: ["Doc control"],
    weeks: [55, 58, 52, 60, 56, 50, 62, 54, 57, 53, 59, 56] },
  { name: "M. Farook",  grade: "Lead",   division: "HVAC",       projects: ["Division mgmt"],
    weeks: [95, 92, 98, 90, 96, 93, 91, 97, 94, 92, 95, 90] },
];

function utilColor(p: number): string {
  if (p > 100) return "#991b1b";   // overloaded
  if (p >= 90) return "#166534";   // healthy
  if (p >= 70) return "#86efac";   // light green
  if (p >= 50) return "#facc15";   // amber
  return "#fca5a5";                // bench
}
function utilTextColor(p: number): string {
  return p > 100 || (p >= 90 && p <= 100) ? "white" : "#111";
}

const COMPLIANCE = [
  { name: "V. Pillai",  doc: "UAE Residence Visa",   exp: "18 May 2026", days: 28,  status: "Urgent" as const },
  { name: "M. Khan",    doc: "DEWA Wiring License",  exp: "02 Jun 2026", days: 43,  status: "Urgent" as const },
  { name: "P. Nair",    doc: "Civil Defense (DCD)",  exp: "22 Jun 2026", days: 63,  status: "Upcoming" as const },
  { name: "A. Sharma",  doc: "Emirates ID",          exp: "04 Jul 2026", days: 75,  status: "Upcoming" as const },
  { name: "D. Thomas",  doc: "UAE Residence Visa",   exp: "15 Jul 2026", days: 86,  status: "Upcoming" as const },
  { name: "K. Antony",  doc: "Trakhees License",     exp: "20 Jul 2026", days: 91,  status: "On track" as const },
  { name: "S. Bhat",    doc: "DEWA Wiring License",  exp: "28 Jul 2026", days: 99,  status: "On track" as const },
  { name: "F. Rahman",  doc: "Passport",             exp: "12 Aug 2026", days: 114, status: "On track" as const },
  { name: "R. Patel",   doc: "DCD Cert",             exp: "25 Aug 2026", days: 127, status: "On track" as const },
  { name: "A. Hussain", doc: "Emirates ID",          exp: "10 Sep 2026", days: 143, status: "On track" as const },
  { name: "M. Ali",     doc: "UAE Residence Visa",   exp: "22 Sep 2026", days: 155, status: "On track" as const },
  { name: "A. Verma",   doc: "Trakhees License",     exp: "05 Oct 2026", days: 168, status: "On track" as const },
];

const BENCH = [
  { name: "R. Patel",  grade: "Senior", spec: "HVAC commissioning",     days: 18, cost: 22_000, redeploy: "Saadiyat Hotel (needs +1 commissioning eng)" },
  { name: "A. Verma",  grade: "Mid",    spec: "Electrical design",      days: 24, cost: 16_000, redeploy: "Al Naboodah HQ (bid support)" },
  { name: "M. Ali",    grade: "Junior", spec: "MEP coordination",       days: 31, cost: 11_000, redeploy: "Expo City Ph 2 (under-resourced)" },
  { name: "V. Pillai", grade: "Mid",    spec: "Electrical contracts",   days: 42, cost: 17_000, redeploy: "⚠ Low recent performance — review first" },
  { name: "P. Nair",   grade: "Senior", spec: "Controls/Automation",    days: 12, cost: 20_000, redeploy: "NEOM Line Plot-42 (controls scope expanding)" },
];

const WEEK_LABELS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"];

export default function UtilizationPage() {
  const [period, setPeriod] = useState<"week" | "4w" | "12w">("12w");
  const [div, setDiv] = useState<string>("All");

  const visibleEng = useMemo(() => {
    if (div === "All") return ENG;
    return ENG.filter((e) => e.division === div);
  }, [div]);

  const totalBench = BENCH.reduce((s, b) => s + b.cost, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-4 py-2 border-b border-rule bg-surface flex items-center gap-3 shrink-0">
        <div className="text-[12px] text-muted-foreground">HR <span className="mx-1">›</span> <span className="text-foreground font-medium">Utilization</span></div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center border border-rule rounded-sm overflow-hidden h-7 text-[11px]">
            {(["week", "4w", "12w"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={cn("px-2.5 h-full transition-colors",
                  period === p ? "bg-navy text-primary-foreground" : "bg-surface text-muted-foreground hover:bg-surface-hover")}>
                {p === "week" ? "Current Week" : p === "4w" ? "Next 4 Weeks" : "Next 12 Weeks"}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" className="h-7 text-[12px]" onClick={() => toast.success("Exported")}><Download className="h-3.5 w-3.5 mr-1" />Export</Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-surface-alt">
        <div className="p-4 space-y-4 max-w-[1500px]">
          {/* KPI strip */}
          <div className="grid grid-cols-5 gap-3">
            <Kpi label="Total Engineers" value="152" />
            <Kpi label="Billable This Week" value="127" sub="84% utilization" tone="green" />
            <Kpi label="On Bench" value="18" sub="12% · AED 340K cost/mo" tone="amber" />
            <Kpi label="Visas Expiring <90d" value="7" tone="red" />
            <Kpi label="Certs Expiring <90d" value="12" tone="red" />
          </div>

          {/* Heatmap */}
          <div className="bg-surface border border-rule rounded-sm p-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[12px] font-bold uppercase tracking-wide text-foreground">Utilization Heatmap</div>
                <div className="text-[11px] text-muted-foreground">Showing 20 of 152 engineers · {period === "12w" ? "Next 12 weeks" : period === "4w" ? "Next 4 weeks" : "Current week"}</div>
              </div>
              <div className="flex items-center gap-1">
                {["All", "HVAC", "Electrical", "MEP", "Automation", "T&C"].map((d) => (
                  <button key={d} onClick={() => setDiv(d)}
                    className={cn("h-7 px-2.5 text-[11px] rounded-sm border transition-colors",
                      div === d ? "bg-navy text-primary-foreground border-navy" : "bg-surface text-muted-foreground border-rule hover:bg-surface-hover")}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 mb-2 text-[10px] text-muted-foreground">
              <span>Bench &lt;50</span>
              <span className="w-4 h-3 rounded-sm" style={{ background: "#fca5a5" }} />
              <span className="w-4 h-3 rounded-sm" style={{ background: "#facc15" }} />
              <span className="w-4 h-3 rounded-sm" style={{ background: "#86efac" }} />
              <span className="w-4 h-3 rounded-sm" style={{ background: "#166534" }} />
              <span className="w-4 h-3 rounded-sm" style={{ background: "#991b1b" }} />
              <span>Overloaded &gt;100</span>
            </div>

            <div className="overflow-x-auto">
              <table className="text-[11px] tabular-nums border-collapse">
                <thead>
                  <tr>
                    <th className="text-left px-2 py-1 sticky left-0 bg-surface z-10 font-semibold w-[140px]">Engineer</th>
                    <th className="text-left px-2 py-1 font-semibold w-[80px]">Grade</th>
                    {WEEK_LABELS.map((w) => (
                      <th key={w} className="px-1 py-1 text-center font-semibold text-muted-foreground" style={{ width: 44 }}>{w}</th>
                    ))}
                    <th className="px-2 py-1 text-right font-semibold">Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleEng.map((e) => {
                    const avg = Math.round(e.weeks.reduce((s, n) => s + n, 0) / e.weeks.length);
                    return (
                      <tr key={e.name} className="border-t border-rule">
                        <td className="px-2 py-1 sticky left-0 bg-surface font-medium text-navy z-10">{e.name}</td>
                        <td className="px-2 py-1 text-muted-foreground">{e.grade}</td>
                        {e.weeks.map((p, i) => (
                          <td key={i} className="p-0.5 text-center">
                            <div title={`${e.name} · ${WEEK_LABELS[i]} · ${p}% · ${e.projects.join(", ")}`}
                              className="h-6 rounded-sm font-semibold text-[10px] flex items-center justify-center cursor-help"
                              style={{ background: utilColor(p), color: utilTextColor(p) }}>
                              {p}
                            </div>
                          </td>
                        ))}
                        <td className={cn("px-2 py-1 text-right font-bold",
                          avg < 50 ? "text-danger" : avg > 100 ? "text-danger" : "text-foreground")}>{avg}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button className="text-[11px] text-mod-crm hover:underline mt-2">Show all 152 →</button>
          </div>

          {/* Compliance alerts */}
          <div className="bg-surface border border-rule rounded-sm">
            <div className="px-3 py-2 border-b border-rule bg-surface-alt flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              <div className="text-[12px] font-bold uppercase tracking-wide text-foreground">Documents Expiring Soon (next 180 days)</div>
            </div>
            <div className="border-l-4 border-l-danger bg-danger/5 px-3 py-2 text-[12px] flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-danger shrink-0" />
              <span><span className="font-semibold text-danger">2 urgent renewals</span> (V. Pillai visa, M. Khan DEWA license) — these engineers cannot legally work after expiry. UAE renewal cycle takes 14-21 days. Start now.</span>
            </div>
            <table className="w-full text-[13px]">
              <thead className="bg-surface-alt border-b border-rule text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-2 py-1.5 text-left">Engineer</th>
                  <th className="px-2 py-1.5 text-left">Document Type</th>
                  <th className="px-2 py-1.5 text-left">Expires</th>
                  <th className="px-2 py-1.5 text-right">Days Left</th>
                  <th className="px-2 py-1.5">Status</th>
                  <th className="px-2 py-1.5">Action</th>
                </tr>
              </thead>
              <tbody>
                {COMPLIANCE.map((c, i) => (
                  <tr key={i} className="border-b border-rule hover:bg-surface-hover">
                    <td className="px-2 py-1.5 font-medium">{c.name}</td>
                    <td className="px-2 py-1.5">{c.doc}</td>
                    <td className="px-2 py-1.5 text-muted-foreground tabular-nums">{c.exp}</td>
                    <td className={cn("px-2 py-1.5 text-right tabular-nums font-medium",
                      c.status === "Urgent" && "text-danger",
                      c.status === "Upcoming" && "text-warning")}>{c.days}</td>
                    <td className="px-2 py-1.5"><Tag tone={c.status === "Urgent" ? "red" : c.status === "Upcoming" ? "amber" : "green"}>● {c.status}</Tag></td>
                    <td className="px-2 py-1.5">
                      {c.status !== "On track" ? (
                        <button onClick={() => toast.success(`Renewal initiated for ${c.name}`)} className="text-[11px] text-mod-crm hover:underline">
                          {c.status === "Urgent" ? "Initiate renewal" : "Schedule"}
                        </button>
                      ) : <span className="text-[11px] text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bench roster */}
          <div className="bg-surface border border-rule rounded-sm">
            <div className="px-3 py-2 border-b border-rule bg-surface-alt flex items-center justify-between">
              <div className="text-[12px] font-bold uppercase tracking-wide text-foreground">Bench Roster — Engineers with &lt;50% utilization</div>
              <div className="text-[12px] text-muted-foreground">Total bench cost: <span className="font-bold text-danger">{fmtAED(totalBench)} / month not billed</span></div>
            </div>
            <table className="w-full text-[13px]">
              <thead className="bg-surface-alt border-b border-rule text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-2 py-1.5 text-left">Engineer</th>
                  <th className="px-2 py-1.5 text-left">Grade</th>
                  <th className="px-2 py-1.5 text-left">Specialization</th>
                  <th className="px-2 py-1.5 text-right">On Bench Since</th>
                  <th className="px-2 py-1.5 text-right">Cost/Month (AED)</th>
                  <th className="px-2 py-1.5 text-left">Suggested Redeployment</th>
                </tr>
              </thead>
              <tbody>
                {BENCH.map((b) => (
                  <tr key={b.name} className="border-b border-rule hover:bg-surface-hover">
                    <td className="px-2 py-1.5 font-medium text-navy">{b.name}</td>
                    <td className="px-2 py-1.5 text-muted-foreground">{b.grade}</td>
                    <td className="px-2 py-1.5">{b.spec}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{b.days} days</td>
                    <td className="px-2 py-1.5 text-right tabular-nums font-medium">{b.cost.toLocaleString()}</td>
                    <td className={cn("px-2 py-1.5 text-[12px]", b.redeploy.startsWith("⚠") && "text-warning")}>{b.redeploy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI Recommendation */}
          <div className="border-2 border-gold/60 bg-gold/5 rounded-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-gold-deep" />
              <span className="text-[12px] font-bold uppercase tracking-wide text-gold-deep">AI Recommendation · Engineer Redeployment</span>
            </div>
            <p className="text-[13px] text-foreground leading-relaxed">
              18 engineers on bench costing <span className="font-semibold">AED 340K/month</span>. Based on active project resource gaps:
            </p>
            <ol className="text-[13px] text-foreground mt-2 space-y-0.5 list-decimal pl-5">
              <li><span className="font-semibold">Saadiyat Hotel:</span> needs +1 HVAC commissioning engineer → deploy <span className="font-medium">R. Patel</span> (Senior, 18d bench)</li>
              <li><span className="font-semibold">Expo City Ph 2:</span> under-resourced on MEP coord → deploy <span className="font-medium">M. Ali</span> (Junior, 31d bench)</li>
              <li><span className="font-semibold">NEOM Line P42:</span> controls scope expanding → deploy <span className="font-medium">P. Nair</span> (Senior, 12d bench)</li>
              <li><span className="font-semibold">Al Naboodah HQ:</span> BD support needed → deploy <span className="font-medium">A. Verma</span> (Mid, 24d bench)</li>
            </ol>
            <div className="mt-3 text-[12px] text-foreground bg-surface p-2 rounded-sm border border-rule">
              Estimated recoverable billability: <span className="font-bold text-success">AED 180K/month</span> (53% of total bench cost).
              <br />2 engineers flagged for performance review before redeployment (V. Pillai, 1 other).
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" className="h-7 text-[12px] bg-gold-deep hover:bg-gold text-navy-deep" onClick={() => toast.success("Redeployment plan generated")}>Generate redeployment plan</Button>
              <Button size="sm" variant="outline" className="h-7 text-[12px]" onClick={() => toast.success("Review meetings scheduled")}>Schedule review meetings</Button>
              <Button size="sm" variant="outline" className="h-7 text-[12px]" onClick={() => toast.success("Exported to PM team")}>Export to PM team</Button>
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
