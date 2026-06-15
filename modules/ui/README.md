# ui

A React component library for building Shelving apps — forms, content, layout, routing, dialogs, and the documentation-site components, all in one place.

The `ui` module exists so an app never hand-rolls the same form field, card, or router twice. Every component picks up its look from shared CSS and exposes its variations as props. You build a screen by composing these pieces, and reach for a custom-styled element only when nothing here fits.

`ui` is consumed as source — it ships `.tsx` and `.module.css` files and needs a bundler that understands CSS Modules and JSX. It is not part of the root `shelving` package; import it from `shelving/ui`.

## How components work

A few conventions run through every component:

- **Styling props, not CSS.** Visual options are props on the component — enumerated props for the scales (`color="red"`, `size="large"`, `space="none"`) and boolean props for on/off variants (`<Button strong>`, `<Section narrow>`, `<Flex wrap>`). Each maps to a class in a CSS Module. You never pass `style` or raw `className`.
- **Composition.** Higher-level components — a `*Page`, a `*Card` — take their identity from library components like [`Card`](/ui/Card), [`Section`](/ui/Section), [`Button`](/ui/Button), and [`Tag`](/ui/Tag) rather than shipping their own styling.
- **Sentence case.** Titles, headings, and button labels capitalise only the first word.
- **Theming via CSS variables.** Colour and spacing come from CSS custom properties with fallback chains, so a theme is a small set of variable overrides.

## The styling system

The styling system lives in `style/` and has four moving parts: design tokens, the tint scale, cascade layers, and the styling props. Components compose them in a predictable shape; consumers theme by overriding CSS custom properties at `:root`.

**Design tokens.** `style/base.css` defines every design-token constant at `:root` — colours (`--color-*`), font sizes (`--size-*`), spacing (`--space-*`), radii (`--radius-*`), strokes (`--stroke-*`), shadows (`--shadow-*`), durations (`--duration-*`), font weights (`--weight-*`), and font faces (`--font-*`) — plus semantic aliases themes usually target instead (`--color-primary`, `--color-link`, `--color-success`, `--space-paragraph`, …). Components read these via `var(--token)`; `base.css` is `@import`ed at the top of every `*.module.css`, so the tokens and the cascade-layer order reach every component regardless of bundle order.

**The tint scale.** All colour flows from one anchor variable, `--tint-50`, from which a 21-step ladder is computed and *recomputed* under [`TINT_CLASS`](/ui/TINT_CLASS) — the heart of how `color=` and `status=` retint a whole subtree. The ladder, the recompute trick, the painting conventions, and the theming guide all live on the [`TINT_CLASS`](/ui/TINT_CLASS) page.

**Cascade layers.** Styles are ordered by `@layer`, lowest to highest priority: `defaults` (`:root` tokens, the tint ladder, body baseline) → `components` (the bulk of the CSS: `.card`, `.button`, …) → `variants` (cross-cutting opt-in modifiers, which always beat components) → `overrides` (top-priority structural fixes like `:first-child` / `:last-child` margin collapses). Unlayered rules beat all layered rules, so a theme should set tokens at `:root` or wrap its rules in `@layer`.

**Styling props.** The cross-cutting visual options are props, each backed by a helper in `style/` that maps the prop to a class. Colour and status move the tint anchor — [`getColorClass`](/ui/getColorClass) and [`getStatusClass`](/ui/getStatusClass); size, alignment, and font family come from [`getTypographyClass`](/ui/getTypographyClass); spacing, padding, and gap from [`getSpacingClass`](/ui/getSpacingClass), [`getPaddingClass`](/ui/getPaddingClass), and [`getGapClass`](/ui/getGapClass); width constraints from [`getWidthClass`](/ui/getWidthClass); flex layout from [`getFlexClass`](/ui/getFlexClass); and opt-in scrolling from [`getScrollClass`](/ui/getScrollClass). Each helper's page lists its exact prop values and what they set. A component opts into the props it wants by extending the matching `*Props` interfaces and composing the `getXxxClass(props)` calls.

Each painting component also exposes its own theme hooks — a single tint hook (`--card-tint`) to recolour the whole component, plus per-property hooks (`--card-background`, `--card-radius`, …) for surgical overrides. Those are documented in each component's own **Styling** section (see [`Card`](/ui/Card) for the precedent).

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
