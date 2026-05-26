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

[`style/base.css`](./style/base.css) defines every design-token constant at `:root` — colours, sizes (`--size-*`), spacing (`--space-*`), radii (`--radius-*`), strokes (`--stroke-*`), shadows (`--shadow-*`), durations (`--duration-*`). Components read these via `var(--token)`; themes override them at `:root` in their own CSS file. No class selectors needed.

`base.css` is `@import`ed at the top of every `*.module.css` in the codebase — that's how the design tokens (and the cascade layer order) reach every component automatically, regardless of bundle order.

#### The 5-step colour scale

Colours are organised as a **5-step scale**: `--color-black`, `--color-dark`, `--color-vivid`, `--color-light`, `--color-white`. The inner three steps (`dark` / `vivid` / `light`) are saturated tones of the active hue and change per variant scope; the extremes (`black` / `white`) are the page foreground/background and stay put unless the theme deliberately inverts them (e.g. dark mode).

A useful mental model: **step distance encodes contrast strength**.

| Distance | Pairing | Use for |
|---|---|---|
| 2 steps | `vivid + white`, `light + dark` | Short text (button labels, tag labels, notices) |
| 3 steps | `dark + white`, `light + black` | Body text (paragraphs, headings) |
| 4 steps | `black + white` | Maximum-contrast surfaces (Inputs) |

Components pick whichever pair fits their content; variants only ever set the inner three steps, so a component that renders `bg=light` and `text=dark` automatically inherits the right tint when wrapped in `.red`, `.success`, etc.

The base palette underneath the scale defines three shades per hue: `--vivid-red`, `--light-red`, `--dark-red` (and the same for orange, yellow, green, aqua, blue, purple, pink, plus `--*-gray` for the default neutrals). The default `:root` value of `--color-vivid` is `var(--vivid-gray)` and so on — grey is just the variant you get when no colour variant is applied.

**`--color-black` and `--color-white` are theme-scoped, not literal.** They're the extremes of the active scale. In a dark theme they'd be a deep navy and a soft cream. For literal black or white pixels (neutral hover blends, etc.) use the CSS keywords `black` / `white` directly — they sit outside the scale entirely.

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

Naming follows the file-prefix rule from [AGENTS.md](/AGENTS.md): hooks owned by a specific module file start with that file's kebab-case name. So Card owns `--card-color-light`, `--card-color-dark`, `--card-padding`, `--card-radius`, etc. Button owns `--button-color-vivid`, `--button-color-light`, `--button-border`, and so on.

Tokens declared at `:root` (in `base.css`, or in `Color`/`Status`'s token blocks) are exempt — they're the global palette, not file-owned.

### The colour rebind pattern

Any component that paints a `background-color`, `border-color`, or `color` from the 5-step scale (Card, Button, Notice, Panel, Tag, Code, Mark, Modal, Popover, Preformatted, …) **rebinds all five scale steps on its own scope** before painting:

```css
.card {
  /* Rebind: per-component theme hook wins; otherwise inherit from variant or page scope. */
  --color-black: var(--card-color-black, inherit);
  --color-dark:  var(--card-color-dark, inherit);
  --color-vivid: var(--card-color-vivid, inherit);
  --color-light: var(--card-color-light, inherit);
  --color-white: var(--card-color-white, inherit);

  /* bg=light + text=dark is a 2-step pair, fine for the short text inside a card body. */
  background-color: var(--color-light);
  border-color:     var(--color-vivid);
  color:            var(--color-dark);
}
```

The rebind serves three jobs at once:

1. **Per-component theme hook.** A consumer setting `--card-color-light: peachpuff` at `:root` repaints the card surface without touching Buttons or Notices.
2. **Variant inheritance.** When the card is `.red` (or `.success`, etc.), the variant has already set `--color-dark / --color-vivid / --color-light` at its scope. The rebind's `inherit` fallback picks those up — no explicit `.card.red` rule needed.
3. **Identity propagation.** Descendants (like a `<Code>` chip inside the card) inherit the rebound values, so they can compute their own surface relative to the card.

For variants on appearance (`.strong`, `.outline`, `.plain` on Button) — just pick a different step pair from the already-rebound scale. No extra hook needed:

```css
.button { background: var(--color-light); color: var(--color-dark); }
.button.strong { background: var(--color-vivid); color: var(--color-white); }
```

**What about components that only paint one colour?** Text-only blocks (Paragraph, Heading, Title, etc.) skip the rebind and read the relevant scale step directly with a single theme-hook fallback:

```css
.paragraph { color: var(--paragraph-color, var(--color-dark)); }
.heading   { color: var(--heading-color, var(--color-black)); }
```

**What about Inputs?** Inputs sit outside the variant scope's middle three steps — they always use `bg=white + text=black` (a 4-step pair, maximum contrast) regardless of the surrounding variant. Variant scope still tints their border and validity states, but never the field surface.

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
    display: block;
    margin-inline: 0;
    margin-block: var(--address-spacing, var(--spacing-paragraph));

    /* Single-colour text block — read --color-dark directly with a theme-hook fallback. */
    color: var(--address-color, var(--color-dark));
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
- [ ] If the component paints a surface (background + border + text), rebind all five scale steps at the top of the rule and pick a step pair for the painted properties.
- [ ] If the component only paints one colour (a text-only block), skip the rebind and read the step directly with a single theme-hook fallback.
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
