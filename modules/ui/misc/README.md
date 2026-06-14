# Misc

Cross-cutting utilities and components that don't belong to a single content category. These are the primitives other components in [ui](/ui) are built from — error handling, status colouring, markdown rendering, element dispatch, and page metadata.

## Error boundaries

`Catcher` is a React class component that catches errors thrown anywhere in its subtree and replaces the failed region with a fallback UI. Pass `as` to supply a custom error renderer; it defaults to `ErrorNotice` (an inline error notice with a retry button). `PageCatcher` is a convenience wrapper that uses `ErrorPage` instead — a full-page error display inside a `<CenteredLayout>`.

`RetryButton` reads the retry callback from the nearest `Catcher` via context and renders a `<Button>`. Returns `null` when there is no parent catcher.

`ErrorNotice` and `ErrorPage` can be used standalone when you need to display a known error without a boundary.

```tsx
import { PageCatcher, Catcher, ErrorNotice } from "shelving/ui";

// Catch and display errors for a whole page
<PageCatcher>
  <MyPage />
</PageCatcher>

// Localised error boundary inside a panel
<Catcher as={ErrorNotice}>
  <LiveFeed />
</Catcher>
```

## Status and colour

`Status` is the type (`"loading" | "info" | "success" | "warning" | "danger" | "error"`) and `StatusProps` is the matching props interface — a `status="error"` prop plus boolean aliases (`<Notice error>`). Use these as the canonical vocabulary for component state everywhere in the UI.

`getStatusClass` maps a `Status` string or `StatusProps` object to a CSS module class. Compose it with other class helpers when building components that need status colouring.

`Color` (from [ui/style](../style/)) exports `ColorProps` — a `color` prop taking a raw hue (`"red"`, `"blue"`, `"purple"`, `"green"`, etc.) — and `getColorClass`. Use `status` for semantic meaning and `color` for purely decorative differentiation.

`getTypographyClass` (from `Typography`) returns a class for the `size` prop (`size="small"` … `size="xxlarge"`), the `tint` prop, and the font-family (`code`, `sans`, `serif`, …) and alignment variants. Compose into components that need typography overrides without wrapping in an extra element.

## Loading spinner

`Loading` renders an animated SVG spinner. `LOADING` is a pre-keyed `<Loading />` constant — use it directly to avoid unnecessary reconciliation overhead.

```tsx
import { LOADING } from "shelving/ui";

{busy ? LOADING : children}
```

## Status icon

`StatusIcon` picks the right icon for a given status and sizes it via the `size` prop (`"small"`, `"normal"`, `"large"`, `"xlarge"`, or `"xxlarge"`; defaults to the current line height). `info` is the default when no `status` prop is set.

```tsx
import { StatusIcon } from "shelving/ui";

<StatusIcon status="success" size="large" />
<StatusIcon status="error" />
<StatusIcon status="loading" size="small" />
```

## Tag

`Tag` is a small inline label. It accepts both `StatusProps` and `ColorProps`, plus `href` or `onClick` from `ClickableProps`, so it can be static or interactive.

```tsx
import { Tag } from "shelving/ui";

<Tag success>Active</Tag>
<Tag warning href="/billing">Overdue</Tag>
<Tag color="purple" size="small">Beta</Tag>
```

## Markup renderer

`Markup` parses a markup string and renders the resulting React nodes. It defaults to the full block + inline rule set and resolves links against the current `<Meta>` context. Wrap in `<Prose>` for longform typography.

```tsx
import { Prose, Markup } from "shelving/ui";

<Prose>
  <Markup>{article.body}</Markup>
</Prose>
```

Override any `MarkupOptions` prop directly on `<Markup>` when you need a custom rule set or a specific base URL.

## Element dispatch: `createMapper`

`createMapper` creates a `[Mapping, Mapper]` component pair backed by a private React context. `Mapper` walks a pre-walked element tree and replaces each matching element type with the registered component. `Mapping` lets a subtree override or extend the dispatch table.

This is the right tool when a component renders a tree of typed elements and callers need to swap in their own renderers for specific types.

```tsx
import { createMapper } from "shelving/ui";

const [TreeMapping, TreeMapper] = createMapper({
  "tree-element": TreeRow,
});

// In a consumer:
<TreeMapper>{walkElements(children)}</TreeMapper>

// Override one entry in a subtree:
<TreeMapping mapping={{ "tree-element": SpecialTreeRow }}>
  <TreeMapper>{walkElements(children)}</TreeMapper>
</TreeMapping>
```

## Page metadata context

`MetaContext` is the raw React context holding the current `Meta` (URL, base root, and other page-level properties). It is published by `<HTML>` and consumed internally by `<Markup>`, `<Link>`, `<Router>`, and similar components.

`requireMeta` reads the context and optionally merges in override props — use this in components that need to resolve URLs against the current page.

`requireMetaURL` resolves the current `url` against the meta `root` and returns the meta extended with the site-root-relative `path` and the extracted query `params`. Throws if `url` is unset or sits on a different origin to `root`.

## See also

- [ui/block](/ui/block) — block content components that compose with `Tag`, `Markup`, and `Prose`
- [ui/inline](/ui/inline) — inline content components
- [ui/notice](/ui/notice) — `Notice` component used inside `ErrorNotice`
- [ui/router](/ui/router) — `<Router>` and `<Navigation>` that publish into `MetaContext`
- [markup](/markup) — the markup parser and rule set underlying `<Markup>`
