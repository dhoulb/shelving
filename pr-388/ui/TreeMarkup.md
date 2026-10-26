# TreeMarkup

- Kind: component
- Import: `import { TreeMarkup } from "shelving/ui";`

Render a markup string with inline code spans auto-linked to their documented tree elements.
- Like `<Markup>` but defaults to `TREE_MARKUP_RULES`, so each backtick span resolves through `TreeLink` against the surrounding `<TreeProvider>` — a known token links to its canonical page, an unknown one stays plain code.
- The standard way to render documentation-site content (READMEs, docblocks, per-symbol pages); plain `<Markup>` stays the choice for general user content that shouldn't cross-link.
- Falls back to plain code spans outside a `<TreeProvider>`, so it's safe to use anywhere. Pass any `MarkupOptions` prop (including `rules`) to override.
- Inherits `<Markup>`'s input-length guidance: when `children` is untrusted, cap its length before rendering (see `MarkupParser.parse()`).

Renders a markup string just like `<Markup>`, but auto-links every inline code span to its documented tree element. A backtick span whose text matches a token in the surrounding `<TreeProvider>` becomes a link to that token's canonical page; anything else stays a plain code token. It's the standard way to render documentation-site content, so cross-references happen automatically at render time instead of being hand-written into the source markdown.

**Things to know:**

- Defaults to `TREE_MARKUP_RULES` — the full default rule set with the inline-code rule swapped for `TREE_CODE_RULE`, which renders each span through `TreeLink`.
- Resolution is exact-match against the tree map: a hit (`` `BooleanSchema` ``, `` `Store.get` ``) links; a miss (`` `bun run fix` ``, `` `string` ``) falls back to a plain code token, so unknown spans never produce a broken link.
- Falls back to plain code spans outside a `<TreeProvider>`, so it's safe to use anywhere — it simply stops linking.
- Inherits everything else from `<Markup>`: `url` / `root` default to the current `<Meta>` context, and any `MarkupOptions` prop (`rules`, `rel`, `url`, `root`, `schemes`) can be overridden directly. That includes the input-length guidance — cap untrusted `children` length before rendering.
- Wrap in `<Prose>` to give the produced `<p>` / `<ul>` / `<pre>` / etc. the standard prose typography.

## Usage

```tsx
import { Prose } from "shelving/ui";
import { TreeMarkup } from "shelving/ui";

// Inline code spans link automatically: `BooleanSchema` → /schema/BooleanSchema.
<Prose>
  <TreeMarkup>{element.props.content}</TreeMarkup>
</Prose>
```


## Signatures

```ts
TreeMarkup({ rules = TREE_MARKUP_RULES, ...props }: MarkupProps): ReactNode
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
