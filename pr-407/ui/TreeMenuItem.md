# TreeMenuItem

- Kind: component
- Import: `import { TreeMenuItem } from "shelving/ui";`

Default menu item renderer for any `tree-*` element.

- Links straight to the element's own canonical `path` (stamped by `flattenTree()`), so the menu must be fed the flattened tree's elements.
- Passes both the label and the nested `<TreeMenuMapper>` to `<MenuItem>`; `<MenuItem>` itself decides whether to reveal the nested submenu based on the current URL.

## Signatures

```ts
TreeMenuItem({ path, name, title, children }: TreeElementProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `TreeElementProps` |  |
| `.name` | `string` | The primary identifier shown in menus, cards, and other listings. - Always set. For files this is the basename (e.g. `"array"` from `array.ts`); for directories it's the directory name; for documented symbols it's the declared name (e.g. `"getFirst"`). - `key` is typically the slugified version of `name`. Read only. |
| `.title` | `string \| undefined` | Optional visual-only override for `name`, set only when a confident source is available (e.g. a markdown `<h1>`, a docblock title). - Renderers should fall back to `name` when `title` is missing. Read only. Optional. |
| `.description` | `string \| undefined` | Short summary used for the page's `<meta name="description">` tag — not rendered as visible page body. - Pages plumb this through `Meta.description`; `<Head>` emits the meta tag. - For visible body content (rendered inside the page) use `content` instead. Read only. Optional. |
| `.content` | `string \| undefined` | Markup source string that should be rendered as the element's visible body content. - Rendered via the `<Markup>` component (typically inside a `<Prose>` wrapper). - For Markdown files this is the file's body (the title `# h1` is lifted into `title`); for TypeScript symbols this is the JSDoc description. Read only. Optional. |
| `.source` | `AbsolutePath \| undefined` | Source location for the element — the absolute filesystem path it was extracted from. - For directories this is the directory path; for files this is the file path. - Optional: synthesised elements (e.g. `kind: "module"` documentation) have no single source. Read only. Optional. |
| `.path` | `AbsolutePath \| undefined` | Canonical site-root-relative URL path of this element (e.g. `"/schema/BooleanSchema"`), stamped by `flattenTree()`. - This is the exact URL the element renders at, and the canonical key it's registered under in `flattenTree()`. - Absent on a freshly-extracted tree — paths are derived from tree structure when the tree is flattened, not at extraction. Read only. Optional. |
| `.children` | `TreeElements \| undefined` | Children of a tree element must be other tree elements. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |

## Examples

```ts
<TreeMenuItem {...element.props} />
```
