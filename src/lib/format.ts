// Prime Technologies — formatters
// AED currency, comma separators, DD MMM YYYY dates.

export function fmtAED(n: number, opts: { compact?: boolean; decimals?: number } = {}): string {
  if (n == null || isNaN(n)) return "—";
  const { compact = false, decimals = 0 } = opts;
  if (compact) {
    if (Math.abs(n) >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2)}M`;
    if (Math.abs(n) >= 1_000) return `AED ${(n / 1_000).toFixed(0)}K`;
    return `AED ${n.toFixed(decimals)}`;
  }
  return `AED ${n.toLocaleString("en-AE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function fmtNum(n: number, decimals = 0): string {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString("en-AE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function fmtPct(n: number, decimals = 1): string {
  if (n == null || isNaN(n)) return "—";
  return `${n.toFixed(decimals)}%`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  return `${day} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function fmtDateTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "—";
  const time = date.toLocaleTimeString("en-AE", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${fmtDate(date)} · ${time}`;
}

export function relativeDays(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
