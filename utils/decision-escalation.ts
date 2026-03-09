/**
 * Decision log escalation logic:
 * - Overdue > 14 days → escalated
 * - Overdue > 7 days → critical
 * - Otherwise → on_track (or n/a if not open / no due date)
 */

export type EscalationLevel = "on_track" | "late" | "critical" | "escalated" | "na";

export interface DecisionEscalation {
  level: EscalationLevel;
  daysOverdue: number;
  isOverdue: boolean;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDay(isoDate: string): number {
  return new Date(isoDate.split("T")[0]).getTime();
}

/**
 * Compute escalation for an open decision with a due date.
 * If status is not "open" or due_date is null, returns "na".
 */
export function getDecisionEscalation(
  status: string,
  dueDate: string | null
): DecisionEscalation {
  if (status !== "open" || !dueDate) {
    return { level: "na", daysOverdue: 0, isOverdue: false };
  }

  const due = startOfDay(dueDate);
  const today = startOfDay(new Date().toISOString());
  const daysOverdue = Math.floor((today - due) / MS_PER_DAY);

  if (daysOverdue <= 0) {
    return { level: "on_track", daysOverdue: 0, isOverdue: false };
  }
  if (daysOverdue > 14) {
    return { level: "escalated", daysOverdue, isOverdue: true };
  }
  if (daysOverdue > 7) {
    return { level: "critical", daysOverdue, isOverdue: true };
  }
  return { level: "late", daysOverdue, isOverdue: true };
}
