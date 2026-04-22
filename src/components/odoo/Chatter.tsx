// Odoo-style chatter panel: messages timeline with Send / Note / Schedule tabs.
import { useState } from "react";
import { MessageSquare, NotebookPen, CalendarPlus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/state/AppState";
import { fmtDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  recordType: string;
  recordId: string;
  followers?: { id: string; initials: string }[];
}

type Tab = "message" | "note" | "log";

export function Chatter({ recordType, recordId, followers = [] }: Props) {
  const { state, dispatch, employeeById } = useAppState();
  const [tab, setTab] = useState<Tab>("message");
  const [body, setBody] = useState("");
  const me = employeeById(state.currentUserId)!;

  const messages = state.chat
    .filter((m) => m.recordType === recordType && m.recordId === recordId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  function send() {
    if (!body.trim()) return;
    dispatch({ type: "CHAT_ADD", payload: {
      id: `m-${Date.now()}`, recordType, recordId,
      authorId: me.id, authorName: me.name, body: body.trim(),
      kind: tab, createdAt: new Date().toISOString(),
    }});
    setBody("");
  }

  return (
    <div className="border-t border-rule bg-surface-alt mt-6">
      <div className="px-4 py-3 flex items-center justify-between border-b border-rule bg-surface">
        <div className="flex items-center gap-1">
          {([
            { k: "message", label: "Send message", Icon: MessageSquare },
            { k: "note",    label: "Log note",     Icon: NotebookPen },
            { k: "log",     label: "Schedule activity", Icon: CalendarPlus },
          ] as const).map(({ k, label, Icon }) => (
            <button key={k} onClick={() => setTab(k)}
              className={cn("flex items-center gap-1.5 px-3 h-7 rounded-sm text-[12px] font-medium transition-colors",
                tab === k ? "bg-navy text-primary-foreground" : "text-muted-foreground hover:bg-surface-hover")}>
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex -space-x-1.5">
            {[me, ...followers.map((f) => employeeById(f.id)).filter(Boolean) as typeof me[]].slice(0, 4).map((u) => (
              <div key={u.id} className="h-6 w-6 rounded-full bg-navy text-primary-foreground text-[10px] font-semibold flex items-center justify-center ring-2 ring-surface">
                {u.initials}
              </div>
            ))}
          </div>
          <button className="text-[11px] text-mod-crm hover:underline">+ Add followers</button>
        </div>
      </div>

      <div className="px-4 py-3 bg-surface border-b border-rule">
        <div className="flex items-start gap-2">
          <div className="h-7 w-7 rounded-full bg-navy text-primary-foreground text-[10px] font-semibold flex items-center justify-center shrink-0">
            {me.initials}
          </div>
          <div className="flex-1">
            <Textarea value={body} onChange={(e) => setBody(e.target.value)}
              placeholder={tab === "message" ? "Send a message to the channel…" : tab === "note" ? "Add an internal note (visible to followers)…" : "Schedule an activity…"}
              className="min-h-[60px] text-[13px] resize-none border-rule" />
            <div className="flex justify-end mt-2">
              <Button size="sm" onClick={send} disabled={!body.trim()} className="h-7 text-[12px]">
                {tab === "message" ? "Send" : tab === "note" ? "Log" : "Schedule"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-rule">
        {messages.length === 0 && (
          <div className="px-4 py-6 text-center text-[12px] text-muted-foreground">No activity yet.</div>
        )}
        {messages.map((m) => (
          <div key={m.id} className="px-4 py-3 flex items-start gap-3">
            <div className="h-7 w-7 rounded-full bg-navy text-primary-foreground text-[10px] font-semibold flex items-center justify-center shrink-0">
              {m.authorName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[12px]">
                <span className="font-semibold text-foreground">{m.authorName}</span>
                <span className={cn(
                  "px-1.5 py-0 rounded-sm text-[10px] uppercase tracking-wide",
                  m.kind === "note" && "bg-warning/15 text-warning",
                  m.kind === "log" && "bg-mod-crm/10 text-mod-crm",
                  m.kind === "message" && "bg-surface-alt text-muted-foreground",
                )}>{m.kind}</span>
                <span className="text-muted-foreground">{fmtDateTime(m.createdAt)}</span>
              </div>
              <div className="text-[13px] text-foreground mt-0.5 whitespace-pre-wrap">{m.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
