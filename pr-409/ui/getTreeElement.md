# getTreeElement()

- Kind: function
- Import: `import { getTreeElement } from "shelving/ui";`

Resolve a reference string to its tree element — by exact key first, then by a normalised key with the prose display decorations stripped.

- Exact lookup handles flat keys (`"BooleanSchema"`, `"Store.get"`) and canonical paths (`"/schema/BooleanSchema"`).
- On a miss, the reference is normalised so a token written in its prose display form still resolves: generics (`"Schema<T>"` → `"Schema"`), call parens (`"formatDate()"` / `"Store.get()"` → bare name), component angle brackets (`"<Section>"` → `"Section"`), and the module package prefix (`"shelving/schema"` → the `"/schema"` canonical path). This is what lets a bare backtick reference in markup auto-link.
- A qualified `"Owner.member"` whose member has no page of its own falls back to the owner's (class/interface) page — so `"StringSchema.validate()"` still links even when `validate` isn't a standalone token.
- A compound reference (`"Schema<T> | null"`, `"Omit<X, 'k'>"`) only retries on the leading identifier when the whole string is `Identifier<…>`; otherwise it stays a miss and the caller falls back to plain text.

## Signatures

```ts
getTreeElement(map: ReadonlyMap<string, TreeElement>, ref: string): TreeElement | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `map` | `ReadonlyMap<string, TreeElement>` | The flattened tree lookup map (from `useTreeMap()`). |
| `ref` | `string` | The reference string — a flat key, canonical path, or token written in its display form. |

## Returns

| Type | Description |
| --- | --- |
| `TreeElement \| undefined` | The resolved element, or `undefined` on a miss. |

## Examples

```ts
getTreeElement(useTreeMap(), "formatDate()") // the `formatDate` element
```
