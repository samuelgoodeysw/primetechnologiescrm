// Prime Technologies — global ERP state types.

export type Tier = "T1" | "T2" | "T3";
export type Division = "HVAC" | "Electrical" | "MEP" | "Automation" | "T&C";
export type Region = "Dubai" | "Abu Dhabi" | "Qatar" | "KSA";

export type OpportunityStage =
  | "Lead"
  | "Qualified"
  | "BOQ Received"
  | "Quoted"
  | "Submitted"
  | "Shortlisted"
  | "Won"
  | "Lost";

export interface Opportunity {
  id: string;
  name: string;
  clientId: string;
  consultant: string;
  value: number;
  stage: OpportunityStage;
  engineerId: string;
  division: Division;
  expectedClose: string; // ISO
  probability: number;
  source?: string;
  tier?: Tier;
  competitors?: string[];
  tags?: string[];
  nextActivity?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  legalName?: string;
  tier: Tier;
  vatTrn?: string;
  tradeLicense?: string;
  industry?: string;
  established?: number;
  location: Region;
  address?: string;
  website?: string;
  phone?: string;
  ownerId: string;
  paymentTerms: string;
  creditLimit: number;
  paymentScore: number;
  arOutstanding: number;
  arOver90: number;
  lifetimeRevenue: number;
  yoyDelta: number;
  activeProjects: number;
  openQuotes: number;
  openQuotesValue: number;
  lastActivityDays: number;
  status: "Active" | "Hold" | "Lost";
}

export interface Contact {
  id: string;
  clientId: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
}

export type QuoteStatus = "Draft" | "Sent" | "Under Discussion" | "Won" | "Lost" | "Expired";

export interface QuoteLine {
  id: string;
  product: string;
  principal: string;
  description: string;
  qty: number;
  unitList: number;
  discountPct: number;
  commissionPct: number;
  costPct: number; // % of net price that is principal cost (e.g. 0.78 = 78%)
}

export interface Quote {
  id: string;
  clientId: string;
  opportunityId?: string;
  consultant: string;
  engineerId: string;
  division: Division;
  issueDate: string;
  validUntil: string;
  paymentTerms: string;
  deliveryTerms?: string;
  leadTimeWeeks?: number;
  status: QuoteStatus;
  lines: QuoteLine[];
  reference?: string;
  warranty?: string;
  tags?: string[];
}

export type ProjectStatus = "Won" | "Mobilized" | "In Progress" | "Commissioning" | "Handover" | "DLP" | "Closed";
export type ProjectHealth = "Critical" | "Watch" | "Healthy";

export interface Project {
  id: string;
  code: string;
  name: string;
  clientId: string;
  consultant: string;
  mainContractor?: string;
  division: Division;
  region: Region;
  poValue: number;
  quotedMargin: number;
  liveMargin: number;
  daysToHandover: number;
  ldExposure: number; // AED/week
  status: ProjectStatus;
  health: ProjectHealth;
  contractType?: "Lump Sum" | "Re-measurable" | "Cost+";
  retentionPct?: number;
  advancePct?: number;
  startDate: string;
  targetHandover: string;
  pmId?: string;
}

export type VOStatus = "Draft" | "Submitted" | "Under Review" | "Approved" | "Rejected" | "Invoiced";

export interface VariationOrder {
  id: string;
  projectId: string;
  value: number;
  daysOpen: number;
  reason: string;
  reasonCategory: "Scope change" | "Design change" | "Site condition" | "Delay" | "Other";
  fidicClause?: string;
  ownerId: string;
  status: VOStatus;
  health: "Overdue" | "Escalate" | "On track" | "Pending" | "Approved" | "Rejected";
  submittedDate: string;
}

export type SubmittalStatus = "Submitted" | "Under Review" | "Approved" | "Rejected" | "Resubmit";

export interface Submittal {
  id: string;
  projectId: string;
  item: string;
  principal: string;
  consultant: string;
  submittedDate: string;
  daysOpen: number;
  status: SubmittalStatus;
  revision: number;
  blocking: boolean;
}

export type RFQStatus = "Draft" | "Sent to Suppliers" | "Comparing" | "Awarded" | "PO Issued" | "Cancelled";

export interface RFQ {
  id: string;
  projectId: string;
  item: string;
  suppliersInvited: string[];
  quotesReceived: number;
  budget: number;
  status: RFQStatus;
  ownerId: string;
  createdAt: string;
  requiredDate: string;
}

export type POStatus = "Draft" | "Sent" | "Acknowledged" | "Shipped" | "In customs" | "Delayed" | "Received" | "Invoiced";

export interface PurchaseOrder {
  id: string;
  projectId: string;
  supplier: string;
  value: number;
  poDate: string;
  expectedDelivery: string;
  status: POStatus;
  delayDays?: number;
}

export interface Supplier {
  id: string;
  name: string;
  agreementType: string;
  ytdVolume: number;
  commissionPct: number;
  otdPct: number;
  qualityScore: number;
  lastOrder: string;
  status: "Active" | "On hold" | "Review";
}

export type InvoiceStatus = "Draft" | "Posted" | "Partially Paid" | "Paid" | "Overdue";

export interface CustomerInvoice {
  id: string;
  clientId: string;
  projectId?: string;
  amount: number;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  ageDays: number;
}

export interface SupplierBill {
  id: string;
  supplier: string;
  amount: number;
  billDate: string;
  dueDate: string;
  status: InvoiceStatus;
}

export interface Employee {
  id: string;
  empNo: string;
  name: string;
  initials: string;
  designation: string;
  department: "Engineering" | "Sales" | "Procurement" | "Accounts" | "HR" | "Admin" | "Operations";
  division?: Division;
  grade: string;
  location: Region;
  status: "Active" | "On Leave" | "Probation";
  visaExpiry?: string;
  emiratesIdExpiry?: string;
  passportExpiry?: string;
  dewaLicenseExpiry?: string;
  dcdCertExpiry?: string;
  ctc?: number;
  startDate?: string;
}

export type ActivityType = "Call" | "Email" | "Meeting" | "Site Visit" | "Note";

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  relatedType: "Client" | "Opportunity" | "Project" | "Quote" | "VO" | "RFQ";
  relatedId: string;
  scheduledFor?: string;
  completedAt?: string;
  outcome?: string;
  ownerId: string;
  createdAt: string;
  durationMin?: number;
}

export interface ChatMessage {
  id: string;
  recordType: string;
  recordId: string;
  authorId: string;
  authorName: string;
  body: string;
  kind: "message" | "note" | "log";
  createdAt: string;
}
