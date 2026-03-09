"use client";

import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DecisionForm } from "./decision-form";
import { updateDecisionAction } from "@/actions/decisions";
import type { Decision, DecisionInsert, KeyResult, UserProfile, Workspace } from "@/types";

interface EditDecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decision: Decision;
  workspaces: Workspace[];
  profiles: UserProfile[];
  keyResults: KeyResult[];
}

export function EditDecisionDialog({
  open,
  onOpenChange,
  decision,
  workspaces,
  profiles,
  keyResults,
}: EditDecisionDialogProps) {
  async function handleSubmit(payload: DecisionInsert) {
    try {
      await updateDecisionAction(decision.id, payload);
      toast.success("Decision updated");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update decision");
      throw err;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit decision</DialogTitle>
        </DialogHeader>
        <DecisionForm
          workspaces={workspaces}
          profiles={profiles}
          keyResults={keyResults}
          defaultValues={decision}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel="Save"
        />
      </DialogContent>
    </Dialog>
  );
}
