# Execution OS — Design System

Modern dashboard UI (Linear / Stripe / Vercel style) built with **Tailwind**, **shadcn/ui**, and **framer-motion**.

## Layout

- **Left**: Sidebar (240px) — `Sidebar` + `SidebarNavigation`
- **Center**: Main content — scrollable, with top search/command bar
- **Right**: AI Insights panel (320px) — `RightInsightsPanel` (optional, toggle via `AppShell`)

## Color rules

| Intent    | Token        | Usage                |
|----------|--------------|----------------------|
| Success  | `success`    | On track, completed  |
| Warning  | `warning`    | At risk, attention   |
| Critical | `critical`  | Behind, errors        |
| Neutral  | `neutral`    | Inactive, default    |

Use Tailwind classes: `text-success`, `bg-warning`, `border-critical`, `text-neutral-foreground`, etc.

## Reusable components

All live in `@/components/design-system` (see `components/design-system/index.ts`).

| Component | Purpose |
|-----------|--------|
| **MetricCard** | Label + value + optional trend/subtitle/icon |
| **ProgressBar** | Bar with variants: default, success, warning, critical |
| **ExecutionStatusBadge** | Status pill: on_track, at_risk, behind, completed, not_started |
| **AlertCard** | Alert block with variant (success/warning/critical/neutral), title, description, action |
| **TableView** | Generic table with columns + data + keyExtractor |
| **CommandPalette** | ⌘K search/navigation (use with `open` / `onOpenChange`) |
| **SidebarNavigation** | Nav links with active state (used inside Sidebar) |
| **RightInsightsPanel** | Right column for AI insights (optional content) |
| **PageHeader** | Title + description + optional actions |
| **StatGrid** | Grid of MetricCards with stagger animation |

## Motion

- **framer-motion** used for: card fade-in, progress bar fill, status badge scale, list stagger, sidebar active indicator.
- Keep animations short (0.15–0.3s) and subtle.

## Usage

```tsx
import {
  PageHeader,
  StatGrid,
  ProgressBar,
  ExecutionStatusBadge,
  AlertCard,
  TableView,
  RightInsightsPanel,
} from "@/components/design-system";
```
