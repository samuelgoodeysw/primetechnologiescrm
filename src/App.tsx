import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppStateProvider } from "@/state/AppState";
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "@/pages/Dashboard";
import ModuleStub from "@/pages/ModuleStub";
import NotFound from "@/pages/NotFound";
import { modules } from "@/state/modules";
import OpportunitiesPage from "@/pages/crm/OpportunitiesPage";
import OpportunityForm from "@/pages/crm/OpportunityForm";
import QuotationsPage from "@/pages/sales/QuotationsPage";
import QuotationForm from "@/pages/sales/QuotationForm";
import NewQuotation from "@/pages/sales/NewQuotation";
import MyPipeline from "@/pages/crm/MyPipeline";
import ClientsPage from "@/pages/crm/ClientsPage";
import ClientForm from "@/pages/crm/ClientForm";
import ARAgingPage from "@/pages/accounting/ARAgingPage";
import CustomerInvoicesPage from "@/pages/accounting/CustomerInvoicesPage";
import SupplierBillsPage from "@/pages/accounting/SupplierBillsPage";
import PurchaseOrdersPage from "@/pages/procurement/PurchaseOrdersPage";
import EmployeesPage from "@/pages/hr/EmployeesPage";
import UtilizationPage from "@/pages/hr/UtilizationPage";
import TimesheetsPage from "@/pages/hr/TimesheetsPage";

const queryClient = new QueryClient();

// Paths that have real built screens — must NOT receive a stub fallback route.
const BUILT_PATHS = new Set<string>([
  "/dashboard",
  "/crm", "/crm/pipeline", "/crm/opportunities", "/crm/clients",
  "/sales", "/sales/quotations", "/sales/customer-invoices",
  "/procurement", "/procurement/purchase-orders",
  "/accounting/ar-aging", "/accounting/customer-invoices", "/accounting/supplier-bills",
  "/hr/employees", "/hr/utilization", "/hr/timesheets",
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppStateProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* CRM */}
              <Route path="/crm" element={<Navigate to="/crm/pipeline" replace />} />
              <Route path="/crm/pipeline" element={<MyPipeline />} />
              <Route path="/crm/opportunities" element={<OpportunitiesPage />} />
              <Route path="/crm/opportunities/:id" element={<OpportunityForm />} />
              <Route path="/crm/clients" element={<ClientsPage />} />
              <Route path="/crm/clients/:id" element={<ClientForm />} />

              {/* Sales */}
              <Route path="/sales" element={<Navigate to="/sales/quotations" replace />} />
              <Route path="/sales/quotations" element={<QuotationsPage />} />
              <Route path="/sales/quotations/new" element={<NewQuotation />} />
              <Route path="/sales/quotations/:id" element={<QuotationForm />} />
              <Route path="/sales/customer-invoices" element={<CustomerInvoicesPage />} />

              {/* Procurement */}
              <Route path="/procurement" element={<Navigate to="/procurement/purchase-orders" replace />} />
              <Route path="/procurement/purchase-orders" element={<PurchaseOrdersPage />} />

              {/* Accounting */}
              <Route path="/accounting/ar-aging" element={<ARAgingPage />} />
              <Route path="/accounting/customer-invoices" element={<CustomerInvoicesPage />} />
              <Route path="/accounting/supplier-bills" element={<SupplierBillsPage />} />

              {/* HR */}
              <Route path="/hr/employees" element={<EmployeesPage />} />
              <Route path="/hr/utilization" element={<UtilizationPage />} />
              <Route path="/hr/timesheets" element={<TimesheetsPage />} />

              {/* Stubs for everything else from the module config. */}
              {modules
                .filter((m) => m.key !== "dashboard")
                .flatMap((m) => {
                  const routes = [];
                  if (!BUILT_PATHS.has(m.basePath)) {
                    routes.push(<Route key={m.basePath} path={m.basePath} element={<ModuleStub />} />);
                  }
                  for (const sub of m.menu) {
                    if (!BUILT_PATHS.has(sub.path)) {
                      routes.push(<Route key={sub.path} path={sub.path} element={<ModuleStub />} />);
                    }
                  }
                  return routes;
                })}
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppStateProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
