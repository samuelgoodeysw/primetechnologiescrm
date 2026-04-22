// Odoo-style status bar — clickable stages, current highlighted in navy.
import { cn } from "@/lib/utils";

interface Props<T extends string> {
  stages: readonly T[];
  current: T;
  onChange?: (s: T) => void;
  done?: T[]; // stages considered terminal "alt" colored
}

export function StatusBar<T extends string>({ stages, current, onChange, done = [] }: Props<T>) {
  const idx = stages.indexOf(current);
  return (
    <div className="flex items-center gap-0 text-[12px] font-medium select-none">
      {stages.map((s, i) => {
        const active = s === current;
        const passed = i < idx;
        const isDone = done.includes(s);
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange?.(s)}
            className={cn(
              "h-7 px-3 border border-r-0 last:border-r relative transition-colors",
              "first:rounded-l-sm last:rounded-r-sm",
              active
                ? "bg-navy text-primary-foreground border-navy z-10"
                : passed
                  ? "bg-surface-alt text-foreground border-rule hover:bg-surface-hover"
                  : "bg-surface text-muted-foreground border-rule hover:bg-surface-hover",
              isDone && active && "bg-success border-success",
            )}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}
