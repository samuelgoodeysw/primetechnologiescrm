// Filter bar: search + chips for filters/groupby.
import { Search, Filter, ListTree, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Chip { label: string; active?: boolean; onClick?: () => void; }

interface Props {
  search: string;
  onSearchChange: (s: string) => void;
  filters?: Chip[];
  groupBy?: Chip[];
  placeholder?: string;
}

export function FilterBar({ search, onSearchChange, filters = [], groupBy = [], placeholder = "Search…" }: Props) {
  return (
    <div className="flex items-center gap-3 h-10 px-4 border-b border-rule bg-surface-alt">
      <div className="flex items-center gap-1.5 flex-1 max-w-md">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent outline-none text-[13px] flex-1 placeholder:text-muted-foreground"
        />
      </div>
      {filters.length > 0 && (
        <ChipGroup icon={Filter} label="Filters" chips={filters} />
      )}
      {groupBy.length > 0 && (
        <ChipGroup icon={ListTree} label="Group By" chips={groupBy} />
      )}
      <button className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1">
        <Star className="h-3.5 w-3.5" /> Favorites
      </button>
    </div>
  );
}

function ChipGroup({ icon: Icon, label, chips }: { icon: typeof Filter; label: string; chips: Chip[] }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}:</span>
      {chips.map((c) => (
        <button
          key={c.label}
          onClick={c.onClick}
          className={cn(
            "h-6 px-2 text-[12px] rounded-sm border transition-colors",
            c.active ? "bg-navy text-primary-foreground border-navy" : "bg-surface text-foreground border-rule hover:bg-surface-hover",
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
