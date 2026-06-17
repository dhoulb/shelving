# Markup

Parses a markup string and renders the resulting React nodes inline. Defaults to the full block + inline rule set and resolves links against the current [`<Meta>`](/ui/Meta) context, so it's the standard way to render user- or content-authored markup in the UI.

**Things to know:**

- `url` and `root` default to the current [`<Meta>`](/ui/Meta) context, so link rules resolve site-absolute and relative hrefs correctly. Override any [`MarkupOptions`](/markup/MarkupOptions) prop (`rules`, `rel`, `url`, `root`, `schemes`) directly on `<Markup>` for a custom rule set or base URL.
- Renders `null` when `children` is empty.
- Wrap in [`<Prose>`](/ui/Prose) to give the produced `<p>` / `<ul>` / `<pre>` / etc. the standard prose typography.

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

## See also

- [`Prose`](/ui/Prose) — longform typography wrapper for the rendered markup.
- [`markup`](/markup) — the markup parser and rule set underlying `<Markup>`.
- [`Meta`](/ui/Meta) — the page metadata `<Markup>` reads to resolve links.
