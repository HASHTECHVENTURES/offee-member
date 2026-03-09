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
import type { OKR, OKRInsert, UserProfile, Workspace } from "@/types";

const STATUS_OPTIONS: { value: OKR["status"]; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const QUARTER_OPTIONS = ["Q1", "Q2", "Q3", "Q4"];
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR + i - 2);

/** Sentinel values for Select (Radix disallows empty string as SelectItem value). */
const EMPTY_OWNER = "__unassigned__";
const EMPTY_PARENT = "__none__";
const EMPTY_QUARTER_YEAR = "__any__";

interface OKRFormProps {
  workspaces: Workspace[];
  profiles: UserProfile[];
  okrs?: OKR[];
  defaultValues?: Partial<OKR>;
  onSubmit: (payload: OKRInsert) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function OKRForm({
  workspaces,
  profiles,
  okrs = [],
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Create OKR",
}: OKRFormProps) {
  const [isPending, startTransition] = useTransition();
  const [workspaceId, setWorkspaceId] = useState(defaultValues?.workspace_id ?? workspaces[0]?.id ?? "");
  const [ownerId, setOwnerId] = useState(defaultValues?.owner_id ?? "");
  const [quarter, setQuarter] = useState(defaultValues?.quarter ?? "");
  const [year, setYear] = useState(defaultValues?.year?.toString() ?? "");
  const [status, setStatus] = useState<OKR["status"]>(defaultValues?.status ?? "draft");
  const [parentOkrId, setParentOkrId] = useState(defaultValues?.parent_okr_id ?? "");

  const parentOkrOptions = okrs.filter(
    (o) => o.id !== defaultValues?.id && o.workspace_id === workspaceId
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.querySelector('[name="title"]') as HTMLInputElement)?.value?.trim();
    const description = (form.querySelector('[name="description"]') as HTMLTextAreaElement)?.value?.trim() || null;
    if (!workspaceId || !title) return;

    startTransition(() => {
      void (async () => {
        await onSubmit({
          workspace_id: workspaceId,
          owner_id: ownerId || null,
          title,
          description,
          quarter: quarter || null,
          year: year ? Number(year) : null,
          quarter_id: defaultValues?.quarter_id ?? null,
          status,
          progress_percent: defaultValues?.progress_percent ?? 0,
          parent_okr_id: parentOkrId || null,
        });
        onCancel?.();
      })();
    });
  }

  const singleWorkspace = workspaces.length <= 1;
  const workspaceName = workspaces.find((w) => w.id === workspaceId)?.name ?? "Workspace";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {singleWorkspace ? (
        <div className="space-y-2">
          <Label>Workspace</Label>
          <p className="text-sm text-muted-foreground py-2">{workspaceName}</p>
          <input type="hidden" name="workspace_id" value={workspaceId} />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="workspace_id">Workspace</Label>
          <Select
            name="workspace_id"
            required
            value={workspaceId}
            onValueChange={setWorkspaceId}
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
        <Label htmlFor="title">Objective</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Increase revenue by 20%"
          required
          defaultValue={defaultValues?.title}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <textarea
          id="description"
          name="description"
          placeholder="Brief context..."
          rows={2}
          defaultValue={defaultValues?.description ?? ""}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="owner_id">Owner</Label>
        <Select
          name="owner_id"
          value={ownerId || EMPTY_OWNER}
          onValueChange={(v) => setOwnerId(v === EMPTY_OWNER ? "" : v)}
        >
          <SelectTrigger id="owner_id" className="w-full">
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

      {parentOkrOptions.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="parent_okr_id">
            Parent OKR{" "}
            <span className="text-xs font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Select
            name="parent_okr_id"
            value={parentOkrId || EMPTY_PARENT}
            onValueChange={(v) => setParentOkrId(v === EMPTY_PARENT ? "" : v)}
          >
            <SelectTrigger id="parent_okr_id" className="w-full">
              <SelectValue placeholder="None (top-level)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_PARENT}>None (top-level)</SelectItem>
              {parentOkrOptions.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">
            Link to a company/team OKR to show hierarchy.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quarter">Quarter</Label>
          <Select
            name="quarter"
            value={quarter || EMPTY_QUARTER_YEAR}
            onValueChange={(v) => setQuarter(v === EMPTY_QUARTER_YEAR ? "" : v)}
          >
            <SelectTrigger id="quarter" className="w-full">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_QUARTER_YEAR}>Any</SelectItem>
              {QUARTER_OPTIONS.map((q) => (
                <SelectItem key={q} value={q}>
                  {q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Select
            name="year"
            value={year || EMPTY_QUARTER_YEAR}
            onValueChange={(v) => setYear(v === EMPTY_QUARTER_YEAR ? "" : v)}
          >
            <SelectTrigger id="year" className="w-full">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_QUARTER_YEAR}>Any</SelectItem>
              {YEAR_OPTIONS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select name="status" value={status} onValueChange={(v) => setStatus(v as OKR["status"])}>
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
