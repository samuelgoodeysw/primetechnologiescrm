// CRM > My Pipeline — personal cockpit for the current user (Manmohan Singh).
// Sections: Greeting + KPI strip · Mini Kanban (mine only) · Needs My Attention · Forecast.

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { Phone, Mail, Users, Building2, FileText, AlertTriangle, CircleDollarSign, ChevronRight } from "lucide-react";
import { useAppState } from "@/state/AppState";
import { fmtAED, fmtDate } from "@/lib/format";
import { Tag, Dot } from "@/components/odoo/Tag";
import { stageTone } from "@/state/crm";
import {
  getMyOpportunities, getMyOpenOpportunities, getMyOverdueActivities,
  getMyDueTodayActivities, getMyClosingWithin, getMyClosingInRange,
  getWeightedPipeline, sumValue, daysInStage, PIPELINE_TODAY,
} from "@/state/selectors";
import type { Opportunity, OpportunityStage, Activity } from "@/state/types";
import { cn } from "@/lib/utils";

const KANBAN_STAGES: OpportunityStage[] = [
  "Lead", "Qualified", "BOQ Received", "Quoted", "Submitted", "Shortlisted",
];

type Period = "month" | "quarter" | "ytd";

export default function MyPipeline() {
  const { state } = useAppState();
  const userId = state.currentUserId;
  const [period, setPeriod] = useState<Period>("month");
  const [stageFilter, setStageFilter] = useState<"all" | "hot" | "stalled">("all");
  const [forecastView, setForecastView] = useState<"period" | "stage">("period");

  // Selectors
  const myOpen = useMemo(() => getMyOpenOpportunities(state, userId), [state, userId]);
  const myAll = useMemo(() => getMyOpportunities(state, userId), [state, userId]);
  const overdueActs = useMemo(() => getMyOverdueActivities(state, userId), [state, userId]);
  const todayActs = useMemo(() => getMyDueTodayActivities(state, userId), [state, userId]);

  // KPI scope
  const scopedOpen = useMemo(() => {
    if (period === "month") return myOpen.filter((o) => withinDays(o.expectedClose, 0, 30));
    if (period === "quarter") return myOpen.filter((o) => withinDays(o.expectedClose, 0, 90));
    return myOpen; // YTD = all open
  }, [myOpen, period]);

  const pipelineValue = sumValue(scopedOpen);
  const weighted = getWeightedPipeline(scopedOpen);
  const closingMonth = getMyClosingWithin(state, userId, 30);
  const closingValue = sumValue(closingMonth);
  const overdueCount = overdueActs.length + todayActs.length;

  // Mini Kanban filter
  const kanbanOpps = useMemo(() => {
    let list = myOpen;
    if (stageFilter === "hot") list = list.filter((o) => o.tags?.includes("Hot") || o.probability >= 60);
    if (stageFilter === "stalled") list = list.filter((o) => daysInStage(o) > 14);
    return list;
  }, [myOpen, stageFilter]);

  return (
    <div className="flex-1 overflow-auto bg-surface-alt">
      <div className="px-6 py-5 border-b border-rule bg-surface">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">CRM &gt; My Pipeline</div>
      </div>

      <div className="p-6 space-y-8 max-w-[1500px]">
        <GreetingAndKpis
          period={period} setPeriod={setPeriod}
          pipelineValue={pipelineValue} pipelineCount={scopedOpen.length}
          weighted={weighted}
          closingCount={closingMonth.length} closingValue={closingValue}
          overdueCount={overdueCount}
        />

        <MiniKanban
          opportunities={kanbanOpps}
          allCount={myOpen.length}
          stageFilter={stageFilter} setStageFilter={setStageFilter}
        />

        <NeedsAttention overdue={overdueActs} today={todayActs} />

        <Forecast view={forecastView} setView={setForecastView} myOpen={myOpen} />
      </div>
    </div>
  );
}

// ───────── Greeting + KPI strip ─────────
function GreetingAndKpis({
  period, setPeriod, pipelineValue, pipelineCount, weighted,
  closingCount, closingValue, overdueCount,
}: {
  period: Period; setPeriod: (p: Period) => void;
  pipelineValue: number; pipelineCount: number;
  weighted: number;
  closingCount: number; closingValue: number;
  overdueCount: number;
}) {
  const { state, employeeById } = useAppState();
  const me = employeeById(state.currentUserId)!;
  const greeting = "Good morning";

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[20px] font-bold text-navy tracking-tight">
            {greeting}, {me.name.split(" ")[0]}
          </h1>
          <span className="text-[13px] text-muted-foreground">
            Monday, {fmtDate(PIPELINE_TODAY.toISOString())}
          </span>
        </div>
        <Segmented
          value={period}
          onChange={(v) => setPeriod(v as Period)}
          options={[
            { value: "month", label: "This Month" },
            { value: "quarter", label: "This Quarter" },
            { value: "ytd", label: "YTD" },
          ]}
        />
      </div>

      <div className="grid grid-cols-4 gap-3">
        <KpiTile
          label="My Pipeline Value"
          value={fmtAED(pipelineValue, { compact: true })}
          sub={`${pipelineCount} open deals`}
        />
        <KpiTile
          label="Weighted Forecast"
          value={fmtAED(weighted, { compact: true })}
          sub={<span className="text-success">▲ 8% vs last month</span>}
        />
        <KpiTile
          label="Closing This Month"
          value={`${closingCount} deals`}
          sub={fmtAED(closingValue, { compact: true })}
        />
        <KpiTile
          label="Overdue Activities"
          value={String(overdueCount)}
          sub="requires action today"
          danger={overdueCount > 0}
        />
      </div>
    </section>
  );
}

function KpiTile({ label, value, sub, danger }: { label: string; value: React.ReactNode; sub: React.ReactNode; danger?: boolean }) {
  return (
    <div className={cn(
      "h-[120px] rounded-sm border bg-surface p-3 flex flex-col justify-between transition-shadow hover:shadow-card",
      danger ? "border-danger/40" : "border-rule",
    )}>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</div>
      <div className={cn("text-[28px] font-bold tabular-nums leading-none", danger ? "text-danger" : "text-navy")}>{value}</div>
      <div className="text-[12px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function Segmented<T extends string>({ value, onChange, options }: {
  value: T; onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex border border-rule rounded-sm bg-surface overflow-hidden text-[12px]">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={cn(
            "px-3 h-7 transition-colors",
            value === o.value ? "bg-navy text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-surface-hover",
          )}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ───────── Mini Kanban ─────────
function MiniKanban({
  opportunities, allCount, stageFilter, setStageFilter,
}: {
  opportunities: Opportunity[]; allCount: number;
  stageFilter: "all" | "hot" | "stalled";
  setStageFilter: (s: "all" | "hot" | "stalled") => void;
}) {
  const { dispatch } = useAppState();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function onDragEnd(e: DragEndEvent) {
    const id = e.active.id as string;
    const newStage = e.over?.id as OpportunityStage | undefined;
    if (!newStage) return;
    const opp = opportunities.find((o) => o.id === id);
    if (!opp || opp.stage === newStage) return;
    dispatch({ type: "OPP_STAGE", payload: { id, stage: newStage } });
    toast.success(`Moved to ${newStage}`, { description: opp.name });
  }

  return (
    <section>
      <div className="flex items-center justify-between h-10 mb-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[16px] font-bold text-navy">My Active Pipeline</h2>
          <span className="text-[12px] text-muted-foreground">{opportunities.length} of {allCount} mine</span>
        </div>
        <div className="inline-flex border border-rule rounded-sm bg-surface overflow-hidden text-[12px]">
          {[
            { v: "all" as const,     l: "All Stages" },
            { v: "hot" as const,     l: "Hot Only" },
            { v: "stalled" as const, l: "Stalled (>14d)" },
          ].map((o) => (
            <button key={o.v} onClick={() => setStageFilter(o.v)}
              className={cn("px-3 h-7", stageFilter === o.v ? "bg-navy text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-surface-hover")}>
              {o.l}
            </button>
          ))}
        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-6 gap-2">
          {KANBAN_STAGES.map((stage) => {
            const items = opportunities.filter((o) => o.stage === stage);
            return <KanbanColumn key={stage} stage={stage} items={items} />;
          })}
        </div>
      </DndContext>
    </section>
  );
}

function KanbanColumn({ stage, items }: { stage: OpportunityStage; items: Opportunity[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const total = items.reduce((s, o) => s + o.value, 0);
  return (
    <div ref={setNodeRef}
      className={cn(
        "bg-surface border border-rule rounded-sm flex flex-col",
        isOver && "ring-2 ring-navy ring-offset-1",
      )}>
      <div className="px-2.5 py-2 border-b border-rule">
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] font-semibold text-foreground truncate">{stage}</span>
          <span className="text-[11px] text-muted-foreground tabular-nums">{items.length}</span>
        </div>
        <div className="text-[11px] text-muted-foreground tabular-nums">{fmtAED(total, { compact: true })}</div>
      </div>
      <div className="p-1.5 space-y-1.5 max-h-[320px] overflow-y-auto min-h-[180px]">
        {items.map((o) => <KanbanCard key={o.id} o={o} />)}
        {items.length === 0 && (
          <div className="text-[11px] text-muted-foreground text-center py-6">—</div>
        )}
      </div>
    </div>
  );
}

function KanbanCard({ o }: { o: Opportunity }) {
  const navigate = useNavigate();
  const { clientById } = useAppState();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: o.id });
  const client = clientById(o.clientId);
  const days = daysInStage(o);
  const stalled = days > 14;
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50 } : undefined;
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}
      onClick={(e) => { if (!isDragging) { e.stopPropagation(); navigate(`/crm/opportunities/${o.id}`); } }}
      className={cn(
        "bg-surface border border-rule rounded-sm p-2 cursor-grab active:cursor-grabbing hover:shadow-card transition-shadow",
        isDragging && "opacity-50 shadow-elevated",
      )}>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">{client?.name}</div>
      <div className="text-[12px] font-semibold text-foreground leading-tight line-clamp-2">{o.name}</div>
      <div className="text-[13px] font-bold text-navy mt-1 tabular-nums">{fmtAED(o.value, { compact: true })}</div>
      <div className="flex items-center gap-1 mt-1.5">
        <Tag tone="grey" className="text-[10px] h-4 px-1">{o.consultant.split(" ")[0]}</Tag>
        <span className="ml-auto"><Tag tone={stalled ? "red" : "grey"} className="text-[10px] h-4 px-1">{days}d</Tag></span>
      </div>
      {stalled && <div className="text-[10px] text-danger mt-0.5 font-medium">● stalled</div>}
    </div>
  );
}

// ───────── Needs My Attention ─────────
function NeedsAttention({ overdue, today }: { overdue: Activity[]; today: Activity[] }) {
  const { state, dispatch } = useAppState();
  const userId = state.currentUserId;
  const myClientIds = new Set(state.clients.filter((c) => c.ownerId === userId).map((c) => c.id));
  const myOpps = state.opportunities.filter(
    (o) => o.engineerId === userId || myClientIds.has(o.clientId),
  );

  // Build "Deals that need me" list — synthesized from real seed records
  type Item = {
    id: string; tone: "red" | "amber" | "green"; icon: React.ReactNode;
    title: string; reason: string; action: string; href: string;
  };
  const dealItems: Item[] = [
    {
      id: "Q-24812", tone: "amber", icon: <CircleDollarSign className="h-3.5 w-3.5 text-warning" />,
      title: "Q-24812 · Al Naboodah HQ (AED 8.2M)",
      reason: "Quote awaiting your approval before send",
      action: "Review", href: "/sales/quotations/Q-24812",
    },
    {
      id: "RFQ-2026-0087", tone: "amber", icon: <CircleDollarSign className="h-3.5 w-3.5 text-warning" />,
      title: "RFQ-2026-0087 · KingAir 80× FCU (AED 1.84M)",
      reason: "Pending approval — 2 days in your queue",
      action: "Review", href: "/procurement/rfqs",
    },
    {
      id: "VO-2026-0142", tone: "red", icon: <FileText className="h-3.5 w-3.5 text-danger" />,
      title: "VO-2026-0142 · Meraas Tower B4 (AED 420K)",
      reason: "Overdue 89 days — escalation letter ready",
      action: "Review", href: "/projects/vos",
    },
    {
      id: "p-1", tone: "red", icon: <AlertTriangle className="h-3.5 w-3.5 text-danger" />,
      title: "Meraas Tower B4",
      reason: "Live margin dropped to 2.1% (quoted 11.2%)",
      action: "Open project", href: "/projects",
    },
    {
      id: "c-afc", tone: "red", icon: <Building2 className="h-3.5 w-3.5 text-danger" />,
      title: "Al Futtaim Carillion",
      reason: "AR overdue AED 6.9M > 90 days",
      action: "Open client", href: "/crm/clients",
    },
    {
      id: "p-2", tone: "amber", icon: <AlertTriangle className="h-3.5 w-3.5 text-warning" />,
      title: "Sobha Hartland 7",
      reason: "PO delayed 9 days, LD risk AED 62K/week",
      action: "Open project", href: "/projects",
    },
    {
      id: "Q-24798", tone: "amber", icon: <Mail className="h-3.5 w-3.5 text-warning" />,
      title: "Arabtec Construction",
      reason: "Quote Q-24798 waiting for reply 18 days",
      action: "Send reminder", href: "/sales/quotations/Q-24798",
    },
  ];

  const totalCount = overdue.length + today.length + dealItems.length;

  return (
    <section>
      <div className="flex items-center justify-between h-10 mb-2">
        <h2 className="text-[16px] font-bold text-navy flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Needs My Attention
        </h2>
        <Tag tone="navy">{totalCount} items</Tag>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-rule rounded-sm bg-surface">
          <div className="px-3 py-2 border-b border-rule flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Activities</span>
            <span className="text-[11px] text-muted-foreground">{overdue.length} overdue · {today.length} today</span>
          </div>
          <ul className="divide-y divide-rule">
            {[...overdue, ...today].map((a) => (
              <ActivityRow key={a.id} a={a}
                isOverdue={overdue.includes(a)}
                onDone={() => {
                  dispatch({ type: "ACTIVITY_COMPLETE", payload: { id: a.id } });
                  toast.success("Activity completed");
                }} />
            ))}
            {overdue.length === 0 && today.length === 0 && (
              <li className="px-3 py-6 text-[12px] text-muted-foreground text-center">No activities pending. Inbox zero.</li>
            )}
          </ul>
        </div>

        <div className="border border-rule rounded-sm bg-surface">
          <div className="px-3 py-2 border-b border-rule">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Deals & Approvals</span>
          </div>
          <ul className="divide-y divide-rule">
            {dealItems.map((it) => <DealRow key={it.id} item={it} />)}
          </ul>
        </div>
      </div>

      {/* Hidden but real: drives "mine" filtering for accuracy */}
      <span className="sr-only">{myOpps.length} opportunities in mine scope</span>
    </section>
  );
}

function ActivityRow({ a, isOverdue, onDone }: { a: Activity; isOverdue: boolean; onDone: () => void }) {
  const { clientById, opportunityById, projectById } = useAppState();
  const [fading, setFading] = useState(false);

  const related = (() => {
    if (a.relatedType === "Client") return clientById(a.relatedId)?.name ?? a.relatedId;
    if (a.relatedType === "Opportunity") return opportunityById(a.relatedId)?.name ?? a.relatedId;
    if (a.relatedType === "Project") return projectById(a.relatedId)?.name ?? a.relatedId;
    return a.relatedId;
  })();

  const due = (() => {
    if (!a.scheduledFor) return "—";
    if (isOverdue) {
      const days = Math.ceil((PIPELINE_TODAY.getTime() - new Date(a.scheduledFor).getTime()) / 86400000);
      return `Overdue ${days}d`;
    }
    return `Today ${a.scheduledFor.slice(11, 16)}`;
  })();

  const icon = (() => {
    switch (a.type) {
      case "Call": return <Phone className="h-3.5 w-3.5" />;
      case "Email": return <Mail className="h-3.5 w-3.5" />;
      case "Meeting": return <Users className="h-3.5 w-3.5" />;
      case "Site Visit": return <Building2 className="h-3.5 w-3.5" />;
      default: return <FileText className="h-3.5 w-3.5" />;
    }
  })();

  return (
    <li className={cn(
      "px-3 py-2 flex items-center gap-2.5 text-[13px] transition-all duration-300",
      isOverdue ? "border-l-2 border-l-danger" : "border-l-2 border-l-gold",
      fading && "opacity-0 -translate-x-2",
    )}>
      <span className={cn("shrink-0", isOverdue ? "text-danger" : "text-gold-deep")}>{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground truncate">{a.subject}</div>
        <div className="text-[11px] text-muted-foreground truncate">{related}</div>
      </div>
      <div className={cn("text-[11px] tabular-nums shrink-0", isOverdue ? "text-danger font-semibold" : "text-muted-foreground")}>{due}</div>
      <button
        onClick={() => { setFading(true); setTimeout(onDone, 250); }}
        className="text-[11px] text-mod-crm hover:underline shrink-0"
      >
        Mark done
      </button>
    </li>
  );
}

function DealRow({ item }: { item: { tone: "red" | "amber" | "green"; icon: React.ReactNode; title: string; reason: string; action: string; href: string } }) {
  const navigate = useNavigate();
  return (
    <li className="px-3 py-2 flex items-center gap-2.5 text-[13px] hover:bg-surface-hover">
      <Dot tone={item.tone} />
      <span className="shrink-0">{item.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground truncate">{item.title}</div>
        <div className="text-[11px] text-muted-foreground truncate">{item.reason}</div>
      </div>
      <button
        onClick={() => navigate(item.href)}
        className="text-[11px] text-mod-crm hover:underline shrink-0 flex items-center gap-0.5"
      >
        {item.action} <ChevronRight className="h-3 w-3" />
      </button>
    </li>
  );
}

// ───────── Forecast ─────────
function Forecast({
  view, setView, myOpen,
}: {
  view: "period" | "stage";
  setView: (v: "period" | "stage") => void;
  myOpen: Opportunity[];
}) {
  const { state } = useAppState();
  const userId = state.currentUserId;

  const periods = useMemo(() => [
    { key: "month", label: "This Month",   sub: "20 Apr – 20 May",  range: [0, 30] as const },
    { key: "next",  label: "Next Month",   sub: "21 May – 20 Jun",  range: [31, 60] as const },
    { key: "q",     label: "Next Quarter", sub: "21 Jun – 20 Sep",  range: [61, 150] as const },
  ].map((p) => {
    const opps = getMyClosingInRange(state, userId, p.range[0], p.range[1]);
    return {
      ...p,
      weighted: getWeightedPipeline(opps),
      pipeline: sumValue(opps),
      count: opps.length,
      breakdown: stageBreakdown(opps),
    };
  }), [state, userId]);

  const stageData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of myOpen) {
      map[o.stage] = (map[o.stage] ?? 0) + o.value * (o.probability / 100);
    }
    return KANBAN_STAGES.map((s) => ({ stage: s, value: Math.round(map[s] ?? 0) }));
  }, [myOpen]);

  return (
    <section>
      <div className="flex items-center justify-between h-10 mb-2">
        <h2 className="text-[16px] font-bold text-navy">Forecast</h2>
        <Segmented
          value={view}
          onChange={(v) => setView(v as "period" | "stage")}
          options={[
            { value: "period", label: "By Period" },
            { value: "stage",  label: "By Stage" },
          ]}
        />
      </div>

      <div className="border border-rule rounded-sm bg-surface p-4 min-h-[320px]">
        {view === "period" ? (
          <div className="grid grid-cols-3 gap-6">
            {periods.map((p) => (
              <div key={p.key} className="space-y-2">
                <div>
                  <div className="text-[12px] font-semibold text-foreground">{p.label}</div>
                  <div className="text-[11px] text-muted-foreground">{p.sub}</div>
                </div>
                <div className="text-[22px] font-bold text-navy tabular-nums leading-tight">
                  {fmtAED(p.weighted, { compact: true })}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  weighted · pipeline <span className="tabular-nums">{fmtAED(p.pipeline, { compact: true })}</span> · {p.count} deals
                </div>
                <StackedStageBar segments={p.breakdown} />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} layout="vertical" margin={{ left: 16, right: 24, top: 8, bottom: 8 }}>
                <CartesianGrid horizontal={false} stroke="hsl(var(--rule))" />
                <XAxis type="number" tickFormatter={(v) => fmtAED(Number(v), { compact: true })} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis type="category" dataKey="stage" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
                <RTooltip
                  cursor={{ fill: "hsl(var(--surface-hover))" }}
                  formatter={(v: number) => fmtAED(Number(v), { compact: true })}
                  contentStyle={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--rule))", borderRadius: 4, fontSize: 12 }}
                />
                <Bar dataKey="value" fill="hsl(var(--navy))" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="text-[12px] italic text-muted-foreground mt-4 pt-3 border-t border-rule">
          Your close rate on Shortlisted deals is 67% YTD — above the team average of 54%.
          If this holds, expect AED 19M+ to close this month.
        </div>
      </div>
    </section>
  );
}

function stageBreakdown(opps: Opportunity[]): { stage: OpportunityStage; pct: number }[] {
  const total = sumValue(opps);
  if (total === 0) return [];
  const byStage: Record<string, number> = {};
  for (const o of opps) byStage[o.stage] = (byStage[o.stage] ?? 0) + o.value;
  return Object.entries(byStage)
    .map(([stage, v]) => ({ stage: stage as OpportunityStage, pct: (v / total) * 100 }))
    .sort((a, b) => b.pct - a.pct);
}

function StackedStageBar({ segments }: { segments: { stage: OpportunityStage; pct: number }[] }) {
  if (segments.length === 0) {
    return <div className="h-2 bg-surface-alt rounded-sm" />;
  }
  const stageColor: Record<OpportunityStage, string> = {
    "Lead": "hsl(213 15% 60%)",
    "Qualified": "#1e88e5",
    "BOQ Received": "#7b3aa3",
    "Quoted": "hsl(var(--navy))",
    "Submitted": "hsl(var(--warning))",
    "Shortlisted": "hsl(var(--gold))",
    "Won": "hsl(var(--success))",
    "Lost": "hsl(var(--danger))",
  };
  return (
    <div className="space-y-1">
      <div className="h-2 bg-surface-alt rounded-sm overflow-hidden flex">
        {segments.map((s) => (
          <div key={s.stage} style={{ width: `${s.pct}%`, background: stageColor[s.stage] }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
        {segments.map((s) => {
          const tone = stageTone(s.stage);
          return (
            <span key={s.stage} className="inline-flex items-center gap-1">
              <Tag tone={tone} className="h-3 px-1 text-[9px]">{s.stage}</Tag>
              <span className="tabular-nums">{s.pct.toFixed(0)}%</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ───────── helpers ─────────
function withinDays(iso: string, fromDays: number, toDays: number): boolean {
  const d = new Date(iso);
  const start = new Date(PIPELINE_TODAY); start.setDate(start.getDate() + fromDays);
  const end = new Date(PIPELINE_TODAY); end.setDate(end.getDate() + toDays);
  return d >= start && d <= end;
}
