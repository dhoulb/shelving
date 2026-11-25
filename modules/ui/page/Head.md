# Head

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
