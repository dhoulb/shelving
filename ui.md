# shelving/ui

- Kind: module
- Import: `import { … } from "shelving/ui";`

A React component library for building Shelving apps — forms, content, layout, routing, dialogs, and the documentation-site components, all in one place.

The `ui` module exists so an app never hand-rolls the same form field, card, or router twice. Every component picks up its look from shared CSS and exposes its variations as props. You build a screen by composing these pieces, and reach for a custom-styled element only when nothing here fits.

`ui` is consumed as source — it ships `.tsx` and `.module.css` files and needs a bundler that understands CSS Modules and JSX. It is not part of the root `shelving` package; import it from `shelving/ui`.

## How components work

A few conventions run through every component:

- **Styling props are for one-off overrides.** Visual options are props on the component — enumerated props for the scales (`color="red"`, `size="large"`, `space="none"`, `width="narrow"`) and boolean props for on/off variants (`<Button plain>`, `<Title center>`, `<Flex wrap>`). Each maps to a class in a CSS Module. Reach for them when a component needs to look different in *one place* — the way the docs site tints its accents purple — not as the way to dress a whole app. You never pass `style`.
- **`className` is the escape hatch.** Most components accept an optional `className`, merged *after* the classes the component computes for itself, so an app class reliably wins over the library's `@layer components` rules. It takes any `Classes` value — a string, an array, or a dictionary of `true` flags — and lands on the component's own root element. Use it for a composed one-off treatment that tokens and per-property hooks can't express (an animation, a bespoke gradient); tokens and hooks stay the primary theming surface. Formatting-only components (`<When>`, `<Prose>`, `<Scroll>`), the `*Layout` components, and `<Dialog>` deliberately don't take one — write a new layout, or style the content inside. See `ClassProps`.
- **Composition.** Higher-level components — a `*Page`, a `*Card` — take their identity from library components like `<Card>`, `<Section>`, `<Button>`, and `<Tag>` rather than shipping their own styling.
- **Sentence case.** Titles, headings, and button labels capitalise only the first word.
- **Theme with CSS.** An app-wide custom look is a CSS file, not a wall of props. Write a `theme.css` that overrides the base design-token variables (and, where needed, per-component hooks) at `:root`, and import it after the library styles. The recommended workflow is to spend time tuning those variables to match your design — see [Theming](#theming) below.

## The styling system

The styling system lives in `style/` and has four moving parts: design tokens, the tint scale, cascade layers, and the styling props. Components compose them in a predictable shape; consumers theme by overriding CSS custom properties at `:root`.

**Design tokens.** Every design-token constant is defined at `:root`, split across the themed token modules in `style/` — each module owns one domain, documents the variables it defines, and is the page a theme author overrides. `style/layers.css` is the cascade-layer anchor; every `*.module.css` `@import`s it plus the specific token modules it references, so the tokens and the layer order reach every component regardless of bundle order. The domains are: colours (`getColorClass()`), typography — font size, weight, family, and case (`getTypographyClass()`), spacing (`getSpaceClass()`), widths (`getWidthClass()`), radii (`getRadiusClass()`), strokes (`getStrokeClass()`), shadows (`getShadowClass()`), and durations (`getDurationClass()`). Each also defines the semantic aliases a theme usually targets (`--color-primary`, `--color-link`, `--space-paragraph`, …). Components read tokens via `var(--token)`.

**The tint scale.** All colour flows from one anchor variable, `--tint-50`, from which a 21-step ladder is computed and *recomputed* under `TINT_CLASS` — the heart of how `color=` and `status=` retint a whole subtree. The ladder, the recompute trick, the painting conventions, and the theming guide all live on the `TINT_CLASS` page.

**Cascade layers.** Styles are ordered by `@layer`, lowest to highest priority: `defaults` (`:root` tokens, the tint ladder, body baseline) → `components` (the bulk of the CSS: `.card`, `.button`, …) → `variants` (cross-cutting opt-in modifiers, which always beat components) → `overrides` (top-priority structural fixes like `:first-child` / `:last-child` margin collapses). Unlayered rules beat all layered rules, so a theme should set tokens at `:root` or wrap its rules in `@layer`.

**Styling props.** The cross-cutting visual options are props, each backed by a helper in `style/` that maps the prop to a class. Colour and status move the tint anchor — `getColorClass()` and `getStatusClass()`; font size, weight, family, and case, plus text alignment, tint, and wrapping, all come from `getTypographyClass()`, which extends `ColorVariants` and composes `getColorClass()` so every typographic element also accepts `color` (use `getColorClass()` directly only for colour-without-typography, e.g. `<Icon>`); spacing, block-padding, inline-padding ("indent"), and gap from `getSpaceClass()`, `getPaddingClass()`, `getIndentClass()`, and `getGapClass()`; width constraints from `getWidthClass()`; flex layout from `getFlexClass()`; grid layout from `getGridClass()`; and opt-in scrolling from `getScrollClass()`. Each helper's page lists its exact prop values and what they set. A component opts into the props it wants by extending the matching `*Props` interfaces and composing the `getXxxClass(props)` calls.

Each painting component also exposes per-property theme hooks (`--card-background`, `--card-radius`, …) for surgical overrides. To recolour a component or a whole region, apply `color=` / `status=` — on it or an ancestor scope — rather than a per-component tint hook; components no longer set the tint anchor themselves. Those hooks are documented in each component's own **Styling** section (see `<Card>` for the precedent).

## Theming

The recommended way to give an app its own look is a **theme stylesheet**, not styling props. Create a `theme.css`, override the base design-token variables at `:root`, and import it after the library styles:

```css
/* theme.css — imported after shelving/ui styles */
:root {
	--color-primary: oklch(58% 0.25 300); /* purple brand */
	--font-body: "Inter", system-ui;
	--radius-normal: 0.5rem; /* tighter corners everywhere */
	--space-normal: 1.125rem; /* roomier spacing scale */
}
```

Each base token lives in a themed module that documents the variables it defines and which ones a theme usually overrides. Work from broadest (a palette colour or scale root) to narrowest (a single semantic alias):

- `weight` · `size` · `font` — typography (`--weight-*`, `--size-*`, `--font-*`, `--case-label`).
- `color` — palette, semantic, and brand colours (`--color-*`).
- `space` · `width` — layout spacing and widths (`--space-*`, `--width-*`).
- `radius` · `stroke` · `shadow` · `duration` — surface tokens (`--radius-*`, `--stroke-*`, `--shadow-*`, `--duration-*`).

The **tint ladder** is the one exception that doesn't follow the override-a-variable pattern: its 21 steps are *recomputed* from a single anchor inside every tinted scope, so you move the anchor (via `color=` / `status=`) rather than overriding individual steps. See `TINT_CLASS` for the full theming guide, and each component's **Styling** section for its per-property hooks.

## Finding your way around

The components below are listed in the index following this page; this is the short version of where to start reading.

**Content.** Block-level structure starts with `<Card>`, `<Section>`, and the `<Heading>` / `<Title>` family, with `<Table>`, `<List>`, and `<Figure>` for specific shapes; wrap longform copy in `<Prose>`. Inline pieces — `<Link>`, `<Code>`, `<Strong>`, `<Mark>` — live inside that block content. To render a Markdown string as components, use `<Markup>`.

**Structure.** Mount a client app with `<App>`, or render a full server document with `<HTML>` and `<Page>`. Arrange the screen with `<CenteredLayout>` or `<SidebarLayout>`, and drive URLs with `<Navigation>` and `<Router>`.

**Interaction.** Forms start at `<Form>`, which wires `<Field>` and the typed inputs to a `FormStore`; `<Button>` is the standalone action. Overlays are `<Dialog>` and `<Modal>`; navigation menus are `<Menu>` and `<MenuItem>`; transient feedback is `<Notice>` (and the global `<Notices>` list); animate enter/leave with `<Transition>`.

**Documentation site.** Hand an extracted tree to `<TreeApp>` and you get a complete site — sidebar, routing, and a rendered page per element — using the renderers in `docs/`.


## Components

- [App](ui/App.md): Root component for an application, providing the top-level Meta context and global styles.
- [PhysicalAddress](ui/PhysicalAddress.md): Show an optional AddressData object correctly on screen.
- [EmailAddress](ui/EmailAddress.md): Show an optional email address string correctly on screen.
- [Block](ui/Block.md): Plain <div> block with block-level spacing.
- [Blockquote](ui/Blockquote.md): Quoted block of text — rendered as <blockquote>.
- [Caption](ui/Caption.md): <figcaption> block — caption text for a <Figure>.
- [Card](ui/Card.md): Cards are boxed areas for content to sit within.
- [Column](ui/Column.md): Flex container that stacks its children as a column by default.
- [Definitions](ui/Definitions.md): Description list — a sequence of term/value pairs rendered as a <dl>.
- [Details](ui/Details.md): A collapsible panel with a title that is always visible, built on native <details> and <summary>.
- [Grid](ui/Grid.md): Grid container that arranges its children in equal-width columns.
- [Heading](ui/Heading.md): Section heading — renders an <h2>.
- [Image](ui/Image.md): Image block — renders an <img> with space and width variants applied.
- [Label](ui/Label.md): Label heading, a <h3> with a labelly appearance (UPPERCASE but with a smaller text size).
- [List](ui/List.md): List block — wraps each child in an <li> and renders an <ul> or <ol>.
- [Panel](ui/Panel.md): Full-width vertical region that paints the current surface colour. Use to break a page into stacked sections. Has zero block-space (Panels butt against each other); set its vertical breathing room with the padding variant (<Panel padding="large">, <Panel padding="xxlarge"> etc.).
- [Paragraph](ui/Paragraph.md): Paragraph block of body text — rendered as <p>.
- [Preformatted](ui/Preformatted.md): Preformatted block of text — rendered as <pre>.
- [Prose](ui/Prose.md): A section of longform text containing lots of <p> or <ul> style elements.
- [Row](ui/Row.md): Flex container that arranges its children as a row by default.
- [Section](ui/Section.md): <section> block with section-level spacing.
- [Header](ui/Header.md): <header> block with section-level spacing.
- [Footer](ui/Footer.md): <footer> block with section-level spacing.
- [Article](ui/Article.md): <article> block with section-level spacing.
- [Figure](ui/Figure.md): <figure> block with section-level spacing.
- [Subheading](ui/Subheading.md): Subsection heading — renders an <h3>.
- [Title](ui/Title.md): Page title — renders an <h1>.
- [Video](ui/Video.md): Video container element.
- [Button](ui/Button.md): Render either a <button> or an <a href=""> styled as a button, based on whether an onClick or href prop is provided.
- [Clickable](ui/Clickable.md): Render either a <button>, an <a href="">, or a plain <span> based on whether an onClick or href prop is provided.
- [FullscreenButton](ui/FullscreenButton.md): Button to toggle the surrounding <figure> element or <body> element in/out of fullscreen mode.
- [RetryButton](ui/RetryButton.md): Button that retries the nearest <Catcher> error boundary when clicked.
- [Dialog](ui/Dialog.md): Modal <dialog> element that opens on mount and includes a close button.
- [DialogCloseButton](ui/DialogCloseButton.md): Button that closes its wrapping <dialog>, showing an X icon by default.
- [DialogsContext](ui/DialogsContext.md): Provider that creates a fresh DialogsStore and shares it with its subtree.
- [Dialogs](ui/Dialogs.md): Render the open dialogs from the current DialogsContext.
- [Modal](ui/Modal.md): Styled <aside> panel for content inside a <Dialog>, with dark text on a light surface.
- [DocumentationButtons](ui/DocumentationButtons.md): Render a symbol's relational metadata as a <nav> column of labelled links.
- [DocumentationCard](ui/DocumentationCard.md): Card renderer for a tree-documentation element — a compact summary card linking to the symbol's detail page.
- [DocumentationDescription](ui/DocumentationDescription.md): Render a documentation table row's description cell.
- [DocumentationKind](ui/DocumentationKind.md): Colour-coded tag for a documented symbol's kind.
- [DocumentationPage](ui/DocumentationPage.md): Page renderer for a tree-documentation element — the full detail page for a documented symbol.
- [DocumentationParams](ui/DocumentationParams.md): Render a documented symbol's parameters as a scrollable table — one row per parameter.
- [DocumentationProperties](ui/DocumentationProperties.md): Render a documented type's data members (properties, getters/setters) as a scrollable table — one row per property.
- [DocumentationReferences](ui/DocumentationReferences.md): Render a type alias's referenced type names as a scrollable table — one row per referenced type.
- [DocumentationReturns](ui/DocumentationReturns.md): Render a documented symbol's @returns entries as a scrollable table — one row per return type.
- [DocumentationSearchPage](ui/DocumentationSearchPage.md): Page listing every element in the system in one flat, searchable view.
- [DocumentationSignatures](ui/DocumentationSignatures.md): Render a documented symbol's signature(s) as monospace code blocks — one <Preformatted> per overload.
- [DocumentationThrows](ui/DocumentationThrows.md): Render a documented symbol's @throws entries as a scrollable table — one row per thrown type.
- [DocumentationType](ui/DocumentationType.md): Render a documentation table's Type column — one linked token per union member, each stacked on its own line.
- [Field](ui/Field.md): A <Field> wraps around a form control/input, to shows a small <label> above it.
- [Form](ui/Form.md): Schema-driven form that creates a FormStore, provides it via FormContext, and validates/submits on submit.
- [FormField](ui/FormField.md): Show a <Field> (label, input, and message) for a single named property of the current form.
- [FormFields](ui/FormFields.md): Show a <Field> for every property in the current form's schema.
- [FormFooter](ui/FormFooter.md): Show a form footer with a submit button and the form's error message.
- [FormInput](ui/FormInput.md): Show a SchemaInput for a single named property of the current form.
- [FormInputs](ui/FormInputs.md): Show a SchemaInput for every property in the current form's schema.
- [FormMessage](ui/FormMessage.md): Show the current form's "main" (unnamed) message as a <Message>, or render nothing when there is no message.
- [FormNotice](ui/FormNotice.md): Show the current form's "main" (unnamed) message as a <Notice>, or render nothing when there is no message.
- [Progress](ui/Progress.md): Show progress as a single continuous horizontal bar, filled to value within the min–max range (matches getPercent() and formatPercent()).
- [Code](ui/Code.md): Inline code span — renders a <code> element.
- [Deleted](ui/Deleted.md): Deleted text — renders a <del> element to mark content removed from a document.
- [Emphasis](ui/Emphasis.md): Emphasised text — renders an <em> element for stress emphasis (typically italic).
- [Inserted](ui/Inserted.md): Inserted text — renders an <ins> element to mark content added to a document.
- [Link](ui/Link.md): Inline link — delegates to <Clickable>, rendering an <a> (when href is set) or <button> (when onClick is set).
- [Mark](ui/Mark.md): Highlighted text — renders a <mark> element to call attention to a run of text.
- [Small](ui/Small.md): Small print — renders a <small> element for side comments and fine print.
- [Span](ui/Span.md): Styled inline text — renders a <span> carrying only the colour and typography variant classes, with no styling of its own.
- [Strong](ui/Strong.md): Strong importance — renders a <strong> element for text of strong importance (typically bold).
- [Subscript](ui/Subscript.md): Subscript text — renders a <sub> element for typographically lowered text (e.g. chemical formulae).
- [Superscript](ui/Superscript.md): Superscript text — renders a <sup> element for typographically raised text (e.g. exponents, footnote markers).
- [When](ui/When.md): Relative time — shows a signed string like in 6d, 3w ago or just now wrapped in a <time> element carrying the machine-readable date.
- [Ago](ui/Ago.md): Elapsed time — shows an unsigned string like 3m, 6mo or just now for a past date wrapped in a <time> element carrying the machine-readable date.
- [Until](ui/Until.md): Remaining time — shows an unsigned string like 6d or 3w for a future date wrapped in a <time> element carrying the machine-readable date.
- [ArrayCheckboxInputs](ui/ArrayCheckboxInputs.md): Output a list of <CheckboxInput> elements for each item in an array, to pick any number of them.
- [ArrayInput](ui/ArrayInput.md): Repeating input that edits an array of items, adding a SchemaInput row per item.
- [ButtonInput](ui/ButtonInput.md): Return either a <button> or an <a href=""> styled as an input, based on whether an onClick or href prop is provided.
- [ChoiceRadioInputs](ui/ChoiceRadioInputs.md): Output a list of <RadioInput> elements for each item in a set of ChoiceOptions in { key: title } format.
- [DataInput](ui/DataInput.md): Composite input that edits a data object by rendering a SchemaInput for each property schema.
- [DictionaryInput](ui/DictionaryInput.md): Repeating input that edits a dictionary, with an editable key and schema-validated value per entry.
- [ImageInput](ui/ImageInput.md): Square image picker that shows the picked image in the square.
- [InputWrapper](ui/InputWrapper.md): Wraps an input with support for absolutely-positioned data-slot icon elements on either side.
- [OutputInput](ui/OutputInput.md): Show static read-only content styled as an input, falling back to placeholder when empty.
- [PopoverButton](ui/PopoverButton.md): Popover variant of <Button> — a button that reveals floating popover content beside it when clicked.
- [PopoverButtonInput](ui/PopoverButtonInput.md): Popover variant of <ButtonInput> — an input-styled button that reveals floating popover content beside it when clicked.
- [QueryCheckboxesInput](ui/QueryCheckboxesInput.md): Combo box that queries a list of items and lets the user pick any number of them, with checkboxes.
- [QueryRadiosInput](ui/QueryRadiosInput.md): Combo box that queries a list of items and lets the user pick one, with radios.
- [SchemaInput](ui/SchemaInput.md): Show the appropriate input control for a schema, dispatching on the schema's concrete type.
- [DateSchemaInput](ui/DateSchemaInput.md): Show a DateInput for a DateSchema.
- [NumberSchemaInput](ui/NumberSchemaInput.md): Show a NumberInput for a NumberSchema, formatting values with the schema's format().
- [ChoiceSchemaInput](ui/ChoiceSchemaInput.md): Show a choice input for a ChoiceSchema — radio inputs or a select.
- [BooleanSchemaInput](ui/BooleanSchemaInput.md): Show a CheckboxInput for a BooleanSchema.
- [StringSchemaInput](ui/StringSchemaInput.md): Show a TextInput for a StringSchema, or a TextareaInput when the schema is multiline, sanitising and formatting values with the schema.
- [ArraySchemaInput](ui/ArraySchemaInput.md): Show an ArrayInput for an ArraySchema.
- [DictionarySchemaInput](ui/DictionarySchemaInput.md): Show a DictionaryInput for a DictionarySchema.
- [DataSchemaInput](ui/DataSchemaInput.md): Show a DataInput for a nested DataSchema.
- [SchemaField](ui/SchemaField.md): Show the appropriate input for a schema, wrapped in a <Field> with its label and message.
- [SelectInput](ui/SelectInput.md): Dropdown input bound to a string value, rendered as a <select> of the provided options.
- [CenteredLayout](ui/CenteredLayout.md): Layout that centres its content with no header/footer and a narrow max-width.
- [SidebarLayout](ui/SidebarLayout.md): Layout with a fixed-width side column (typically navigation) next to a scrollable main content column.
- [Menu](ui/Menu.md): A <menu> list of <MenuItem> children.
- [MenuItem](ui/MenuItem.md): A <li> containing an <a> link, plus optional submenu content shown when this item is "proud".
- [Catcher](ui/Catcher.md): React error boundary that renders a fallback component when any descendant throws.
- [ErrorNotice](ui/ErrorNotice.md): Render a caught error as an inline <Notice> with a retry button.
- [PageCatcher](ui/PageCatcher.md): Error boundary for a whole page that renders a full <ErrorPage> fallback on error.
- [ErrorPage](ui/ErrorPage.md): Render a caught error as a full-page <Page> with a centered <ErrorNotice>.
- [Icon](ui/Icon.md): Render the icon for a given status, coloured to match.
- [Loader](ui/Loader.md): Load a component.
- [PageLoader](ui/PageLoader.md): Load a page.
- [Loading](ui/Loading.md): Animated loading spinner shaped like a Heroicon — a faint track plus a rotating indicator arc.
- [Markup](ui/Markup.md): Parse a markup string and render the resulting elements inline.
- [Tag](ui/Tag.md): Small inline label used to annotate other content.
- [Empty](ui/Empty.md): Message for a list with nothing in it: centred, grey content with space around it.
- [Notice](ui/Notice.md): Block-level status callout with an icon and message, used to highlight feedback.
- [Notices](ui/Notices.md): Render the global list of notices and subscribe to incoming "notice" events.
- [Head](ui/Head.md): Emit the current page's head metadata and sync browser history to its URL.
- [HTML](ui/HTML.md): Render the full <html> document shell wrapping <head> and <body>.
- [Page](ui/Page.md): Wrap a single page (or screen) within an app, applying its meta and head tags.
- [Navigation](ui/Navigation.md): Top-level navigation provider.
- [RouteCache](ui/RouteCache.md): Keep-alive page cache keyed by the current URL — drop it into a layout around its scrolling content region.
- [RoutePath](ui/RoutePath.md): Tell the surrounding <Router> (and <RouteCache>) that this page owns every path that matches a template.
- [Router](ui/Router.md): Match the current URL against routes and render the matched element.
- [Scroll](ui/Scroll.md): Wrap children in a scrollable container with horizontal and/or vertical scrolling enabled.
- [Cell](ui/Cell.md): Table cell.
- [Table](ui/Table.md): Table block — rendered as <table>.
- [CollapseTransition](ui/CollapseTransition.md): Transition that collapses its children in and out by animating their size.
- [FadeTransition](ui/FadeTransition.md): Transition that fades its children in and out by animating their opacity.
- [HorizontalTransition](ui/HorizontalTransition.md): Transition that slides its children horizontally — right when moving forward, left when moving back.
- [Transition](ui/Transition.md): Wrap children in a React View Transition, applying the configured transition classes.
- [VerticalTransition](ui/VerticalTransition.md): Transition that slides its children vertically — down when moving forward, up when moving back.
- [TreeApp](ui/TreeApp.md): Top-level app component for a tree-based documentation site.
- [TreeBreadcrumbs](ui/TreeBreadcrumbs.md): Breadcrumb trail of links to a tree page's ancestors, separated by › arrow icons.
- [TreeButton](ui/TreeButton.md): Small button linking to a specific tree element, resolved by reference string.
- [TreeCard](ui/TreeCard.md): Card renderer for a generic tree-element (a directory or file) — a summary card showing the heading and description.
- [TreeCards](ui/TreeCards.md): Render a list of tree elements as a stack of cards.
- [TreeProvider](ui/TreeProvider.md): Provide a tree to descendants as a flattened lookup map (see flattenTree()).
- [TreeLink](ui/TreeLink.md): Inline Code token linking to a specific tree element, resolved by reference string — the link-styled counterpart of TreeButton.
- [TreeMarkup](ui/TreeMarkup.md): Render a markup string with inline code spans auto-linked to their documented tree elements.
- [TreeMenuItem](ui/TreeMenuItem.md): Default menu item renderer for any tree-* element.
- [TreeMenu](ui/TreeMenu.md): Sidebar navigation menu built from the children of a root tree element.
- [TreePage](ui/TreePage.md): Page renderer for a generic tree-element (a directory or file).
- [TreeRouter](ui/TreeRouter.md): Resolve a URL path to a tree element and render it as a full page.
- [TreeSidebar](ui/TreeSidebar.md): Sidebar built from the surrounding tree, in three sections separated by dividers.

## Functions

- [Address()](ui/Address.md): Show any kind of contact data, rendered as an <address>.
- [Divider()](ui/Divider.md): Horizontal rule separating blocks of content — rendered as <hr>.
- [getButtonClass()](ui/getButtonClass.md): Get the full combined className string for a button from its styling variants.
- [LinkClickable()](ui/LinkClickable.md): Render an <a href=""> element, resolving its href against the current page URL and marking it active when it matches.
- [ButtonClickable()](ui/ButtonClickable.md): Render a <button> element that runs its onClick handler through a BusyStore and shows a loading spinner while busy.
- [SpanClickable()](ui/SpanClickable.md): Render a non-interactive <span> element, used as the fallback when neither href nor onClick is provided.
- [SubmitButton()](ui/SubmitButton.md): Submit button for a form that disables itself and shows a spinner while the form is busy.
- [requireDialogs()](ui/requireDialogs.md): Read the current DialogsStore from the nearest <DialogsContext>.
- [DocumentationApp()](ui/DocumentationApp.md): Documentation app.
- [getDocumentationKindColor()](ui/getDocumentationKindColor.md): Get the raw colour variant for a documented symbol's kind, or undefined for an unknown kind.
- [splitType()](ui/splitType.md): Split a type expression on | into its individual union members.
- [callNotifiedForm()](ui/callNotifiedForm.md): Run a form submit callback and publish success/error notices based on its return or thrown value.
- [awaitNotifiedForm()](ui/awaitNotifiedForm.md): Await a pending submit result and publish a success or error notice to a form once it settles.
- [notifyThrownForm()](ui/notifyThrownForm.md): Notify the user about a value thrown during submit, storing string errors as form field messages.
- [requireForm()](ui/requireForm.md): Hook that returns the current form's FormStore from context.
- [useField()](ui/useField.md): Hook that returns the input props for a single named field of a form.
- [FormNotify()](ui/FormNotify.md): Publish the current form's "main" (unnamed) message as a global success notice whenever it changes.
- [ArrayRadioInputs()](ui/ArrayRadioInputs.md): Output a list of <RadioInput> elements for each item in an array.
- [CheckboxInput()](ui/CheckboxInput.md): Checkbox input bound to a boolean value, rendered as a labelled <input type="checkbox">.
- [DateInput()](ui/DateInput.md): Date, time, or datetime input that accepts a PossibleDate and emits an ISO string value.
- [FileInput()](ui/FileInput.md): File picker input that emits the selected File through onValue.
- [getInputClass()](ui/getInputClass.md): Build the shared base className for a form input from its styling variants — the base input class plus any InputVariants.
- [NumberInput()](ui/NumberInput.md): Numeric input bound to a number value, parsing typed text and reformatting it on blur.
- [Popover()](ui/Popover.md): Trigger element that reveals a floating popover panel beside it when active or focused.
- [QueryInputBase()](ui/QueryInputBase.md): Text input that queries a list of items, then shows the list in a popover or inline.
- [RadioInput()](ui/RadioInput.md): Single <input type="radio"> wrapped in a <label> styled as an <Input>.
- [isSchemaRequired()](ui/isSchemaRequired.md): Whether a schema is required, i.e. not wrapped in an OptionalSchema or NullableSchema.
- [TextareaInput()](ui/TextareaInput.md): Multiline text input bound to a string value, rendered as a <textarea> that grows to fit its content.
- [TextInput()](ui/TextInput.md): Single-line text input bound to a string value, rendered as an <input>. Use TextareaInput for multiline text.
- [createMapper()](ui/createMapper.md): Create a [Mapping, Mapper] pair of components backed by their own private React context.
- [requireMeta()](ui/requireMeta.md): Read the current Meta context, optionally merging in additional meta data.
- [requireMetaURL()](ui/requireMetaURL.md): Read the current Meta context and derive URL helpers (path and params) from its url.
- [getTagClass()](ui/getTagClass.md): Build the combined className string for a <Tag> from its styling variants.
- [Message()](ui/Message.md): Status-coloured paragraph used for inline feedback messages.
- [requireNavigation()](ui/requireNavigation.md): Read the current NavigationStore from context, throwing if used outside <Navigation>.
- [getBlockClass()](ui/getBlockClass.md): Get the combined className string for a block from its styling variants.
- [getColorClass()](ui/getColorClass.md): CSS class that applies color tinting to an element.
- [getDurationClass()](ui/getDurationClass.md): Get the transition-duration class for a component from its duration variant prop.
- [getFlexClass()](ui/getFlexClass.md): Get the flex layout class for a component from its flex variant props.
- [getGapClass()](ui/getGapClass.md): Get the gap class for a component from its gap variant prop.
- [getGridClass()](ui/getGridClass.md): Get the grid layout class for a component from its grid variant props.
- [getIndentClass()](ui/getIndentClass.md): Get the inline-padding ("indent") class for a component from its indent variant prop.
- [getPaddingClass()](ui/getPaddingClass.md): Get the block-padding class for a component from its padding variant prop.
- [getRadiusClass()](ui/getRadiusClass.md): Get the corner-radius class for a component from its radius variant prop.
- [getScrollClass()](ui/getScrollClass.md): Get the scroll class for a component from its horizontal / vertical variant props.
- [getShadowClass()](ui/getShadowClass.md): Get the drop-shadow class for a component from its shadow variant prop.
- [getSpaceClass()](ui/getSpaceClass.md): Get the block spacing class for a component from its space="" variant prop.
- [getStatusClass()](ui/getStatusClass.md): Get the status tint class for a component from its status variant prop.
- [getStrokeClass()](ui/getStrokeClass.md): Get the border-thickness class for a component from its stroke variant prop.
- [getTypographyClass()](ui/getTypographyClass.md): Get the typography class for a component from its typographic variant props.
- [getWidthClass()](ui/getWidthClass.md): Get the width class for a component from its width / grow variant props.
- [useTransitionValue()](ui/useTransitionValue.md): Read a store's value, and re-render inside startTransition() when it changes, so <ViewTransition> boundaries animate.
- [setTransitionType()](ui/setTransitionType.md): Type-safe passthrough for React's addTransitionType() that checks type is one of our known view-transition types.
- [useTreeMap()](ui/useTreeMap.md): Use the flattened tree lookup map from context.
- [getTreeElement()](ui/getTreeElement.md): Resolve a reference string to its tree element — by exact key first, then by a normalised key with the prose display decorations stripped.
- [matchMenuElement()](ui/matchMenuElement.md): Match an element that should appear in the sidebar menu.
- [requireContext()](ui/requireContext.md): Use the value of a React Context, or throw RequiredError if the context was unset.
- [getClass()](ui/getClass.md): Parse a list of possible className strings and join them into a single string.
- [getModuleClass()](ui/getModuleClass.md): Parse a list of possible className strings, match them in a CSSModule dictionary, and join them into a single string.
- [eventPreventDefault()](ui/eventPreventDefault.md): Call event.preventDefault() on an event.
- [focusFirstFocusable()](ui/focusFirstFocusable.md): Focus on the first focusable element inside an element.
- [loopFocus()](ui/loopFocus.md): Loop focus inside an element so it can't escape — refocus the first focusable child when focus moves out.
- [eventLoopFocus()](ui/eventLoopFocus.md): Loop focus inside an element in response to a blur event — a ready-made onBlur handler that traps focus.
- [joinMetaCSP()](ui/joinMetaCSP.md): Turn a deconstructed MetaCSP into a Content-Security-Policy string.
- [joinTitles()](ui/joinTitles.md): Join several page or site titles together with - , skipping empty values.
- [mergeMeta()](ui/mergeMeta.md): Merge a PossibleMeta onto an existing Meta, resolving URLs and assets in the process.
- [createMeta()](ui/createMeta.md): Create a fully-formed Meta from a PossibleMeta.
- [mergeMetaURL()](ui/mergeMetaURL.md): Merge a new metadata URL onto the current one, resolving it and applying params.
- [mergeMetaTags()](ui/mergeMetaTags.md): Merge two sets of meta <meta> tags, with next taking precedence over current.
- [mergeMetaLinks()](ui/mergeMetaLinks.md): Merge two meta <link> lists, resolving the new hrefs to absolute URIs.
- [mergeMetaAssets()](ui/mergeMetaAssets.md): Merge two meta asset lists (modules, scripts, stylesheets), resolving the new hrefs to absolute URIs.
- [notify()](ui/notify.md): Notify the user with a message by dispatching a notice event.
- [notifySuccess()](ui/notifySuccess.md): Notify the user with a success message by dispatching a notice event with "success" status.
- [notifyError()](ui/notifyError.md): Notify the user with an error message by dispatching a notice event with "error" status.
- [notifyThrown()](ui/notifyThrown.md): Look at a thrown value, extract a viable message from it, and dispatch an error notice.
- [subscribeNotices()](ui/subscribeNotices.md): Subscribe to notice events on an element and call a callback when they happen.
- [callNotified()](ui/callNotified.md): Run a callback and dispatch a success or error notice to the window based on its return or throw.
- [awaitNotified()](ui/awaitNotified.md): Await a pending value and dispatch a success or error notice to the window based on its resolution.
- [callNotifiedElement()](ui/callNotifiedElement.md): Run a callback and dispatch a success or error notice to a specific element based on its return or throw.
- [awaitNotifiedElement()](ui/awaitNotifiedElement.md): Await a pending value and dispatch a success or error notice to a specific element based on its resolution.
- [useRefresh()](ui/useRefresh.md): Re-render a component automatically on a fixed interval.
- [useScrollIntersect()](ui/useScrollIntersect.md): Fire callbacks when a referenced element enters or leaves the visible scrolling area.
- [getMostVisibleObserverEntry()](ui/getMostVisibleObserverEntry.md): Find the most-visible entry in a list of IntersectionObserverEntry objects.
- [useDebouncedState()](ui/useDebouncedState.md): Hold a piece of state that only updates after a debounce delay since the last set.
- [useDebouncedCallback()](ui/useDebouncedCallback.md): Wrap a callback so it only runs after a debounce delay since the last invocation.

## Classes

- [DialogsStore](ui/DialogsStore.md): Store holding the live list of open <Dialog> elements.
- [FormStore](ui/FormStore.md): Reactive store holding the current (possibly partial and invalid) value of a form, plus its field messages.
- [NoticesStore](ui/NoticesStore.md): Store holding the live list of NoticeStore notices currently shown.
- [NoticeStore](ui/NoticeStore.md): Store holding a single notice's content and status, owned by a NoticesStore.
- [NavigationStore](ui/NavigationStore.md): Store holding the current navigation URL and driving browser history.

## Interfaces

- [AppProps](ui/AppProps.md): Props for <App> — the root Meta plus the application children.
- [AddressProps](ui/AddressProps.md): Props for Address — colour, space, and typography variants plus required children.
- [PhysicalAddressProps](ui/PhysicalAddressProps.md): Props for PhysicalAddress — an optional name and a nullable AddressData object.
- [EmailAddressProps](ui/EmailAddressProps.md): Props for EmailAddress — an optional name and a nullable email string.
- [BlockProps](ui/BlockProps.md): Props for Block — colour, space, typography, and width variants plus an optional as element override.
- [BlockquoteProps](ui/BlockquoteProps.md): Props for Blockquote — colour, space, and typography variants plus optional children.
- [CaptionProps](ui/CaptionProps.md): Props for Caption — colour, space, and typography variants plus optional children.
- [CardProps](ui/CardProps.md): Props for Card — combines ClickableProps (for navigable cards) with colour, status, padding, space, typography, width, and shadow variants.
- [ColumnProps](ui/ColumnProps.md): Props for the <Column> component.
- [DefinitionsProps](ui/DefinitionsProps.md): Props for Definitions — colour, gap, space, and typography variants plus optional children.
- [DetailsProps](ui/DetailsProps.md): Props for <Details> — the summary title, the revealed content, and the open state.
- [DividerProps](ui/DividerProps.md): Props for Divider — space and colour variants.
- [GridProps](ui/GridProps.md): Props for the <Grid> component.
- [HeadingProps](ui/HeadingProps.md): Props shared by <Title>, Heading, and <Subheading> — colour, space, and typography variants plus a heading-level override.
- [ImageProps](ui/ImageProps.md): Props for Image — an src, optional alt text, plus space and width variants.
- [LabelProps](ui/LabelProps.md): Props for Label — identical to HeadingProps.
- [ListProps](ui/ListProps.md): Props for List — colour, gap, space, and typography variants plus its list items and an ordered toggle.
- [PanelProps](ui/PanelProps.md): Props for Panel — colour, status, and typography variants plus optional children.
- [ParagraphProps](ui/ParagraphProps.md): Props for Paragraph — colour, space, and typography variants.
- [PreformattedProps](ui/PreformattedProps.md): Props for Preformatted — space, colour, typography, width, and padding variants plus a wrap toggle.
- [ProseProps](ui/ProseProps.md): Props for Prose — just the longform children to style.
- [RowProps](ui/RowProps.md): Props for the <Row> component.
- [SectionProps](ui/SectionProps.md): Props for Section and its semantic siblings — colour, space, typography, and width variants plus an optional as element override.
- [VideoProps](ui/VideoProps.md): Props for Video — space and width variants plus optional children.
- [ButtonVariants](ui/ButtonVariants.md): Styling variants for a Button: the block variants (space, padding, indent, width, typography), flex, and status, plus button-specific toggles.
- [ButtonProps](ui/ButtonProps.md): Component props for a <Button> component.
- [ClickableProps](ui/ClickableProps.md): Props for a thing that can be clicked — either has a string href link or an onClick callback handler.
- [StylableClickableProps](ui/StylableClickableProps.md): Props for a clickable that also accepts a className for styling.
- [FullscreenButtonProps](ui/FullscreenButtonProps.md): Component props for a <FullscreenButton>
- [RetryButtonProps](ui/RetryButtonProps.md): Component props for <RetryButton>
- [SubmitButtonProps](ui/SubmitButtonProps.md): Component props for <SubmitButton>, a form submit button.
- [DialogProps](ui/DialogProps.md): Props for <Dialog> — optional children content and an onClose callback.
- [DialogCloseButtonProps](ui/DialogCloseButtonProps.md): Props for <DialogCloseButton> — button styling variants and optional children to override the X icon.
- [DialogsContextProps](ui/DialogsContextProps.md): Props for <DialogsContext> — the children subtree the dialogs store is provided to.
- [DialogsProps](ui/DialogsProps.md): Props for <Dialogs> — takes no props (branded empty interface).
- [ModalVariants](ui/ModalVariants.md): Variant props for <Modal> — pin the panel to one edge of the screen.
- [ModalProps](ui/ModalProps.md): Props for <Modal> — edge, padding, indent, radius, and shadow variants, optional children content, and an optional className.
- [DocumentationButtonsProps](ui/DocumentationButtonsProps.md): Props for DocumentationButtons — the relational metadata of a documented symbol (class, extends, implements), plus block-space and flex overrides.
- [DocumentationDescriptionProps](ui/DocumentationDescriptionProps.md): Props for DocumentationDescription — a description cell's resolved text, plus an optional default/optionality note.
- [DocumentationKindProps](ui/DocumentationKindProps.md): Props for DocumentationKind — a TagProps plus the documented symbol's kind.
- [DocumentationParamsProps](ui/DocumentationParamsProps.md): Props for DocumentationParams — the parameter list to render, one row per parameter.
- [DocumentationPropertiesProps](ui/DocumentationPropertiesProps.md): Props for DocumentationProperties — the data members of a class/interface/object-literal type to render, one row each.
- [DocumentationReferencesProps](ui/DocumentationReferencesProps.md): Props for DocumentationReferences — the referenced type names to render, one row each.
- [DocumentationReturnsProps](ui/DocumentationReturnsProps.md): Props for DocumentationReturns — the @returns entries to render, one row each.
- [DocumentationSignaturesProps](ui/DocumentationSignaturesProps.md): Props for DocumentationSignatures — the type signatures to render, one block per overload.
- [DocumentationThrowsProps](ui/DocumentationThrowsProps.md): Props for DocumentationThrows — the @throws entries to render, one row each.
- [DocumentationTypeProps](ui/DocumentationTypeProps.md): Props for DocumentationType — the union members to render (see splitType()).
- [FieldProps](ui/FieldProps.md): Props for Field, a labelled wrapper around a form control.
- [FormProps](ui/FormProps.md): Props for Form, the schema-driven form wrapper component.
- [FormFooterProps](ui/FormFooterProps.md): Props for FormFooter, the submit-button-and-message footer for a form.
- [FormInputProps](ui/FormInputProps.md): Props for FormInput, a bare SchemaInput bound to a named form field.
- [ProgressProps](ui/ProgressProps.md): Props for Progress, a continuous horizontal progress bar.
- [CodeProps](ui/CodeProps.md): Props for Code — colour and typography variants, optional children, plus a plain toggle.
- [DeletedProps](ui/DeletedProps.md): Props for Deleted — colour and typography variants, plus optional children.
- [EmphasisProps](ui/EmphasisProps.md): Props for Emphasis — optional children.
- [InsertedProps](ui/InsertedProps.md): Props for Inserted — colour and typography variants, plus optional children.
- [LinkProps](ui/LinkProps.md): Props for Link — ClickableProps (href for navigation or onClick for actions) plus colour and typography variants.
- [MarkProps](ui/MarkProps.md): Props for Mark — optional children.
- [SmallProps](ui/SmallProps.md): Props for Small — optional children.
- [SpanProps](ui/SpanProps.md): Props for Span — colour and typography variants, plus optional children.
- [StrongProps](ui/StrongProps.md): Props for Strong — optional children.
- [SubscriptProps](ui/SubscriptProps.md): Props for Subscript — optional children.
- [SuperscriptProps](ui/SuperscriptProps.md): Props for Superscript — optional children.
- [WhenProps](ui/WhenProps.md): Props for When, Ago, and Until — a target date plus an optional current reference date and full toggle.
- [AgoProps](ui/AgoProps.md): Props for Ago — identical to WhenProps.
- [UntilProps](ui/UntilProps.md): Props for Until — identical to WhenProps.
- [ArrayCheckboxInputsProps](ui/ArrayCheckboxInputsProps.md): Props for ArrayCheckboxInputs, which renders a checkbox for each item in an array of values.
- [ArrayInputProps](ui/ArrayInputProps.md): Props for ArrayInput, a repeating input that edits an array of schema-validated items.
- [ArrayRadioInputsProps](ui/ArrayRadioInputsProps.md): Props for ArrayRadioInputs, which renders a radio for each item in an array of values.
- [ButtonInputProps](ui/ButtonInputProps.md): Props for ButtonInput, a clickable element styled to match form inputs.
- [CheckboxProps](ui/CheckboxProps.md): Props for CheckboxInput, a boolean-valued checkbox input.
- [ChoiceRadioInputsProps](ui/ChoiceRadioInputsProps.md): Props for ChoiceRadioInputs, which renders a radio for each entry in a ChoiceOptions set.
- [DataInputProps](ui/DataInputProps.md): Props for DataInput, a composite input that edits an object of schema-validated sub-fields.
- [DateInputProps](ui/DateInputProps.md): Props for DateInput, a date/time <input> that emits an ISO string value.
- [DictionaryInputProps](ui/DictionaryInputProps.md): Props for DictionaryInput, a repeating input that edits a dictionary of schema-validated items.
- [FileInputProps](ui/FileInputProps.md): Props for FileInput, an <input type="file"> that emits the selected File.
- [ImageInputProps](ui/ImageInputProps.md): Props for <ImageInput>, a square image picker that emits the picked File.
- [InputVariants](ui/InputVariants.md): Styling variants shared by every form input — the block variants: space, padding, indent, width, and typography.
- [InputProps](ui/InputProps.md): Base props shared by every form input (name, title, placeholder, required/disabled state, and error message).
- [ValueInputProps](ui/ValueInputProps.md): "Value inputs" are inputs that generate a value, like <input> or <textarea>
- [InputWrapperProps](ui/InputWrapperProps.md): Props for InputWrapper — the wrapped children plus an optional className.
- [NumberInputProps](ui/NumberInputProps.md): Props for NumberInput, a text-based numeric input bound to a number value.
- [OutputInputProps](ui/OutputInputProps.md): Props for OutputInput, a read-only <output> styled to match form inputs.
- [PopoverProps](ui/PopoverProps.md): Props for Popover, a trigger element that reveals floating content.
- [PopoverButtonProps](ui/PopoverButtonProps.md): Props for PopoverButton — all the Button styling variants, plus children whose first node is the button label and the rest the popover contents.
- [PopoverButtonInputProps](ui/PopoverButtonInputProps.md): Props for PopoverButtonInput — the shared InputProps, plus children whose first node is the button label and the rest the popover contents.
- [QueryCheckboxesInputProps](ui/QueryCheckboxesInputProps.md): Props for QueryCheckboxesInput, a combo box that queries items of type O from an input of type I, and picks any number of them.
- [QueryInputBaseProps](ui/QueryInputBaseProps.md): Props shared by QueryRadiosInput and QueryCheckboxesInput.
- [QueryRadiosInputProps](ui/QueryRadiosInputProps.md): Props for QueryRadiosInput, a combo box that queries items of type O from an input of type I, and picks one.
- [RadioInputProps](ui/RadioInputProps.md): Props for RadioInput, a single labelled radio button styled as an input.
- [SchemaInputProps](ui/SchemaInputProps.md): Props for SchemaInput and its variants: a schema plus the value input props it drives.
- [DateSchemaInputProps](ui/DateSchemaInputProps.md): Props for DateSchemaInput, the DateSchema input variant.
- [NumberSchemaInputProps](ui/NumberSchemaInputProps.md): Props for NumberSchemaInput, the NumberSchema input variant.
- [ChoiceSchemaInputProps](ui/ChoiceSchemaInputProps.md): Props for ChoiceSchemaInput, the ChoiceSchema input variant.
- [BooleanSchemaInputProps](ui/BooleanSchemaInputProps.md): Props for BooleanSchemaInput, the BooleanSchema input variant.
- [StringSchemaInputProps](ui/StringSchemaInputProps.md): Props for StringSchemaInput, the StringSchema input variant.
- [ArraySchemaInputProps](ui/ArraySchemaInputProps.md): Props for ArraySchemaInput, the ArraySchema input variant.
- [DictionarySchemaInputProps](ui/DictionarySchemaInputProps.md): Props for DictionarySchemaInput, the DictionarySchema input variant.
- [DataSchemaInputProps](ui/DataSchemaInputProps.md): Props for DataSchemaInput, the DataSchema input variant.
- [SchemaFieldProps](ui/SchemaFieldProps.md): Props for SchemaField: SchemaInput props plus optional children to override the input.
- [SelectProps](ui/SelectProps.md): Props for SelectInput, a dropdown <select> bound to a string value.
- [TextareaInputProps](ui/TextareaInputProps.md): Props for TextareaInput, a multiline text input bound to a string value.
- [TextInputProps](ui/TextInputProps.md): Props for TextInput, a single-line text input bound to a string value.
- [CenteredLayoutProps](ui/CenteredLayoutProps.md): Props for <CenteredLayout> — optional children plus width (of the centred column) and padding / indent (block / inline padding of the scroll area) variants.
- [SidebarLayoutProps](ui/SidebarLayoutProps.md): Props for <SidebarLayout> — the sidebar column content, main children, and a right placement flag.
- [MenuProps](ui/MenuProps.md): Props for <Menu> — optional <MenuItem> children.
- [MenuItemProps](ui/MenuItemProps.md): Props for <MenuItem> — <Clickable> props plus children whose first node is the label and the rest the submenu.
- [ErrorProps](ui/ErrorProps.md): Props for a component that renders a caught error reason.
- [CatcherProps](ui/CatcherProps.md): Props for <Catcher> — the children to guard plus the as component used to render any caught error.
- [IconProps](ui/IconProps.md): Props for <Icon> — the status to represent and optional icon size.
- [LoaderProps](ui/LoaderProps.md): Props for <Loader> and <PageLoader> — the children to load plus an optional fallback shown while they suspend.
- [MappingProps](ui/MappingProps.md): Props for the Mapping component returned by createMapper().
- [MapperProps](ui/MapperProps.md): Props for the Mapper component returned by createMapper().
- [MarkupProps](ui/MarkupProps.md): Props for <Markup> — extends MarkupOptions so callers can override rules, rel, url, root, or schemes directly.
- [MetaURL](ui/MetaURL.md): A Meta object with a guaranteed url, plus derived path and params properties.
- [TagVariants](ui/TagVariants.md): Styling variants accepted by <Tag> — status, colour, and typography options.
- [TagProps](ui/TagProps.md): Props for <Tag> — TagVariants styling options plus <Clickable> props (href, onClick, children, etc.).
- [EmptyProps](ui/EmptyProps.md): Props for <Empty> — the message content plus an optional className.
- [MessageProps](ui/MessageProps.md): Props for <Message> — paragraph props plus colour and status styling variants.
- [NoticeProps](ui/NoticeProps.md): Props for <Notice> — flex/colour/status styling variants, optional children, and an optional icon.
- [NoticesProps](ui/NoticesProps.md): Props for <Notices> — the corner for the list, and flex styling variants for the notices container.
- [HTMLProps](ui/HTMLProps.md): Props for <HTML> — initial Meta (language/root/app) plus the page children.
- [PageProps](ui/PageProps.md): Props for <Page> — per-page Meta (title, description, etc.) plus the page children.
- [NavigationProps](ui/NavigationProps.md): Props for <Navigation> — initial Meta (url/base) plus optional children.
- [RouteCacheProps](ui/RouteCacheProps.md): Props for <RouteCache> — the maxCached size and the content children to keep alive per URL.
- [RouteState](ui/RouteState.md): The route state of one page, shared by <Router>, <RouteCache> and <RoutePath>.
- [RoutePathProps](ui/RoutePathProps.md): Props for <RoutePath> — the path template the page owns, and the page content.
- [RouterProps](ui/RouterProps.md): Props for <Router> — the routes to match against plus an optional fallback.
- [BlockVariants](ui/BlockVariants.md): Variants for block level elements.
- [ColorVariants](ui/ColorVariants.md): Variant props for colouring an element, e.g. color="purple".
- [DurationVariants](ui/DurationVariants.md): Variant props for the transition duration of an element, e.g. duration="fast".
- [FlexVariants](ui/FlexVariants.md): Variant props for flex layout — opt-in modifiers any component can mix in via getFlexClass().
- [GapVariants](ui/GapVariants.md): Variant props for the gap between a component's children, e.g. gap="large".
- [GridVariants](ui/GridVariants.md): Variant props for grid layout, e.g. columns={3} gap="normal".
- [IndentVariants](ui/IndentVariants.md): Variant props for the inline-padding ("indent", left + right) of a component, e.g. indent="normal".
- [PaddingVariants](ui/PaddingVariants.md): Variant props for the block-padding (top + bottom) of a component, e.g. padding="large".
- [RadiusVariants](ui/RadiusVariants.md): Variant props for the corner radius of an element, e.g. radius="large".
- [ScrollVariants](ui/ScrollVariants.md): Variant props selecting which scroll axes are enabled on an element.
- [ScrollComponentProps](ui/ScrollComponentProps.md): Props for the Scroll component — children plus scroll-axis variants.
- [ShadowVariants](ui/ShadowVariants.md): Variant props for the drop shadow of an element, e.g. shadow="large".
- [SpaceVariants](ui/SpaceVariants.md): Variants to control block spacing on components, e.g. space="large".
- [StatusVariants](ui/StatusVariants.md): Variant props for the semantic status of an element, e.g. status="success".
- [StrokeVariants](ui/StrokeVariants.md): Variant props for the border thickness of a component, e.g. stroke="thick".
- [TypographyVariants](ui/TypographyVariants.md): Typographic variant props — colour, font-family, weight, case, size, tint, alignment, wrap, and truncate, applied via getTypographyClass()
- [WidthVariants](ui/WidthVariants.md): Variant props that set (or unconstrain) a component's width, e.g. width="narrow" or width="12x".
- [CellProps](ui/CellProps.md): Props for Cell — padding, indent, width, and typography variants plus children.
- [TableProps](ui/TableProps.md): Props for Table — colour, space, typography, and width variants plus children.
- [CollapseTransitionProps](ui/CollapseTransitionProps.md): Props for the CollapseTransition component — the shared transition variant props.
- [FadeTransitionProps](ui/FadeTransitionProps.md): Props for the FadeTransition component — the shared transition variant props.
- [HorizontalTransitionProps](ui/HorizontalTransitionProps.md): Props for the HorizontalTransition component — the shared transition variant props.
- [TransitionVariants](ui/TransitionVariants.md): Variant props shared by every transition component.
- [TransitionProps](ui/TransitionProps.md): React props for <Transition> component.
- [VerticalTransitionProps](ui/VerticalTransitionProps.md): Props for the VerticalTransition component — the shared transition variant props.
- [TreeAppProps](ui/TreeAppProps.md): Props for the TreeApp component — the tree to render plus optional extra routes and app meta.
- [TreeBreadcrumbsProps](ui/TreeBreadcrumbsProps.md): Props for the TreeBreadcrumbs component — typography, space, and flex variant props.
- [TreeButtonProps](ui/TreeButtonProps.md): Props for the TreeButton component — the element reference plus button variants.
- [TreeCardsProps](ui/TreeCardsProps.md): Props for the TreeCards component — the tree elements to render as cards.
- [TreeLinkProps](ui/TreeLinkProps.md): Props for the TreeLink component — the element reference plus an optional label.
- [TreeMenuProps](ui/TreeMenuProps.md): Props for the TreeMenu component — the root tree element plus its URL path.
- [TreeRouterProps](ui/TreeRouterProps.md): Props for the TreeRouter component — the tree to route plus an optional fallback and app meta.
- [TreeSidebarProps](ui/TreeSidebarProps.md): Props for the TreeSidebar component.
- [Variants](ui/Variants.md): Dictionary of boolean variant flags whose true-valued keys become class names.
- [Meta](ui/Meta.md): Combined meta data for a website page — title, URLs, description, CSP, tags, links, and assets.
- [PossibleMeta](ui/PossibleMeta.md): Input metadata that can be parsed and converted to a fully-resolved Meta.
- [ChildProps](ui/ChildProps.md): Props for a component that requires children.
- [OptionalChildProps](ui/OptionalChildProps.md): Props for a component that optionally accepts children.
- [ClassProps](ui/ClassProps.md): Props for a component that accepts an additional className, merged after the classes the component computes for itself.

## Types

- [BlockElement](ui/BlockElement.md): Semantic element names a block element may render as via its as prop.
- [SubheadingProps](ui/SubheadingProps.md): Props for Subheading — identical to HeadingProps.
- [TitleProps](ui/TitleProps.md): Props for Title — identical to HeadingProps.
- [ClickableCallback](ui/ClickableCallback.md): Handler for a clickable onClick event.
- [FormCallback](ui/FormCallback.md): Callback invoked when a Form is submitted with its validated data.
- [PopoverChildren](ui/PopoverChildren.md): Children tuple for Popover: a leading trigger node followed by the popover's contents.
- [TextFormatter](ui/TextFormatter.md): Formats a string for display in a text input.
- [Mapping](ui/Mapping.md): Dispatch table from a JSX.IntrinsicElements key to a renderer component.
- [NoticesPosition](ui/NoticesPosition.md): Corner of the screen where <Notices> shows the list of notices.
- [RouteProps](ui/RouteProps.md): Props for a component that works as a route in the router.
- [RouteComponent](ui/RouteComponent.md): React component usable as a route value — a function or class component accepting RouteProps.
- [Route](ui/Route.md): Valid route values:
- [Routes](ui/Routes.md): Route table mapping { path: RouteComponent | redirectPath | ReactElement } for a <Router>.
- [ColorVariant](ui/ColorVariant.md): Enumerated colour names selectable via the color="purple" prop for components that support that support ColorVariants
- [DurationValue](ui/DurationValue.md): Allowed values for transition timing for components that support DurationVariants
- [ColumnsVariant](ui/ColumnsVariant.md): Number of equal-width columns selectable via the columns variant prop.
- [IndentVariant](ui/IndentVariant.md): Allowed values for inline-padding ("indent") for components that support IndentVariants
- [RadiusVariant](ui/RadiusVariant.md): Allowed values for border radius for components that support RadiusVariants
- [ShadowVariant](ui/ShadowVariant.md): Enumerated drop-shadow scale selectable via the shadow="normal" variant prop.
- [SpaceValue](ui/SpaceValue.md): Allowed values for block spacing for components that support SpaceVariants
- [Status](ui/Status.md): Allowed status names selected via the status="info" prop for components that support that support StatusVariants
- [StrokeVariant](ui/StrokeVariant.md): Allowed values for border thickness for components that support StrokeVariants
- [TintVariant](ui/TintVariant.md): Shades of the currently selected tint color, from "00" (black) through "50" (the hue itself) to "100" (white).
- [SizeVariant](ui/SizeVariant.md): Allowed values for font size for components that support TypographyVariants
- [WeightVariant](ui/WeightVariant.md): Allowed values for font weight for components that support TypographyVariants
- [CaseVariant](ui/CaseVariant.md): Allowed values for text case for components that support TypographyVariants
- [FontVariant](ui/FontVariant.md): Allowed values for font family for components that support TypographyVariants
- [WidthVariant](ui/WidthVariant.md): Enumerated width selectable via the width variant prop.
- [TransitionClasses](ui/TransitionClasses.md): Map of view-transition types to their CSS class names in { type: className } format.
- [TransitionType](ui/TransitionType.md): Known view-transition type names that all transitions support — the keys of TransitionClasses.
- [Classes](ui/Classes.md): Set of classnames that can be joined into a single className string.
- [CSSModule](ui/CSSModule.md): CSS modules mapping of local class names to hashed runtime class names.
- [MetaTags](ui/MetaTags.md): Set of named meta <meta /> tags in { name: content } format.
- [MetaLinks](ui/MetaLinks.md): Set of resolved meta <link /> tags in { rel: href } format (hrefs already absolutified to ImmutableURI).
- [PossibleMetaLinks](ui/PossibleMetaLinks.md): Set of input meta <link /> tags in { rel: href } format, before hrefs are resolved.
- [MetaAssets](ui/MetaAssets.md): Set of resolved linked assets in (href)[] format (hrefs already absolutified to ImmutableURI).
- [PossibleMetaAssets](ui/PossibleMetaAssets.md): Set of input linked assets in (href)[] format, before hrefs are resolved.
- [MetaCSP](ui/MetaCSP.md): Type for a meta Content-Security-Policy tag in { resource: string[] } format.
- [NoticeCallback](ui/NoticeCallback.md): Callback that can return or throw a value, triggering a success or error notice accordingly.

## Constants

- [RetryContext](ui/RetryContext.md): Context for providing a "retry" callback to descendant <RetryButton> elements.
- [FormContext](ui/FormContext.md): React context holding the current FormStore, provided by the Form component.
- [LOADING_INPUT](ui/LOADING_INPUT.md): Input that is loading.
- [LOADING](ui/LOADING.md): Shared loading spinner element with a stable key, ready to drop into Suspense fallbacks and lists.
- [MetaContext](ui/MetaContext.md): React context holding the current Meta object (page URL, site root, title, etc.).
- [EMPTY_LOADING](ui/EMPTY_LOADING.md): Loading spinner in an <Empty>, for a list or form that is still loading. The empty message replaces it in the same place.
- [LOADING_NOTICE](ui/LOADING_NOTICE.md): Shared loading <Notice> element showing the loading spinner.
- [NOTICES](ui/NOTICES.md): Global NoticesStore shown by <Notices>, accepting any of the default statuses.
- [NavigationContext](ui/NavigationContext.md): React context holding the current NavigationStore, provided by <Navigation>.
- [RouteContext](ui/RouteContext.md): React context holding the RouteState of the current page, provided by <Router> and <RouteCache>.
- [STATUSES](ui/STATUSES.md): Tuple of the status names selectable via the status variant prop.
- [TINT_CLASS](ui/TINT_CLASS.md): CSS class that (re)calculates the full ladder of tint shades from the current global tint colour.
- [TreeContext](ui/TreeContext.md): React context holding a flattened key → element map of the surrounding tree(s).
- [TREE_CODE_RULE](ui/TREE_CODE_RULE.md): Markup rule that renders an inline code span as a tree-resolved <TreeLink> instead of a plain <code>.
- [TREE_MARKUP_RULES](ui/TREE_MARKUP_RULES.md): Default markup rules with the inline-code rule swapped for TREE_CODE_RULE — every backtick span auto-links to its documented token.
