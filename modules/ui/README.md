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

## Module map

### Content

| Folder | What's inside |
|---|---|
| [block](/ui/block) | Block-level content — `Card`, `Section`, `Heading`, `Table`, `List`, `Prose`, `Figure`, `Flex` |
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
import { App, CenteredLayout, Section, Heading, Paragraph } from "shelving/ui";

function HelloApp() {
  return (
    <App app="My app">
      <CenteredLayout>
        <Section narrow>
          <Heading>Hello</Heading>
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
