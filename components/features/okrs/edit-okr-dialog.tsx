"use client";

import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OKRForm } from "./okr-form";
import { updateOkrAction } from "@/actions/okrs";
import type { OKR, OKRInsert, UserProfile, Workspace } from "@/types";

interface EditOKRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  okr: OKR;
  workspaces: Workspace[];
  profiles: UserProfile[];
}

export function EditOKRDialog({
  open,
  onOpenChange,
  okr,
  workspaces,
  profiles,
}: EditOKRDialogProps) {
  async function handleSubmit(payload: OKRInsert) {
    try {
      await updateOkrAction(okr.id, payload);
      toast.success("OKR updated");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update OKR");
      throw err;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit OKR</DialogTitle>
        </DialogHeader>
        <OKRForm
          workspaces={workspaces}
          profiles={profiles}
          defaultValues={okr}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel="Save changes"
        />
      </DialogContent>
    </Dialog>
  );
}
