/**
 * Key Result progress status from actual vs target.
 * Status: >=100% green, 80-99% amber, <80% red.
 */
export type KRProgressStatus = "green" | "amber" | "red" | "black";

export interface KRProgressResult {
  status: KRProgressStatus;
  progressPercent: number;
  hasNumbers: boolean;
}

export function getKeyResultProgressStatus(
  currentValue: number | null | undefined,
  targetValue: number | null | undefined
): KRProgressResult {
  const current = currentValue != null && !Number.isNaN(Number(currentValue))
    ? Number(currentValue)
    : null;
  const target = targetValue != null && !Number.isNaN(Number(targetValue))
    ? Number(targetValue)
    : null;

  if (target === null || target === 0) {
    return {
      status: "black",
      progressPercent: 0,
      hasNumbers: false,
    };
  }

  const actual = current ?? 0;
  const progressPercent = (actual / target) * 100;
  const hasNumbers = true;

  if (progressPercent >= 100) {
    return { status: "green", progressPercent, hasNumbers };
  }
  if (progressPercent >= 80) {
    return { status: "amber", progressPercent, hasNumbers };
  }
  return { status: "red", progressPercent, hasNumbers };
}
