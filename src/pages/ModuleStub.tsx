// Generic placeholder for modules not yet built in Phase 1.
import { Construction } from "lucide-react";
import { useLocation } from "react-router-dom";
import { moduleForPath } from "@/state/modules";

export default function ModuleStub() {
  const location = useLocation();
  const mod = moduleForPath(location.pathname);
  const sub = mod.menu.find((m) => m.path === location.pathname);
  return (
    <div className="flex-1 grid place-items-center bg-surface-alt">
      <div className="text-center max-w-md px-6">
        <div className="h-14 w-14 mx-auto rounded-sm bg-surface border border-rule grid place-items-center mb-4">
          <Construction className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{mod.label}</div>
        <h2 className="text-[18px] font-bold text-foreground mt-1">{sub?.label ?? mod.label}</h2>
        <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed">
          This module view ships in Phase 2. The shell, navigation, command palette (⌘K), Prime AI drawer, and shared form/list components are ready.
          The reducer is pre-seeded with all the records this view will render.
        </p>
      </div>
    </div>
  );
}
