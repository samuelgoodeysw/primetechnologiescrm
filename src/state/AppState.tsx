// Prime Technologies — global ERP state via Context + useReducer.
// Session-only. Pre-seeded.

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import {
  activities as seedActivities, chatMessages as seedChat, clients as seedClients,
  contacts as seedContacts, customerInvoices as seedCustomerInvoices,
  employees as seedEmployees, opportunities as seedOpps, projects as seedProjects,
  purchaseOrders as seedPOs, quotes as seedQuotes, rfqs as seedRFQs,
  submittals as seedSubmittals, supplierBills as seedSupplierBills,
  suppliers as seedSuppliers, variationOrders as seedVOs,
} from "./seed";
import type {
  Activity, ChatMessage, Client, Contact, CustomerInvoice, Employee,
  Opportunity, OpportunityStage, Project, PurchaseOrder, Quote, QuoteLine,
  QuoteStatus, RFQ, RFQStatus, Submittal, Supplier, SupplierBill, VariationOrder, VOStatus,
} from "./types";

interface State {
  currentUserId: string;
  opportunities: Opportunity[];
  clients: Client[];
  contacts: Contact[];
  quotes: Quote[];
  projects: Project[];
  variationOrders: VariationOrder[];
  submittals: Submittal[];
  rfqs: RFQ[];
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  customerInvoices: CustomerInvoice[];
  supplierBills: SupplierBill[];
  employees: Employee[];
  activities: Activity[];
  chat: ChatMessage[];
}

type Action =
  | { type: "OPP_CREATE"; payload: Opportunity }
  | { type: "OPP_UPDATE"; payload: Partial<Opportunity> & { id: string } }
  | { type: "OPP_STAGE";  payload: { id: string; stage: OpportunityStage } }
  | { type: "OPP_DELETE"; payload: { id: string } }
  | { type: "CLIENT_UPDATE"; payload: Partial<Client> & { id: string } }
  | { type: "QUOTE_CREATE"; payload: Quote }
  | { type: "QUOTE_UPDATE";  payload: Partial<Quote> & { id: string } }
  | { type: "QUOTE_STATUS"; payload: { id: string; status: QuoteStatus } }
  | { type: "QUOTE_LINE_UPDATE"; payload: { quoteId: string; lineId: string; fields: Partial<QuoteLine> } }
  | { type: "QUOTE_LINE_ADD"; payload: { quoteId: string; line: QuoteLine } }
  | { type: "QUOTE_LINE_DELETE"; payload: { quoteId: string; lineId: string } }
  | { type: "ACTIVITY_CREATE"; payload: Activity }
  | { type: "ACTIVITY_COMPLETE"; payload: { id: string; outcome?: string } }
  | { type: "VO_STATUS"; payload: { id: string; status: VOStatus; health?: VariationOrder["health"] } }
  | { type: "RFQ_STATUS"; payload: { id: string; status: RFQStatus } }
  | { type: "CHAT_ADD"; payload: ChatMessage };

const initial: State = {
  currentUserId: "u-ms",
  opportunities: seedOpps,
  clients: seedClients,
  contacts: seedContacts,
  quotes: seedQuotes,
  projects: seedProjects,
  variationOrders: seedVOs,
  submittals: seedSubmittals,
  rfqs: seedRFQs,
  purchaseOrders: seedPOs,
  suppliers: seedSuppliers,
  customerInvoices: seedCustomerInvoices,
  supplierBills: seedSupplierBills,
  employees: seedEmployees,
  activities: seedActivities,
  chat: seedChat,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "OPP_CREATE":
      return { ...state, opportunities: [action.payload, ...state.opportunities] };
    case "OPP_UPDATE":
      return { ...state, opportunities: state.opportunities.map((o) => o.id === action.payload.id ? { ...o, ...action.payload } : o) };
    case "OPP_STAGE":
      return { ...state, opportunities: state.opportunities.map((o) => o.id === action.payload.id ? { ...o, stage: action.payload.stage } : o) };
    case "OPP_DELETE":
      return { ...state, opportunities: state.opportunities.filter((o) => o.id !== action.payload.id) };
    case "CLIENT_UPDATE":
      return { ...state, clients: state.clients.map((c) => c.id === action.payload.id ? { ...c, ...action.payload } : c) };
    case "QUOTE_CREATE":
      return { ...state, quotes: [action.payload, ...state.quotes] };
    case "QUOTE_UPDATE":
      return { ...state, quotes: state.quotes.map((q) => q.id === action.payload.id ? { ...q, ...action.payload } : q) };
    case "QUOTE_STATUS":
      return { ...state, quotes: state.quotes.map((q) => q.id === action.payload.id ? { ...q, status: action.payload.status } : q) };
    case "QUOTE_LINE_UPDATE":
      return { ...state, quotes: state.quotes.map((q) => q.id !== action.payload.quoteId ? q : {
        ...q, lines: q.lines.map((l) => l.id === action.payload.lineId ? { ...l, ...action.payload.fields } : l),
      })};
    case "QUOTE_LINE_ADD":
      return { ...state, quotes: state.quotes.map((q) => q.id !== action.payload.quoteId ? q : {
        ...q, lines: [...q.lines, action.payload.line],
      })};
    case "QUOTE_LINE_DELETE":
      return { ...state, quotes: state.quotes.map((q) => q.id !== action.payload.quoteId ? q : {
        ...q, lines: q.lines.filter((l) => l.id !== action.payload.lineId),
      })};
    case "ACTIVITY_CREATE":
      return { ...state, activities: [action.payload, ...state.activities] };
    case "ACTIVITY_COMPLETE":
      return { ...state, activities: state.activities.map((a) => a.id === action.payload.id ? { ...a, completedAt: new Date().toISOString(), outcome: action.payload.outcome ?? a.outcome } : a) };
    case "VO_STATUS":
      return { ...state, variationOrders: state.variationOrders.map((v) => v.id === action.payload.id ? { ...v, status: action.payload.status, health: action.payload.health ?? v.health } : v) };
    case "RFQ_STATUS":
      return { ...state, rfqs: state.rfqs.map((r) => r.id === action.payload.id ? { ...r, status: action.payload.status } : r) };
    case "CHAT_ADD":
      return { ...state, chat: [action.payload, ...state.chat] };
    default:
      return state;
  }
}

interface Ctx {
  state: State;
  dispatch: React.Dispatch<Action>;
  clientById: (id: string) => Client | undefined;
  employeeById: (id: string) => Employee | undefined;
  projectById: (id: string) => Project | undefined;
  opportunityById: (id: string) => Opportunity | undefined;
  quoteById: (id: string) => Quote | undefined;
}

const AppStateContext = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const value = useMemo<Ctx>(() => ({
    state, dispatch,
    clientById: (id) => state.clients.find((c) => c.id === id),
    employeeById: (id) => state.employees.find((e) => e.id === id),
    projectById: (id) => state.projects.find((p) => p.id === id),
    opportunityById: (id) => state.opportunities.find((o) => o.id === id),
    quoteById: (id) => state.quotes.find((q) => q.id === id),
  }), [state]);
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside <AppStateProvider>");
  return ctx;
}
