import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OKRForm } from "./okr-form";
import { createOkrAction } from "@/actions/okrs";
import type { OKRInsert, UserProfile, Workspace } from "@/types";

interface CreateOKRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaces: Workspace[];
  profiles: UserProfile[];
}

export function CreateOKRDialog({
  open,
  onOpenChange,
  workspaces,
  profiles,
}: CreateOKRDialogProps) {
  async function handleSubmit(payload: OKRInsert) {
    try {
      const { okr, error } = await createOkrAction(payload);
      if (error) throw new Error(typeof error === "string" ? error : (error as Error)?.message ?? "Failed to create OKR");
      toast.success("OKR created", { description: okr.title });
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create OKR");
      throw err;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New OKR</DialogTitle>
        </DialogHeader>
        <OKRForm
          workspaces={workspaces}
          profiles={profiles}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel="Create OKR"
        />
      </DialogContent>
    </Dialog>
  );
}
