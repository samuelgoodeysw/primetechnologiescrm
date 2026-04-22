// Prime Technologies — quote pricing math.
// Live margin recomputation used by the Quote form and the AI Insight card.

import type { Quote, QuoteLine } from "./types";

export interface LineCalc {
  unitNet: number;
  lineTotal: number;
  unitCost: number;
  lineCost: number;
  lineMarginPct: number;
  lineCommissionAED: number;
  lineDiscountAED: number;
}

export interface QuoteCalc {
  lines: (QuoteLine & LineCalc)[];
  subtotal: number;
  discountTotal: number;
  discountPct: number;
  vat: number;
  grandTotal: number;
  estimatedCost: number;
  expectedMargin: number;
  marginPct: number;
  commissionEarned: number;
  customerDiscount: number;
  netSpreadPct: number;
}

export function calcLine(line: QuoteLine): LineCalc {
  const unitNet = line.unitList * (1 - line.discountPct / 100);
  const lineTotal = unitNet * line.qty;
  const unitCost = unitNet * line.costPct;
  const lineCost = unitCost * line.qty;
  const lineMarginPct = lineTotal > 0 ? ((lineTotal - lineCost) / lineTotal) * 100 : 0;
  // Commission from principal is computed off list (typical industry practice).
  const lineCommissionAED = (line.unitList * line.qty) * (line.commissionPct / 100);
  const lineDiscountAED = (line.unitList * line.qty) - lineTotal;
  return { unitNet, lineTotal, unitCost, lineCost, lineMarginPct, lineCommissionAED, lineDiscountAED };
}

export function calcQuote(quote: Quote): QuoteCalc {
  const lines = quote.lines.map((l) => ({ ...l, ...calcLine(l) }));
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const listTotal = lines.reduce((s, l) => s + l.unitList * l.qty, 0);
  const discountTotal = listTotal - subtotal;
  const discountPct = listTotal > 0 ? (discountTotal / listTotal) * 100 : 0;
  const vat = subtotal * 0.05;
  const grandTotal = subtotal + vat;
  const estimatedCost = lines.reduce((s, l) => s + l.lineCost, 0);
  const expectedMargin = subtotal - estimatedCost;
  const marginPct = subtotal > 0 ? (expectedMargin / subtotal) * 100 : 0;
  const commissionEarned = lines.reduce((s, l) => s + l.lineCommissionAED, 0);
  const customerDiscount = discountTotal;
  // Net spread = commission % minus discount % at gross level
  const commissionPctOfList = listTotal > 0 ? (commissionEarned / listTotal) * 100 : 0;
  const netSpreadPct = commissionPctOfList - discountPct;
  return {
    lines, subtotal, discountTotal, discountPct, vat, grandTotal,
    estimatedCost, expectedMargin, marginPct,
    commissionEarned, customerDiscount, netSpreadPct,
  };
}
