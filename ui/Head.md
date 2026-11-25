# Head

- Kind: component
- Import: `import { Head } from "shelving/ui";`

Emit the current page's head metadata, and replace the browser URL with the page's canonical URL.
- On the server, emits hoistable head elements (title, meta, links, stylesheets, scripts) inline; React 19 hoists each one into the document `<head>`.
- In the browser, it emits only links, stylesheets and scripts, and sets `document.title`. The browser ignores the other tags after the page loads (only crawlers and link previews read them, from the server HTML), and React never removes duplicate `<title>` and `<meta>` tags, so each nested or stacked `<Page>` would add its own copies.
- In the browser, the title is the title of the deepest `<Page>` on the page the browser history is on (the same `stack` and `ordinal`). It updates on each navigation, so a page kept in its stack (for swipe-back) gets its title back when you return to it.
- Does not render `<base>` (not hoistable — that lives in `<Head>` in the `<HTML>` shell component).
- When the meta `url` differs from the browser URL (a page that knows its canonical URL), calls `NavigationSequence.replace()` with it. It only does this for the page the browser history is on (the same `stack` and `ordinal`), so a page shown ahead of history, such as a swipe-back preview, leaves history alone. Outside `<Navigation>` it does not touch history.

Low-level emitter of hoistable head metadata from the current `Meta` context. On the server it outputs `<title>`, `<meta>`, `<link>`, stylesheet, module, and script elements inline, and React 19 hoists each one into the document `<head>`. It also syncs `window.history` to the page URL.

**Things to know:**

- `<Page>` renders `<Head>` automatically — you rarely need it directly.
- It does not render `<base>`, which is not hoistable; that lives in the `<HTML>` shell.
- The composed title combines the page `title` with the app name from context.
- In the browser it emits only links, stylesheets and scripts, and sets `document.title` instead of a `<title>`. The browser ignores `<meta>` tags after the page loads (crawlers and link previews read them from the server HTML), and React never removes duplicate `<title>` and `<meta>` tags, so nested and stacked pages would pile them up.
- The title in the browser comes from the deepest `<Page>` on the page the browser history is on (same `stack` and `ordinal`), and it updates on each navigation.

## Usage

```tsx
import { Page, Head } from "shelving/ui";

// <Page> already renders <Head> for you; render it directly only for custom shells.
<Page title="Settings">
	<Head />…
</Page>;
```


## Signatures

```ts
Head(): ReactElement
```

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |
