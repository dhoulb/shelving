# Head

- Kind: component
- Import: `import { Head } from "shelving/ui";`

Emit the current page's head metadata, and replace the browser URL with the page's canonical URL.
- Emits hoistable head elements (title, meta, links, stylesheets, scripts) inline; React 19 hoists each one into the document `<head>`.
- Does not render `<base>` (not hoistable — that lives in `<Head>` in the `<HTML>` shell component).
- When the meta `url` differs from the browser URL (a page that knows its canonical URL), calls `NavigationStore.replace()` with it. Outside `<Navigation>` it does not touch history.

Low-level emitter of hoistable head metadata from the current `Meta` context. It outputs `<title>`, `<meta>`, `<link>`, stylesheet, module, and script elements inline, and React 19 hoists each one into the document `<head>`. It also syncs `window.history` to the page URL.

**Things to know:**

- `<Page>` renders `<Head>` automatically — you rarely need it directly.
- It does not render `<base>`, which is not hoistable; that lives in the `<HTML>` shell.
- The composed title combines the page `title` with the app name from context.

## Usage

```tsx
import { Page, Head } from "shelving/ui";

// <Page> already renders <Head> for you; render it directly only for custom shells.
<Page title="Settings">
  <Head/>
  …
</Page>
```


## Signatures

```ts
Head(): ReactElement
```

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |
