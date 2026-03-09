import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DecisionForm } from "./decision-form";
import { createDecisionAction } from "@/actions/decisions";
import type { DecisionInsert, KeyResult, UserProfile, Workspace } from "@/types";

interface CreateDecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaces: Workspace[];
  profiles: UserProfile[];
  keyResults: KeyResult[];
}

export function CreateDecisionDialog({
  open,
  onOpenChange,
  workspaces,
  profiles,
  keyResults,
}: CreateDecisionDialogProps) {
  async function handleSubmit(payload: DecisionInsert) {
    try {
      const { decision, error } = await createDecisionAction(payload);
      if (error) throw new Error(typeof error === "string" ? error : (error as Error)?.message ?? "Failed to create decision");
      toast.success("Decision logged", { description: decision.title });
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to log decision");
      throw err;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log decision</DialogTitle>
        </DialogHeader>
        <DecisionForm
          workspaces={workspaces}
          profiles={profiles}
          keyResults={keyResults}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel="Create"
        />
      </DialogContent>
    </Dialog>
  );
}
