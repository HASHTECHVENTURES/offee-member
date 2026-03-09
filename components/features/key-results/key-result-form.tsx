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
import type { KeyResult, KeyResultInsert, MetricType, OKR, UserProfile } from "@/types";

const METRIC_TYPES: { value: MetricType; label: string }[] = [
  { value: "number", label: "Number" },
  { value: "percentage", label: "Percentage" },
  { value: "currency", label: "Currency" },
  { value: "count", label: "Count" },
  { value: "custom", label: "Custom" },
];

const STATUS_OPTIONS: { value: KeyResult["status"]; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "on_track", label: "On track" },
  { value: "at_risk", label: "At risk" },
  { value: "behind", label: "Behind" },
  { value: "completed", label: "Completed" },
];

interface KeyResultFormProps {
  okrs: OKR[];
  profiles: UserProfile[];
  defaultValues?: Partial<KeyResult>;
  onSubmit: (payload: KeyResultInsert) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function KeyResultForm({
  okrs,
  profiles,
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Create Key Result",
}: KeyResultFormProps) {
  const [isPending, startTransition] = useTransition();
  const [okrId, setOkrId] = useState(defaultValues?.okr_id ?? okrs[0]?.id ?? "");
  const [driId, setDriId] = useState(defaultValues?.dri_id ?? "");
  const [metricType, setMetricType] = useState<MetricType | "">(
    defaultValues?.metric_type ?? ""
  );
  const [status, setStatus] = useState<KeyResult["status"]>(
    defaultValues?.status ?? "not_started"
  );
  const [confidence, setConfidence] = useState<string>(
    defaultValues?.confidence?.toString() ?? ""
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.querySelector('[name="title"]') as HTMLInputElement)?.value?.trim();
    const targetRaw = (form.querySelector('[name="target_value"]') as HTMLInputElement)?.value;
    const currentRaw = (form.querySelector('[name="current_value"]') as HTMLInputElement)?.value;
    const unit = (form.querySelector('[name="unit"]') as HTMLInputElement)?.value?.trim() || null;

    const target_value = targetRaw ? Number(targetRaw) : 0;
    const current_value = currentRaw ? Number(currentRaw) : 0;

    if (!okrId || !title || !driId) return;

    startTransition(() => {
      void (async () => {
        await onSubmit({
          okr_id: okrId,
          title,
          target_value,
          current_value,
          unit,
          metric_type: metricType || null,
          dri_id: driId || null,
          status,
          confidence: confidence ? Number(confidence) : null,
        });
        onCancel?.();
      })();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="okr_id">OKR</Label>
        <Select
          name="okr_id"
          required
          value={okrId}
          onValueChange={setOkrId}
          disabled={!!defaultValues?.okr_id}
        >
          <SelectTrigger id="okr_id" className="w-full">
            <SelectValue placeholder="Select OKR" />
          </SelectTrigger>
          <SelectContent>
            {okrs.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Name</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Reach 100 paying customers"
          required
          defaultValue={defaultValues?.title}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="target_value">Target</Label>
          <Input
            id="target_value"
            name="target_value"
            type="number"
            step="any"
            required
            defaultValue={defaultValues?.target_value ?? ""}
            placeholder="0"
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="current_value">Actual</Label>
          <Input
            id="current_value"
            name="current_value"
            type="number"
            step="any"
            defaultValue={defaultValues?.current_value ?? 0}
            placeholder="0"
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Unit (optional)</Label>
        <Input
          id="unit"
          name="unit"
          placeholder="e.g. %, $, users"
          defaultValue={defaultValues?.unit ?? ""}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="metric_type">Metric type</Label>
        <Select
          name="metric_type"
          value={metricType}
          onValueChange={(v) => setMetricType(v as MetricType)}
        >
          <SelectTrigger id="metric_type" className="w-full">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {METRIC_TYPES.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dri_id">
          DRI{" "}
          <span className="text-xs font-normal text-muted-foreground">
            Directly Responsible Individual
          </span>
          <span className="text-destructive ml-0.5">*</span>
        </Label>
        <Select name="dri_id" value={driId} onValueChange={setDriId} required>
          <SelectTrigger id="dri_id" className="w-full">
            <SelectValue placeholder="Select DRI (required)" />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.full_name || p.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[10px] text-muted-foreground">
          Every Key Result must have one DRI. No &quot;we&quot;.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" value={status} onValueChange={(v) => setStatus(v as KeyResult["status"])}>
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
        <div className="space-y-2">
          <Label htmlFor="confidence">
            Confidence{" "}
            <span className="text-xs font-normal text-muted-foreground">(1-10)</span>
          </Label>
          <Select
            name="confidence"
            value={confidence}
            onValueChange={setConfidence}
          >
            <SelectTrigger id="confidence" className="w-full">
              <SelectValue placeholder="Rate confidence" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <SelectItem key={n} value={n.toString()}>
                  {n} {n <= 3 ? "- Low" : n <= 6 ? "- Medium" : n <= 8 ? "- High" : "- Very High"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">
            How confident are you that you'll hit this target?
          </p>
        </div>
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
