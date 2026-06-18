# Head

Low-level emitter of hoistable head metadata from the current [`Meta`](/ui/Meta) context. It outputs `<title>`, `<meta>`, `<link>`, stylesheet, module, and script elements inline, and React 19 hoists each one into the document `<head>`. It also syncs `window.history` to the page URL.

**Things to know:**

- [`Page`](/ui/Page) renders `<Head>` automatically — you rarely need it directly.
- It does not render `<base>`, which is not hoistable; that lives in the [`HTML`](/ui/HTML) shell.
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
