// Prime Technologies — derived selectors for "My Pipeline" and personal cockpits.
// Schema reuses existing fields: opp.engineerId, client.ownerId, activity.ownerId, activity.completedAt.
// "Mine" = engineerId === me OR client.ownerId === me. (No followers[] in schema yet.)

import type { Activity, Opportunity, Client } from "./types";

interface ScopedState {
  opportunities: Opportunity[];
  clients: Client[];
  activities: Activity[];
}

export function getMyClientIds(state: ScopedState, userId: string): string[] {
  return state.clients.filter((c) => c.ownerId === userId).map((c) => c.id);
}

export function getMyOpportunities(state: ScopedState, userId: string): Opportunity[] {
  const myClients = new Set(getMyClientIds(state, userId));
  return state.opportunities.filter(
    (o) => o.engineerId === userId || myClients.has(o.clientId),
  );
}

export function getMyOpenOpportunities(state: ScopedState, userId: string): Opportunity[] {
  return getMyOpportunities(state, userId).filter(
    (o) => o.stage !== "Won" && o.stage !== "Lost",
  );
}

const TODAY = new Date("2026-04-20T00:00:00");

export function getMyOverdueActivities(state: ScopedState, userId: string): Activity[] {
  return state.activities.filter((a) => {
    if (a.ownerId !== userId || a.completedAt) return false;
    if (!a.scheduledFor) return false;
    return new Date(a.scheduledFor) < TODAY;
  });
}

export function getMyDueTodayActivities(state: ScopedState, userId: string): Activity[] {
  const todayStr = "2026-04-20";
  return state.activities.filter(
    (a) => a.ownerId === userId && !a.completedAt && a.scheduledFor?.startsWith(todayStr),
  );
}

export function getMyOpenActivities(state: ScopedState, userId: string): Activity[] {
  return state.activities.filter((a) => a.ownerId === userId && !a.completedAt);
}

export function getMyClosingWithin(
  state: ScopedState,
  userId: string,
  days: number,
): Opportunity[] {
  const horizon = new Date(TODAY);
  horizon.setDate(horizon.getDate() + days);
  return getMyOpenOpportunities(state, userId).filter((o) => {
    const close = new Date(o.expectedClose);
    return close >= TODAY && close <= horizon;
  });
}

export function getMyClosingInRange(
  state: ScopedState,
  userId: string,
  startDays: number,
  endDays: number,
): Opportunity[] {
  const start = new Date(TODAY); start.setDate(start.getDate() + startDays);
  const end = new Date(TODAY); end.setDate(end.getDate() + endDays);
  return getMyOpenOpportunities(state, userId).filter((o) => {
    const close = new Date(o.expectedClose);
    return close >= start && close <= end;
  });
}

export function getWeightedPipeline(opportunities: Opportunity[]): number {
  return opportunities.reduce((sum, o) => sum + o.value * (o.probability / 100), 0);
}

export function sumValue(opportunities: Opportunity[]): number {
  return opportunities.reduce((s, o) => s + o.value, 0);
}

export function daysInStage(opp: Opportunity): number {
  return Math.floor((TODAY.getTime() - new Date(opp.createdAt).getTime()) / 86400000);
}

export const PIPELINE_TODAY = TODAY;
