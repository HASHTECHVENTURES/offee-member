"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Decision, DecisionInsert, KeyResult, UserProfile, Workspace } from "@/types";

const STATUS_OPTIONS: { value: Decision["status"]; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "decided", label: "Decided" },
  { value: "archived", label: "Archived" },
];

/** Sentinel values for Select (Radix disallows empty string as SelectItem value). */
const EMPTY_OWNER = "__unassigned__";
const EMPTY_KR = "__none__";

const TEXTAREA_CLASS =
  "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

interface DecisionFormProps {
  workspaces: Workspace[];
  profiles: UserProfile[];
  keyResults: KeyResult[];
  defaultValues?: Partial<Decision>;
  onSubmit: (payload: DecisionInsert) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function DecisionForm({
  workspaces,
  profiles,
  keyResults,
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Create decision",
}: DecisionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [workspaceId, setWorkspaceId] = useState(
    defaultValues?.workspace_id ?? workspaces[0]?.id ?? ""
  );
  const [ownerId, setOwnerId] = useState(defaultValues?.decided_by ?? "");
  const [krId, setKrId] = useState(defaultValues?.kr_impacted_id ?? "");
  const [status, setStatus] = useState<Decision["status"]>(
    defaultValues?.status ?? "open"
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.querySelector('[name="title"]') as HTMLInputElement)?.value?.trim();
    const context = (form.querySelector('[name="context"]') as HTMLTextAreaElement)?.value?.trim() || null;
    const outcome = (form.querySelector('[name="outcome"]') as HTMLTextAreaElement)?.value?.trim() || null;
    const dueDate = (form.querySelector('[name="due_date"]') as HTMLInputElement)?.value || null;
    const evidenceLink = (form.querySelector('[name="evidence_link"]') as HTMLInputElement)?.value?.trim() || null;

    if (!workspaceId || !title) return;

    const decidedAt =
      status === "decided"
        ? defaultValues?.decided_at ?? new Date().toISOString()
        : defaultValues?.decided_at ?? null;

    startTransition(() => {
      void (async () => {
        await onSubmit({
          workspace_id: workspaceId,
          title,
          context,
          outcome,
          decided_by: ownerId || null,
          due_date: dueDate || null,
          kr_impacted_id: krId || null,
          evidence_link: evidenceLink || null,
          status,
          decided_at: decidedAt,
        });
        onCancel?.();
      })();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {workspaces.length > 1 && (
        <div className="space-y-2">
          <Label htmlFor="workspace_id">Workspace</Label>
          <Select
            value={workspaceId}
            onValueChange={setWorkspaceId}
            required
            disabled={!!defaultValues?.workspace_id}
          >
            <SelectTrigger id="workspace_id" className="w-full">
              <SelectValue placeholder="Select workspace" />
            </SelectTrigger>
            <SelectContent>
              {workspaces.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Decision</Label>
        <Input
          id="title"
          name="title"
          placeholder="What was decided or needs to be decided?"
          required
          defaultValue={defaultValues?.title}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="context">Context</Label>
        <textarea
          id="context"
          name="context"
          rows={2}
          placeholder="Background, rationale, or why this decision matters..."
          defaultValue={defaultValues?.context ?? ""}
          className={TEXTAREA_CLASS}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="outcome">
          Outcome{" "}
          <span className="text-xs text-muted-foreground font-normal">
            (fill in after decision is made)
          </span>
        </Label>
        <textarea
          id="outcome"
          name="outcome"
          rows={2}
          placeholder="What was the result or action taken?"
          defaultValue={defaultValues?.outcome ?? ""}
          className={TEXTAREA_CLASS}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="decided_by">Owner</Label>
        <Select
          value={ownerId || EMPTY_OWNER}
          onValueChange={(v) => setOwnerId(v === EMPTY_OWNER ? "" : v)}
        >
          <SelectTrigger id="decided_by" className="w-full">
            <SelectValue placeholder="Unassigned" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={EMPTY_OWNER}>Unassigned</SelectItem>
            {profiles.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.full_name || p.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="kr_impacted_id">KR impacted</Label>
        <Select
          value={krId || EMPTY_KR}
          onValueChange={(v) => setKrId(v === EMPTY_KR ? "" : v)}
        >
          <SelectTrigger id="kr_impacted_id" className="w-full">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={EMPTY_KR}>None</SelectItem>
            {keyResults.map((kr) => (
              <SelectItem key={kr.id} value={kr.id}>
                {kr.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="due_date">Due date</Label>
        <Input
          id="due_date"
          name="due_date"
          type="date"
          defaultValue={defaultValues?.due_date ?? ""}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="evidence_link">Evidence link</Label>
        <Input
          id="evidence_link"
          name="evidence_link"
          type="url"
          placeholder="https://..."
          defaultValue={defaultValues?.evidence_link ?? ""}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as Decision["status"])}>
          <SelectTrigger id="status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
