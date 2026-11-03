# Markup

- Kind: component
- Import: `import { Markup } from "shelving/ui";`

Parse a markup string and render the resulting elements inline.
- Defaults to `MARKUP_OPTIONS` (full block + inline rule set). Pass `rules`, `rel`, `url`, `root`, or `schemes` as props to override.
- `url`/`root` default to the current `<Meta>` context so link rules resolve site-absolute and relative hrefs.
- Renders inside whatever ancestor element the caller provides — wrap in `<Prose>` to get the standard prose typography for the produced `<p>` / `<ul>` / `<pre>` / etc.
- **Untrusted input:** when `children` comes from users, cap its length before rendering — parsing is linear for normal content but a few rules can degrade on adversarial input (a sane maximum for your use case, typically tens of kilobytes, bounds worst-case work). See `MarkupParser.parse()`.

Parses a markup string and renders the resulting React nodes inline. Defaults to the full block + inline rule set and resolves links against the current `<Meta>` context, so it's the standard way to render user- or content-authored markup in the UI.

**Things to know:**

- `url` and `root` default to the current `<Meta>` context, so link rules resolve site-absolute and relative hrefs correctly. Override any `MarkupOptions` prop (`rules`, `rel`, `url`, `root`, `schemes`) directly on `<Markup>` for a custom rule set or base URL.
- Renders `null` when `children` is empty.
- Wrap in `<Prose>` to give the produced `<p>` / `<ul>` / `<pre>` / etc. the standard prose typography.
- When `children` comes from users, cap its length before rendering: parsing is linear for normal content, but a few rules can degrade on adversarial input (long backtick runs, deeply-nested `>` blockquotes). A sane maximum for your use case — tens of kilobytes for typical user content — keeps worst-case work bounded.

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


## Signatures

```ts
Markup({ children, ...options }: MarkupProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `children` | `MarkupProps` | The source markup string to parse and render (renders `null` when empty). |
| `.children` | `string \| undefined` | The source string to parse and render. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` | The parsed markup as React nodes, or `null` when `children` is empty. |
