// Prime Technologies — pre-seeded ERP data.
// All AED. Dates ISO. Names per spec.

import type {
  Activity,
  ChatMessage,
  Client,
  Contact,
  CustomerInvoice,
  Employee,
  Opportunity,
  Project,
  PurchaseOrder,
  Quote,
  RFQ,
  Submittal,
  Supplier,
  SupplierBill,
  VariationOrder,
} from "./types";

// ───────── Employees (sales engineers + a few support) ─────────
export const employees: Employee[] = [
  { id: "u-ms",  empNo: "PT-0001", name: "Manmohan Singh", initials: "MS", designation: "Business Development Director", department: "Sales", grade: "G1", location: "Dubai", status: "Active", ctc: 86000, startDate: "1986-03-12", visaExpiry: "2027-08-15", emiratesIdExpiry: "2027-08-15", passportExpiry: "2030-04-22" },
  { id: "u-fk",  empNo: "PT-0007", name: "M. Farook",     initials: "MF", designation: "Division Head — HVAC",          department: "Engineering", division: "HVAC", grade: "G2", location: "Dubai", status: "Active", ctc: 64000, startDate: "1998-09-04", visaExpiry: "2027-02-10", emiratesIdExpiry: "2027-02-10" },
  { id: "u-rk",  empNo: "PT-0042", name: "R. Kumar",       initials: "RK", designation: "Senior Sales Engineer",          department: "Sales", division: "HVAC", grade: "G3", location: "Dubai", status: "Active", ctc: 38000, startDate: "2009-06-18", visaExpiry: "2026-12-04", emiratesIdExpiry: "2026-12-04", dewaLicenseExpiry: "2026-09-30" },
  { id: "u-sm",  empNo: "PT-0058", name: "S. Menon",       initials: "SM", designation: "Sales Engineer",                 department: "Sales", division: "MEP", grade: "G3", location: "Abu Dhabi", status: "Active", ctc: 32000, startDate: "2012-01-22", visaExpiry: "2026-08-19", emiratesIdExpiry: "2026-08-19" },
  { id: "u-ah",  empNo: "PT-0061", name: "A. Hussain",     initials: "AH", designation: "Sales Engineer",                 department: "Sales", division: "Electrical", grade: "G3", location: "Dubai", status: "Active", ctc: 30000, startDate: "2013-08-11", visaExpiry: "2027-04-02", emiratesIdExpiry: "2027-04-02" },
  { id: "u-vp",  empNo: "PT-0084", name: "V. Pillai",      initials: "VP", designation: "Sales Engineer",                 department: "Sales", division: "HVAC", grade: "G4", location: "Dubai", status: "Active", ctc: 26000, startDate: "2018-05-09", visaExpiry: "2026-05-18", emiratesIdExpiry: "2026-05-18", dewaLicenseExpiry: "2026-06-12" },
  { id: "u-fr",  empNo: "PT-0091", name: "F. Rahman",      initials: "FR", designation: "Sales Engineer",                 department: "Sales", division: "Automation", grade: "G3", location: "Dubai", status: "Active", ctc: 34000, startDate: "2015-11-03", visaExpiry: "2027-11-21", emiratesIdExpiry: "2027-11-21" },
  { id: "u-mk",  empNo: "PT-0103", name: "M. Khan",        initials: "MK", designation: "Project Engineer",               department: "Engineering", division: "MEP", grade: "G4", location: "Dubai", status: "Active", ctc: 22000, startDate: "2019-02-17" },
  { id: "u-pn",  empNo: "PT-0112", name: "P. Nair",        initials: "PN", designation: "Project Engineer",               department: "Engineering", division: "HVAC", grade: "G4", location: "Abu Dhabi", status: "Active", ctc: 21000, startDate: "2020-07-01" },
  { id: "u-dt",  empNo: "PT-0118", name: "D. Thomas",      initials: "DT", designation: "Procurement Manager",            department: "Procurement", grade: "G2", location: "Dubai", status: "Active", ctc: 42000, startDate: "2010-04-14" },
  { id: "u-as",  empNo: "PT-0124", name: "A. Sharma",      initials: "AS", designation: "Senior Buyer",                   department: "Procurement", grade: "G3", location: "Dubai", status: "Active", ctc: 26000, startDate: "2016-09-26" },
  { id: "u-rp",  empNo: "PT-0131", name: "R. Patel",       initials: "RP", designation: "Accounts Manager",               department: "Accounts", grade: "G2", location: "Dubai", status: "Active", ctc: 38000, startDate: "2008-10-08" },
  { id: "u-av",  empNo: "PT-0144", name: "A. Verma",       initials: "AV", designation: "AR Specialist",                  department: "Accounts", grade: "G4", location: "Dubai", status: "Active", ctc: 18000, startDate: "2021-03-15" },
  { id: "u-mali",empNo: "PT-0152", name: "M. Ali",         initials: "MA", designation: "Site Engineer",                  department: "Operations", division: "Electrical", grade: "G4", location: "Qatar", status: "Active", ctc: 19000, startDate: "2019-12-02", dcdCertExpiry: "2026-07-04" },
  { id: "u-sj",  empNo: "PT-0163", name: "S. Joseph",      initials: "SJ", designation: "HR Manager",                     department: "HR", grade: "G2", location: "Dubai", status: "Active", ctc: 36000, startDate: "2011-05-22" },
  { id: "u-ka",  empNo: "PT-0171", name: "K. Abdullah",    initials: "KA", designation: "Site Engineer",                  department: "Operations", division: "MEP", grade: "G4", location: "KSA", status: "Active", ctc: 20000, startDate: "2020-08-14" },
  { id: "u-rs",  empNo: "PT-0182", name: "R. Singh",       initials: "RS", designation: "Commissioning Engineer",         department: "Engineering", division: "T&C", grade: "G3", location: "Dubai", status: "Active", ctc: 28000, startDate: "2017-06-30", dewaLicenseExpiry: "2026-10-18" },
  { id: "u-tk",  empNo: "PT-0190", name: "T. Kurian",      initials: "TK", designation: "QA/QC Engineer",                 department: "Engineering", grade: "G4", location: "Dubai", status: "Active", ctc: 22000, startDate: "2018-09-11" },
  { id: "u-jl",  empNo: "PT-0199", name: "J. Lopez",       initials: "JL", designation: "Document Controller",            department: "Admin", grade: "G5", location: "Dubai", status: "Active", ctc: 14000, startDate: "2022-01-09" },
  { id: "u-bh",  empNo: "PT-0208", name: "B. Hassan",      initials: "BH", designation: "Logistics Coordinator",          department: "Procurement", grade: "G4", location: "Dubai", status: "Active", ctc: 16000, startDate: "2021-11-20" },
];

// ───────── Clients ─────────
export const clients: Client[] = [
  { id: "c-afc",  name: "Al Futtaim Carillion",  legalName: "Al-Futtaim Carillion LLC", tier: "T1", vatTrn: "100023411800003", tradeLicense: "DED-621447", industry: "Main Contractor", established: 2007, location: "Dubai", phone: "+971 4 2061 100", website: "alfuttaim-carillion.com", ownerId: "u-ms", paymentTerms: "60 days net", creditLimit: 30_000_000, paymentScore: 62, arOutstanding: 13_600_000, arOver90: 6_900_000, lifetimeRevenue: 89_200_000, yoyDelta: -8, activeProjects: 4, openQuotes: 6, openQuotesValue: 24_800_000, lastActivityDays: 2, status: "Active" },
  { id: "c-sob",  name: "Sobha Realty",          legalName: "Sobha LLC",                tier: "T1", vatTrn: "100098221100003", tradeLicense: "DED-308991", industry: "Developer",       established: 1995, location: "Dubai", phone: "+971 4 4080 800", ownerId: "u-ms", paymentTerms: "75 days net", creditLimit: 18_000_000, paymentScore: 74, arOutstanding: 6_900_000, arOver90: 2_300_000, lifetimeRevenue: 41_300_000, yoyDelta: 4, activeProjects: 3, openQuotes: 4, openQuotesValue: 11_200_000, lastActivityDays: 5, status: "Active" },
  { id: "c-alec", name: "ALEC Engineering",      legalName: "ALEC Engineering & Contracting", tier: "T1", tradeLicense: "DED-410082", industry: "Main Contractor", established: 1999, location: "Dubai", ownerId: "u-fk", paymentTerms: "45 days net", creditLimit: 25_000_000, paymentScore: 89, arOutstanding: 5_000_000, arOver90: 200_000, lifetimeRevenue: 62_400_000, yoyDelta: 12, activeProjects: 2, openQuotes: 3, openQuotesValue: 9_600_000, lastActivityDays: 1, status: "Active" },
  { id: "c-mir",  name: "Miral Asset Mgmt",      legalName: "Miral Asset Management LLC", tier: "T1", industry: "Developer", established: 2011, location: "Abu Dhabi", ownerId: "u-ms", paymentTerms: "90 days net", creditLimit: 15_000_000, paymentScore: 58, arOutstanding: 6_700_000, arOver90: 3_600_000, lifetimeRevenue: 22_800_000, yoyDelta: -2, activeProjects: 2, openQuotes: 2, openQuotesValue: 4_400_000, lastActivityDays: 3, status: "Active" },
  { id: "c-em",   name: "Emaar Construction",    legalName: "Emaar Construction LLC", tier: "T1", industry: "Developer", established: 1997, location: "Dubai", ownerId: "u-fk", paymentTerms: "45 days net", creditLimit: 40_000_000, paymentScore: 91, arOutstanding: 4_200_000, arOver90: 0, lifetimeRevenue: 118_400_000, yoyDelta: 18, activeProjects: 5, openQuotes: 8, openQuotesValue: 32_100_000, lastActivityDays: 1, status: "Active" },
  { id: "c-dam",  name: "DAMAC Properties",      legalName: "DAMAC Properties LLC",   tier: "T2", industry: "Developer", established: 2002, location: "Dubai", ownerId: "u-rk", paymentTerms: "60 days net", creditLimit: 12_000_000, paymentScore: 78, arOutstanding: 2_100_000, arOver90: 0, lifetimeRevenue: 14_600_000, yoyDelta: 22, activeProjects: 2, openQuotes: 3, openQuotesValue: 8_900_000, lastActivityDays: 4, status: "Active" },
  { id: "c-nab",  name: "Al Naboodah",           legalName: "Saeed & Mohammed Al Naboodah Group", tier: "T1", industry: "Main Contractor", established: 1958, location: "Dubai", ownerId: "u-ms", paymentTerms: "45 days net", creditLimit: 22_000_000, paymentScore: 92, arOutstanding: 3_500_000, arOver90: 0, lifetimeRevenue: 71_900_000, yoyDelta: 9, activeProjects: 3, openQuotes: 4, openQuotesValue: 12_400_000, lastActivityDays: 1, status: "Active" },
  { id: "c-arb",  name: "Arabtec Construction",  legalName: "Arabtec Holding PJSC",   tier: "T2", industry: "Main Contractor", established: 1975, location: "Dubai", ownerId: "u-sm", paymentTerms: "90 days net", creditLimit: 10_000_000, paymentScore: 54, arOutstanding: 6_800_000, arOver90: 3_900_000, lifetimeRevenue: 28_700_000, yoyDelta: -14, activeProjects: 3, openQuotes: 2, openQuotesValue: 14_300_000, lastActivityDays: 6, status: "Active" },
  { id: "c-ald",  name: "Aldar Properties",      legalName: "Aldar Properties PJSC",  tier: "T1", industry: "Developer", established: 2004, location: "Abu Dhabi", ownerId: "u-fk", paymentTerms: "45 days net", creditLimit: 28_000_000, paymentScore: 87, arOutstanding: 1_800_000, arOver90: 0, lifetimeRevenue: 39_500_000, yoyDelta: 7, activeProjects: 2, openQuotes: 2, openQuotesValue: 8_400_000, lastActivityDays: 2, status: "Active" },
  { id: "c-nak",  name: "Nakheel",               legalName: "Nakheel PJSC",           tier: "T2", industry: "Developer", established: 2000, location: "Dubai", ownerId: "u-rk", paymentTerms: "60 days net", creditLimit: 8_000_000, paymentScore: 71, arOutstanding: 2_400_000, arOver90: 600_000, lifetimeRevenue: 9_800_000, yoyDelta: 5, activeProjects: 1, openQuotes: 2, openQuotesValue: 4_900_000, lastActivityDays: 3, status: "Active" },
  { id: "c-exp",  name: "Expo City Dubai",       legalName: "Expo 2020 Dubai LLC",    tier: "T1", industry: "Developer", established: 2014, location: "Dubai", ownerId: "u-ms", paymentTerms: "60 days net", creditLimit: 20_000_000, paymentScore: 88, arOutstanding: 1_900_000, arOver90: 0, lifetimeRevenue: 27_300_000, yoyDelta: 11, activeProjects: 2, openQuotes: 1, openQuotesValue: 22_100_000, lastActivityDays: 1, status: "Active" },
  { id: "c-bjv",  name: "Bechtel JV (NEOM)",     legalName: "Bechtel-AECOM JV",       tier: "T1", industry: "Main Contractor", established: 2018, location: "KSA", ownerId: "u-fr", paymentTerms: "60 days net", creditLimit: 30_000_000, paymentScore: 85, arOutstanding: 4_800_000, arOver90: 0, lifetimeRevenue: 38_900_000, yoyDelta: 24, activeProjects: 1, openQuotes: 3, openQuotesValue: 19_800_000, lastActivityDays: 2, status: "Active" },
  { id: "c-azi",  name: "Azizi Developments",    tier: "T2", industry: "Developer", established: 2007, location: "Dubai", ownerId: "u-rk", paymentTerms: "75 days net", creditLimit: 6_000_000, paymentScore: 66, arOutstanding: 1_400_000, arOver90: 200_000, lifetimeRevenue: 4_200_000, yoyDelta: 0, activeProjects: 0, openQuotes: 1, openQuotesValue: 4_200_000, lastActivityDays: 8, status: "Active" },
];

export const contacts: Contact[] = [
  { id: "ct-1", clientId: "c-nab", name: "Khalid Al Naboodah", role: "Director — Construction", phone: "+971 50 4112233", email: "khalid@naboodah.com" },
  { id: "ct-2", clientId: "c-nab", name: "P. Vishwanathan",     role: "Procurement Lead",        phone: "+971 50 8821147", email: "vishwa@naboodah.com" },
  { id: "ct-3", clientId: "c-nab", name: "S. Aravind",          role: "MEP Coordinator",         phone: "+971 55 4490012", email: "aravind@naboodah.com" },
  { id: "ct-4", clientId: "c-afc", name: "Brian O'Connor",      role: "Commercial Director",     phone: "+971 50 6612344", email: "boc@afcarillion.com" },
  { id: "ct-5", clientId: "c-afc", name: "Rajeev Menon",        role: "Project Director",        phone: "+971 50 8801197", email: "rmenon@afcarillion.com" },
  { id: "ct-6", clientId: "c-em",  name: "Ahmed Al Hashimi",    role: "Senior Procurement Mgr",  phone: "+971 4 367 3333",  email: "ahmed.h@emaar.com" },
  { id: "ct-7", clientId: "c-mir", name: "Stephen Wallace",     role: "Project Manager",         phone: "+971 2 657 0000",  email: "swallace@miral.ae" },
];

// ───────── Opportunities ─────────
export const opportunities: Opportunity[] = [
  { id: "o-1",  name: "Al Naboodah HQ Expansion",    clientId: "c-nab", consultant: "Hyder Consulting",  value: 8_200_000,  stage: "Quoted",       engineerId: "u-rk", division: "MEP",        expectedClose: "2026-05-15", probability: 65, source: "Consultant specification", tier: "T1", competitors: ["Danway","Voltas"], tags: ["Hot","Recurring client"], nextActivity: "Call - 21 Apr",          createdAt: "2026-03-12" },
  { id: "o-2",  name: "Arabtec Marsa Tower",          clientId: "c-arb", consultant: "AECOM",             value: 12_100_000, stage: "Quoted",       engineerId: "u-sm", division: "HVAC",       expectedClose: "2026-05-30", probability: 35, source: "Tender portal",           tier: "T2", competitors: ["Voltas","BIX"],     tags: [],                          nextActivity: "Follow-up email",       createdAt: "2026-02-21" },
  { id: "o-3",  name: "ALEC Engineering Tower B",     clientId: "c-alec",consultant: "Atkins",            value: 4_800_000,  stage: "Shortlisted",  engineerId: "u-rk", division: "Electrical", expectedClose: "2026-05-05", probability: 78, source: "Referral",                tier: "T1", competitors: ["Danway"],            tags: ["Hot"],                     nextActivity: "Submit revised quote",  createdAt: "2026-03-04" },
  { id: "o-4",  name: "DAMAC Lagoons Phase 3",        clientId: "c-dam", consultant: "Hyder Consulting",  value: 6_400_000,  stage: "Submitted",    engineerId: "u-ah", division: "MEP",        expectedClose: "2026-05-22", probability: 40, source: "Inbound",                 tier: "T2", competitors: ["BIX"],               tags: [],                          nextActivity: "",                       createdAt: "2026-02-28" },
  { id: "o-5",  name: "Emaar Creek Harbour T4",       clientId: "c-em",  consultant: "Atkins",            value: 9_100_000,  stage: "Submitted",    engineerId: "u-fr", division: "Automation", expectedClose: "2026-06-10", probability: 50, source: "Consultant specification", tier: "T1", competitors: ["Voltas"],            tags: ["Recurring client"],        nextActivity: "Site meeting 25 Apr",   createdAt: "2026-02-14" },
  { id: "o-6",  name: "Nakheel Deira Islands",        clientId: "c-nak", consultant: "RMJM",              value: 3_200_000,  stage: "Quoted",       engineerId: "u-rk", division: "HVAC",       expectedClose: "2026-04-28", probability: 30, source: "Tender portal",           tier: "T2", competitors: ["Danway","Voltas"], tags: [],                          nextActivity: "",                       createdAt: "2026-03-08" },
  { id: "o-7",  name: "Aldar Yas Island Villas",      clientId: "c-ald", consultant: "Dar Al Handasah",   value: 6_800_000,  stage: "BOQ Received", engineerId: "u-ah", division: "MEP",        expectedClose: "2026-05-08", probability: 55, source: "Consultant specification", tier: "T1", competitors: [],                    tags: ["Hot"],                     nextActivity: "Prepare quote",          createdAt: "2026-04-02" },
  { id: "o-8",  name: "Azizi Riviera Phase 6",        clientId: "c-azi", consultant: "Atkins",            value: 4_200_000,  stage: "Lead",         engineerId: "u-rk", division: "HVAC",       expectedClose: "2026-06-18", probability: 18, source: "Inbound",                 tier: "T3", competitors: [],                    tags: [],                          nextActivity: "Qualification call",     createdAt: "2026-04-09" },
  { id: "o-9",  name: "Saadiyat Cultural District",   clientId: "c-mir", consultant: "AECOM",             value: 15_800_000, stage: "Shortlisted",  engineerId: "u-sm", division: "MEP",        expectedClose: "2026-05-12", probability: 70, source: "Tender portal",           tier: "T1", competitors: ["Voltas","BIX"],     tags: ["Hot","Gov project"],       nextActivity: "Negotiation meeting",   createdAt: "2026-02-09" },
  { id: "o-10", name: "Emaar Downtown Expansion",     clientId: "c-em",  consultant: "Atkins",            value: 8_100_000,  stage: "Qualified",    engineerId: "u-sm", division: "HVAC",       expectedClose: "2026-05-20", probability: 45, source: "Referral",                tier: "T1", competitors: [],                    tags: ["Recurring client"],        nextActivity: "Site visit 28 Apr",     createdAt: "2026-03-25" },
  { id: "o-11", name: "NEOM Line Plot-42",            clientId: "c-bjv", consultant: "AECOM",             value: 18_400_000, stage: "Won",          engineerId: "u-fr", division: "Automation", expectedClose: "2026-03-15", probability: 100,source: "Consultant specification", tier: "T1", competitors: [],                    tags: ["Strategic"],               nextActivity: "",                       createdAt: "2025-11-12" },
  { id: "o-12", name: "Expo City Phase 2",            clientId: "c-exp", consultant: "Atkins",            value: 22_100_000, stage: "Won",          engineerId: "u-rk", division: "MEP",        expectedClose: "2026-02-02", probability: 100,source: "Consultant specification", tier: "T1", competitors: [],                    tags: ["Strategic"],               nextActivity: "",                       createdAt: "2025-09-22" },
  { id: "o-13", name: "Sobha Hartland 8",             clientId: "c-sob", consultant: "Hyder Consulting",  value: 7_400_000,  stage: "Lost",         engineerId: "u-vp", division: "Electrical", expectedClose: "2026-04-10", probability: 0,  source: "Consultant specification", tier: "T1", competitors: ["Danway"],            tags: [],                          nextActivity: "",                       createdAt: "2026-01-18" },
  { id: "o-14", name: "Meraas Tower B4 Retrofit",     clientId: "c-afc", consultant: "Dar Al Handasah",   value: 5_600_000,  stage: "Quoted",       engineerId: "u-ah", division: "HVAC",       expectedClose: "2026-05-25", probability: 38, source: "Inbound",                 tier: "T1", competitors: ["Voltas"],            tags: [],                          nextActivity: "Follow-up call",         createdAt: "2026-03-19" },
  { id: "o-15", name: "DAMAC Hills 2 Villas",         clientId: "c-dam", consultant: "Hyder Consulting",  value: 2_400_000,  stage: "Qualified",    engineerId: "u-rk", division: "Electrical", expectedClose: "2026-06-04", probability: 35, source: "Inbound",                 tier: "T2", competitors: [],                    tags: [],                          nextActivity: "",                       createdAt: "2026-04-01" },
  { id: "o-16", name: "Aldar Saadiyat Reserve",       clientId: "c-ald", consultant: "Dar Al Handasah",   value: 11_200_000, stage: "Submitted",    engineerId: "u-fr", division: "MEP",        expectedClose: "2026-06-20", probability: 50, source: "Tender portal",           tier: "T1", competitors: ["Voltas"],            tags: ["Hot"],                     nextActivity: "Price negotiation",     createdAt: "2026-02-26" },
  { id: "o-17", name: "Sobha One Tower",              clientId: "c-sob", consultant: "Hyder Consulting",  value: 9_400_000,  stage: "BOQ Received", engineerId: "u-vp", division: "HVAC",       expectedClose: "2026-05-29", probability: 32, source: "Consultant specification", tier: "T1", competitors: ["Danway","BIX"],     tags: [],                          nextActivity: "Prepare quote",          createdAt: "2026-03-30" },
  { id: "o-18", name: "Emaar Beachfront T7",          clientId: "c-em",  consultant: "Atkins",            value: 6_700_000,  stage: "Quoted",       engineerId: "u-fr", division: "HVAC",       expectedClose: "2026-05-18", probability: 55, source: "Consultant specification", tier: "T1", competitors: [],                    tags: ["Recurring client"],        nextActivity: "",                       createdAt: "2026-03-22" },
];

// ───────── Quotes (the lead one — Q-24812 — has full line items) ─────────
export const quotes: Quote[] = [
  { id: "Q-24812", clientId: "c-nab", opportunityId: "o-1",  consultant: "Hyder Consulting", engineerId: "u-rk", division: "HVAC",       issueDate: "2026-04-06", validUntil: "2026-05-06", paymentTerms: "60 days net", deliveryTerms: "DDP Site - Al Naboodah HQ Dubai", leadTimeWeeks: 10, status: "Sent",             reference: "HC-2024-FCU-03 spec match", warranty: "3 years standard", tags: ["Hot","Consultant spec'd"], lines: [
      { id: "ln-1", product: "FCU KingAir KA-FC-450", principal: "KingAir",         description: "Horizontal concealed FCU, 450 CFM, chilled water", qty: 80,  unitList: 28_500, discountPct: 7, commissionPct: 18, costPct: 0.78 },
      { id: "ln-2", product: "FCU KingAir KA-FC-600", principal: "KingAir",         description: "Horizontal concealed FCU, 600 CFM",                  qty: 40,  unitList: 34_200, discountPct: 7, commissionPct: 18, costPct: 0.78 },
      { id: "ln-3", product: "Thermostats Honeywell T6", principal: "Thomas & Betts", description: "Programmable digital",                                qty: 120, unitList: 620,    discountPct: 5, commissionPct: 12, costPct: 0.81 },
      { id: "ln-4", product: "Vibration isolators",   principal: "Vibro-Acoustics", description: "Spring mount, 120 units",                             qty: 120, unitList: 310,    discountPct: 3, commissionPct: 22, costPct: 0.74 },
      { id: "ln-5", product: "Installation & T&C labor", principal: "—",            description: "Site supervision + commissioning",                    qty: 1,   unitList: 350_000,discountPct: 0, commissionPct: 0,  costPct: 0.72 },
  ]},
  { id: "Q-24798", clientId: "c-arb", opportunityId: "o-2",  consultant: "AECOM",            engineerId: "u-sm", division: "HVAC",       issueDate: "2026-03-29", validUntil: "2026-04-29", paymentTerms: "90 days net", status: "Under Discussion", lines: [] },
  { id: "Q-24776", clientId: "c-alec",opportunityId: "o-3",  consultant: "Atkins",           engineerId: "u-rk", division: "Electrical", issueDate: "2026-04-11", validUntil: "2026-05-11", paymentTerms: "45 days net", status: "Sent",             lines: [] },
  { id: "Q-24755", clientId: "c-dam", opportunityId: "o-4",  consultant: "Hyder Consulting", engineerId: "u-ah", division: "MEP",        issueDate: "2026-04-02", validUntil: "2026-05-02", paymentTerms: "60 days net", status: "Sent",             lines: [] },
  { id: "Q-24743", clientId: "c-em",  opportunityId: "o-5",  consultant: "Atkins",           engineerId: "u-fr", division: "Automation", issueDate: "2026-03-24", validUntil: "2026-04-24", paymentTerms: "45 days net", status: "Expired",          lines: [] },
  { id: "Q-24731", clientId: "c-nak", opportunityId: "o-6",  consultant: "RMJM",             engineerId: "u-rk", division: "HVAC",       issueDate: "2026-04-09", validUntil: "2026-05-09", paymentTerms: "60 days net", status: "Sent",             lines: [] },
  { id: "Q-24718", clientId: "c-ald", opportunityId: "o-16", consultant: "Dar Al Handasah",  engineerId: "u-fr", division: "MEP",        issueDate: "2026-03-18", validUntil: "2026-04-18", paymentTerms: "45 days net", status: "Under Discussion", lines: [] },
  { id: "Q-24702", clientId: "c-mir", opportunityId: "o-9",  consultant: "AECOM",            engineerId: "u-sm", division: "MEP",        issueDate: "2026-03-11", validUntil: "2026-04-11", paymentTerms: "90 days net", status: "Sent",             lines: [] },
  { id: "Q-24688", clientId: "c-em",  opportunityId: "o-18", consultant: "Atkins",           engineerId: "u-fr", division: "HVAC",       issueDate: "2026-03-22", validUntil: "2026-04-22", paymentTerms: "45 days net", status: "Sent",             lines: [] },
  { id: "Q-24671", clientId: "c-sob", opportunityId: "o-13", consultant: "Hyder Consulting", engineerId: "u-vp", division: "Electrical", issueDate: "2026-02-20", validUntil: "2026-03-22", paymentTerms: "75 days net", status: "Lost",             lines: [] },
];

// ───────── Projects ─────────
export const projects: Project[] = [
  { id: "p-1", code: "PR-2025-0114", name: "Meraas Tower B4",       clientId: "c-afc", consultant: "Dar Al Handasah", mainContractor: "Al Futtaim Carillion", division: "HVAC",       region: "Dubai",     poValue: 11_400_000, quotedMargin: 11.2, liveMargin: 2.1,  daysToHandover: 47,  ldExposure: 84_000,  status: "In Progress",  health: "Critical", contractType: "Lump Sum", retentionPct: 10, advancePct: 10, startDate: "2025-04-01", targetHandover: "2026-06-06", pmId: "u-mk" },
  { id: "p-2", code: "PR-2025-0098", name: "Sobha Hartland 7",      clientId: "c-sob", consultant: "Hyder Consulting", mainContractor: "Sobha Realty",         division: "Electrical", region: "Dubai",     poValue: 8_200_000,  quotedMargin: 8.5,  liveMargin: 3.8,  daysToHandover: 21,  ldExposure: 62_000,  status: "Commissioning",health: "Critical", contractType: "Lump Sum", retentionPct: 10, advancePct: 10, startDate: "2024-11-15", targetHandover: "2026-05-11", pmId: "u-mali" },
  { id: "p-3", code: "PR-2025-0142", name: "Saadiyat Hotel",        clientId: "c-mir", consultant: "AECOM",            mainContractor: "Miral Asset Mgmt",     division: "HVAC",       region: "Abu Dhabi", poValue: 6_900_000,  quotedMargin: 12.0, liveMargin: 3.4,  daysToHandover: 9,   ldExposure: 48_000,  status: "Handover",     health: "Critical", contractType: "Re-measurable", retentionPct: 5,  advancePct: 15, startDate: "2024-10-08", targetHandover: "2026-04-29", pmId: "u-pn" },
  { id: "p-4", code: "PR-2025-0167", name: "Expo City Phase 2",     clientId: "c-exp", consultant: "Atkins",           mainContractor: "Expo City Dubai",      division: "MEP",        region: "Dubai",     poValue: 22_100_000, quotedMargin: 9.8,  liveMargin: 4.9,  daysToHandover: 88,  ldExposure: 165_000, status: "In Progress",  health: "Watch",    contractType: "Lump Sum", retentionPct: 10, advancePct: 10, startDate: "2025-06-22", targetHandover: "2026-07-17", pmId: "u-mk" },
  { id: "p-5", code: "PR-2025-0181", name: "NEOM Line Plot-42",     clientId: "c-bjv", consultant: "AECOM",            mainContractor: "Bechtel JV",           division: "Automation", region: "KSA",       poValue: 18_400_000, quotedMargin: 14.5, liveMargin: 6.2,  daysToHandover: 156, ldExposure: 138_000, status: "In Progress",  health: "Watch",    contractType: "Cost+",    retentionPct: 5,  advancePct: 20, startDate: "2025-09-10", targetHandover: "2026-09-23", pmId: "u-ka" },
  { id: "p-6", code: "PR-2025-0102", name: "ALEC Tower A",          clientId: "c-alec",consultant: "Atkins",           mainContractor: "ALEC Engineering",     division: "MEP",        region: "Dubai",     poValue: 9_600_000,  quotedMargin: 9.8,  liveMargin: 10.4, daysToHandover: 112, ldExposure: 110_000, status: "In Progress",  health: "Healthy",  contractType: "Lump Sum", retentionPct: 5,  advancePct: 10, startDate: "2025-05-04", targetHandover: "2026-08-10", pmId: "u-rs" },
  { id: "p-7", code: "PR-2025-0078", name: "Al Naboodah HQ",        clientId: "c-nab", consultant: "Hyder Consulting", mainContractor: "Al Naboodah",          division: "Electrical", region: "Dubai",     poValue: 7_400_000,  quotedMargin: 10.1, liveMargin: 11.3, daysToHandover: 64,  ldExposure: 31_000,  status: "In Progress",  health: "Healthy",  contractType: "Lump Sum", retentionPct: 5,  advancePct: 10, startDate: "2025-03-18", targetHandover: "2026-06-23", pmId: "u-tk" },
];

// ───────── Variation Orders ─────────
export const variationOrders: VariationOrder[] = [
  { id: "VO-2026-0142", projectId: "p-1", value: 420_000,   daysOpen: 89, reason: "HVAC spec change",        reasonCategory: "Scope change",   fidicClause: "Cl. 13", ownerId: "u-rk", status: "Submitted",     health: "Overdue",  submittedDate: "2026-01-21" },
  { id: "VO-2026-0138", projectId: "p-3", value: 1_240_000, daysOpen: 72, reason: "Site access extension",   reasonCategory: "Delay",          fidicClause: "Cl. 20", ownerId: "u-sm", status: "Under Review",  health: "Overdue",  submittedDate: "2026-02-07" },
  { id: "VO-2026-0131", projectId: "p-4", value: 680_000,   daysOpen: 54, reason: "Additional FCUs",         reasonCategory: "Scope change",   fidicClause: "Cl. 13", ownerId: "u-ah", status: "Under Review",  health: "Escalate", submittedDate: "2026-02-25" },
  { id: "VO-2026-0127", projectId: "p-2", value: 290_000,   daysOpen: 48, reason: "Electrical re-routing",   reasonCategory: "Site condition", fidicClause: "Cl. 44.1",ownerId: "u-vp", status: "Under Review",  health: "Escalate", submittedDate: "2026-03-03" },
  { id: "VO-2026-0121", projectId: "p-5", value: 1_850_000, daysOpen: 41, reason: "Automation scope add",    reasonCategory: "Scope change",   fidicClause: "Cl. 13", ownerId: "u-fr", status: "Submitted",     health: "Pending",  submittedDate: "2026-03-10" },
  { id: "VO-2026-0116", projectId: "p-6", value: 510_000,   daysOpen: 34, reason: "Acoustic panel upgrade",  reasonCategory: "Design change",  fidicClause: "Cl. 13", ownerId: "u-rk", status: "Submitted",     health: "On track", submittedDate: "2026-03-17" },
  { id: "VO-2026-0112", projectId: "p-7", value: 180_000,   daysOpen: 22, reason: "Additional DB board",     reasonCategory: "Scope change",   fidicClause: "Cl. 13", ownerId: "u-ah", status: "Submitted",     health: "On track", submittedDate: "2026-03-29" },
  { id: "VO-2026-0108", projectId: "p-4", value: 95_000,    daysOpen: 18, reason: "BMS integration changes", reasonCategory: "Design change",  fidicClause: "Cl. 13", ownerId: "u-fr", status: "Draft",         health: "Pending",  submittedDate: "2026-04-02" },
  { id: "VO-2025-0421", projectId: "p-1", value: 240_000,   daysOpen: 0,  reason: "Lift lobby AHU upgrade",  reasonCategory: "Scope change",   fidicClause: "Cl. 13", ownerId: "u-rk", status: "Approved",      health: "Approved", submittedDate: "2025-12-04" },
  { id: "VO-2025-0398", projectId: "p-3", value: 320_000,   daysOpen: 0,  reason: "Chiller relocation",      reasonCategory: "Site condition", fidicClause: "Cl. 44.1",ownerId: "u-pn", status: "Rejected",      health: "Rejected", submittedDate: "2025-11-19" },
];

// ───────── Submittals ─────────
export const submittals: Submittal[] = [
  { id: "SUB-2026-0214", projectId: "p-1", item: "FCU KingAir KA-FC-450 (qty 80)",       principal: "KingAir",        consultant: "Dar Al Handasah",  submittedDate: "2026-03-12", daysOpen: 38, status: "Resubmit",      revision: 2, blocking: true },
  { id: "SUB-2026-0208", projectId: "p-2", item: "Busbar Trunking 800A",                  principal: "Thomas & Betts", consultant: "Hyder Consulting", submittedDate: "2026-03-18", daysOpen: 32, status: "Under Review",  revision: 1, blocking: true },
  { id: "SUB-2026-0203", projectId: "p-4", item: "Variable Speed Drives 22kW (qty 14)",   principal: "ACME",           consultant: "Atkins",           submittedDate: "2026-03-22", daysOpen: 28, status: "Under Review",  revision: 1, blocking: false },
  { id: "SUB-2026-0198", projectId: "p-3", item: "Spring isolators (qty 240)",            principal: "Vibro-Acoustics",consultant: "AECOM",            submittedDate: "2026-03-28", daysOpen: 22, status: "Approved",      revision: 1, blocking: false },
  { id: "SUB-2026-0192", projectId: "p-5", item: "PLC Panels Schneider M340",             principal: "ACME",           consultant: "AECOM",            submittedDate: "2026-04-04", daysOpen: 16, status: "Submitted",     revision: 1, blocking: false },
  { id: "SUB-2026-0188", projectId: "p-6", item: "Acoustic Louvers (qty 32)",             principal: "Filterine",      consultant: "Atkins",           submittedDate: "2026-04-08", daysOpen: 12, status: "Approved",      revision: 1, blocking: false },
];

// ───────── RFQs ─────────
export const rfqs: RFQ[] = [
  { id: "RFQ-2026-0087", projectId: "p-1", item: "80× Fan Coil Units (KA-FC-450 spec)", suppliersInvited: ["KingAir","Carrier","Trosten"], quotesReceived: 3, budget: 2_100_000, status: "Comparing",         ownerId: "u-rk", createdAt: "2026-04-08", requiredDate: "2026-06-15" },
  { id: "RFQ-2026-0084", projectId: "p-4", item: "14× VSD 22kW",                         suppliersInvited: ["ACME","Schneider","Danfoss"],  quotesReceived: 3, budget: 480_000,   status: "Awarded",          ownerId: "u-ah", createdAt: "2026-04-02", requiredDate: "2026-05-30" },
  { id: "RFQ-2026-0081", projectId: "p-2", item: "Busbar Trunking 800A 220m",            suppliersInvited: ["Thomas & Betts","Schneider"],  quotesReceived: 2, budget: 1_400_000, status: "Sent to Suppliers",ownerId: "u-vp", createdAt: "2026-04-12", requiredDate: "2026-05-22" },
  { id: "RFQ-2026-0079", projectId: "p-3", item: "Spring isolators (qty 240)",           suppliersInvited: ["Vibro-Acoustics","Mason"],     quotesReceived: 2, budget: 88_000,    status: "PO Issued",        ownerId: "u-pn", createdAt: "2026-03-25", requiredDate: "2026-05-04" },
  { id: "RFQ-2026-0076", projectId: "p-5", item: "PLC Panels Schneider M340",            suppliersInvited: ["ACME","Siemens"],              quotesReceived: 1, budget: 720_000,   status: "Sent to Suppliers",ownerId: "u-fr", createdAt: "2026-04-10", requiredDate: "2026-06-08" },
  { id: "RFQ-2026-0072", projectId: "p-6", item: "Acoustic Louvers (qty 32)",            suppliersInvited: ["Filterine","Vibro-Acoustics"], quotesReceived: 2, budget: 142_000,   status: "Awarded",          ownerId: "u-rk", createdAt: "2026-03-30", requiredDate: "2026-05-12" },
  { id: "RFQ-2026-0068", projectId: "p-1", item: "Thermostats Honeywell T6 (qty 120)",   suppliersInvited: ["Thomas & Betts","Honeywell"],  quotesReceived: 0, budget: 78_000,    status: "Draft",            ownerId: "u-rk", createdAt: "2026-04-15", requiredDate: "2026-06-01" },
];

// ───────── Purchase Orders ─────────
export const purchaseOrders: PurchaseOrder[] = [
  { id: "PO-2026-0142", projectId: "p-1", supplier: "KingAir (Taiwan)",  value: 2_100_000, poDate: "2026-03-04", expectedDelivery: "2026-04-28", status: "Shipped",   delayDays: 0 },
  { id: "PO-2026-0138", projectId: "p-2", supplier: "Thomas & Betts",    value: 1_400_000, poDate: "2026-02-22", expectedDelivery: "2026-05-02", status: "Delayed",   delayDays: 9 },
  { id: "PO-2026-0131", projectId: "p-3", supplier: "Vibro-Acoustics",   value: 890_000,   poDate: "2026-03-12", expectedDelivery: "2026-04-25", status: "In customs",delayDays: 0 },
  { id: "PO-2026-0127", projectId: "p-4", supplier: "ACME",              value: 3_200_000, poDate: "2026-03-18", expectedDelivery: "2026-05-05", status: "Sent",      delayDays: 0 },
  { id: "PO-2026-0121", projectId: "p-5", supplier: "KingAir",           value: 1_800_000, poDate: "2026-03-28", expectedDelivery: "2026-05-15", status: "Acknowledged", delayDays: 0 },
  { id: "PO-2026-0116", projectId: "p-6", supplier: "Filterine",         value: 142_000,   poDate: "2026-04-02", expectedDelivery: "2026-05-12", status: "Sent",      delayDays: 0 },
  { id: "PO-2026-0112", projectId: "p-7", supplier: "Thomas & Betts",    value: 320_000,   poDate: "2026-03-30", expectedDelivery: "2026-05-08", status: "Acknowledged", delayDays: 0 },
];

// ───────── Suppliers (principals) ─────────
export const suppliers: Supplier[] = [
  { id: "s-ka",  name: "KingAir",          agreementType: "Exclusive UAE",   ytdVolume: 18_400_000, commissionPct: 18, otdPct: 91, qualityScore: 4.4, lastOrder: "2026-03-28", status: "Active" },
  { id: "s-va",  name: "Vibro-Acoustics",  agreementType: "Authorized",      ytdVolume: 6_200_000,  commissionPct: 22, otdPct: 88, qualityScore: 4.6, lastOrder: "2026-03-12", status: "Active" },
  { id: "s-tb",  name: "Thomas & Betts",   agreementType: "Distributor",     ytdVolume: 11_800_000, commissionPct: 12, otdPct: 71, qualityScore: 3.4, lastOrder: "2026-03-30", status: "Review" },
  { id: "s-acme",name: "ACME",             agreementType: "Authorized",      ytdVolume: 7_900_000,  commissionPct: 16, otdPct: 86, qualityScore: 4.2, lastOrder: "2026-03-18", status: "Active" },
  { id: "s-fil", name: "Filterine",        agreementType: "Exclusive GCC",   ytdVolume: 3_200_000,  commissionPct: 21, otdPct: 93, qualityScore: 4.7, lastOrder: "2026-04-02", status: "Active" },
  { id: "s-car", name: "Carrier",          agreementType: "Spot",            ytdVolume: 1_400_000,  commissionPct: 9,  otdPct: 82, qualityScore: 4.1, lastOrder: "2025-12-04", status: "Active" },
  { id: "s-sie", name: "Siemens",          agreementType: "Authorized",      ytdVolume: 4_100_000,  commissionPct: 14, otdPct: 89, qualityScore: 4.4, lastOrder: "2026-02-19", status: "Active" },
  { id: "s-tro", name: "Trosten",          agreementType: "Spot",            ytdVolume: 800_000,    commissionPct: 12, otdPct: 79, qualityScore: 3.8, lastOrder: "2025-10-22", status: "On hold" },
];

// ───────── Customer invoices ─────────
export const customerInvoices: CustomerInvoice[] = [
  { id: "INV-2026-0312", clientId: "c-afc", projectId: "p-1", amount: 2_400_000, invoiceDate: "2026-01-22", dueDate: "2026-03-23", status: "Overdue", ageDays: 88 },
  { id: "INV-2026-0298", clientId: "c-afc", projectId: "p-1", amount: 3_100_000, invoiceDate: "2026-02-08", dueDate: "2026-04-09", status: "Overdue", ageDays: 71 },
  { id: "INV-2026-0287", clientId: "c-sob", projectId: "p-2", amount: 1_600_000, invoiceDate: "2026-02-14", dueDate: "2026-04-30", status: "Overdue", ageDays: 65 },
  { id: "INV-2026-0274", clientId: "c-mir", projectId: "p-3", amount: 1_800_000, invoiceDate: "2026-02-21", dueDate: "2026-05-22", status: "Posted",  ageDays: 58 },
  { id: "INV-2026-0261", clientId: "c-arb", projectId: undefined, amount: 1_200_000, invoiceDate: "2026-03-04", dueDate: "2026-06-02", status: "Posted",  ageDays: 47 },
  { id: "INV-2026-0254", clientId: "c-em",  projectId: undefined, amount: 880_000,   invoiceDate: "2026-03-12", dueDate: "2026-04-26", status: "Posted",  ageDays: 39 },
  { id: "INV-2026-0241", clientId: "c-nab", projectId: "p-7", amount: 1_100_000, invoiceDate: "2026-03-18", dueDate: "2026-05-02", status: "Paid",    ageDays: 33 },
  { id: "INV-2026-0228", clientId: "c-alec",projectId: "p-6", amount: 2_100_000, invoiceDate: "2026-03-25", dueDate: "2026-05-09", status: "Posted",  ageDays: 26 },
  { id: "INV-2026-0214", clientId: "c-exp", projectId: "p-4", amount: 1_900_000, invoiceDate: "2026-03-30", dueDate: "2026-05-29", status: "Posted",  ageDays: 21 },
  { id: "INV-2026-0201", clientId: "c-bjv", projectId: "p-5", amount: 4_800_000, invoiceDate: "2026-04-04", dueDate: "2026-06-03", status: "Posted",  ageDays: 16 },
];

export const supplierBills: SupplierBill[] = [
  { id: "BILL-KA-8934", supplier: "KingAir",         amount: 2_100_000, billDate: "2026-03-04", dueDate: "2026-05-03", status: "Posted" },
  { id: "BILL-TB-2241", supplier: "Thomas & Betts",  amount: 1_400_000, billDate: "2026-02-22", dueDate: "2026-04-23", status: "Overdue" },
  { id: "BILL-VA-0918", supplier: "Vibro-Acoustics", amount: 890_000,   billDate: "2026-03-12", dueDate: "2026-05-11", status: "Posted" },
  { id: "BILL-AC-1187", supplier: "ACME",            amount: 3_200_000, billDate: "2026-03-18", dueDate: "2026-05-17", status: "Posted" },
  { id: "BILL-FI-0418", supplier: "Filterine",       amount: 142_000,   billDate: "2026-04-02", dueDate: "2026-05-31", status: "Posted" },
  { id: "BILL-SI-2208", supplier: "Siemens",         amount: 480_000,   billDate: "2026-02-19", dueDate: "2026-04-20", status: "Overdue" },
];

// ───────── Activities (today + recent) ─────────
const today = "2026-04-20";
export const activities: Activity[] = [
  { id: "a-1", type: "Call",       subject: "Call Al Naboodah - payment follow-up",        relatedType: "Client",      relatedId: "c-afc", scheduledFor: `${today}T10:00`, ownerId: "u-ms", createdAt: "2026-04-19" },
  { id: "a-2", type: "Site Visit", subject: "Site visit - Meraas Tower B4",                relatedType: "Project",     relatedId: "p-1",   scheduledFor: `${today}T11:30`, ownerId: "u-ms", createdAt: "2026-04-18" },
  { id: "a-3", type: "Meeting",    subject: "Meeting - Farook + KingAir rep",              relatedType: "Client",      relatedId: "c-em",  scheduledFor: `${today}T14:00`, ownerId: "u-ms", createdAt: "2026-04-15" },
  { id: "a-4", type: "Note",       subject: "Review VO-2026-0142 (overdue 89d)",           relatedType: "VO",          relatedId: "VO-2026-0142", scheduledFor: `${today}T16:00`, ownerId: "u-ms", createdAt: "2026-04-17" },
  { id: "a-5", type: "Call",       subject: "Call Sobha - delivery escalation",            relatedType: "Project",     relatedId: "p-2",   scheduledFor: `${today}T17:00`, ownerId: "u-ms", createdAt: "2026-04-19" },
  { id: "a-6", type: "Call",       subject: "Qualification call - Azizi Riviera",          relatedType: "Opportunity", relatedId: "o-8",   scheduledFor: "2026-04-22T11:00", ownerId: "u-rk", createdAt: "2026-04-19" },
  { id: "a-7", type: "Email",      subject: "Sent revised quote Q-24812 v2",                relatedType: "Quote",       relatedId: "Q-24812", completedAt: "2026-04-18T16:42", outcome: "Awaiting consultant feedback", ownerId: "u-rk", createdAt: "2026-04-18" },
  { id: "a-8", type: "Meeting",    subject: "Pre-bid meeting Saadiyat Cultural District",  relatedType: "Opportunity", relatedId: "o-9",   completedAt: "2026-04-15T10:00", outcome: "Shortlisted along with 2 competitors", ownerId: "u-sm", createdAt: "2026-04-15" },
];

// ───────── Chatter seed ─────────
export const chatMessages: ChatMessage[] = [
  { id: "m-1", recordType: "Opportunity", recordId: "o-1", authorId: "u-rk", authorName: "R. Kumar",       body: "Hyder confirmed Al Naboodah will award by 15 May. Asked us to revise FCU model to match HC-2024-FCU-03.", kind: "message", createdAt: "2026-04-12T10:18" },
  { id: "m-2", recordType: "Opportunity", recordId: "o-1", authorId: "u-ms", authorName: "Manmohan Singh", body: "Good. Make sure we hold discount at 7% — Hyder has historically respected our commercial terms.",                           kind: "note",    createdAt: "2026-04-13T09:04" },
  { id: "m-3", recordType: "Opportunity", recordId: "o-1", authorId: "u-rk", authorName: "R. Kumar",       body: "Quote Q-24812 sent 06 Apr. Validity 30 days.",                                                                              kind: "log",     createdAt: "2026-04-06T14:22" },
  { id: "m-4", recordType: "Project",     recordId: "p-1", authorId: "u-mk", authorName: "M. Khan",        body: "Site report: FCU installation 38% complete. Submittal SUB-2026-0214 still blocking risers 7-12.",                            kind: "message", createdAt: "2026-04-19T17:30" },
  { id: "m-5", recordType: "VO",          recordId: "VO-2026-0142", authorId: "u-rk", authorName: "R. Kumar", body: "Carillion commercial team has had this since 21 Jan. Need escalation letter prepared per FIDIC Cl. 13.",                kind: "note",    createdAt: "2026-04-18T11:12" },
];
