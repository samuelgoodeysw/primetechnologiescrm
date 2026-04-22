import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAppState } from "@/state/AppState";
import { fmtAED, fmtDate } from "@/lib/format";
import { Tag } from "@/components/odoo/Tag";
import { modules, moduleAccent } from "@/state/modules";

export default function Dashboard() {
  const navigate = useNavigate();
  const { state, employeeById } = useAppState();
  const me = employeeById(state.currentUserId)!;
  const today = state.activities.filter((a) => !a.completedAt && a.scheduledFor?.startsWith("2026-04-20"));

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-6 py-5 border-b border-rule bg-surface">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[22px] font-bold text-foreground tracking-tight">Good morning, {me.name.split(" ")[0]}</h1>
          <span className="text-[13px] text-muted-foreground">{fmtDate("2026-04-20")} · Dubai · 32°C clear</span>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-[1400px]">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "My Open Tasks", value: "12", sub: "3 overdue", tone: "red" as const },
            { label: "Unread Messages", value: "8", sub: "across modules", tone: "blue" as const },
            { label: "Pending My Approval", value: "5", sub: "POs · VOs · Quotes", tone: "amber" as const },
            { label: "Alerts Today", value: "7", sub: "3 critical", tone: "red" as const },
          ].map((t) => (
            <button key={t.label} className="border border-rule bg-surface rounded-sm p-3 text-left hover:border-navy/40 transition-colors">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{t.label}</div>
              <div className="flex items-baseline justify-between mt-1.5">
                <div className="text-[26px] font-bold text-navy tabular-nums">{t.value}</div>
                <Tag tone={t.tone}>{t.sub}</Tag>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <section className="border border-rule bg-surface rounded-sm">
            <div className="px-3 py-2 border-b border-rule text-[12px] font-semibold uppercase tracking-wide text-muted-foreground bg-surface-alt">My activities today</div>
            <table className="w-full text-[13px]">
              <tbody>
                {today.map((a) => (
                  <tr key={a.id} className="border-t border-rule first:border-t-0 hover:bg-surface-hover">
                    <td className="px-3 py-2 tabular-nums text-muted-foreground w-16">{a.scheduledFor?.slice(11, 16)}</td>
                    <td className="px-3 py-2 font-medium">{a.subject}</td>
                    <td className="px-3 py-2 text-muted-foreground text-right">
                      <button className="text-[11px] text-mod-crm hover:underline">Mark done</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="border border-rule bg-surface rounded-sm">
            <div className="px-3 py-2 border-b border-rule text-[12px] font-semibold uppercase tracking-wide text-muted-foreground bg-surface-alt">Pending my approval</div>
            <table className="w-full text-[13px]">
              <tbody>
                {[
                  { type: "PO",      ref: "RFQ-2026-0087 (KingAir 80× FCU)", value: 1_840_000, by: "R. Kumar" },
                  { type: "VO",      ref: "VO-2026-0142",                    value: 420_000,   by: "R. Kumar" },
                  { type: "Quote",   ref: "Q-24812 (Al Naboodah)",           value: 8_200_000, by: "R. Kumar" },
                  { type: "Payment", ref: "BILL-KA-8934",                    value: 2_100_000, by: "Accounts" },
                  { type: "Expense", ref: "Site trip Riyadh",                value: 8_400,     by: "S. Menon" },
                ].map((r) => (
                  <tr key={r.ref} className="border-t border-rule first:border-t-0 hover:bg-surface-hover">
                    <td className="px-3 py-2 w-14"><Tag tone="navy">{r.type}</Tag></td>
                    <td className="px-3 py-2 font-medium">{r.ref}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmtAED(r.value, { compact: true })}</td>
                    <td className="px-3 py-2 text-right">
                      <button className="text-[11px] text-mod-crm hover:underline">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <section className="border border-rule bg-surface rounded-sm">
            <div className="px-3 py-2 border-b border-rule text-[12px] font-semibold uppercase tracking-wide text-muted-foreground bg-surface-alt">Pipeline snapshot</div>
            <div className="p-3 space-y-1.5">
              {[
                { stage: "Lead", n: 12 }, { stage: "Qualified", n: 18 }, { stage: "BOQ Received", n: 24 },
                { stage: "Quoted", n: 61 }, { stage: "Submitted", n: 41 }, { stage: "Shortlisted", n: 21 },
              ].map((s) => (
                <div key={s.stage} className="flex items-center text-[13px]">
                  <div className="w-32 text-muted-foreground">{s.stage}</div>
                  <div className="flex-1 h-2 bg-surface-alt rounded-sm overflow-hidden">
                    <div className="h-full bg-navy" style={{ width: `${(s.n / 61) * 100}%` }} />
                  </div>
                  <div className="w-10 text-right tabular-nums font-semibold">{s.n}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-rule bg-surface rounded-sm col-span-2">
            <div className="px-3 py-2 border-b border-rule text-[12px] font-semibold uppercase tracking-wide text-muted-foreground bg-surface-alt">Alerts & notifications</div>
            <ul className="divide-y divide-rule text-[13px]">
              {[
                { tone: "red" as const,   text: "Meraas Tower B4 margin dropped to 2.1% (live → quoted delta -9.1pt)" },
                { tone: "red" as const,   text: "AR overdue: Al Futtaim Carillion AED 6.9M > 90 days" },
                { tone: "red" as const,   text: "Visa expiring: V. Pillai (28 days)" },
                { tone: "amber" as const, text: "VO-2026-0142 overdue (89 days)" },
                { tone: "amber" as const, text: "Sobha Hartland 7 PO delayed 9 days" },
                { tone: "green" as const, text: "Q-24776 (ALEC) shortlisted" },
              ].map((a, i) => (
                <li key={i} className="px-3 py-2 flex items-center gap-2">
                  <Tag tone={a.tone}>•</Tag>
                  <span className="flex-1">{a.text}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="border border-gold/40 bg-gold/5 rounded-sm p-5">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-sm bg-gold/20 grid place-items-center"><Sparkles className="h-5 w-5 text-gold-deep" /></div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-foreground">Phase 1 of the new Prime ERP is live</div>
              <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                The Odoo-style shell, global state, dashboard, command palette (⌘K), and Prime AI assistant are wired across all 8 modules.
                Module list views, the Quote form with live margin recalculation, Project &amp; VO forms, and the AED 3.2M Leak page ship in the next pass.
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-4 gap-3">
          {modules.filter((m) => m.key !== "dashboard").map((m) => {
            const Icon = m.icon;
            return (
              <button key={m.key} onClick={() => navigate(m.basePath)}
                className="border border-rule bg-surface rounded-sm p-3 text-left hover:border-navy/40 transition-colors flex items-center gap-3 group">
                <div className="h-9 w-9 rounded-sm grid place-items-center" style={{ background: moduleAccent(m.key) }}>
                  <Icon className="h-[18px] w-[18px] text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold">{m.label}</div>
                  <div className="text-[11px] text-muted-foreground">Open module</div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
