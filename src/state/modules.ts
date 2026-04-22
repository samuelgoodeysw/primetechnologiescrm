// Prime Technologies — module configuration. 6 modules.

import {
  Home, Handshake, ShoppingCart, Truck, Calculator, Users,
  type LucideIcon,
} from "lucide-react";

export type ModuleKey =
  | "dashboard" | "crm" | "sales" | "procurement"
  | "accounting" | "hr";

export interface ModuleDef {
  key: ModuleKey;
  label: string;
  icon: LucideIcon;
  accent: string;
  basePath: string;
  menu: { label: string; path: string; group?: string }[];
}

export const modules: ModuleDef[] = [
  {
    key: "dashboard", label: "Dashboard", icon: Home, accent: "#0F2847",
    basePath: "/dashboard",
    menu: [{ label: "Home", path: "/dashboard" }],
  },
  {
    key: "crm", label: "CRM", icon: Handshake, accent: "#1e88e5",
    basePath: "/crm",
    menu: [
      { label: "My Pipeline",   path: "/crm/pipeline" },
      { label: "Opportunities", path: "/crm/opportunities" },
      { label: "Leads",         path: "/crm/leads" },
      { label: "Clients",       path: "/crm/clients" },
      { label: "Activities",    path: "/crm/activities" },
      { label: "Conversion funnel", path: "/crm/reports/funnel", group: "Reports" },
    ],
  },
  {
    key: "sales", label: "Sales", icon: ShoppingCart, accent: "#2e7d32",
    basePath: "/sales",
    menu: [
      { label: "Quotations",             path: "/sales/quotations" },
      { label: "Sales Orders",           path: "/sales/orders" },
      { label: "Customer Invoices",      path: "/sales/customer-invoices" },
      { label: "Products & Price Lists", path: "/sales/products" },
    ],
  },
  {
    key: "procurement", label: "Procurement", icon: Truck, accent: "#ef6c00",
    basePath: "/procurement",
    menu: [
      { label: "Purchase Orders", path: "/procurement/purchase-orders" },
    ],
  },
  {
    key: "accounting", label: "Accounting", icon: Calculator, accent: "#00838f",
    basePath: "/accounting",
    menu: [
      { label: "Customer Invoices",  path: "/accounting/customer-invoices" },
      { label: "Supplier Bills",     path: "/accounting/supplier-bills" },
      { label: "Payments",           path: "/accounting/payments" },
      { label: "AR Aging",           path: "/accounting/ar-aging" },
      { label: "AP Aging",           path: "/accounting/ap-aging" },
      { label: "Cash Flow",          path: "/accounting/cash-flow" },
    ],
  },
  {
    key: "hr", label: "HR", icon: Users, accent: "#c2185b",
    basePath: "/hr",
    menu: [
      { label: "Employees",             path: "/hr/employees" },
      { label: "Utilization",           path: "/hr/utilization" },
      { label: "Compliance & Documents",path: "/hr/compliance" },
      { label: "Timesheets",            path: "/hr/timesheets" },
      { label: "Leaves",                path: "/hr/leaves" },
      { label: "Contracts & Payroll",   path: "/hr/payroll" },
    ],
  },
];

export function moduleForPath(pathname: string): ModuleDef {
  return modules.find((m) => pathname.startsWith(m.basePath)) ?? modules[0];
}

export function moduleAccent(key: string): string {
  return modules.find((m) => m.key === key)?.accent ?? "#0F2847";
}
