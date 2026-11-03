# Head

- Kind: component
- Import: `import { Head } from "shelving/ui";`

Emit the current page's head metadata and sync browser history to its URL.
- Emits hoistable head elements (title, meta, links, stylesheets, scripts) inline; React 19 hoists each one into the document `<head>`.
- Does not render `<base>` (not hoistable — that lives in `<Head>` in the `<HTML>` shell component).
- Updates `window.history` to match the page URL.

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
