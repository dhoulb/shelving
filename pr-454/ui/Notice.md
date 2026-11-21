# Notice

- Kind: component
- Import: `import { Notice } from "shelving/ui";`

Block-level status callout with an icon and message, used to highlight feedback.

- Shows a `<StatusIcon>` for the current `status` by default; pass `icon` to override, or `false`/`null` to hide it.
- Sets an ARIA `role` of `"alert"` for error/danger statuses, otherwise `"status"`.

A block-level status callout with an icon and message, used to highlight feedback. Rendered as an `<aside>` with a status icon and a message, mapping its `status` to the appropriate colour and ARIA role.

**Things to know:**

- Shows a `<StatusIcon>` for the current `status` by default; pass `icon` to override, or `false` / `null` to hide it.
- Sets an ARIA `role` of `"alert"` for `error` / `danger` statuses, otherwise `"status"`.
- `LOADING_NOTICE` is a shared `<Notice status="loading" />` element ready to drop into `Suspense` fallbacks.

## Usage

### Every status

```tsx live
import { Notice } from "shelving/ui";

<Notice status="info">Your trial ends in 3 days.</Notice>
<Notice status="success">Your changes have been saved.</Notice>
<Notice status="warning">Your card expires next month.</Notice>
<Notice status="danger">This deletes the project for everyone.</Notice>
<Notice status="error">Something went wrong.</Notice>
<Notice status="loading" />
```

### A custom icon, or no icon

```tsx live
import { AddIcon } from "shelving/icon/AddIcon";
import { Notice } from "shelving/ui";

<Notice status="info" icon={<AddIcon />}>Three new projects.</Notice>
<Notice status="info" icon={false}>No icon.</Notice>
```

### A loading fallback

```tsx live
import { Suspense, use } from "react";
import { LOADING_NOTICE, Notice } from "shelving/ui";

// Loads for three seconds, then shows the notice.
const MESSAGE = new Promise<string>(resolve => setTimeout(() => resolve("Loaded."), 3000));

function SlowPanel() {
	return <Notice status="success">{use(MESSAGE)}</Notice>;
}

<Suspense fallback={LOADING_NOTICE}>
	<SlowPanel />
</Suspense>;
```

## Styling

`Notice` paints from the [tint ladder](/ui/TINT_CLASS); override these hooks at `:root` (or any ancestor scope) to retheme. Its `status` (or a `color=` / `status=` on an ancestor scope) sets the tint that the surface, border, and text all derive from; reach for a per-property hook for a single change.

Override these hooks at `:root`. The tint hooks (`--notice-border`, `--notice-background`, `--notice-color`) are declared again in every tint scope, so override them at `:root, .tint`.

| Variable              | Styles                                         | Default                      |
| --------------------- | ---------------------------------------------- | ---------------------------- |
| `--notice-background` | Surface fill                                   | `var(--tint-90)`             |
| `--notice-color`      | Text colour                                    | `var(--tint-50)`             |
| `--notice-border`     | Border colour (width is `--notice-stroke`)     | `var(--tint-80)`             |
| `--notice-stroke`     | Border thickness                               | `var(--stroke-normal)` (2px) |
| `--notice-shadow`     | Drop shadow, for example `var(--shadow-small)` | `none`                       |
| `--notice-radius`     | Corner radius                                  | `var(--radius-xsmall)`       |
| `--notice-padding`    | Inner top and bottom padding (one length)      | `var(--space-small)` (12px)  |
| `--notice-indent`     | Inner left and right padding (one length)      | `var(--space-small)` (12px)  |
| `--notice-space`      | Outer block margin (top + bottom)              | `var(--space-paragraph)`     |
| `--notice-size`       | Font size                                      | `var(--size-normal)`         |
| `--notice-weight`     | Font weight                                    | `var(--weight-strong)`       |

**Global tokens it reads** — the tint ladder `--tint-50` / `--tint-80` / `--tint-90`, plus `--space-paragraph`, `--space-small`, `--radius-xsmall`, `--stroke-normal`, `--size-normal`, and `--weight-strong`.


## Signatures

```ts
Notice({
	children, //
	icon,
	className,
	ref,
	...props
}: NoticeProps): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `NoticeProps` |  |
| `.icon` | `ReactElement \| false \| undefined` | Icon for the notice (or `null` or `false` to hide the icon, defaults to `<StatusIcon>`). Optional. |
| `.ref` | `Ref<HTMLElement> \| undefined` | Ref to the notice's `<aside>` element. Optional. |
