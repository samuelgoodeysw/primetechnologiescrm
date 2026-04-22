// Top app bar — Prime logo, breadcrumb, search, notifications, user.
// No app switcher (vertical rail handles that). No AI button.
import { useLocation, Link } from "react-router-dom";
import { Search, Bell, ChevronDown, ChevronRight } from "lucide-react";
import { moduleForPath } from "@/state/modules";
import { useAppState } from "@/state/AppState";

export function TopBar({ onOpenSearch }: { onOpenSearch: () => void }) {
  const location = useLocation();
  const { state, employeeById } = useAppState();
  const me = employeeById(state.currentUserId)!;
  const mod = moduleForPath(location.pathname);
  const crumbs = buildCrumbs(location.pathname, mod);

  return (
    <header className="h-14 bg-surface border-b border-rule flex items-center px-4 gap-4 shrink-0">
      <Link to="/dashboard" className="flex items-baseline gap-1.5 shrink-0">
        <span className="font-bold text-navy tracking-tight text-[15px]">PRIME</span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">Technologies</span>
      </Link>

      <div className="h-5 w-px bg-rule" />

      <div className="flex items-center gap-1.5 text-[13px] min-w-0">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
            {c.to ? (
              <Link to={c.to} className="text-muted-foreground hover:text-foreground truncate">{c.label}</Link>
            ) : (
              <span className="text-foreground font-medium truncate">{c.label}</span>
            )}
          </span>
        ))}
      </div>

      <button onClick={onOpenSearch} className="ml-auto h-8 w-72 px-2.5 flex items-center gap-2 bg-surface-alt border border-rule rounded-sm text-[12px] text-muted-foreground hover:bg-surface-hover transition-colors">
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search records, contacts…</span>
        <kbd className="text-[10px] bg-surface border border-rule rounded-sm px-1 font-sans">⌘K</kbd>
      </button>

      <button className="h-8 w-8 grid place-items-center rounded-sm text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors relative">
        <Bell className="h-4 w-4" />
        <span className="absolute top-1 right-1 h-3.5 min-w-3.5 px-0.5 bg-danger text-primary-foreground rounded-full text-[9px] font-semibold grid place-items-center">3</span>
      </button>

      <button className="h-8 pl-1 pr-2 flex items-center gap-1.5 rounded-sm hover:bg-surface-hover transition-colors">
        <div className="h-7 w-7 rounded-full bg-navy text-primary-foreground text-[11px] font-semibold grid place-items-center">{me.initials}</div>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
    </header>
  );
}

function buildCrumbs(pathname: string, mod: ReturnType<typeof moduleForPath>) {
  const crumbs: { label: string; to?: string }[] = [{ label: mod.label, to: mod.basePath }];
  const sub = mod.menu.find((m) => pathname === m.path || pathname.startsWith(m.path + "/"));
  if (sub && sub.path !== mod.basePath) crumbs.push({ label: sub.label, to: sub.path });
  // Detail page (e.g. /crm/opportunities/o-1)
  const segs = pathname.split("/").filter(Boolean);
  if (segs.length >= 3 && sub) {
    const last = segs[segs.length - 1];
    if (last !== "new" && last !== sub.path.split("/").pop()) {
      crumbs.push({ label: prettify(last) });
    } else if (last === "new") {
      crumbs.push({ label: "New" });
    }
  }
  return crumbs;
}

function prettify(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
