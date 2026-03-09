"use client";

import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KeyResultForm } from "./key-result-form";
import { updateKeyResultAction } from "@/actions/key-results";
import type { KeyResult, KeyResultInsert, OKR, UserProfile } from "@/types";

interface EditKeyResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyResult: KeyResult;
  okrs: OKR[];
  profiles: UserProfile[];
}

export function EditKeyResultDialog({
  open,
  onOpenChange,
  keyResult,
  okrs,
  profiles,
}: EditKeyResultDialogProps) {
  async function handleSubmit(payload: KeyResultInsert) {
    try {
      await updateKeyResultAction(keyResult.id, payload);
      toast.success("Key result updated");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update key result");
      throw err;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Key Result</DialogTitle>
        </DialogHeader>
        <KeyResultForm
          okrs={okrs}
          profiles={profiles}
          defaultValues={keyResult}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel="Save changes"
        />
      </DialogContent>
    </Dialog>
  );
}
