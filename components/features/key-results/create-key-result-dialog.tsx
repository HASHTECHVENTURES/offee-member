import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KeyResultForm } from "./key-result-form";
import { createKeyResultAction } from "@/actions/key-results";
import type { KeyResultInsert, OKR, UserProfile } from "@/types";

interface CreateKeyResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  okrs: OKR[];
  profiles: UserProfile[];
  defaultOkrId?: string;
}

export function CreateKeyResultDialog({
  open,
  onOpenChange,
  okrs,
  profiles,
  defaultOkrId,
}: CreateKeyResultDialogProps) {
  async function handleSubmit(payload: KeyResultInsert) {
    try {
      const { keyResult, error } = await createKeyResultAction(payload);
      if (error) throw new Error(typeof error === "string" ? error : (error as Error)?.message ?? "Failed to create key result");
      toast.success("Key result created", { description: keyResult.title });
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create key result");
      throw err;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Key Result</DialogTitle>
        </DialogHeader>
        <KeyResultForm
          okrs={okrs}
          profiles={profiles}
          defaultValues={defaultOkrId ? { okr_id: defaultOkrId } : undefined}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel="Create Key Result"
        />
      </DialogContent>
    </Dialog>
  );
}
