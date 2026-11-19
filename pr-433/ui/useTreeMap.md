# useTreeMap()

- Kind: function
- Import: `import { useTreeMap } from "shelving/ui";`

Use the flattened tree lookup map from context.

- Returns an empty map when there's no `<TreeProvider>` above (e.g. an isolated card rendered outside the tree shell), so callers can look up freely and fall back to plain text on a miss.

## Signatures

```ts
useTreeMap(): ReadonlyMap<string, TreeElement>
```

## Returns

| Type | Description |
| --- | --- |
| `ReadonlyMap<string, TreeElement>` | The flattened `key` → `element` map, or an empty map when no `<TreeProvider>` is present. |

## Examples

```ts
const element = useTreeMap().get("Store.get");
```
