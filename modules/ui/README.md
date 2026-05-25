# ui

A React component library for building Shelving apps — forms, content, layout, routing, dialogs, and the documentation-site components, all in one place.

The `ui` module exists so an app never hand-rolls the same form field, card, or router twice. Every component picks up its look from shared CSS and exposes its variations as plain boolean props. You build a screen by composing these pieces, and reach for a custom-styled element only when nothing here fits.

`ui` is consumed as source — it ships `.tsx` and `.module.css` files and needs a bundler that understands CSS Modules and JSX. It is not part of the root `shelving` package; import it from `shelving/ui`.

## How components work

A few conventions run through every component (see also the React Components section of `AGENTS.md`):

- **Variants, not CSS.** Visual options are boolean props — `<Button small primary>`, `<Section narrow>`. Each maps to a class in the component's CSS Module. You never pass `style` or raw `className`.
- **Composition.** Higher-level components — a `*Page`, a `*Card` — take their identity from library components like `Card`, `Section`, `Button`, and `Tag` rather than shipping their own styling.
- **Sentence case.** Titles, headings, and button labels capitalise only the first word.
- **Theming via CSS variables.** Colour and spacing come from CSS custom properties with fallback chains, so a theme is a small set of variable overrides.

## Styling system

The styling system has four moving parts, all defined in [style/](./style/). Most components compose them in a predictable shape; consumers theme by overriding CSS custom properties at `:root`.

### Design tokens

[`style/base.css`](./style/base.css) defines every design-token constant at `:root` — colours (`--color-*`), sizes (`--size-*`), spacing (`--space-*`), radii (`--radius-*`), strokes (`--stroke-*`), shadows (`--shadow-*`), durations (`--duration-*`). Components read these via `var(--token)`; themes override them at `:root` in their own CSS file. No class selectors needed.

`base.css` is `@import`ed at the top of every `*.module.css` in the codebase — that's how the design tokens (and the cascade layer order) reach every component automatically, regardless of bundle order.

### Cascade layers

Order, lowest to highest priority:

| Layer | What's in it |
|---|---|
| `defaults` | `:root` design tokens, body baseline typography, any low-priority opt-in defaults |
| `components` | Component-defining CSS — the bulk of the codebase: `.card`, `.button`, `.notice`, `.heading`, etc. |
| `variants` | Cross-cutting opt-in modifiers (Color, Status, Align, Spacing, Padding, Gap, Thickness, Width, Typography, Flex). Always beat components. |
| `overrides` | Top-priority structural overrides — `:first-child` / `:last-child` margin collapses, which need to beat variant-set margins |

**Unlayered rules beat all layered rules.** A consumer theme that wraps its overrides in `@layer theme { … }` or just sets tokens at `:root` is fine; one that writes raw class selectors without participating in the layer system will silently dominate variants.

### Variant utilities

[`style/`](./style/) exports a set of opt-in class utilities. Each has the same shape: a `.module.css` with the variant classes inside `@layer variants`, and a `.tsx` exporting `getXxxClass(props)` + a `XxxVariants` interface that components extend.

| Utility | Classes | Purpose |
|---|---|---|
| [`Color`](./style/Color.tsx) | `.primary`, `.secondary`, `.red`, `.blue`, `.green`, etc. | Raw colour overrides |
| [`Status`](./style/Status.tsx) | `.info`, `.success`, `.warning`, `.danger`, `.error`, `.loading` | Semantic status colours |
| [`Align`](./style/Align.tsx) | `.left`, `.center`, `.right` | `text-align` |
| [`Spacing`](./style/Spacing.tsx) | `.space-none` … `.space-xxlarge` | `margin-block` (top + bottom) |
| [`Padding`](./style/Padding.tsx) | `.padding-none` … `.padding-xxlarge` | `padding-block` (top + bottom) |
| [`Gap`](./style/Gap.tsx) | `.gap-none` … `.gap-xxlarge` | `gap` |
| [`Thickness`](./style/Thickness.tsx) | `.thickness-none` … `.thickness-xxthick` | Sets `--thickness` for components that paint borders |
| [`Width`](./style/Width.tsx) | `.narrow`, `.wide`, `.full` | `max-width` |
| [`Typography`](./style/Typography.tsx) | `.body`, `.monospace`, `.sans`, `.serif`, `.code` + `.size-xxsmall` … `.size-xxlarge` | `font-family` + `font-size` |
| [`Flex`](./style/Flex.tsx) | `.flex` + `.column`, `.left`, `.wrap`, etc. | Flex layout (composes `Gap`) |

A component using variants looks like:

```tsx
export interface CardProps extends ColorVariants, PaddingVariants, ThicknessVariants, WidthVariants /* … */ {
  status?: Status | undefined;
}

export function Card({ children, status, ...props }: CardProps): ReactElement {
  return (
    <article
      className={getClass(
        getModuleClass(CARD_CSS, "card"),
        status && getStatusClass(status),
        getColorClass(props),
        getPaddingClass(props),
        getThicknessClass(props),
        getWidthClass(props),
      )}
    >
      {children}
    </article>
  );
}
```

### Component theme hooks

Each component exposes per-component CSS custom properties for its overridable values. These are read with a `var(--component-hook, default)` fallback chain in the component's CSS, so a consumer can override the hook to retheme a single component without touching the rest of the design system.

Naming follows the file-prefix rule from [AGENTS.md](/AGENTS.md): hooks owned by a specific module file start with that file's kebab-case name. So Card owns `--card-color-bg`, `--card-padding`, `--card-radius`, `--card-thickness`. Button owns `--button-color-bg`, `--button-color-border`. And so on.

Tokens declared at `:root` (in `base.css`, or in `Color`/`Status`'s token blocks) are exempt — they're the global palette, not file-owned.

### The colour rebind pattern

Any component that paints a `background-color`, `border-color`, or `color` (Card, Button, Notice, Panel, Tag, Code, Mark, Modal, Popover, Heading, Title, Subheading, Paragraph, Table, Definitions, Blockquote, …) **rebinds the global colour tokens on its own scope** before painting:

```css
.card {
  /* Rebind: component hook wins; otherwise inherit the parent's value. */
  --color-surface: var(--card-color-bg, inherit);
  --color-border: var(--card-color-border, inherit);
  --color-text: var(--card-color-text, inherit);

  background-color: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}
```

Why: the colour tokens are *identity*. A chip inside a card needs to know the card's surface colour (to compute a contrasting bg); a button inside an error notice needs to know it's on an error surface. Variants (`.primary`, `.success`, etc.) override `--color-surface` etc. at higher cascade priority, and the colour propagates to descendants via inheritance.

The rebind pattern applies to colour tokens only: `--color-surface`, `--color-text`, `--color-border`, `--color-quiet`, `--color-link`, `--color-focus`, `--color-contrast`.

Other tokens (`--*-padding`, `--*-spacing`, `--*-radius`, `--*-font`, `--*-size`, etc.) are **not** rebound:

- `font-*` properties already inherit naturally via CSS, so just setting them is enough — children pick up the value automatically.
- `padding`, `margin`, `gap`, `border-width`, `border-radius` are non-inheriting CSS properties. Each component sets its own; children should never read a parent's padding.

This split is deliberate. The rebind is the right tool when an identity needs to propagate; for everything else, plain CSS inheritance (or no inheritance at all) is the right tool.

### How `:first-child` / `:last-child` margin overrides work

Every block-level component zeros its outer margins when it's the first or last child of its container — otherwise a Heading at the top of a Card would leave a strip of unwanted space. These rules live in `@layer overrides`, which beats every other layer including `variants`, so a `<Card space-large>` still collapses its abutting edges correctly.

Pattern:

```css
@layer components {
  .card { margin-block: var(--card-spacing, var(--spacing-paragraph)); }
}

@layer overrides {
  .card {
    &:first-child { margin-block-start: 0; }
    &:last-child { margin-block-end: 0; }
  }
}
```

### Writing a new component

A typical new block-level component looks like:

```tsx
// Address.tsx
import { type AlignVariants, getAlignClass } from "../style/Align.js";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";

export interface AddressProps extends AlignVariants, SpacingVariants, TypographyVariants, ChildProps {}

export function Address({ children, ...variants }: AddressProps) {
  return (
    <address
      className={getClass(
        getModuleClass(styles, "address"),
        getAlignClass(variants),
        getSpacingClass(variants),
        getTypographyClass(variants),
      )}
    >
      {children}
    </address>
  );
}
```

```css
/* Address.module.css */
@import "../style/base.css";

@layer components {
  .address {
    --color-text: var(--address-color, inherit);

    display: block;
    margin-inline: 0;
    margin-block: var(--address-spacing, var(--spacing-paragraph));

    color: var(--color-text);
    font-family: var(--address-font, inherit);
    font-size: var(--address-size, inherit);
    text-align: var(--address-align, left);
  }
}

@layer overrides {
  .address {
    &:first-child { margin-block-start: 0; }
    &:last-child { margin-block-end: 0; }
  }
}
```

Checklist:

- [ ] `@import "../style/base.css";` at the top.
- [ ] All rules inside `@layer components { … }`.
- [ ] All custom properties owned by this file start with the file name (`--address-*`, etc.), per [AGENTS.md](/AGENTS.md).
- [ ] Colour tokens rebound at the top of the component rule (if it paints a background, border, or text colour).
- [ ] `:first-child` / `:last-child` overrides in a separate `@layer overrides { … }` block.
- [ ] TSX extends the variant interfaces (`SpacingVariants`, `AlignVariants`, etc.) you want to expose; composes the matching `getXxxClass(props)` calls.

## Module map

### Content

| Folder | What's inside |
|---|---|
| [block](/ui/block) | Block-level content — `Card`, `Section`, `Title`, `Heading`, `Table`, `List`, `Prose`, `Figure`, `Flex` |
| [inline](/ui/inline) | Inline content — `Code`, `Strong`, `Emphasis`, `Link`, `Mark`, `Small` |
| [misc](/ui/misc) | Cross-cutting pieces — `Markup`, `Tag`, `Status`, `Loading`, `Color`, `Catcher`, `Mapper` |

### Structure

| Folder | What's inside |
|---|---|
| [app](/ui/app) | The `<App>` root component |
| [page](/ui/page) | Document-level components — `<HTML>`, `<Head>`, `<Page>` |
| [layout](/ui/layout) | Page layouts — `SidebarLayout`, `CenteredLayout` |
| [router](/ui/router) | Client-side routing — `<Navigation>`, `<Router>` |

### Interaction

| Folder | What's inside |
|---|---|
| [form](/ui/form) | Forms and inputs — `<Form>`, `<Field>`, typed inputs, `<Button>`, `FormStore` |
| [dialog](/ui/dialog) | `<Dialog>` and `<Modal>` overlays |
| [menu](/ui/menu) | `<Menu>` and `<MenuItem>` |
| [notice](/ui/notice) | Inline and global notices |
| [transition](/ui/transition) | CSS enter / leave transitions |

### Documentation site

| Folder | What's inside |
|---|---|
| [tree](/ui/tree) | `<TreeApp>` and the components that turn a tree into a site |
| [docs](/ui/docs) | Page and card renderers for directories, files, and code symbols |
| [util](/ui/util) | UI helper functions — context, meta, CSS class composition |

## Quick start

A minimal single-screen app:

```tsx
import { App, CenteredLayout, Section, Title, Paragraph } from "shelving/ui";

function HelloApp() {
  return (
    <App app="My app">
      <CenteredLayout>
        <Section narrow>
          <Title>Hello</Title>
          <Paragraph>Welcome to the app.</Paragraph>
        </Section>
      </CenteredLayout>
    </App>
  );
}
```

For a routed, multi-page app, wrap the tree in [`<Navigation>` and `<Router>`](/ui/router). For a documentation site, hand an extracted tree to [`<TreeApp>`](/ui/tree) — see the [extract](/extract) guide.

## See also

- [extract](/extract) — builds the tree that the documentation components render
- [markup](/markup) — Markdown rendering used by `<Markup>` and `<Prose>`
- [store](/store) — reactive state behind `FormStore`, `NavigationStore`, and notices
- [react](/react) — store and provider hooks used alongside these components
