// Field group (Odoo form sheet): label-on-left two-column rows.
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function FieldGroup({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("border border-rule rounded-sm bg-surface", className)}>
      {title && <div className="px-3 py-2 border-b border-rule text-[11px] font-semibold uppercase tracking-wide text-muted-foreground bg-surface-alt">{title}</div>}
      <div className="p-3">
        <table className="w-full">
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <tr className="align-top">
      <td className="text-[12px] text-muted-foreground py-1.5 pr-3 w-[40%] whitespace-nowrap">{label}</td>
      <td className="text-[13px] text-foreground py-1.5">{children}</td>
    </tr>
  );
}
