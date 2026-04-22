// CRM Opportunity stage helpers — display tone + ordered stages.
import type { OpportunityStage } from "@/state/types";
import type { Tone } from "@/components/odoo/Tag";

export const OPP_STAGES: OpportunityStage[] = [
  "Lead", "Qualified", "BOQ Received", "Quoted", "Submitted", "Shortlisted", "Won",
];
export const OPP_STAGES_FULL: OpportunityStage[] = [...OPP_STAGES, "Lost"];

export function stageTone(s: OpportunityStage): Tone {
  switch (s) {
    case "Lead": return "grey";
    case "Qualified": return "blue";
    case "BOQ Received": return "purple";
    case "Quoted": return "navy";
    case "Submitted": return "amber";
    case "Shortlisted": return "gold";
    case "Won": return "green";
    case "Lost": return "red";
  }
}
