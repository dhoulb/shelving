# TreeLink

- Kind: component
- Import: `import { TreeLink } from "shelving/ui";`

Inline `Code` token linking to a specific tree element, resolved by reference string — the link-styled counterpart of `TreeButton`.

- Resolves `name` via `getTreeElement()` — by flat key or canonical path, falling back to the bare name for a single generic type (`Schema<T>` → `Schema`) — and links to the element's canonical `path`.
- A hit becomes a `<Link>` wrapping a `<Code>` token; a miss (e.g. a builtin like `string` or a compound type like `T | null` that isn't an exact token) stays a plain `<Code>` so it still reads as code.
- Designed for the `Type` column of the documentation Parameters / Returns / Throws / Types tables, where only exact-match type names should link.

## Signatures

```ts
TreeLink({ name, children, ...props }: TreeLinkProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `TreeLinkProps` |  |
| `.name` | `string` | Reference to an element in the tree — a flat key (`"BooleanSchema"`, `"Store.get"`) or a canonical path (`"/schema/BooleanSchema"`). Read only. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

## Examples

```ts
<TreeLink name="BooleanSchema" />
```
