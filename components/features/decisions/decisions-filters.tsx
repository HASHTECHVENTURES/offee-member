"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Decision } from "@/types";
import type { DecisionRow } from "./decisions-table";
import { getDecisionEscalation } from "@/utils/decision-escalation";

type StatusFilter = Decision["status"] | "all";
type EscalationFilter = "all" | "critical" | "escalated";

interface DecisionsFiltersProps {
  statusFilter: StatusFilter;
  escalationFilter: EscalationFilter;
  onStatusChange: (v: StatusFilter) => void;
  onEscalationChange: (v: EscalationFilter) => void;
}

export function DecisionsFilters({
  statusFilter,
  escalationFilter,
  onStatusChange,
  onEscalationChange,
}: DecisionsFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Status</Label>
        <Select
          value={statusFilter}
          onValueChange={(v) => onStatusChange(v as StatusFilter)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="decided">Decided</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Escalation</Label>
        <Select
          value={escalationFilter}
          onValueChange={(v) => onEscalationChange(v as EscalationFilter)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function filterDecisions(
  decisions: DecisionRow[],
  statusFilter: StatusFilter,
  escalationFilter: EscalationFilter
): DecisionRow[] {
  let out = decisions;

  if (statusFilter !== "all") {
    out = out.filter((d) => d.status === statusFilter);
  }

  if (escalationFilter !== "all") {
    out = out.filter((d) => {
      const esc = getDecisionEscalation(d.status, d.due_date);
      return esc.level === escalationFilter;
    });
  }

  return out;
}
