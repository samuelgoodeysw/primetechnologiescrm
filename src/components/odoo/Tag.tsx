// Stage badge / status badge with color tone.
import { cn } from "@/lib/utils";

const TONES = {
  navy:    "bg-navy/10 text-navy border-navy/20",
  blue:    "bg-mod-crm/10 text-mod-crm border-mod-crm/20",
  green:   "bg-success/10 text-success border-success/30",
  amber:   "bg-warning/15 text-warning border-warning/30",
  red:     "bg-danger/10 text-danger border-danger/30",
  gold:    "bg-gold/15 text-gold-deep border-gold/40",
  grey:    "bg-surface-alt text-muted-foreground border-rule",
  purple:  "bg-mod-projects/10 text-mod-projects border-mod-projects/20",
} as const;

export type Tone = keyof typeof TONES;

export function Tag({ children, tone = "grey", className }: { children: React.ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center h-5 px-1.5 rounded-sm border text-[11px] font-medium tabular-nums whitespace-nowrap",
      TONES[tone], className,
    )}>
      {children}
    </span>
  );
}

export function Dot({ tone = "grey" }: { tone?: "red" | "amber" | "green" | "grey" | "blue" }) {
  const map = { red: "bg-danger", amber: "bg-warning", green: "bg-success", grey: "bg-muted-foreground/40", blue: "bg-mod-crm" };
  return <span className={cn("inline-block h-1.5 w-1.5 rounded-full", map[tone])} />;
}
