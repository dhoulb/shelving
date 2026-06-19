# Markup

Parses a markup string and renders the resulting React nodes inline. Defaults to the full block + inline rule set and resolves links against the current `<Meta>` context, so it's the standard way to render user- or content-authored markup in the UI.

**Things to know:**

- `url` and `root` default to the current `<Meta>` context, so link rules resolve site-absolute and relative hrefs correctly. Override any `MarkupOptions` prop (`rules`, `rel`, `url`, `root`, `schemes`) directly on `<Markup>` for a custom rule set or base URL.
- Renders `null` when `children` is empty.
- Wrap in `<Prose>` to give the produced `<p>` / `<ul>` / `<pre>` / etc. the standard prose typography.

## Usage

```tsx
import { Prose, Markup } from "shelving/ui";

<Prose>
  <Markup>{article.body}</Markup>
</Prose>
```

```tsx
import { Markup } from "shelving/ui";

// Custom rule set or base URL via MarkupOptions props.
<Markup rules={INLINE_ONLY} root="https://example.com">
  {comment.body}
</Markup>
```
