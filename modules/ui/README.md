# ui

A React component library for building Shelving apps — forms, content, layout, routing, dialogs, and the documentation-site components, all in one place.

The `ui` module exists so an app never hand-rolls the same form field, card, or router twice. Every component picks up its look from shared CSS and exposes its variations as props. You build a screen by composing these pieces, and reach for a custom-styled element only when nothing here fits.

`ui` is consumed as source — it ships `.tsx` and `.module.css` files and needs a bundler that understands CSS Modules and JSX. It is not part of the root `shelving` package; import it from `shelving/ui`.

## How components work

A few conventions run through every component (see also the React Components section of `AGENTS.md`):

- **Styling props, not CSS.** Visual options are props on the component — enumerated props for the scales (`color="red"`, `size="large"`, `space="none"`) and boolean props for on/off variants (`<Button strong>`, `<Section narrow>`, `<Flex wrap>`). Each maps to a class in a CSS Module. You never pass `style` or raw `className`.
- **Composition.** Higher-level components — a `*Page`, a `*Card` — take their identity from library components like `Card`, `Section`, `Button`, and `Tag` rather than shipping their own styling.
- **Sentence case.** Titles, headings, and button labels capitalise only the first word.
- **Theming via CSS variables.** Colour and spacing come from CSS custom properties with fallback chains, so a theme is a small set of variable overrides.

## Styling system

The styling system has four moving parts, all defined in [style/](./style/): design tokens, the tint scale, cascade layers, and the styling props. Components compose them in a predictable shape; consumers theme by overriding CSS custom properties at `:root`.

### Design tokens

[`style/base.css`](./style/base.css) defines every design-token constant at `:root` — colours (`--color-*`), font sizes (`--size-*`), spacing (`--space-*`), radii (`--radius-*`), strokes (`--stroke-*`), shadows (`--shadow-*`), durations (`--duration-*`), font weights (`--weight-*`), and font faces (`--font-*`). Components read these via `var(--token)`; themes override them at `:root` in their own CSS file. No class selectors needed.

`base.css` is `@import`ed at the top of every `*.module.css` in the codebase — that's how the design tokens (and the cascade layer order) reach every component automatically, regardless of bundle order.

Alongside the raw scales sit semantic aliases that themes usually target instead: `--color-primary` / `--color-secondary` / `--color-tertiary` (brand), `--color-link` / `--color-focus` (interaction), `--color-success` / `--color-warning` / `--color-failure` (status), `--space-paragraph` / `--space-section` (rhythm).

### The tint scale

All colour in the library flows from a single anchor variable, **`--tint-50`**, defined in [`style/Tint.module.css`](./style/Tint.module.css). From that one hue, a 21-step ladder — `--tint-00`, `--tint-05`, … `--tint-95`, `--tint-100` — is computed with `color-mix()` in OKLCH: `--tint-00` is black, `--tint-50` is the anchor hue itself, `--tint-100` is white, and every step in between mixes the anchor toward one extreme or the other.

The anchor defaults to `--color-gray`, so the default ladder is a neutral grey ramp — grey is just the colour you get when nothing moves the anchor. The page baseline paints from the extremes: `body { color: var(--tint-00); background: var(--tint-100); }`.

The ladder is computed at `:root` and *recomputed* under the `.tint` class (`TINT_CLASS` in [`style/Tint.tsx`](./style/Tint.tsx)). That recomputation is the whole trick: move the anchor at any scope, apply `.tint`, and all 21 shades rebuild from the new hue at that scope. Colour and status classes are exactly that —

```css
/* Color.module.css — a colour variant just moves the anchor. */
.red {
	--tint-50: var(--color-red);
}

/* Status.module.css — a status maps a semantic name onto a palette colour. */
.success {
	--tint-50: var(--color-success);
}
```

`getColorClass()` and `getStatusClass()` compose `TINT_CLASS` automatically, so `<Card color="red">` is: move the anchor to red, rebuild the ladder, and let the card paint from the same steps it always paints from. Descendants inherit the rebuilt ladder, which is why a `<Tag>` or `<Preformatted>` nested in a red card tints to match it.

Components paint from the ladder by convention:

| Step | Used for |
|---|---|
| `--tint-00` | Body text, headings — maximum contrast |
| `--tint-50` | The hue itself — accents, labels, `Tag` backgrounds, `strong` button backgrounds |
| `--tint-80` | Borders |
| `--tint-90` | Surfaces — `Card`, `Preformatted`, `Button` backgrounds |
| `--tint-95` | Hover state of those surfaces |
| `--tint-100` | The page background; text on `--tint-50` backgrounds |

Pairings follow contrast: long text reads at `00`-on-`90` or `00`-on-`100`; short labels read at `100`-on-`50`.

### Cascade layers

Order, lowest to highest priority:

| Layer | What's in it |
|---|---|
| `defaults` | `:root` design tokens, the tint ladder, body baseline typography, low-priority opt-in defaults |
| `components` | Component-defining CSS — the bulk of the codebase: `.card`, `.button`, `.notice`, `.heading`, etc. |
| `variants` | Cross-cutting opt-in modifiers (Color, Status, Spacing, Padding, Gap, Width, Typography, Flex, Scroll). Always beat components. |
| `overrides` | Top-priority structural overrides — `:first-child` / `:last-child` margin collapses, which need to beat variant-set margins |

**Unlayered rules beat all layered rules.** A consumer theme that wraps its overrides in `@layer theme { … }` or just sets tokens at `:root` is fine; one that writes raw class selectors without participating in the layer system will silently dominate variants.

### Styling props

[`style/`](./style/) exports the cross-cutting styling props. Each module has the same shape: a `.module.css` with classes inside `@layer variants`, and a `.tsx` exporting a `getXxxClass(props)` helper plus a props interface that components extend.

Scales — anything with mutually-exclusive options — are enumerated props:

| Prop | Module | Values | Sets |
|---|---|---|---|
| `color=` | [`Color`](./style/Color.tsx) | `"primary"`, `"secondary"`, `"tertiary"`, `"red"`, `"orange"`, `"yellow"`, `"green"`, `"aqua"`, `"blue"`, `"purple"`, `"pink"`, `"gray"` | The tint anchor — recolours the whole scope |
| `status=` | [`Status`](./style/Status.tsx) | `"info"`, `"success"`, `"warning"`, `"danger"`, `"error"`, `"loading"` | The tint anchor, via a semantic name |
| `size=` | [`Typography`](./style/Typography.tsx) | `"xxsmall"` … `"xxlarge"` | `font-size` |
| `tint=` | [`Typography`](./style/Typography.tsx) | `"00"`, `"05"`, … `"100"` | Text `color`, as a step of the current ladder |
| `space=` | [`Spacing`](./style/Spacing.tsx) | `"none"`, `"xxsmall"` … `"xxlarge"` | `margin-block` (top + bottom) |
| `padding=` | [`Padding`](./style/Padding.tsx) | `"none"`, `"xxsmall"` … `"xxlarge"` | `padding-block` (top + bottom) |
| `gap=` | [`Gap`](./style/Gap.tsx) | `"none"`, `"xxsmall"` … `"xxlarge"` | `gap` between children |

On/off options stay boolean props:

| Props | Module | Purpose |
|---|---|---|
| `narrow`, `wide`, `full` | [`Width`](./style/Width.tsx) | Constrain (or unconstrain) `max-width` |
| `body`, `code`, `monospace`, `sans`, `serif` | [`Typography`](./style/Typography.tsx) | Font family |
| `left`, `center`, `right` | [`Typography`](./style/Typography.tsx) | Text alignment |
| `wrap`, `column`, `reverse`, justify/align (`left`, `middle`, `between`, …) | [`Flex`](./style/Flex.tsx) | Flex layout (composes `gap=`) |
| `horizontal`, `vertical` | [`Scroll`](./style/Scroll.tsx) | Opt-in scrolling (combinable) |

Status also keeps boolean aliases (`<Notice error>` ≡ `<Notice status="error">`) because they read naturally at call sites that hard-code one status.

A component using styling props looks like:

```tsx
export interface CardProps extends ColorProps, StatusProps, PaddingProps, SpacingProps, WidthVariants /* … */ {}

export function Card({ children, ...props }: CardProps): ReactElement {
  return (
    <article
      className={getClass(
        getModuleClass(CARD_CSS, "card"),
        getStatusClass(props),
        getColorClass(props),
        getPaddingClass(props),
        getSpacingClass(props),
        getWidthClass(props),
      )}
    >
      {children}
    </article>
  );
}
```

```tsx
// At a call site:
<Card color="purple" padding="large" space="none">…</Card>
```

### Component theme hooks

Each component exposes per-component CSS custom properties for its overridable values, read with a `var(--component-hook, default)` fallback chain. A consumer overrides the hook at `:root` to retheme that one component without touching the rest of the design system.

Every painting component exposes two kinds of hook:

- **A tint hook** — the component rebinds the scale anchor once, at the top of its rule: `--tint-50: var(--card-tint, inherit);`. Setting `--card-tint: var(--color-purple)` recolours every card (and everything nested inside cards) while leaving the rest of the page alone. The `inherit` fallback is what lets `color=` / `status=` variants and parent scopes flow through when the hook is unset.
- **Per-property hooks** — `--card-background`, `--card-border`, `--card-padding`, `--card-radius`, `--card-shadow`, and so on, for surgical overrides of a single painted property: `background: var(--card-background, var(--tint-90))`.

Naming follows the file-prefix rule from [AGENTS.md](/AGENTS.md): hooks owned by a module file start with that file's kebab-case name — `Card.module.css` owns `--card-*`, `Button.module.css` owns `--button-*`. Design tokens declared at `:root` in `base.css` and the tint ladder itself are exempt — they're the global palette, not file-owned.

### Theming

A theme is a CSS file of custom-property overrides at `:root`, imported after the base styles. Work from broadest to narrowest:

1. **Move a palette colour.** Overriding `--color-gray` moves the default anchor, retinting every neutral ladder in the app — the broadest possible change. Overriding `--color-red`, `--color-primary`, etc. re-aims every variant and status that maps to it.
2. **Retint one component family.** Set its tint hook: `--card-tint: var(--color-purple)` makes all cards (and their nested content) purple-tinted, with text, border, surface, and hover shades all derived for free.
3. **Override one property.** Per-property hooks are the scalpel: `--button-radius: 999px`, `--card-border: none`, `--tag-case: none`.

**Don't override individual ladder steps (`--tint-90`, etc.) at `:root`.** The ladder is *recomputed* from the anchor inside every `.tint` scope — which includes every component that accepts `color=` or `status=` — so a step override at `:root` only reaches untinted regions and produces inconsistent surfaces. Move the anchor (option 1 or 2) instead, and the steps follow.

### How `:first-child` / `:last-child` margin overrides work

Every paragraph-level component zeros its outer margins when it's the first or last child of its container — otherwise a Heading at the top of a Card would leave a strip of unwanted space. These rules live in `@layer overrides`, which beats every other layer including `variants`, so a `<Paragraph space="large">` still collapses its abutting edges correctly.

Pattern:

```css
@layer components {
  .paragraph { margin-block: var(--paragraph-space, var(--space-paragraph)); }
}

@layer overrides {
  .paragraph {
    &:first-child { margin-block-start: 0; }
    &:last-child { margin-block-end: 0; }
  }
}
```

### Writing a new component

A typical new block-level component looks like:

```tsx
// Address.tsx
import { type ColorProps, getColorClass } from "../style/Color.js";
import { getSpacingClass, type SpacingProps } from "../style/Spacing.js";
import { getTypographyClass, type TypographyProps } from "../style/Typography.js";

export interface AddressProps extends ColorProps, SpacingProps, TypographyProps, ChildProps {}

export function Address({ children, ...props }: AddressProps) {
  return (
    <address
      className={getClass(
        getModuleClass(styles, "address"),
        getColorClass(props),
        getSpacingClass(props),
        getTypographyClass(props),
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
    /* Theme — rebind the tint anchor so `--address-tint` (and parent scopes) flow through. */
    --tint-50: var(--address-tint, inherit);

    /* Box */
    display: block;
    margin-inline: 0;
    margin-block: var(--address-space, var(--space-paragraph));

    /* Text — paint from the ladder, with a per-property hook in front. */
    color: var(--address-color, var(--tint-00));
    font-family: var(--address-font, inherit);
    font-size: var(--address-size, inherit);
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
- [ ] If the component paints colour, rebind the tint anchor at the top of the rule (`--tint-50: var(--address-tint, inherit);`) and paint from ladder steps with per-property hooks in front.
- [ ] `:first-child` / `:last-child` overrides in a separate `@layer overrides { … }` block.
- [ ] TSX extends the styling-prop interfaces (`ColorProps`, `SpacingProps`, `TypographyProps`, etc.) you want to expose; composes the matching `getXxxClass(props)` calls.

## Module map

### Content

| Folder | What's inside |
|---|---|
| [block](/ui/block) | Block-level content — `Card`, `Section`, `Title`, `Heading`, `Table`, `List`, `Prose`, `Figure` |
| [inline](/ui/inline) | Inline content — `Code`, `Strong`, `Emphasis`, `Link`, `Mark`, `Small` |
| [misc](/ui/misc) | Cross-cutting pieces — `Markup`, `Tag`, `StatusIcon`, `Loading`, `Catcher`, `Mapper` |
| [style](./style/) | The styling system — design tokens, the tint scale, styling props, `Flex`, `Scroll` |

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
