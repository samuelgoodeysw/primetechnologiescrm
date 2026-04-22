// CRM > Opportunity form view — status bar, fields, tabs, chatter.
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/state/AppState";
import { calcQuote } from "@/state/calc";
import { OPP_STAGES_FULL } from "@/state/crm";
import { fmtAED, fmtDate, relativeDays } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tag } from "@/components/odoo/Tag";
import { FieldGroup, Field } from "@/components/odoo/FieldGroup";
import { Chatter } from "@/components/odoo/Chatter";
import { cn } from "@/lib/utils";
import type { Division, OpportunityStage } from "@/state/types";

const DIVISIONS: Division[] = ["HVAC", "Electrical", "MEP", "Automation", "T&C"];

export default function OpportunityForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch, opportunityById, clientById, employeeById } = useAppState();
  const opp = opportunityById(id ?? "");
  const allOpps = state.opportunities;
  const idx = allOpps.findIndex((o) => o.id === id);

  const [draft, setDraft] = useState(() => opp);
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(opp), [draft, opp]);

  if (!opp || !draft) {
    return <div className="p-8 text-muted-foreground">Opportunity not found.</div>;
  }

  const client = clientById(draft.clientId);
  const linkedQuotes = state.quotes.filter((q) => q.opportunityId === opp.id);
  const activities = state.activities.filter((a) => a.relatedType === "Opportunity" && a.relatedId === opp.id);

  function update<K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) {
    setDraft((d) => d ? { ...d, [k]: v } : d);
  }

  function save() {
    if (!draft) return;
    dispatch({ type: "OPP_UPDATE", payload: draft });
    toast.success("Opportunity saved");
  }
  function discard() { setDraft(opp); }

  function setStage(s: OpportunityStage) {
    if (s === draft.stage) return;
    dispatch({ type: "OPP_STAGE", payload: { id: opp!.id, stage: s } });
    setDraft((d) => d ? { ...d, stage: s } : d);
    toast.success(`Stage set to ${s}`);
  }

  function nav(delta: number) {
    const next = allOpps[idx + delta];
    if (next) navigate(`/crm/opportunities/${next.id}`);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top toolbar */}
      <div className="flex items-center gap-2 h-10 px-4 border-b border-rule bg-surface shrink-0">
        {dirty ? (
          <>
            <Button size="sm" onClick={save} className="h-7 px-3 text-[12px] font-semibold">Save</Button>
            <button onClick={discard} className="text-[12px] text-destructive hover:underline px-2">Discard</button>
          </>
        ) : (
          <button className="text-[12px] text-muted-foreground hover:text-foreground px-2 h-7 rounded-sm hover:bg-surface-hover">⌄ Action</button>
        )}
        <div className="ml-auto flex items-center gap-1 text-[12px] text-muted-foreground tabular-nums">
          <span>{idx + 1} / {allOpps.length}</span>
          <button onClick={() => nav(-1)} disabled={idx <= 0} className="h-6 w-6 hover:bg-surface-hover rounded-sm grid place-items-center disabled:opacity-30"><ChevronLeft className="h-3.5 w-3.5" /></button>
          <button onClick={() => nav(1)} disabled={idx >= allOpps.length - 1} className="h-6 w-6 hover:bg-surface-hover rounded-sm grid place-items-center disabled:opacity-30"><ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {/* Status bar */}
      <div className="px-4 py-2.5 border-b border-rule bg-surface shrink-0">
        <div className="flex items-stretch">
          {OPP_STAGES_FULL.map((s, i) => {
            const active = s === draft.stage;
            const passed = OPP_STAGES_FULL.indexOf(draft.stage) > i && draft.stage !== "Lost";
            return (
              <button key={s} onClick={() => setStage(s)}
                className={cn("h-7 px-3 text-[12px] font-medium border border-r-0 last:border-r transition-colors first:rounded-l-sm last:rounded-r-sm",
                  active && s === "Won" && "bg-success text-success-foreground border-success",
                  active && s === "Lost" && "bg-danger text-danger-foreground border-danger",
                  active && s !== "Won" && s !== "Lost" && "bg-gold text-navy-deep border-gold-deep z-10",
                  !active && passed && "bg-navy text-primary-foreground border-navy",
                  !active && !passed && "bg-surface-alt text-muted-foreground border-rule hover:bg-surface-hover",
                )}>
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center justify-end gap-2 h-10 px-4 border-b border-rule bg-surface-alt shrink-0">
        <Button size="sm" variant="outline" onClick={() => setStage("Won")} className="h-7 px-3 text-[12px] border-success text-success hover:bg-success/10">Mark Won</Button>
        <Button size="sm" variant="outline" onClick={() => setStage("Lost")} className="h-7 px-3 text-[12px] border-destructive text-destructive hover:bg-destructive/10">Mark Lost</Button>
        <Button size="sm" onClick={() => navigate(`/sales/quotations/new?opportunity=${opp.id}`)} className="h-7 px-3 text-[12px]">New Quote</Button>
        <Button size="sm" variant="ghost" className="h-7 px-3 text-[12px]">Log Activity</Button>
        <Button size="sm" variant="ghost" className="h-7 px-3 text-[12px]">Duplicate</Button>
        <Button size="sm" variant="ghost"
          onClick={() => { dispatch({ type: "OPP_DELETE", payload: { id: opp.id } }); toast.success("Deleted"); navigate("/crm/opportunities"); }}
          className="h-7 px-3 text-[12px] text-destructive hover:bg-destructive/10">Delete</Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto bg-surface-alt">
        <div className="p-4 space-y-4 max-w-[1200px]">
          {/* Title */}
          <div className="bg-surface border border-rule rounded-sm p-4">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Opportunity</div>
            <h1 className="text-[20px] font-bold text-foreground mt-0.5">{draft.name}</h1>
            <div className="flex items-center gap-2 mt-1.5 text-[12px] text-muted-foreground">
              <span>{client?.name}</span>
              <span>·</span>
              <span>{draft.consultant}</span>
              <span>·</span>
              <span className="text-navy font-bold tabular-nums">{fmtAED(draft.value)}</span>
            </div>
          </div>

          {/* Field groups */}
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup title="Opportunity Info">
              <Field label="Opportunity Name">
                <Input value={draft.name} onChange={(e) => update("name", e.target.value)} className="h-7 text-[13px]" />
              </Field>
              <Field label="Client">
                <Select value={draft.clientId} onValueChange={(v) => update("clientId", v)}>
                  <SelectTrigger className="h-7 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{state.clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Main Contractor">
                <span className="text-[13px]">Self (direct)</span>
              </Field>
              <Field label="Consultant">
                <Input value={draft.consultant} onChange={(e) => update("consultant", e.target.value)} className="h-7 text-[13px]" />
              </Field>
              <Field label="Project Value (AED)">
                <Input type="number" value={draft.value} onChange={(e) => update("value", Number(e.target.value))} className="h-7 text-[13px] tabular-nums" />
              </Field>
              <Field label="Expected Close">
                <Input type="date" value={draft.expectedClose.slice(0,10)} onChange={(e) => update("expectedClose", e.target.value)} className="h-7 text-[13px]" />
              </Field>
              <Field label="Probability">
                <div className="flex items-center gap-3">
                  <Slider min={0} max={100} step={1} value={[draft.probability]} onValueChange={(v) => update("probability", v[0])} className="flex-1" />
                  <span className="text-[12px] tabular-nums w-10 text-right font-medium">{draft.probability}%</span>
                </div>
              </Field>
            </FieldGroup>

            <FieldGroup title="Assignment">
              <Field label="Engineer Owner">
                <Select value={draft.engineerId} onValueChange={(v) => update("engineerId", v)}>
                  <SelectTrigger className="h-7 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {state.employees.filter((e) => e.department === "Sales" || e.department === "Engineering").map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Division">
                <Select value={draft.division} onValueChange={(v) => update("division", v as Division)}>
                  <SelectTrigger className="h-7 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{DIVISIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Competitors">
                <div className="flex flex-wrap gap-1">
                  {(draft.competitors ?? []).map((c) => <Tag key={c} tone="grey">{c}</Tag>)}
                  {(draft.competitors ?? []).length === 0 && <span className="text-[12px] text-muted-foreground">—</span>}
                </div>
              </Field>
              <Field label="Source">
                <span className="text-[13px]">{draft.source ?? "—"}</span>
              </Field>
              <Field label="Tier">
                <Tag tone="navy">{draft.tier ?? "T2"} {draft.tier === "T1" && "(Strategic)"}</Tag>
              </Field>
              <Field label="Tags">
                <div className="flex flex-wrap gap-1">
                  {(draft.tags ?? []).map((t) => <Tag key={t} tone="gold">{t}</Tag>)}
                  {(draft.tags ?? []).length === 0 && <span className="text-[12px] text-muted-foreground">—</span>}
                </div>
              </Field>
            </FieldGroup>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="quotes">
            <TabsList className="bg-transparent border-b border-rule rounded-none h-auto p-0 w-full justify-start gap-0">
              <TabTrigger v="quotes">Quotes ({linkedQuotes.length})</TabTrigger>
              <TabTrigger v="products">Products (BOQ)</TabTrigger>
              <TabTrigger v="activities">Activities ({activities.length})</TabTrigger>
              <TabTrigger v="documents">Documents</TabTrigger>
              <TabTrigger v="analytics">Analytics</TabTrigger>
            </TabsList>

            <TabsContent value="quotes" className="bg-surface border border-rule border-t-0 rounded-b-sm p-3 mt-0">
              <div className="flex justify-end mb-2">
                <Button size="sm" onClick={() => navigate(`/sales/quotations/new?opportunity=${opp.id}`)} className="h-7 text-[12px]">+ New Quote</Button>
              </div>
              <table className="w-full text-[13px] tabular-nums">
                <thead className="border-b border-rule text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr><th className="px-2 py-1.5 text-left">Quote #</th><th className="px-2 py-1.5 text-left">Date</th><th className="px-2 py-1.5 text-left">Engineer</th><th className="px-2 py-1.5 text-right">Value (AED)</th><th className="px-2 py-1.5 text-right">Margin %</th><th className="px-2 py-1.5">Status</th><th className="px-2 py-1.5 text-right">—</th></tr>
                </thead>
                <tbody>
                  {linkedQuotes.length === 0 && <tr><td colSpan={7} className="px-2 py-6 text-center text-muted-foreground">No quotes linked yet. Click + New Quote.</td></tr>}
                  {linkedQuotes.map((q) => {
                    const calc = calcQuote(q);
                    const eng = employeeById(q.engineerId);
                    return (
                      <tr key={q.id} className="border-b border-rule hover:bg-surface-hover">
                        <td className="px-2 py-1.5 font-medium text-navy">{q.id}</td>
                        <td className="px-2 py-1.5 text-muted-foreground">{fmtDate(q.issueDate)}</td>
                        <td className="px-2 py-1.5">{eng?.name}</td>
                        <td className="px-2 py-1.5 text-right">{calc.subtotal > 0 ? fmtAED(calc.subtotal).replace("AED ", "") : "—"}</td>
                        <td className="px-2 py-1.5 text-right">{calc.subtotal > 0 ? `${calc.marginPct.toFixed(1)}%` : "—"}</td>
                        <td className="px-2 py-1.5"><Tag tone={q.status === "Won" ? "green" : q.status === "Lost" ? "red" : q.status === "Sent" ? "blue" : q.status === "Expired" ? "grey" : "amber"}>{q.status}</Tag></td>
                        <td className="px-2 py-1.5 text-right"><button onClick={() => navigate(`/sales/quotations/${q.id}`)} className="text-[11px] text-mod-crm hover:underline">Open</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TabsContent>

            <TabsContent value="products" className="bg-surface border border-rule border-t-0 rounded-b-sm p-3 mt-0">
              <div className="text-[12px] text-muted-foreground">BOQ inherited from the latest linked quote. Open Q-24812 to edit line items.</div>
            </TabsContent>

            <TabsContent value="activities" className="bg-surface border border-rule border-t-0 rounded-b-sm p-3 mt-0">
              <div className="space-y-3">
                {[
                  { icon: "📞", subj: "Call - payment follow-up", note: "AP team confirmed payment Q2 release", when: "4 days ago", who: "Manmohan" },
                  { icon: "✉",  subj: "Email - Quote Q-24812 sent", note: "Quote shared with Hyder for review", when: "14 days ago", who: "R. Kumar" },
                  { icon: "🤝", subj: "Meeting - Project scope review", note: "Clarified additional FCU requirements", when: "3 weeks ago", who: "Manmohan + R. Kumar" },
                  { icon: "🏗", subj: "Site visit - Al Naboodah HQ", note: "Confirmed shaft coordination with MEP contractor", when: "5 weeks ago", who: "R. Kumar" },
                ].map((a, i) => (
                  <div key={i} className="flex gap-3 pb-3 border-b border-rule last:border-0">
                    <div className="text-[18px] leading-none mt-0.5">{a.icon}</div>
                    <div className="flex-1">
                      <div className="text-[13px] font-medium">{a.subj}</div>
                      <div className="text-[12px] text-muted-foreground italic">"{a.note}"</div>
                      <div className="text-[11px] text-muted-foreground mt-1">{a.when} · {a.who}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="documents" className="bg-surface border border-rule border-t-0 rounded-b-sm p-3 mt-0">
              <div className="border-2 border-dashed border-rule rounded-sm p-6 text-center text-[12px] text-muted-foreground mb-3">Drag & drop files here, or click to upload</div>
              <ul className="text-[13px] divide-y divide-rule">
                {[
                  { f: "BOQ_Al_Naboodah_HQ_v3.xlsx", s: "2.1 MB", d: "uploaded 14 Apr" },
                  { f: "Hyder_spec_HC-2024-FCU-03.pdf", s: "840 KB", d: "uploaded 12 Apr" },
                  { f: "Site_drawings_package.zip", s: "18 MB", d: "uploaded 08 Apr" },
                  { f: "Technical_submittal_KingAir_FCU.pdf", s: "3.2 MB", d: "uploaded 06 Apr" },
                ].map((doc) => (
                  <li key={doc.f} className="flex items-center justify-between py-2">
                    <span>📄 {doc.f}</span>
                    <span className="text-[11px] text-muted-foreground">{doc.s} · {doc.d}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="analytics" className="bg-surface border border-rule border-t-0 rounded-b-sm p-3 mt-0">
              <div className="grid grid-cols-3 gap-3">
                <div className="border border-rule rounded-sm p-3">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Time in stage</div>
                  <div className="space-y-1.5 mt-2 text-[12px]">
                    {[{ s: "Lead", d: 4 }, { s: "Qualified", d: 8 }, { s: "BOQ Received", d: 12 }, { s: "Quoted (current)", d: 14 }].map((r) => (
                      <div key={r.s} className="flex items-center gap-2">
                        <span className="w-28 text-muted-foreground">{r.s}</span>
                        <div className="flex-1 h-1.5 bg-surface-alt rounded-sm overflow-hidden"><div className="h-full bg-navy" style={{ width: `${(r.d / 14) * 100}%` }} /></div>
                        <span className="tabular-nums w-8 text-right">{r.d}d</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border border-rule rounded-sm p-3">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Win probability trend</div>
                  <div className="text-[28px] font-bold text-navy mt-2 tabular-nums">{draft.probability}%</div>
                  <div className="text-[11px] text-muted-foreground mt-1">↑ from 40% at Lead. Discount aligned with consultant average; client is T1; positive site feedback.</div>
                </div>
                <div className="border border-gold/40 bg-gold/5 rounded-sm p-3">
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-gold-deep font-semibold"><Sparkles className="h-3 w-3" /> Client history</div>
                  <div className="text-[12px] mt-2 leading-relaxed">{client?.name}: 3 projects won in last 24 months. <span className="font-semibold">{client?.paymentScore}/100</span> payment score. 100% historical hit rate at Tier 1 value.</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Chatter recordType="Opportunity" recordId={opp.id} followers={[{ id: "u-fk", initials: "MF" }, { id: draft.engineerId, initials: employeeById(draft.engineerId)?.initials ?? "" }]} />
        </div>
      </div>
    </div>
  );
}

function TabTrigger({ v, children }: { v: string; children: React.ReactNode }) {
  return (
    <TabsTrigger value={v}
      className="h-9 px-4 text-[12px] rounded-none border-b-2 border-transparent data-[state=active]:border-navy data-[state=active]:bg-transparent data-[state=active]:text-navy data-[state=active]:font-semibold data-[state=active]:shadow-none">
      {children}
    </TabsTrigger>
  );
}
