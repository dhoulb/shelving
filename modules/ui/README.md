# ui

The shelving UI library — a React component set that renders consistent, themeable interfaces using CSS custom properties and CSS modules.

## Concepts

The library is organised into a small set of categories that mirror what each component _is_, not where it ends up on the page:

- **`app`** — top-level `App` component that mounts the theme on `<body>`.
- **`block`** — block-level building blocks: `Heading`, `Subheading`, `Paragraph`, `Card`, `List`, `Blockquote`, `Section`, `Header`, `Aside`, `Footer`, `Image`, `Figure`, `Video`, `Address`, `Divider`, `Preformatted`, and the `Prose` aggregator that styles a slab of mixed elements.
- **`inline`** — inline-level marks: `Strong`, `Emphasis`, `Mark`, `Code`, `Keyboard`, `Sample`, `Variable`, `Small`, `Subscript`, `Superscript`, `Inserted`, `Deleted`, `Link`, `Tag`, `When`, `Ago`, `Until`.
- **`layout`** — page chassis: `Layout` (the body-pinned scroll container), `CenteredLayout`, `SidebarLayout`.
- **`page`** — top-level page wrappers: `Page`, `Head`.
- **`form`** — interactive controls: `Button`, every `*Input`, `Form`, `FormFields`, `FormStore`, `Popover`, `Progress`.
- **`notice`** — feedback surfaces: `Notice`, `Notices`, `Message`, `Status`, `StatusIcon`.
- **`dialog`** — `Dialog`, `Dialogs`, `Modal`.
- **`router`** — client routing: `Router`, `Routes`, `RouterStore`.
- **`transition`** — animation primitives: `Transition`, `FadeTransition`, `CollapseTransition`, `HorizontalTransition`, `VerticalTransition`.
- **`misc`** — `Loading`, `Catcher`, `Meta`.
- **`util`** — non-rendering helpers: `getClass`, `getModuleClass`, focus, scroll, refresh, context, event, state, meta utilities.

## Usage

### App + theme

Wrap an application in `<App>` so the theme tokens are applied to `<body>`. Tokens are CSS custom properties — `--color-text`, `--primary-text`, `--spacing-block`, `--radius-element`, etc. — defined in `App.module.css` and inherited everywhere.

```tsx
import { App, CenteredLayout, Heading, Paragraph } from "shelving/ui";

export function Root() {
  return (
    <App title="Shelving">
      <CenteredLayout>
        <Heading>Welcome</Heading>
        <Paragraph>Hello from the shelving UI library.</Paragraph>
      </CenteredLayout>
    </App>
  );
}
```

### Variants

Reusable components expose styling via boolean variants rather than `style` props. For example `<Button strong primary>` and `<Tag outline danger>`. Variants map to classes on the component's CSS module.

```tsx
import { Button, Tag } from "shelving/ui";

<Button strong primary>Save</Button>
<Tag warning>Beta</Tag>
<Tag outline error>Failed</Tag>
```

`StatusVariants` (`primary`, `secondary`, `tertiary`, `info`, `success`, `warning`, `danger`, `error`, `highlight`, `quiet`, `loading`) are re-used across components like `Button`, `Tag`, and `Notice` to keep colour roles consistent.

### Layouts

A page picks one layout. `Layout` itself owns the page scroll, locks `<html>` / `<body>` so iOS doesn't rubber-band, and applies safe-area padding. `CenteredLayout` adds a narrow centred column; `SidebarLayout` adds a fixed-width side column for navigation.

```tsx
import { SidebarLayout } from "shelving/ui";

<SidebarLayout sidebar={<Nav />}>
  <Article />
</SidebarLayout>
```

### Prose

When rendering markup-derived HTML, wrap it in `<Prose>` so every block / inline element picks up the prose-tuned variant of its styles automatically.

```tsx
import { Prose } from "shelving/ui";
import { renderMarkup, MARKUP_RULES } from "shelving/markup";

<Prose>{renderMarkup(markdown, { rules: MARKUP_RULES })}</Prose>
```

## Conventions

- Components are plain named function declarations returning `ReactElement`.
- Props are destructured in the signature with sensible defaults.
- CSS lives in a colocated `*.module.css` file; never use `style={…}`.
- CSS custom properties drive theming — set them on `<App>`, on a status-classed wrapper, or on a single component.
- Status / variant classes layer cleanly: a `<Notice status="warning">` overrides `--color-text` and `--color-surface` on its subtree without touching child components.
- New colour or sizing knobs go on `:root` in `App.module.css` first, then are referenced by component styles via `var(--token, var(--fallback))` chains.

## See also

- [notice](./notice/README.md) — status colours and notification component contract.
- [markup](../markup/README.md) — produces JSX nodes ready to drop into `<Prose>`.
