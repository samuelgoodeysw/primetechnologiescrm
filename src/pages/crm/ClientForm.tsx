// CRM > Client 360 form — relationship cockpit.
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles, AlertTriangle, TrendingDown, Star } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid, ComposedChart,
} from "recharts";
import { useAppState } from "@/state/AppState";
import { fmtAED, fmtDate, relativeDays } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tag, Dot } from "@/components/odoo/Tag";
import { FieldGroup, Field } from "@/components/odoo/FieldGroup";
import { Chatter } from "@/components/odoo/Chatter";
import { calcQuote } from "@/state/calc";
import { cn } from "@/lib/utils";

// Per-client demo content. We extend Al Futtaim Carillion (c-afc) with the headline data.
const CLIENT_EXTRA: Record<string, {
  contacts: { name: string; role: string; dept: string; phone: string; email: string; primary?: boolean }[];
  invoices: { id: string; project: string; amount: number; invDate: string; dueDate: string; daysOver: number; status: "Overdue" | "Due soon" | "Current" }[];
  invoicesYTD: number; paidYTD: number; outstanding: number; avgDaysToPay: number; worstInv: string;
  paymentTrend: { m: string; days: number }[];
  revenueTrend: { m: string; rev: number; cum: number }[];
}> = {
  "c-afc": {
    contacts: [
      { name: "Mohammed Al Rashid", role: "Procurement Director", dept: "Procurement", phone: "+971 50 xxx 1234", email: "mar@afc.com", primary: true },
      { name: "Rajesh Kumar",       role: "Project Manager",      dept: "Projects",     phone: "+971 50 xxx 2345", email: "rk@afc.com" },
      { name: "Sarah Thompson",     role: "Accounts Payable Head",dept: "Finance",      phone: "+971 4 xxx 3456",  email: "st@afc.com" },
      { name: "Ahmed Hussain",      role: "Site Engineer - Meraas",dept: "Site",        phone: "+971 50 xxx 4567", email: "ah@afc.com" },
      { name: "Fatima Al Shamsi",   role: "Legal Counsel",        dept: "Legal",        phone: "+971 4 xxx 5678",  email: "fas@afc.com" },
      { name: "David Chen",         role: "Commercial Manager",   dept: "Commercial",   phone: "+971 50 xxx 6789", email: "dc@afc.com" },
      { name: "Vikram Menon",       role: "BIM Coordinator",      dept: "Design",       phone: "+971 50 xxx 7890", email: "vm@afc.com" },
    ],
    invoices: [
      { id: "INV-2024-89",  project: "Meraas Tower B4",        amount: 4_800_000, invDate: "2025-12-18", dueDate: "2026-02-17", daysOver: 62, status: "Overdue" },
      { id: "INV-2025-12",  project: "Al Futtaim Mall Sharjah", amount: 2_100_000, invDate: "2026-01-05", dueDate: "2026-03-06", daysOver: 45, status: "Overdue" },
      { id: "INV-2025-34",  project: "Meraas Tower B4",        amount: 3_100_000, invDate: "2026-01-22", dueDate: "2026-03-23", daysOver: 28, status: "Due soon" },
      { id: "INV-2025-45",  project: "Festival City Plaza",    amount: 1_800_000, invDate: "2026-02-14", dueDate: "2026-04-15", daysOver: 5,  status: "Due soon" },
      { id: "INV-2025-67",  project: "Carillion Warehouse AD", amount: 1_200_000, invDate: "2026-02-28", dueDate: "2026-04-29", daysOver: 0,  status: "Current" },
      { id: "INV-2025-78",  project: "Al Futtaim Mall Sharjah", amount: 600_000,   invDate: "2026-03-12", dueDate: "2026-05-11", daysOver: 0,  status: "Current" },
    ],
    invoicesYTD: 18_400_000, paidYTD: 4_800_000, outstanding: 13_600_000, avgDaysToPay: 94, worstInv: "INV-2024-89 (AED 4.8M, 127 days overdue)",
    paymentTrend: Array.from({ length: 24 }, (_, i) => ({
      m: `M${i + 1}`,
      days: Math.round(45 + (i / 23) * 49 + (i > 14 ? (i - 14) * 1.5 : 0) + (Math.sin(i * 1.3) * 3)),
    })),
    revenueTrend: (() => {
      const peakAt = 8;
      const base = [9.2, 10.1, 11.8, 12.4, 11.6, 13.1, 13.8, 14.2, 13.4, 12.1, 11.0, 10.2, 9.4, 8.6, 7.9, 7.2, 6.4, 5.8, 5.2, 4.8, 4.4, 4.1, 3.9, 3.7];
      let cum = 0;
      return base.map((rev, i) => { cum += rev; return { m: `M${i + 1}`, rev, cum: Math.round(cum * 10) / 10 }; });
    })(),
  },
};

function defaultExtra(name: string) {
  return {
    contacts: [
      { name: "Procurement Lead",     role: "Procurement Manager", dept: "Procurement", phone: "+971 50 000 0001", email: `procurement@${name.toLowerCase().replace(/\s+/g, "")}.com`, primary: true },
      { name: "Commercial Director",  role: "Commercial Director", dept: "Commercial",  phone: "+971 50 000 0002", email: `commercial@${name.toLowerCase().replace(/\s+/g, "")}.com` },
      { name: "Project Manager",      role: "Project Manager",     dept: "Projects",    phone: "+971 50 000 0003", email: `pm@${name.toLowerCase().replace(/\s+/g, "")}.com` },
    ],
    invoices: [] as never[],
    invoicesYTD: 0, paidYTD: 0, outstanding: 0, avgDaysToPay: 60, worstInv: "—",
    paymentTrend: Array.from({ length: 24 }, (_, i) => ({ m: `M${i + 1}`, days: 55 + Math.round(Math.sin(i / 2) * 6) })),
    revenueTrend: Array.from({ length: 24 }, (_, i) => ({ m: `M${i + 1}`, rev: 4 + Math.sin(i / 2) * 2, cum: (4 + Math.sin(i / 2) * 2) * (i + 1) })),
  };
}

export default function ClientForm() {
  const { id = "c-afc" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, clientById, employeeById } = useAppState();
  const client = clientById(id);

  const idx = state.clients.findIndex((c) => c.id === id);
  const allClients = state.clients;

  const linkedOpps = useMemo(() => state.opportunities.filter((o) => o.clientId === id), [state.opportunities, id]);
  const linkedProjects = useMemo(() => state.projects.filter((p) => p.clientId === id), [state.projects, id]);
  const linkedInvoices = useMemo(() => state.customerInvoices.filter((i) => i.clientId === id), [state.customerInvoices, id]);
  const extra = client ? (CLIENT_EXTRA[id] ?? defaultExtra(client.name)) : defaultExtra("");

  if (!client) {
    return <div className="p-8 text-muted-foreground">Client not found.</div>;
  }

  const owner = employeeById(client.ownerId);

  function nav(delta: number) {
    const next = allClients[idx + delta];
    if (next) navigate(`/crm/clients/${next.id}`);
  }

  const arTone = client.arOutstanding >= 6_000_000 ? "red" : client.arOutstanding >= 3_000_000 ? "amber" : "green";
  const isSlowPayer = client.paymentScore < 70;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top toolbar */}
      <div className="flex items-center gap-2 h-10 px-4 border-b border-rule bg-surface shrink-0">
        <div className="text-[12px] text-muted-foreground">
          CRM <span className="mx-1">›</span>
          <button onClick={() => navigate("/crm/clients")} className="hover:text-foreground hover:underline">Clients</button>
          <span className="mx-1">›</span>
          <span className="text-foreground font-medium">{client.name}</span>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[12px] text-muted-foreground tabular-nums">
          <span>{idx + 1} / {allClients.length}</span>
          <button onClick={() => nav(-1)} disabled={idx <= 0} className="h-6 w-6 hover:bg-surface-hover rounded-sm grid place-items-center disabled:opacity-30"><ChevronLeft className="h-3.5 w-3.5" /></button>
          <button onClick={() => nav(1)} disabled={idx >= allClients.length - 1} className="h-6 w-6 hover:bg-surface-hover rounded-sm grid place-items-center disabled:opacity-30"><ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {/* Identity row */}
      <div className="px-4 py-3 bg-surface border-b border-rule shrink-0 flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-navy text-primary-foreground text-[14px] font-bold flex items-center justify-center shrink-0">
          {client.name.split(/[\s-]/).map((p) => p[0]).slice(0, 3).join("")}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-bold text-foreground truncate">{client.name}</h1>
            <Tag tone={client.tier === "T1" ? "gold" : "grey"}>{client.tier} {client.tier === "T1" && "Strategic"}</Tag>
            {isSlowPayer && <Tag tone="amber">⚠ Slow payer</Tag>}
          </div>
          <div className="text-[12px] text-muted-foreground mt-0.5">{client.legalName ?? client.name}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-[12px]">Edit</Button>
          <Button size="sm" variant="outline" onClick={() => navigate(`/crm/opportunities/new?client=${id}`)} className="h-7 text-[12px]">+ New Opportunity</Button>
          <Button size="sm" variant="outline" className="h-7 text-[12px]" onClick={() => toast.success("Activity logged")}>Log Activity</Button>
          <Button size="sm" onClick={() => navigate(`/sales/quotations/new?client=${id}`)} className="h-7 text-[12px]">+ New Quote</Button>
          <Button size="sm" variant="outline" onClick={() => toast.success("Reminder drafted")} className="h-7 text-[12px] border-warning text-warning hover:bg-warning/10">Send Reminder</Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="px-4 py-2 bg-surface-alt border-b border-rule shrink-0 grid grid-cols-6 gap-2">
        <KpiTile label="Lifetime Revenue" value={fmtAED(client.lifetimeRevenue, { compact: true })} />
        <KpiTile label="Active Projects" value={String(client.activeProjects)} />
        <KpiTile label="Open Quotes" value={String(client.openQuotes)} sub={fmtAED(client.openQuotesValue, { compact: true })} />
        <KpiTile label="AR Outstanding" value={fmtAED(client.arOutstanding, { compact: true })} tone={arTone} />
        <KpiTile label="AR > 90 days" value={fmtAED(client.arOver90, { compact: true })} tone={client.arOver90 > 0 ? "red" : "green"} />
        <KpiTile label="YoY Volume" value={`${client.yoyDelta >= 0 ? "▲" : "▼"} ${Math.abs(client.yoyDelta)}%`} tone={client.yoyDelta >= 0 ? "green" : "red"} />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto bg-surface-alt">
        <div className="p-4 space-y-4 max-w-[1400px]">
          {/* Field groups */}
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup title="Client Details">
              <Field label="Legal Name">{client.legalName ?? client.name}</Field>
              <Field label="Trade License #">{client.tradeLicense ?? "—"}</Field>
              <Field label="VAT TRN">{client.vatTrn ?? "—"}</Field>
              <Field label="Industry">{client.industry ?? "—"}</Field>
              <Field label="Established">{client.established ?? "—"}</Field>
              <Field label="Parent Group">Al Futtaim Group</Field>
              <Field label="Address">{client.address ?? "Festival Tower, Dubai Festival City, Dubai"}</Field>
              <Field label="Website">{client.website ?? "—"}</Field>
              <Field label="Main Phone">{client.phone ?? "—"}</Field>
            </FieldGroup>

            <FieldGroup title="Commercial Terms">
              <Field label="Relationship Owner">
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded-full bg-navy text-primary-foreground text-[9px] font-semibold flex items-center justify-center">{owner?.initials}</div>
                  <span>{owner?.name ?? "—"}</span>
                </div>
              </Field>
              <Field label="Tier"><Tag tone={client.tier === "T1" ? "gold" : "grey"}>{client.tier} {client.tier === "T1" && "(Strategic)"}</Tag></Field>
              <Field label="Payment Terms">{client.paymentTerms}</Field>
              <Field label="Credit Limit">{fmtAED(client.creditLimit)}</Field>
              <Field label="Active Since">March 2014</Field>
              <Field label="Status">
                <span className="text-foreground">{client.status} {isSlowPayer && <span className="text-warning">— Credit Hold Recommended</span>}</span>
              </Field>
              <Field label="Risk Flag">{isSlowPayer ? <Tag tone="amber">⚠ Slow payer (auto)</Tag> : <Tag tone="green">No flags</Tag>}</Field>
              <Field label="Retention %">10% (standard)</Field>
              <Field label="Insurance Required">Yes — verified</Field>
            </FieldGroup>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="projects">
            <TabsList className="bg-transparent border-b border-rule rounded-none h-auto p-0 w-full justify-start gap-0">
              <TabTrigger v="projects">Active Projects ({linkedProjects.length})</TabTrigger>
              <TabTrigger v="opps">Opportunities ({linkedOpps.length})</TabTrigger>
              <TabTrigger v="contacts">Contacts ({extra.contacts.length})</TabTrigger>
              <TabTrigger v="invoices">Invoices & Payments</TabTrigger>
              <TabTrigger v="activities">Activities</TabTrigger>
              <TabTrigger v="documents">Documents</TabTrigger>
              <TabTrigger v="ai">AI Insights</TabTrigger>
            </TabsList>

            {/* Projects */}
            <TabsContent value="projects" className="bg-surface border border-rule border-t-0 rounded-b-sm p-3 mt-0">
              <table className="w-full text-[13px] tabular-nums">
                <thead className="border-b border-rule text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-2 py-1.5 text-left">Project</th>
                    <th className="px-2 py-1.5 text-left">Division</th>
                    <th className="px-2 py-1.5 text-right">PO Value (AED)</th>
                    <th className="px-2 py-1.5 text-right">Quoted M%</th>
                    <th className="px-2 py-1.5 text-right">Live M%</th>
                    <th className="px-2 py-1.5 text-right">Δ</th>
                    <th className="px-2 py-1.5 text-right">Days to Handover</th>
                    <th className="px-2 py-1.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedProjects.length === 0 && <tr><td colSpan={8} className="px-2 py-6 text-center text-muted-foreground">No active projects.</td></tr>}
                  {linkedProjects.map((p) => {
                    const delta = p.liveMargin - p.quotedMargin;
                    return (
                      <tr key={p.id} onClick={() => navigate(`/projects/${p.id}`)} className="border-b border-rule hover:bg-surface-hover cursor-pointer">
                        <td className="px-2 py-1.5 font-medium text-navy">{p.name}</td>
                        <td className="px-2 py-1.5 text-muted-foreground">{p.division}</td>
                        <td className="px-2 py-1.5 text-right">{fmtAED(p.poValue, { compact: true }).replace("AED ", "")}</td>
                        <td className="px-2 py-1.5 text-right">{p.quotedMargin.toFixed(1)}%</td>
                        <td className="px-2 py-1.5 text-right font-medium">{p.liveMargin.toFixed(1)}%</td>
                        <td className={cn("px-2 py-1.5 text-right font-medium", delta < 0 ? "text-danger" : "text-success")}>{delta > 0 ? "+" : ""}{delta.toFixed(1)}</td>
                        <td className="px-2 py-1.5 text-right">{p.daysToHandover}</td>
                        <td className="px-2 py-1.5"><Tag tone={p.health === "Critical" ? "red" : p.health === "Watch" ? "amber" : "green"}>● {p.health}</Tag></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TabsContent>

            {/* Opportunities */}
            <TabsContent value="opps" className="bg-surface border border-rule border-t-0 rounded-b-sm p-3 mt-0">
              <table className="w-full text-[13px] tabular-nums">
                <thead className="border-b border-rule text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-2 py-1.5 text-left">Opportunity</th>
                    <th className="px-2 py-1.5 text-left">Consultant</th>
                    <th className="px-2 py-1.5 text-right">Value (AED)</th>
                    <th className="px-2 py-1.5">Stage</th>
                    <th className="px-2 py-1.5 text-left">Engineer</th>
                    <th className="px-2 py-1.5 text-left">Expected Close</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedOpps.length === 0 && <tr><td colSpan={6} className="px-2 py-6 text-center text-muted-foreground">No opportunities.</td></tr>}
                  {linkedOpps.map((o) => {
                    const eng = employeeById(o.engineerId);
                    return (
                      <tr key={o.id} onClick={() => navigate(`/crm/opportunities/${o.id}`)} className="border-b border-rule hover:bg-surface-hover cursor-pointer">
                        <td className="px-2 py-1.5 font-medium text-navy">{o.name}</td>
                        <td className="px-2 py-1.5 text-muted-foreground">{o.consultant}</td>
                        <td className="px-2 py-1.5 text-right">{fmtAED(o.value, { compact: true }).replace("AED ", "")}</td>
                        <td className="px-2 py-1.5"><Tag tone={o.stage === "Won" ? "green" : o.stage === "Lost" ? "red" : "blue"}>{o.stage}</Tag></td>
                        <td className="px-2 py-1.5 text-muted-foreground">{eng?.name ?? "—"}</td>
                        <td className="px-2 py-1.5 text-muted-foreground">{fmtDate(o.expectedClose)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {linkedOpps.length > 0 && (
                <div className="px-2 py-2 mt-2 border-t border-rule text-[12px] text-muted-foreground">
                  {linkedOpps.length} opportunities · <span className="font-medium text-foreground">{fmtAED(linkedOpps.reduce((s, o) => s + o.value, 0), { compact: true })}</span> open pipeline
                </div>
              )}
            </TabsContent>

            {/* Contacts */}
            <TabsContent value="contacts" className="bg-surface border border-rule border-t-0 rounded-b-sm p-3 mt-0">
              <div className="flex justify-end mb-2">
                <Button size="sm" className="h-7 text-[12px]">+ Add Contact</Button>
              </div>
              <table className="w-full text-[13px]">
                <thead className="border-b border-rule text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-2 py-1.5 text-left">Name</th>
                    <th className="px-2 py-1.5 text-left">Role</th>
                    <th className="px-2 py-1.5 text-left">Department</th>
                    <th className="px-2 py-1.5 text-left">Phone</th>
                    <th className="px-2 py-1.5 text-left">Email</th>
                    <th className="px-2 py-1.5 text-center">Primary</th>
                  </tr>
                </thead>
                <tbody>
                  {extra.contacts.map((c) => (
                    <tr key={c.email} className="border-b border-rule hover:bg-surface-hover">
                      <td className="px-2 py-1.5 font-medium">{c.name}</td>
                      <td className="px-2 py-1.5">{c.role}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{c.dept}</td>
                      <td className="px-2 py-1.5 tabular-nums">{c.phone}</td>
                      <td className="px-2 py-1.5 text-mod-crm">{c.email}</td>
                      <td className="px-2 py-1.5 text-center">{c.primary && <Star className="h-3.5 w-3.5 inline text-gold fill-gold" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TabsContent>

            {/* Invoices */}
            <TabsContent value="invoices" className="bg-surface border border-rule border-t-0 rounded-b-sm p-3 mt-0 space-y-3">
              <div className="grid grid-cols-5 gap-2 text-[12px]">
                <SmallStat label="Invoiced YTD" value={fmtAED(extra.invoicesYTD, { compact: true })} />
                <SmallStat label="Paid YTD" value={fmtAED(extra.paidYTD, { compact: true })} />
                <SmallStat label="Outstanding" value={fmtAED(extra.outstanding, { compact: true })} tone="red" />
                <SmallStat label="Avg Days to Pay" value={`${extra.avgDaysToPay}d`} tone={extra.avgDaysToPay > 60 ? "red" : "green"} />
                <SmallStat label="Worst Invoice" value={extra.worstInv} small />
              </div>

              {client.arOver90 > 0 && (
                <div className="border border-danger/40 bg-danger/5 rounded-sm p-2.5 flex items-center gap-2 text-[12px]">
                  <AlertTriangle className="h-4 w-4 text-danger shrink-0" />
                  <span className="text-foreground">
                    <span className="font-semibold text-danger">{fmtAED(client.arOver90, { compact: true })}</span> aged &gt;90 days. Last communication 14 days ago.
                  </span>
                  <Button size="sm" variant="outline" className="h-6 text-[11px] ml-auto border-danger text-danger hover:bg-danger/10" onClick={() => toast.success("Escalation letter draft opened")}>Draft escalation letter</Button>
                </div>
              )}

              <table className="w-full text-[13px] tabular-nums">
                <thead className="border-b border-rule text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-2 py-1.5 text-left">Invoice #</th>
                    <th className="px-2 py-1.5 text-left">Project</th>
                    <th className="px-2 py-1.5 text-right">Amount (AED)</th>
                    <th className="px-2 py-1.5 text-left">Invoice Date</th>
                    <th className="px-2 py-1.5 text-left">Due Date</th>
                    <th className="px-2 py-1.5 text-right">Days Overdue</th>
                    <th className="px-2 py-1.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(extra.invoices.length > 0 ? extra.invoices : linkedInvoices.map((i) => ({
                    id: i.id, project: i.projectId ?? "—", amount: i.amount, invDate: i.invoiceDate, dueDate: i.dueDate,
                    daysOver: Math.max(0, Math.floor((Date.now() - new Date(i.dueDate).getTime()) / 86400000)),
                    status: i.status === "Overdue" ? ("Overdue" as const) : (i.ageDays > 30 ? ("Due soon" as const) : ("Current" as const)),
                  }))).map((inv) => (
                    <tr key={inv.id} className="border-b border-rule hover:bg-surface-hover">
                      <td className="px-2 py-1.5 font-medium text-navy">{inv.id}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{inv.project}</td>
                      <td className="px-2 py-1.5 text-right">{inv.amount.toLocaleString()}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{fmtDate(inv.invDate)}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{fmtDate(inv.dueDate)}</td>
                      <td className={cn("px-2 py-1.5 text-right font-medium", inv.daysOver > 0 && "text-danger")}>{inv.daysOver > 0 ? inv.daysOver : "—"}</td>
                      <td className="px-2 py-1.5"><Tag tone={inv.status === "Overdue" ? "red" : inv.status === "Due soon" ? "amber" : "green"}>{inv.status}</Tag></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TabsContent>

            {/* Activities */}
            <TabsContent value="activities" className="bg-surface border border-rule border-t-0 rounded-b-sm p-3 mt-0">
              <div className="flex justify-end mb-2">
                <Button size="sm" className="h-7 text-[12px]" onClick={() => toast.success("Activity dialog opened")}>+ Log Activity</Button>
              </div>
              <div className="space-y-2.5">
                {[
                  { icon: "📞", date: "18 Apr 2026", subj: "Payment follow-up on INV-2024-89", who: "Manmohan", outcome: "AP team confirmed Q2 budget release pending approval from group CFO. Will follow up 25 Apr." },
                  { icon: "🤝", date: "12 Apr 2026", subj: "Q2 project review meeting", who: "Farook + Manmohan", outcome: "Discussed Meraas Tower B4 VO status and Festival City scope expansion opportunity." },
                  { icon: "📞", date: "05 Apr 2026", subj: "Call re: Sobha site visit", who: "Manmohan", outcome: "Coordinated VO submission strategy." },
                  { icon: "✉",  date: "28 Mar 2026", subj: "Email: Quote Q-24812 submitted", who: "R. Kumar", outcome: "" },
                  { icon: "🏗", date: "22 Mar 2026", subj: "Site visit Meraas Tower B4 commissioning", who: "R. Kumar + Manmohan", outcome: "Identified 3 additional FCUs needed — VO to follow." },
                  { icon: "✉",  date: "15 Mar 2026", subj: "LPD Notice #1 sent on INV-2024-89", who: "Accounts", outcome: "" },
                  { icon: "📞", date: "08 Mar 2026", subj: "Call to Sarah Thompson re: AP schedule", who: "Manmohan", outcome: "" },
                ].map((a, i) => (
                  <div key={i} className="flex gap-3 pb-2.5 border-b border-rule last:border-0">
                    <div className="text-[16px] leading-none mt-0.5">{a.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[13px] font-medium">{a.subj}</div>
                        <div className="text-[11px] text-muted-foreground tabular-nums shrink-0">{a.date}</div>
                      </div>
                      {a.outcome && <div className="text-[12px] text-muted-foreground italic mt-0.5">"{a.outcome}"</div>}
                      <div className="text-[11px] text-muted-foreground mt-0.5">{a.who}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Documents */}
            <TabsContent value="documents" className="bg-surface border border-rule border-t-0 rounded-b-sm p-3 mt-0">
              <div className="border-2 border-dashed border-rule rounded-sm p-6 text-center text-[12px] text-muted-foreground mb-3">Drag & drop files here, or click to upload</div>
              <ul className="text-[13px] divide-y divide-rule">
                {[
                  "Master_Services_Agreement_2014.pdf",
                  "FIDIC_Conditions_Attachment.pdf",
                  "Trade_License_AFC_2026.pdf",
                  "VAT_Certificate.pdf",
                  "Credit_Application_approved.pdf",
                  "Insurance_Verification_Q1_2026.pdf",
                  "LPD_Notice_INV-2024-89.pdf",
                ].map((f) => (
                  <li key={f} className="flex items-center justify-between py-2">
                    <span>📄 {f}</span>
                    <span className="text-[11px] text-muted-foreground">view · download</span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            {/* AI Insights */}
            <TabsContent value="ai" className="bg-surface border border-rule border-t-0 rounded-b-sm p-3 mt-0 space-y-3">
              {/* Risk Card */}
              <div className="border-2 border-gold/60 bg-gold/5 rounded-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-gold-deep" />
                  <span className="text-[12px] font-bold uppercase tracking-wide text-gold-deep">AI Risk Assessment</span>
                  <span className="text-[11px] text-muted-foreground ml-auto">Updated 20 Apr 2026</span>
                </div>
                <p className="text-[13px] text-foreground leading-relaxed">
                  <span className="font-semibold">{client.name}</span>'s payment behavior has deteriorated over 24 months:
                </p>
                <ul className="text-[12px] text-foreground mt-1.5 space-y-0.5 list-disc pl-5">
                  <li>Avg days-to-pay: <span className="font-medium">45 → 94</span> (⬆ 34 days)</li>
                  <li>Invoices &gt;90 days overdue: <span className="font-medium">0 → 2</span> ({fmtAED(client.arOver90, { compact: true })})</li>
                  <li>YoY volume: <span className="font-medium text-danger">▼ {Math.abs(client.yoyDelta)}%</span></li>
                </ul>
                <div className="mt-3 text-[12px] text-foreground">
                  <div className="font-semibold mb-1">Combined exposure if default:</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[12px]">
                    <span className="text-muted-foreground">AR outstanding:</span><span className="text-right tabular-nums">{fmtAED(client.arOutstanding, { compact: true })}</span>
                    <span className="text-muted-foreground">Work-in-progress not invoiced:</span><span className="text-right tabular-nums">AED 8.2M</span>
                    <span className="text-muted-foreground">Committed supplier POs:</span><span className="text-right tabular-nums">AED 2.1M</span>
                    <span className="font-semibold border-t border-gold/40 pt-1">Total exposure:</span><span className="text-right tabular-nums font-bold text-danger border-t border-gold/40 pt-1">AED 23.9M</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">12.7% of annual pipeline · Probability of AED 6.9M becoming bad debt: <span className="font-bold text-danger">22%</span></div>
                </div>
                <div className="mt-3 text-[12px] text-foreground">
                  <div className="font-semibold mb-1">Recommended actions:</div>
                  <ol className="list-decimal pl-5 space-y-0.5">
                    <li>Send LPD Notice #2 on INV-2024-89 (draft ready)</li>
                    <li>Pause new supplier POs on their active projects</li>
                    <li>Tighten credit terms on new quotes (suggested: 30-day net, 15% advance)</li>
                    <li>Escalate to GM Farook Aliyar for strategic review</li>
                  </ol>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="h-7 text-[12px] bg-gold-deep hover:bg-gold text-navy-deep" onClick={() => toast.success("LPD Notice draft generated")}>Draft LPD Notice</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[12px]" onClick={() => toast.success("Risk memo exported")}>Export risk memo</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[12px]" onClick={() => toast.success("Exec review scheduled")}>Schedule exec review</Button>
                </div>
              </div>

              {/* Payment behavior chart */}
              <div className="border border-rule rounded-sm p-3 bg-surface">
                <div className="text-[12px] font-bold uppercase tracking-wide text-foreground">Payment Behavior — Last 24 months</div>
                <div className="text-[11px] text-muted-foreground mb-2">Average days-to-pay vs contractual 60-day term</div>
                <div style={{ width: "100%", height: 200 }}>
                  <ResponsiveContainer>
                    <LineChart data={extra.paymentTrend} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
                      <CartesianGrid stroke="hsl(var(--rule))" strokeDasharray="2 2" vertical={false} />
                      <XAxis dataKey="m" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[0, 110]} />
                      <Tooltip contentStyle={{ fontSize: 11, padding: "4px 8px" }} />
                      <ReferenceLine y={60} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" label={{ value: "60d term", fontSize: 10, fill: "hsl(var(--muted-foreground))", position: "right" }} />
                      <Line type="monotone" dataKey="days" stroke="hsl(var(--danger))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 italic">Contract terms: 60-day net. Breach began ~14 months ago.</div>
              </div>

              {/* Revenue chart */}
              <div className="border border-rule rounded-sm p-3 bg-surface">
                <div className="text-[12px] font-bold uppercase tracking-wide text-foreground">Relationship Value — Last 24 months</div>
                <div className="text-[11px] text-muted-foreground mb-2">Monthly invoiced (bars) and cumulative lifetime revenue (line, AED M)</div>
                <div style={{ width: "100%", height: 200 }}>
                  <ResponsiveContainer>
                    <ComposedChart data={extra.revenueTrend} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
                      <CartesianGrid stroke="hsl(var(--rule))" strokeDasharray="2 2" vertical={false} />
                      <XAxis dataKey="m" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ fontSize: 11, padding: "4px 8px" }} />
                      <Bar yAxisId="left" dataKey="rev" fill="hsl(var(--navy))" radius={[2, 2, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="cum" stroke="hsl(var(--gold-deep))" strokeWidth={2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 italic">
                  Lifetime revenue {fmtAED(client.lifetimeRevenue, { compact: true })}. Peak quarter: Q3 2023 (AED 14.2M). YTD 2026: AED 18.4M (pace suggests AED 48M year — below AED 62M 2024).
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Chatter recordType="Client" recordId={client.id} />
        </div>
      </div>
    </div>
  );
}

function KpiTile({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "red" | "amber" | "green" }) {
  return (
    <div className="bg-surface border border-rule rounded-sm px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</div>
      <div className={cn("text-[16px] font-bold tabular-nums mt-0.5",
        tone === "red" && "text-danger",
        tone === "amber" && "text-warning",
        tone === "green" && "text-success",
        !tone && "text-navy",
      )}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground tabular-nums">{sub}</div>}
    </div>
  );
}

function SmallStat({ label, value, tone, small }: { label: string; value: string; tone?: "red" | "green"; small?: boolean }) {
  return (
    <div className="border border-rule rounded-sm p-2 bg-surface-alt">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</div>
      <div className={cn("font-bold tabular-nums mt-0.5",
        small ? "text-[11px] leading-tight" : "text-[14px]",
        tone === "red" && "text-danger",
        tone === "green" && "text-success",
        !tone && "text-foreground",
      )}>{value}</div>
    </div>
  );
}

function TabTrigger({ v, children }: { v: string; children: React.ReactNode }) {
  return (
    <TabsTrigger value={v}
      className="h-9 px-4 text-[12px] font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-navy data-[state=active]:text-navy data-[state=active]:shadow-none data-[state=active]:bg-transparent">
      {children}
    </TabsTrigger>
  );
}
