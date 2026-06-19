# TreeMarkup

Renders a markup string just like [`<Markup>`](/ui/Markup), but auto-links every inline code span to its documented tree element. A backtick span whose text matches a token in the surrounding [`<TreeProvider>`](/ui/TreeProvider) becomes a link to that token's canonical page; anything else stays a plain code token. It's the standard way to render documentation-site content, so cross-references happen automatically at render time instead of being hand-written into the source markdown.

**Things to know:**

- Defaults to [`TREE_MARKUP_RULES`](/ui/TREE_MARKUP_RULES) — the full default rule set with the inline-code rule swapped for [`TREE_CODE_RULE`](/ui/TREE_CODE_RULE), which renders each span through [`TreeLink`](/ui/TreeLink).
- Resolution is exact-match against the tree map: a hit (`` `BooleanSchema` ``, `` `Store.get` ``) links; a miss (`` `bun run fix` ``, `` `string` ``) falls back to a plain code token, so unknown spans never produce a broken link.
- Falls back to plain code spans outside a [`<TreeProvider>`](/ui/TreeProvider), so it's safe to use anywhere — it simply stops linking.
- Inherits everything else from [`<Markup>`](/ui/Markup): `url` / `root` default to the current [`<Meta>`](/ui/Meta) context, and any [`MarkupOptions`](/markup/MarkupOptions) prop (`rules`, `rel`, `url`, `root`, `schemes`) can be overridden directly.
- Wrap in [`<Prose>`](/ui/Prose) to give the produced `<p>` / `<ul>` / `<pre>` / etc. the standard prose typography.

## Usage

```tsx
import { Prose } from "shelving/ui";
import { TreeMarkup } from "shelving/ui";

// Inline code spans link automatically: `BooleanSchema` → /schema/BooleanSchema.
<Prose>
  <TreeMarkup>{element.props.content}</TreeMarkup>
</Prose>
```
