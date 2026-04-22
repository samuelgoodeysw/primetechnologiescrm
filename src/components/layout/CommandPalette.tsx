// Cmd+K Command palette — searches across records.
import { useNavigate } from "react-router-dom";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { useAppState } from "@/state/AppState";
import { Handshake, FileText } from "lucide-react";

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { state, clientById } = useAppState();

  function go(path: string) { navigate(path); onClose(); }

  return (
    <CommandDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <CommandInput placeholder="Search opportunities, clients, quotes…" />
      <CommandList>
        <CommandEmpty>No matching records.</CommandEmpty>

        <CommandGroup heading="Opportunities">
          {state.opportunities.slice(0, 6).map((o) => (
            <CommandItem key={o.id} onSelect={() => go(`/crm/opportunities/${o.id}`)} value={`opp ${o.name} ${clientById(o.clientId)?.name ?? ""}`}>
              <Handshake className="h-3.5 w-3.5 text-mod-crm" />
              <span className="font-medium">{o.name}</span>
              <span className="ml-auto text-[11px] text-muted-foreground">{clientById(o.clientId)?.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Clients">
          {state.clients.slice(0, 6).map((c) => (
            <CommandItem key={c.id} onSelect={() => go(`/crm/clients/${c.id}`)} value={`client ${c.name}`}>
              <Handshake className="h-3.5 w-3.5 text-mod-crm" />
              <span className="font-medium">{c.name}</span>
              <span className="ml-auto text-[11px] text-muted-foreground">{c.tier}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Quotes">
          {state.quotes.slice(0, 6).map((q) => (
            <CommandItem key={q.id} onSelect={() => go(`/sales/quotations/${q.id}`)} value={`quote ${q.id} ${clientById(q.clientId)?.name ?? ""}`}>
              <FileText className="h-3.5 w-3.5 text-mod-sales" />
              <span className="font-medium tabular-nums">{q.id}</span>
              <span className="ml-auto text-[11px] text-muted-foreground">{clientById(q.clientId)?.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Modules">
          <CommandItem onSelect={() => go("/dashboard")}>Dashboard</CommandItem>
          <CommandItem onSelect={() => go("/crm/opportunities")}>CRM › Opportunities</CommandItem>
          <CommandItem onSelect={() => go("/crm/clients")}>CRM › Clients</CommandItem>
          <CommandItem onSelect={() => go("/sales/quotations")}>Sales › Quotations</CommandItem>
          <CommandItem onSelect={() => go("/procurement/purchase-orders")}>Procurement › Purchase Orders</CommandItem>
          <CommandItem onSelect={() => go("/accounting/customer-invoices")}>Accounting › Customer Invoices</CommandItem>
          <CommandItem onSelect={() => go("/accounting/supplier-bills")}>Accounting › Supplier Bills</CommandItem>
          <CommandItem onSelect={() => go("/accounting/ar-aging")}>Accounting › AR Aging</CommandItem>
          <CommandItem onSelect={() => go("/hr/employees")}>HR › Employees</CommandItem>
          <CommandItem onSelect={() => go("/hr/utilization")}>HR › Utilization</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
