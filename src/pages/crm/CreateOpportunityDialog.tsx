// Create Opportunity dialog — fully working with reducer dispatch.
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useAppState } from "@/state/AppState";
import { OPP_STAGES_FULL } from "@/state/crm";
import type { Division, OpportunityStage } from "@/state/types";

interface Props { open: boolean; onClose: () => void; }

interface FormData {
  name: string;
  clientId: string;
  value: number;
  expectedClose: string;
  stage: OpportunityStage;
  engineerId: string;
  division: Division;
  consultant: string;
  probability: number;
  notes: string;
}

const DIVISIONS: Division[] = ["HVAC", "Electrical", "MEP", "Automation", "T&C"];

export function CreateOpportunityDialog({ open, onClose }: Props) {
  const { state, dispatch } = useAppState();
  const [keepOpen, setKeepOpen] = useState(false);

  const defaultClose = (() => {
    const d = new Date(); d.setDate(d.getDate() + 60);
    return d.toISOString().slice(0, 10);
  })();

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: "", clientId: "", value: 0, expectedClose: defaultClose,
      stage: "Lead", engineerId: state.currentUserId, division: "HVAC",
      consultant: "", probability: 20, notes: "",
    },
  });

  useEffect(() => {
    if (open) reset({
      name: "", clientId: "", value: 0, expectedClose: defaultClose,
      stage: "Lead", engineerId: state.currentUserId, division: "HVAC",
      consultant: "", probability: 20, notes: "",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function onSubmit(data: FormData) {
    if (!data.name || !data.clientId || !data.value || !data.expectedClose) {
      toast.error("Please fill required fields");
      return;
    }
    const id = `o-${Date.now()}`;
    dispatch({ type: "OPP_CREATE", payload: {
      id, name: data.name, clientId: data.clientId, consultant: data.consultant,
      value: Number(data.value), stage: data.stage, engineerId: data.engineerId,
      division: data.division, expectedClose: data.expectedClose, probability: data.probability,
      tags: [], competitors: [], createdAt: new Date().toISOString(),
    }});
    toast.success("Opportunity created", { description: "AI scored 54% conversion likelihood." });
    if (keepOpen) {
      reset();
    } else {
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-[15px]">New Opportunity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Row label="Opportunity Name *" error={errors.name?.message}>
            <Input {...register("name", { required: "Required" })} className="h-8 text-[13px]" />
          </Row>

          <Row label="Client *" error={errors.clientId?.message}>
            <Controller name="clientId" control={control} rules={{ required: "Required" }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-8 text-[13px]"><SelectValue placeholder="Select client…" /></SelectTrigger>
                  <SelectContent>
                    {state.clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
          </Row>

          <div className="grid grid-cols-2 gap-3">
            <Row label="Project Value (AED) *" error={errors.value?.message}>
              <Input type="number" {...register("value", { required: "Required", valueAsNumber: true, min: 1 })} className="h-8 text-[13px] tabular-nums" />
            </Row>
            <Row label="Expected Close *" error={errors.expectedClose?.message}>
              <Input type="date" {...register("expectedClose", { required: "Required" })} className="h-8 text-[13px]" />
            </Row>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Row label="Stage">
              <Controller name="stage" control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => field.onChange(v as OpportunityStage)}>
                    <SelectTrigger className="h-8 text-[13px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{OPP_STAGES_FULL.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
            </Row>
            <Row label="Engineer Owner">
              <Controller name="engineerId" control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-8 text-[13px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {state.employees.filter((e) => e.department === "Sales" || e.department === "Engineering").map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
            </Row>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Row label="Division">
              <Controller name="division" control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => field.onChange(v as Division)}>
                    <SelectTrigger className="h-8 text-[13px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{DIVISIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
            </Row>
            <Row label="Consultant">
              <Input {...register("consultant")} placeholder="e.g. Hyder Consulting" className="h-8 text-[13px]" />
            </Row>
          </div>

          <Row label="Probability">
            <Controller name="probability" control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3">
                  <Slider min={0} max={100} step={1} value={[field.value]} onValueChange={(v) => field.onChange(v[0])} className="flex-1" />
                  <span className="text-[12px] tabular-nums w-10 text-right font-medium">{field.value}%</span>
                </div>
              )} />
          </Row>

          <Row label="Notes">
            <Textarea {...register("notes")} rows={2} className="text-[13px] resize-none" />
          </Row>

          <DialogFooter className="pt-2 gap-2">
            <Button type="button" variant="ghost" onClick={onClose} className="h-8 text-[12px]">Cancel</Button>
            <Button type="submit" variant="ghost" onClick={() => setKeepOpen(true)} className="h-8 text-[12px]">Save & New</Button>
            <Button type="submit" onClick={() => setKeepOpen(false)} className="h-8 text-[12px]">Save & Close</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
      {error && <div className="text-[11px] text-destructive mt-0.5">{error}</div>}
    </div>
  );
}
