# ui

A React component library for building Shelving apps — forms, content, layout, routing, dialogs, and the documentation-site components, all in one place.

The `ui` module exists so an app never hand-rolls the same form field, card, or router twice. Every component picks up its look from shared CSS and exposes its variations as props. You build a screen by composing these pieces, and reach for a custom-styled element only when nothing here fits.

`ui` is consumed as source — it ships `.tsx` and `.module.css` files and needs a bundler that understands CSS Modules and JSX. It is not part of the root `shelving` package; import it from `shelving/ui`.

## How components work

A few conventions run through every component:

- **Styling props are for one-off overrides.** Visual options are props on the component — enumerated props for the scales (`color="red"`, `size="large"`, `space="none"`, `width="narrow"`) and boolean props for on/off variants (`<Button strong>`, `<Title center>`, `<Flex wrap>`). Each maps to a class in a CSS Module. Reach for them when a component needs to look different in *one place* — the way the docs site tints its accents purple — not as the way to dress a whole app. You never pass `style` or raw `className`.
- **Composition.** Higher-level components — a `*Page`, a `*Card` — take their identity from library components like [`Card`](/ui/Card), [`Section`](/ui/Section), [`Button`](/ui/Button), and [`Tag`](/ui/Tag) rather than shipping their own styling.
- **Sentence case.** Titles, headings, and button labels capitalise only the first word.
- **Theme with CSS.** An app-wide custom look is a CSS file, not a wall of props. Write a `theme.css` that overrides the base design-token variables (and, where needed, per-component hooks) at `:root`, and import it after the library styles. The recommended workflow is to spend time tuning those variables to match your design — see [Theming](#theming) below.

## The styling system

The styling system lives in `style/` and has four moving parts: design tokens, the tint scale, cascade layers, and the styling props. Components compose them in a predictable shape; consumers theme by overriding CSS custom properties at `:root`.

**Design tokens.** Every design-token constant is defined at `:root`, split across the themed token modules in `style/` — each module owns one domain, documents the variables it defines, and is the page a theme author overrides. `style/layers.css` is the cascade-layer anchor; every `*.module.css` `@import`s it plus the specific token modules it references, so the tokens and the layer order reach every component regardless of bundle order. The domains are: colours ([`getColorClass`](/ui/getColorClass)), font sizes ([`getSizeClass`](/ui/getSizeClass)), font weights ([`getWeightClass`](/ui/getWeightClass)), font faces ([`getFontClass`](/ui/getFontClass)), spacing ([`getSpaceClass`](/ui/getSpaceClass)), widths ([`getWidthClass`](/ui/getWidthClass)), radii ([`getRadiusClass`](/ui/getRadiusClass)), strokes ([`getStrokeClass`](/ui/getStrokeClass)), shadows ([`getShadowClass`](/ui/getShadowClass)), and durations ([`getDurationClass`](/ui/getDurationClass)). Each also defines the semantic aliases a theme usually targets (`--color-primary`, `--color-link`, `--space-paragraph`, …). Components read tokens via `var(--token)`.

**The tint scale.** All colour flows from one anchor variable, `--tint-50`, from which a 21-step ladder is computed and *recomputed* under [`TINT_CLASS`](/ui/TINT_CLASS) — the heart of how `color=` and `status=` retint a whole subtree. The ladder, the recompute trick, the painting conventions, and the theming guide all live on the [`TINT_CLASS`](/ui/TINT_CLASS) page.

**Cascade layers.** Styles are ordered by `@layer`, lowest to highest priority: `defaults` (`:root` tokens, the tint ladder, body baseline) → `components` (the bulk of the CSS: `.card`, `.button`, …) → `variants` (cross-cutting opt-in modifiers, which always beat components) → `overrides` (top-priority structural fixes like `:first-child` / `:last-child` margin collapses). Unlayered rules beat all layered rules, so a theme should set tokens at `:root` or wrap its rules in `@layer`.

**Styling props.** The cross-cutting visual options are props, each backed by a helper in `style/` that maps the prop to a class. Colour and status move the tint anchor — [`getColorClass`](/ui/getColorClass) and [`getStatusClass`](/ui/getStatusClass); font size, weight, and family come from [`getSizeClass`](/ui/getSizeClass), [`getWeightClass`](/ui/getWeightClass), and [`getFontClass`](/ui/getFontClass), which [`getTypographyClass`](/ui/getTypographyClass) combines with text alignment and tint; spacing, padding, and gap from [`getSpaceClass`](/ui/getSpaceClass), [`getPaddingClass`](/ui/getPaddingClass), and [`getGapClass`](/ui/getGapClass); width constraints from [`getWidthClass`](/ui/getWidthClass); flex layout from [`getFlexClass`](/ui/getFlexClass); and opt-in scrolling from [`getScrollClass`](/ui/getScrollClass). Each helper's page lists its exact prop values and what they set. A component opts into the props it wants by extending the matching `*Props` interfaces and composing the `getXxxClass(props)` calls.

Each painting component also exposes its own theme hooks — a single tint hook (`--card-tint`) to recolour the whole component, plus per-property hooks (`--card-background`, `--card-radius`, …) for surgical overrides. Those are documented in each component's own **Styling** section (see [`Card`](/ui/Card) for the precedent).

## Theming

The recommended way to give an app its own look is a **theme stylesheet**, not styling props. Create a `theme.css`, override the base design-token variables at `:root`, and import it after the library styles:

```css
/* theme.css — imported after shelving/ui styles */
:root {
	--color-primary: oklch(58% 0.25 300); /* purple brand */
	--font-body: "Inter", system-ui;
	--radius: 0.5rem; /* tighter corners everywhere */
	--space: 1.125rem; /* roomier spacing scale */
}
```

Each base token lives in a themed module that documents the variables it defines and which ones a theme usually overrides. Work from broadest (a palette colour or scale root) to narrowest (a single semantic alias):

- [weight](/ui/getWeightClass) · [size](/ui/getSizeClass) · [font](/ui/getFontClass) — typography (`--weight-*`, `--size-*`, `--font-*`, `--case-label`).
- [color](/ui/getColorClass) — palette, semantic, and brand colours (`--color-*`).
- [space](/ui/getSpaceClass) · [width](/ui/getWidthClass) — layout spacing and widths (`--space-*`, `--width-*`).
- [radius](/ui/getRadiusClass) · [stroke](/ui/getStrokeClass) · [shadow](/ui/getShadowClass) · [duration](/ui/getDurationClass) — surface tokens (`--radius-*`, `--stroke-*`, `--shadow-*`, `--duration-*`).

The **tint ladder** is the one exception that doesn't follow the override-a-variable pattern: its 21 steps are *recomputed* from a single anchor inside every tinted scope, so you move the anchor rather than overriding individual steps. See [`TINT_CLASS`](/ui/TINT_CLASS) for the full theming guide, and each component's **Styling** section for its per-component hooks.

## Finding your way around

The components below are listed in the index following this page; this is the short version of where to start reading.

**Content.** Block-level structure starts with [`Card`](/ui/Card), [`Section`](/ui/Section), and the [`Heading`](/ui/Heading) / [`Title`](/ui/Title) family, with [`Table`](/ui/Table), [`List`](/ui/List), and [`Figure`](/ui/Figure) for specific shapes; wrap longform copy in [`Prose`](/ui/Prose). Inline pieces — [`Link`](/ui/Link), [`Code`](/ui/Code), [`Strong`](/ui/Strong), [`Mark`](/ui/Mark) — live inside that block content. To render a Markdown string as components, use [`Markup`](/ui/Markup).

**Structure.** Mount a client app with [`App`](/ui/App), or render a full server document with [`HTML`](/ui/HTML) and [`Page`](/ui/Page). Arrange the screen with [`CenteredLayout`](/ui/CenteredLayout) or [`SidebarLayout`](/ui/SidebarLayout), and drive URLs with [`Navigation`](/ui/Navigation) and [`Router`](/ui/Router).

**Interaction.** Forms start at [`Form`](/ui/Form), which wires [`Field`](/ui/Field) and the typed inputs to a [`FormStore`](/ui/FormStore); [`Button`](/ui/Button) is the standalone action. Overlays are [`Dialog`](/ui/Dialog) and [`Modal`](/ui/Modal); navigation menus are [`Menu`](/ui/Menu) and [`MenuItem`](/ui/MenuItem); transient feedback is [`Notice`](/ui/Notice) (and the global [`Notices`](/ui/Notices) list); animate enter/leave with [`Transition`](/ui/Transition).

**Documentation site.** Hand an extracted tree to [`TreeApp`](/ui/TreeApp) and you get a complete site — sidebar, routing, and a rendered page per element — using the renderers in `docs/`.

## See also

- [extract](/extract) — builds the tree that the documentation components render
- [markup](/markup) — Markdown rendering used by [`Markup`](/ui/Markup) and [`Prose`](/ui/Prose)
- [store](/store) — reactive state behind [`FormStore`](/ui/FormStore), `NavigationStore`, and notices
- [react](/react) — store and provider hooks used alongside these components

> Building or extending a component? The contributor walkthrough (file layout, the tint-anchor + per-property-hook pattern, `:first-child` / `:last-child` overrides, and the checklist) lives in the **React Components** section of `AGENTS.md`.
