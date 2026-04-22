// CRM > Opportunities — Kanban view with drag-drop stage changes.
import { DndContext, type DragEndEvent, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppState } from "@/state/AppState";
import { fmtAED } from "@/lib/format";
import { OPP_STAGES_FULL } from "@/state/crm";
import type { Opportunity, OpportunityStage } from "@/state/types";
import { Tag } from "@/components/odoo/Tag";
import { cn } from "@/lib/utils";

const KANBAN_STAGES: OpportunityStage[] = ["Lead", "Qualified", "BOQ Received", "Quoted", "Submitted", "Shortlisted"];

export function OpportunityKanban({ opportunities }: { opportunities: Opportunity[] }) {
  const { dispatch } = useAppState();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function onDragEnd(e: DragEndEvent) {
    const id = e.active.id as string;
    const newStage = e.over?.id as OpportunityStage | undefined;
    if (!newStage) return;
    const opp = opportunities.find((o) => o.id === id);
    if (!opp || opp.stage === newStage) return;
    dispatch({ type: "OPP_STAGE", payload: { id, stage: newStage } });
    toast.success(`Stage updated to ${newStage}`, { description: "Conversion score recalculated." });
  }

  return (
    <div className="flex-1 overflow-auto bg-surface-alt">
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="flex gap-2 p-3 min-w-fit h-full">
          {KANBAN_STAGES.map((stage) => {
            const items = opportunities.filter((o) => o.stage === stage);
            const total = items.reduce((s, o) => s + o.value, 0);
            return <Column key={stage} stage={stage} items={items} total={total} />;
          })}
          <CollapsedColumn opportunities={opportunities} />
        </div>
      </DndContext>
    </div>
  );
}

function Column({ stage, items, total }: { stage: OpportunityStage; items: Opportunity[]; total: number }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <div ref={setNodeRef}
      className={cn("w-64 shrink-0 bg-surface border border-rule rounded-sm flex flex-col",
        isOver && "ring-2 ring-navy ring-offset-1")}>
      <div className="px-3 py-2 border-b border-rule">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-semibold text-foreground">{stage}</span>
          <span className="text-[11px] text-muted-foreground tabular-nums">{items.length}</span>
        </div>
        <div className="text-[11px] text-muted-foreground tabular-nums">{fmtAED(total, { compact: true })}</div>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]">
        {items.map((o) => <Card key={o.id} o={o} />)}
        {items.length === 0 && <div className="text-[11px] text-muted-foreground text-center py-6">Drop here</div>}
      </div>
    </div>
  );
}

function Card({ o }: { o: Opportunity }) {
  const navigate = useNavigate();
  const { clientById, employeeById } = useAppState();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: o.id });
  const client = clientById(o.clientId);
  const eng = employeeById(o.engineerId);
  const days = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 86400000);
  const stale = days > 21;

  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50 } : undefined;
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}
      onClick={(e) => { if (!isDragging) { e.stopPropagation(); navigate(`/crm/opportunities/${o.id}`); } }}
      className={cn("bg-surface border border-rule rounded-sm p-2.5 cursor-grab active:cursor-grabbing hover:shadow-card transition-shadow",
        isDragging && "opacity-50 shadow-elevated")}>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{client?.name}</div>
      <div className="text-[13px] font-semibold text-foreground mt-0.5 leading-tight">{o.name}</div>
      <div className="text-[14px] font-bold text-navy mt-1 tabular-nums">{fmtAED(o.value, { compact: true })}</div>
      <div className="flex items-center gap-1.5 mt-2">
        <span className="h-5 w-5 rounded-full bg-navy text-primary-foreground text-[9px] font-semibold grid place-items-center">{eng?.initials}</span>
        <Tag tone="grey">{o.consultant.split(" ")[0]}</Tag>
        <span className="ml-auto"><Tag tone={stale ? "red" : "grey"}>{days}d</Tag></span>
      </div>
      <div className="text-[10px] text-muted-foreground mt-1.5">P {o.probability}%</div>
    </div>
  );
}

function CollapsedColumn({ opportunities }: { opportunities: Opportunity[] }) {
  const won = opportunities.filter((o) => o.stage === "Won");
  const lost = opportunities.filter((o) => o.stage === "Lost");
  return (
    <div className="w-44 shrink-0 bg-surface border border-rule rounded-sm flex flex-col">
      <div className="px-3 py-2 border-b border-rule">
        <span className="text-[13px] font-semibold text-foreground">Won / Lost</span>
        <div className="text-[11px] text-muted-foreground tabular-nums">collapsed</div>
      </div>
      <div className="p-3 space-y-2 text-[12px]">
        <div className="flex items-center justify-between">
          <Tag tone="green">Won</Tag>
          <span className="tabular-nums font-semibold">{won.length}</span>
        </div>
        <div className="text-[11px] text-muted-foreground tabular-nums">{fmtAED(won.reduce((s, o) => s + o.value, 0), { compact: true })}</div>
        <div className="flex items-center justify-between pt-2 border-t border-rule">
          <Tag tone="red">Lost</Tag>
          <span className="tabular-nums font-semibold">{lost.length}</span>
        </div>
        <div className="text-[11px] text-muted-foreground tabular-nums">{fmtAED(lost.reduce((s, o) => s + o.value, 0), { compact: true })}</div>
      </div>
    </div>
  );
}
