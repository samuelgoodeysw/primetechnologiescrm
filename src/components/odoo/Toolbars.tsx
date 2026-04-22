// Odoo-style action toolbar above list/form views.
import { ChevronLeft, ChevronRight, List, LayoutGrid, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ListToolbarProps {
  title: string;
  count?: { from: number; to: number; total: number };
  onCreate?: () => void;
  views?: ("list" | "kanban" | "graph" | "calendar")[];
  view?: "list" | "kanban" | "graph" | "calendar";
  onViewChange?: (v: "list" | "kanban" | "graph" | "calendar") => void;
  rightExtra?: React.ReactNode;
}

const VIEW_ICONS = { list: List, kanban: LayoutGrid, graph: BarChart3, calendar: Calendar };

export function ListToolbar({ title, count, onCreate, views = ["list"], view = "list", onViewChange, rightExtra }: ListToolbarProps) {
  return (
    <div className="flex items-center gap-2 h-10 px-4 border-b border-rule bg-surface">
      {onCreate && (
        <Button size="sm" onClick={onCreate} className="h-7 px-3 text-[12px] font-semibold">Create</Button>
      )}
      <button className="text-[12px] text-muted-foreground hover:text-foreground px-2 h-7 rounded-sm hover:bg-surface-hover">⌄ Action</button>
      {rightExtra}
      <div className="ml-auto flex items-center gap-3">
        {count && (
          <div className="flex items-center gap-1 text-[12px] text-muted-foreground tabular-nums">
            <span>{count.from}-{count.to} / {count.total}</span>
            <button className="h-6 w-6 hover:bg-surface-hover rounded-sm grid place-items-center"><ChevronLeft className="h-3.5 w-3.5" /></button>
            <button className="h-6 w-6 hover:bg-surface-hover rounded-sm grid place-items-center"><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
        )}
        <div className="flex items-center border border-rule rounded-sm overflow-hidden">
          {views.map((v) => {
            const Icon = VIEW_ICONS[v];
            return (
              <button key={v} onClick={() => onViewChange?.(v)}
                className={cn("h-7 w-7 grid place-items-center transition-colors", view === v ? "bg-navy text-primary-foreground" : "text-muted-foreground hover:bg-surface-hover")}>
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface FormToolbarProps {
  onSave?: () => void;
  onDiscard?: () => void;
  dirty?: boolean;
  rightExtra?: React.ReactNode;
}

export function FormToolbar({ onSave, onDiscard, dirty, rightExtra }: FormToolbarProps) {
  return (
    <div className="flex items-center gap-2 h-10 px-4 border-b border-rule bg-surface">
      {dirty ? (
        <>
          <Button size="sm" onClick={onSave} className="h-7 px-3 text-[12px] font-semibold">Save</Button>
          <button onClick={onDiscard} className="text-[12px] text-destructive hover:underline px-2">Discard</button>
        </>
      ) : (
        <button className="text-[12px] text-muted-foreground hover:text-foreground px-2 h-7 rounded-sm hover:bg-surface-hover">⌄ Action</button>
      )}
      {rightExtra}
      <div className="ml-auto flex items-center gap-1 text-[12px] text-muted-foreground tabular-nums">
        <button className="h-6 w-6 hover:bg-surface-hover rounded-sm grid place-items-center"><ChevronLeft className="h-3.5 w-3.5" /></button>
        <button className="h-6 w-6 hover:bg-surface-hover rounded-sm grid place-items-center"><ChevronRight className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}
