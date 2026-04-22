// Left sidebar — vertical 56px navy icon rail + 200px module submenu.
import { Link, useLocation, useNavigate } from "react-router-dom";
import { modules, moduleForPath } from "@/state/modules";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const mod = moduleForPath(location.pathname);

  // Group submenu items
  const groups: Record<string, typeof mod.menu> = {};
  mod.menu.forEach((m) => {
    const g = m.group ?? "Main";
    (groups[g] ||= []).push(m);
  });

  return (
    <TooltipProvider delayDuration={200}>
      <aside className="flex shrink-0">
        {/* Icon rail — 56px, navy */}
        <div className="w-14 bg-navy-deep flex flex-col items-center py-2 gap-1.5 border-r border-navy">
          {modules.map((m) => {
            const Icon = m.icon;
            const active = m.key === mod.key;
            return (
              <Tooltip key={m.key}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => navigate(m.basePath)}
                    aria-label={m.label}
                    className={cn(
                      "h-10 w-10 grid place-items-center rounded-sm transition-colors",
                      active
                        ? "bg-gold text-navy-deep"
                        : "text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.25 : 2} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-[12px]">{m.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Submenu — 200px, light grey */}
        <div className="w-[200px] bg-surface-alt border-r border-rule flex flex-col">
          <div className="px-3 h-10 flex items-center border-b border-rule">
            <span className="text-[13px] font-bold text-foreground">{mod.label}</span>
          </div>

          <nav className="flex-1 overflow-y-auto py-1 text-[13px]">
            {Object.entries(groups).map(([groupName, items]) => (
              <div key={groupName} className="mb-1">
                {groupName !== "Main" && (
                  <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">{groupName}</div>
                )}
                <ul>
                  {items.map((it) => {
                    const active = location.pathname === it.path
                      || (it.path !== mod.basePath && location.pathname.startsWith(it.path + "/"));
                    return (
                      <li key={it.path}>
                        <Link
                          to={it.path}
                          className={cn(
                            "flex items-center h-8 pl-3 pr-2 transition-colors text-[13px]",
                            active
                              ? "bg-surface text-navy font-semibold border-l-2 border-navy pl-[10px]"
                              : "text-foreground/80 hover:bg-surface hover:text-foreground",
                          )}
                        >
                          {it.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="px-3 py-2 border-t border-rule text-[11px] text-muted-foreground">
            Prime ERP · v0.6
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
