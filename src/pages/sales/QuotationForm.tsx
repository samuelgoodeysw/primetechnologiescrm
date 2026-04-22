// Sales > Quote form — shell with header, status bar, line items table.
// Live margin recalc — every onChange dispatches to reducer.
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/state/AppState";
import { calcQuote } from "@/state/calc";
import { fmtAED, fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag } from "@/components/odoo/Tag";
import { FieldGroup, Field } from "@/components/odoo/FieldGroup";
import { Chatter } from "@/components/odoo/Chatter";
import { cn } from "@/lib/utils";
import type { QuoteLine, QuoteStatus } from "@/state/types";

const STAGES: QuoteStatus[] = ["Draft", "Sent", "Under Discussion", "Won", "Lost"];

export default function QuotationForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch, quoteById, clientById, employeeById, opportunityById } = useAppState();
  const quote = quoteById(id ?? "");
  const allQuotes = state.quotes;
  const idx = allQuotes.findIndex((q) => q.id === id);
  const [flashCells, setFlashCells] = useState<Record<string, number>>({});
  const calc = useMemo(() => (quote ? calcQuote(quote) : null), [quote]);

  if (!quote || !calc) return <div className="p-8 text-muted-foreground">Quote not found.</div>;

  const client = clientById(quote.clientId);
  const eng = employeeById(quote.engineerId);
  const opp = quote.opportunityId ? opportunityById(quote.opportunityId) : null;

  function flash(key: string) {
    setFlashCells((m) => ({ ...m, [key]: Date.now() }));
    setTimeout(() => setFlashCells((m) => { const n = { ...m }; delete n[key]; return n; }), 250);
  }

  function updateLine(lineId: string, field: keyof QuoteLine, value: number) {
    dispatch({ type: "QUOTE_LINE_UPDATE", payload: { quoteId: quote!.id, lineId, fields: { [field]: value } as Partial<QuoteLine> } });
    // flash all derived totals
    ["sub", "disc", "vat", "grand", "margin", "spread", "comm"].forEach(flash);
    flash(`${lineId}-net`); flash(`${lineId}-total`); flash(`${lineId}-margin`);
  }

  function addLine() {
    dispatch({ type: "QUOTE_LINE_ADD", payload: { quoteId: quote!.id, line: {
      id: `ln-${Date.now()}`, product: "New product", principal: "—", description: "",
      qty: 1, unitList: 0, discountPct: 0, commissionPct: 0, costPct: 0.75,
    }}});
  }

  function deleteLine(lineId: string) {
    dispatch({ type: "QUOTE_LINE_DELETE", payload: { quoteId: quote!.id, lineId } });
  }

  function setStatus(s: QuoteStatus) {
    if (s === quote!.status) return;
    dispatch({ type: "QUOTE_STATUS", payload: { id: quote!.id, status: s } });
    toast.success(`Status set to ${s}`);
  }

  function nav(d: number) {
    const next = allQuotes[idx + d];
    if (next) navigate(`/sales/quotations/${next.id}`);
  }

  const marginTone = calc.marginPct >= 10 ? "green" : calc.marginPct >= 5 ? "amber" : "red";
  const spreadTone = calc.netSpreadPct >= 5 ? "green" : calc.netSpreadPct >= 2 ? "amber" : "red";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 h-10 px-4 border-b border-rule bg-surface shrink-0">
        <button className="text-[12px] text-muted-foreground hover:text-foreground px-2 h-7 rounded-sm hover:bg-surface-hover">⌄ Action</button>
        <div className="ml-auto flex items-center gap-1 text-[12px] text-muted-foreground tabular-nums">
          <span>{idx + 1} / {allQuotes.length}</span>
          <button onClick={() => nav(-1)} disabled={idx <= 0} className="h-6 w-6 hover:bg-surface-hover rounded-sm grid place-items-center disabled:opacity-30"><ChevronLeft className="h-3.5 w-3.5" /></button>
          <button onClick={() => nav(1)} disabled={idx >= allQuotes.length - 1} className="h-6 w-6 hover:bg-surface-hover rounded-sm grid place-items-center disabled:opacity-30"><ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {/* Status bar */}
      <div className="px-4 py-2.5 border-b border-rule bg-surface shrink-0">
        <div className="flex items-stretch">
          {STAGES.map((s, i) => {
            const active = s === quote.status;
            const passed = STAGES.indexOf(quote.status) > i && quote.status !== "Lost";
            return (
              <button key={s} onClick={() => setStatus(s)}
                className={cn("h-7 px-3 text-[12px] font-medium border border-r-0 last:border-r transition-colors first:rounded-l-sm last:rounded-r-sm",
                  active && s === "Won" && "bg-success text-success-foreground border-success",
                  active && s === "Lost" && "bg-danger text-danger-foreground border-danger",
                  active && s !== "Won" && s !== "Lost" && "bg-gold text-navy-deep border-gold-deep z-10",
                  !active && passed && "bg-navy text-primary-foreground border-navy",
                  !active && !passed && "bg-surface-alt text-muted-foreground border-rule hover:bg-surface-hover",
                )}>
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2 h-10 px-4 border-b border-rule bg-surface-alt shrink-0">
        <Button size="sm" variant="ghost" className="h-7 px-3 text-[12px]">Send by Email</Button>
        <Button size="sm" variant="ghost" className="h-7 px-3 text-[12px]">Print</Button>
        <Button size="sm" variant="ghost" className="h-7 px-3 text-[12px]">Duplicate</Button>
        <Button size="sm" variant="outline" onClick={() => setStatus("Lost")} className="h-7 px-3 text-[12px] border-destructive text-destructive hover:bg-destructive/10">Cancel Quote</Button>
        <Button size="sm" variant="outline" onClick={() => setStatus("Won")} className="h-7 px-3 text-[12px] border-success text-success hover:bg-success/10">Mark Won</Button>
      </div>

      <div className="flex-1 overflow-auto bg-surface-alt">
        <div className="p-4 space-y-4 max-w-[1280px]">
          {/* Title */}
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Quotation</div>
            <h1 className="text-[20px] font-bold text-foreground mt-0.5">{quote.id} — {client?.name}</h1>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-3 gap-3">
            <InfoCard
              top="Client"
              title={client?.name ?? ""}
              chips={<>
                <Tag tone="navy">{client?.tier}</Tag>
                <Tag tone={(client?.paymentScore ?? 0) >= 80 ? "green" : (client?.paymentScore ?? 0) >= 60 ? "amber" : "red"}>
                  Payment {client?.paymentScore}/100
                </Tag>
              </>}
              link={() => navigate(`/crm/clients`)}
              linkLabel="Open Client"
            />
            <InfoCard
              top="Consultant"
              title={quote.consultant}
              chips={<span className="text-[11px] text-muted-foreground">39% historical hit rate · 17d avg approval</span>}
            />
            <InfoCard
              top="Opportunity"
              title={opp?.name ?? "—"}
              chips={<span className="text-[11px] text-muted-foreground">{opp ? `${fmtAED(opp.value, { compact: true })} · ${opp.stage}` : "Not linked"}</span>}
              link={opp ? () => navigate(`/crm/opportunities/${opp.id}`) : undefined}
              linkLabel="Open Opportunity"
            />
          </div>

          {/* Field groups */}
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup title="Quote Details">
              <Field label="Quote #"><span className="font-medium">{quote.id}</span></Field>
              <Field label="Quote Date">{fmtDate(quote.issueDate)}</Field>
              <Field label="Validity Until">{fmtDate(quote.validUntil)}</Field>
              <Field label="Payment Terms">{quote.paymentTerms}</Field>
              <Field label="Delivery Terms">{quote.deliveryTerms ?? "—"}</Field>
              <Field label="Lead Time (weeks)">{quote.leadTimeWeeks ?? "—"}</Field>
            </FieldGroup>
            <FieldGroup title="Assignment">
              <Field label="Engineer Owner">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-navy text-primary-foreground text-[9px] font-semibold grid place-items-center">{eng?.initials}</span>
                  {eng?.name}
                </span>
              </Field>
              <Field label="Division">{quote.division}</Field>
              <Field label="Reference">{quote.reference ?? "—"}</Field>
              <Field label="Warranty">{quote.warranty ?? "—"}</Field>
              <Field label="Tags">
                <div className="flex flex-wrap gap-1">
                  {(quote.tags ?? []).map((t) => <Tag key={t} tone="gold">{t}</Tag>)}
                  {(quote.tags ?? []).length === 0 && <span className="text-[12px] text-muted-foreground">—</span>}
                </div>
              </Field>
            </FieldGroup>
          </div>

          {/* Negative spread warning */}
          {calc.lines.length > 0 && calc.netSpreadPct < 2 && (
            <div className="border border-destructive bg-destructive/5 rounded-sm p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1 text-[12px]">
                <span className="font-semibold text-destructive">Low / negative spread detected.</span>
                <span className="text-foreground/80"> This quote gives the customer a discount close to or larger than the principal commission. Prime margin is at risk on principal trading.</span>
              </div>
              <Button size="sm" variant="ghost" className="h-6 text-[11px] text-destructive">Review discounts</Button>
            </div>
          )}

          {/* Line items */}
          <section className="bg-surface border border-rule rounded-sm">
            <div className="px-3 py-2 border-b border-rule bg-surface-alt flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Line items</span>
              <Button size="sm" onClick={addLine} className="h-6 px-2 text-[11px]">+ Add Product</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] tabular-nums">
                <thead className="border-b border-rule text-[10px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-2 py-1.5 text-left w-8">#</th>
                    <th className="px-2 py-1.5 text-left">Product</th>
                    <th className="px-2 py-1.5 text-left">Principal</th>
                    <th className="px-2 py-1.5 text-left">Description</th>
                    <th className="px-2 py-1.5 text-right w-16">Qty</th>
                    <th className="px-2 py-1.5 text-right w-24">Unit List</th>
                    <th className="px-2 py-1.5 text-right w-16">Disc %</th>
                    <th className="px-2 py-1.5 text-right w-24">Unit Net</th>
                    <th className="px-2 py-1.5 text-right w-28">Line Total</th>
                    <th className="px-2 py-1.5 text-right w-16">Comm %</th>
                    <th className="px-2 py-1.5 text-right w-16">Margin %</th>
                    <th className="w-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {calc.lines.map((l, i) => (
                    <tr key={l.id} className="border-b border-rule hover:bg-surface-hover group">
                      <td className="px-2 py-1 text-muted-foreground">{i + 1}</td>
                      <td className="px-2 py-1 font-medium">{l.product}</td>
                      <td className="px-2 py-1 text-muted-foreground">{l.principal}</td>
                      <td className="px-2 py-1 text-muted-foreground text-[11px]">{l.description}</td>
                      <td className="px-2 py-1">
                        <NumCell value={l.qty} onChange={(v) => updateLine(l.id, "qty", v)} />
                      </td>
                      <td className="px-2 py-1">
                        <NumCell value={l.unitList} onChange={(v) => updateLine(l.id, "unitList", v)} decimals={0} />
                      </td>
                      <td className="px-2 py-1">
                        <NumCell value={l.discountPct} onChange={(v) => updateLine(l.id, "discountPct", v)} decimals={1} />
                      </td>
                      <td className={cn("px-2 py-1 text-right transition-colors", flashCells[`${l.id}-net`] && "bg-gold/30")}>{l.unitNet.toFixed(0)}</td>
                      <td className={cn("px-2 py-1 text-right font-medium transition-colors", flashCells[`${l.id}-total`] && "bg-gold/30")}>{l.lineTotal.toLocaleString("en-AE", { maximumFractionDigits: 0 })}</td>
                      <td className="px-2 py-1 text-right text-muted-foreground">{l.commissionPct}%</td>
                      <td className={cn("px-2 py-1 text-right transition-colors", flashCells[`${l.id}-margin`] && "bg-gold/30",
                        l.lineMarginPct < 5 && "text-destructive font-medium")}>{l.lineMarginPct.toFixed(1)}%</td>
                      <td className="px-1 py-1">
                        <button onClick={() => deleteLine(l.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {calc.lines.length === 0 && (
                    <tr><td colSpan={12} className="px-2 py-8 text-center text-muted-foreground">No line items yet. Click + Add Product.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Totals + Margin */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-navy/30 bg-surface rounded-sm p-3">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold border-b border-rule pb-1.5 mb-2">Margin Analysis</div>
              <Row k="Quote Value (excl. VAT)" v={fmtAED(calc.subtotal)} flash={flashCells.sub} />
              <Row k="Estimated Cost" v={fmtAED(calc.estimatedCost)} flash={flashCells.sub} />
              <div className="border-t border-rule my-2" />
              <Row k="Expected Margin AED" v={fmtAED(calc.expectedMargin)} flash={flashCells.margin} bold />
              <Row k="Expected Margin %" v={
                <span className="inline-flex items-center gap-1.5">
                  <Tag tone={marginTone}>{calc.marginPct.toFixed(1)}%</Tag>
                </span>
              } flash={flashCells.margin} bold />
              <div className="border-t border-rule my-2" />
              <Row k="Principal Commission" v={fmtAED(calc.commissionEarned)} flash={flashCells.comm} />
              <Row k="Customer Discount" v={fmtAED(calc.customerDiscount)} flash={flashCells.disc} />
              <div className="border-t border-rule my-2" />
              <Row k="Net Spread %" v={
                <span className="inline-flex items-center gap-1.5">
                  <Tag tone={spreadTone}>{calc.netSpreadPct.toFixed(1)}%</Tag>
                </span>
              } flash={flashCells.spread} bold />
              <div className="text-[10px] text-muted-foreground text-right mt-1">benchmark: &gt; 5%</div>
            </div>

            <div className="border border-rule bg-surface rounded-sm p-3">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold border-b border-rule pb-1.5 mb-2">Totals</div>
              <Row k="Subtotal" v={fmtAED(calc.subtotal)} flash={flashCells.sub} />
              <Row k={`Discount Total (${calc.discountPct.toFixed(1)}%)`} v={`− ${fmtAED(calc.discountTotal)}`} flash={flashCells.disc} />
              <div className="border-t border-rule my-2" />
              <Row k="Net before VAT" v={fmtAED(calc.subtotal)} flash={flashCells.sub} />
              <Row k="VAT (5%)" v={`+ ${fmtAED(calc.vat)}`} flash={flashCells.vat} />
              <div className="border-t-2 border-navy my-2" />
              <Row k="GRAND TOTAL" v={<span className="text-navy text-[15px] font-bold">{fmtAED(calc.grandTotal)}</span>} flash={flashCells.grand} bold />
            </div>
          </div>

          {/* AI Insight */}
          <div className="border border-gold/40 bg-gold/5 rounded-sm p-4">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-gold-deep font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5" /> Prime AI analysis
            </div>
            <ul className="text-[12px] space-y-1 text-foreground/85 leading-relaxed">
              <li>· {client?.name} pays on time ({client?.paymentScore}/100 score) — no AR risk</li>
              <li>· {quote.consultant} has 39% historical hit rate for you — above average</li>
              <li>· Average customer discount on this quote: <span className="font-semibold">{calc.discountPct.toFixed(1)}%</span> · principal commission earned: <span className="font-semibold">{(calc.commissionEarned / Math.max(1, calc.subtotal) * 100).toFixed(1)}%</span></li>
              <li>· <span className="font-semibold">Recommendation:</span> {calc.netSpreadPct >= 5 ? "Submit as-is. ~74% probability to close." : "Revisit discount strategy — spread is below the 5% benchmark."}</li>
            </ul>
          </div>

          <Chatter recordType="Quote" recordId={quote.id} followers={[{ id: "u-fk", initials: "MF" }]} />
        </div>
      </div>
    </div>
  );
}

function NumCell({ value, onChange, decimals = 0 }: { value: number; onChange: (v: number) => void; decimals?: number }) {
  return (
    <input type="number" value={value} step={decimals > 0 ? 0.1 : 1}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-6 w-full text-right tabular-nums bg-surface border border-rule rounded-sm px-1.5 text-[12px] focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy" />
  );
}

function Row({ k, v, flash, bold }: { k: string; v: React.ReactNode; flash?: number; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between items-center py-1 text-[12px] tabular-nums transition-colors rounded-sm px-1 -mx-1",
      flash && "bg-gold/30")}>
      <span className={cn("text-muted-foreground", bold && "text-foreground font-semibold")}>{k}</span>
      <span className={cn(bold && "font-semibold")}>{v}</span>
    </div>
  );
}

function InfoCard({ top, title, chips, link, linkLabel }: { top: string; title: string; chips?: React.ReactNode; link?: () => void; linkLabel?: string }) {
  return (
    <div className="border border-rule bg-surface rounded-sm p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{top}</div>
      <div className="text-[14px] font-semibold text-foreground mt-0.5">{title}</div>
      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">{chips}</div>
      {link && (
        <button onClick={link} className="text-[11px] text-mod-crm hover:underline mt-2 inline-flex items-center gap-1">
          {linkLabel} <ExternalLink className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
