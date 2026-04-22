// New quote — auto-generates next quote # and pre-fills from ?opportunity= context.
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAppState } from "@/state/AppState";

export default function NewQuotation() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { state, dispatch, opportunityById } = useAppState();
  const oppId = params.get("opportunity");

  useEffect(() => {
    // Generate next ID
    const nums = state.quotes.map((q) => parseInt(q.id.replace("Q-", "")) || 0);
    const next = Math.max(...nums, 24812) + 1;
    const id = `Q-${next}`;
    const opp = oppId ? opportunityById(oppId) : undefined;
    const today = new Date().toISOString().slice(0, 10);
    const validUntil = (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().slice(0, 10); })();

    dispatch({ type: "QUOTE_CREATE", payload: {
      id, clientId: opp?.clientId ?? state.clients[0].id,
      opportunityId: opp?.id, consultant: opp?.consultant ?? "",
      engineerId: opp?.engineerId ?? state.currentUserId,
      division: opp?.division ?? "HVAC",
      issueDate: today, validUntil, paymentTerms: "60 days net",
      deliveryTerms: "DDP Site - Dubai", leadTimeWeeks: 10,
      status: "Draft", lines: [],
      reference: "", warranty: "3 years standard", tags: [],
    }});
    toast.success(`Quote ${id} created`, { description: "Add line items to compute margin." });
    navigate(`/sales/quotations/${id}`, { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className="p-8 text-muted-foreground">Creating quote…</div>;
}
