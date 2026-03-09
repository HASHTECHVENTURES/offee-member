/**
 * Weekly KR Scoreboard: catch-up calculation logic
 * Gap = target − actual
 * CatchUp = gap / remaining weeks
 * NextTarget = weekly target + catchUp
 */

export type RAGStatus = "green" | "amber" | "red" | "black";

export interface WeeklyKRRow {
  krId: string;
  krTitle: string;
  okrId: string;
  okrTitle: string;
  unit: string | null;
  /** Total target for the period */
  target: number;
  /** Actual progress so far */
  actual: number;
  /** Weeks in the period (e.g. quarter) */
  totalWeeks: number;
  /** Weeks elapsed in period */
  weeksElapsed: number;
  /** Weeks remaining (min 1) */
  remainingWeeks: number;
}

export interface WeeklyKRCalculated {
  /** Target per week */
  weeklyTarget: number;
  /** Current actual (cumulative) */
  actualProgress: number;
  /** target - actual */
  gap: number;
  /** gap / remainingWeeks */
  catchUp: number;
  /** weeklyTarget + catchUp */
  nextTarget: number;
  /** RAG status for display */
  ragStatus: RAGStatus;
}

const DEFAULT_WEEKS_IN_PERIOD = 13;

/**
 * Get start of quarter (UTC date string YYYY-MM-DD)
 */
function getQuarterStart(year: number, quarter: string): Date {
  const month =
    quarter === "Q1"
      ? 0
      : quarter === "Q2"
        ? 3
        : quarter === "Q3"
          ? 6
          : 9;
  return new Date(Date.UTC(year, month, 1));
}

/**
 * Get end of quarter (last day of quarter)
 */
function getQuarterEnd(year: number, quarter: string): Date {
  const month =
    quarter === "Q1"
      ? 2
      : quarter === "Q2"
        ? 5
        : quarter === "Q3"
          ? 8
          : 11;
  return new Date(Date.UTC(year, month + 1, 0));
}

/**
 * Weeks between two dates (fractional)
 */
function weeksBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return ms / (7 * 24 * 60 * 60 * 1000);
}

/**
 * Total weeks in quarter (for given year/quarter)
 */
export function getTotalWeeksInPeriod(
  year: number | null,
  quarter: string | null
): number {
  if (year == null || !quarter) return DEFAULT_WEEKS_IN_PERIOD;
  const start = getQuarterStart(year, quarter);
  const end = getQuarterEnd(year, quarter);
  return Math.max(1, Math.ceil(weeksBetween(start, end)));
}

/**
 * Weeks elapsed from period start to today (capped at totalWeeks)
 */
export function getWeeksElapsed(
  year: number | null,
  quarter: string | null,
  totalWeeks: number
): number {
  if (year == null || !quarter) {
    return Math.min(totalWeeks - 1, 6);
  }
  const start = getQuarterStart(year, quarter);
  const now = new Date();
  const elapsed = weeksBetween(start, now);
  return Math.max(0, Math.min(elapsed, totalWeeks - 0.01));
}

/**
 * Remaining weeks (min 1 so we don't divide by zero)
 */
export function getRemainingWeeks(
  totalWeeks: number,
  weeksElapsed: number
): number {
  return Math.max(1, Math.ceil(totalWeeks - weeksElapsed));
}

/**
 * Catch-up math for one row
 */
export function calculateWeeklyCatchUp(row: WeeklyKRRow): WeeklyKRCalculated {
  const { target, actual, totalWeeks, remainingWeeks } = row;
  const weeklyTarget = totalWeeks > 0 ? target / totalWeeks : 0;
  const gap = target - actual;
  const catchUp = remainingWeeks > 0 ? gap / remainingWeeks : gap;
  const nextTarget = weeklyTarget + catchUp;

  const expectedByNow = weeklyTarget * row.weeksElapsed;
  let ragStatus: RAGStatus = "black";
  if (target > 0 && !Number.isNaN(actual)) {
    if (actual >= target) {
      ragStatus = "green";
    } else if (expectedByNow <= 0) {
      ragStatus = actual >= 0 ? "green" : "red";
    } else {
      const ratio = actual / expectedByNow;
      if (ratio >= 1) ragStatus = "green";
      else if (ratio >= 0.8) ragStatus = "amber";
      else ragStatus = "red";
    }
  }

  return {
    weeklyTarget,
    actualProgress: actual,
    gap,
    catchUp,
    nextTarget,
    ragStatus,
  };
}
