# TreeButton

- Kind: component
- Import: `import { TreeButton } from "shelving/ui";`

Small button linking to a specific tree element, resolved by reference string.

- Resolves `name` via `getTreeElement()` — by flat key (`"Store"`, `"Store.get"`) or canonical path (`"/schema/BooleanSchema"`), falling back to the bare name for a single generic type (`"Schema<T>"` → `"Schema"`) — and links to the element's canonical `path`.
- A hit becomes an `<a>` link; a miss (e.g. a builtin like `Serializable`, or a compound type like `Foo | null`) stays a plain non-link label so it still reads as text.
- Defaults to `small plain` styling; pass other `ButtonVariants` to override.

## Signatures

```ts
TreeButton({ name, children, small = true, plain = true, ...variants }: TreeButtonProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `variants` | `TreeButtonProps` |  |
| `.name` | `string` | Reference to an element in the tree — a flat key (`"Store"`, `"Store.get"`) or a canonical path (`"/schema/BooleanSchema"`). Read only. |
| `.children` | `ReactNode \| undefined` | Visible label — defaults to the resolved element's `title`, falling back to `name`. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

## Examples

```ts
<TreeButton name="Store.get">Store.get()</TreeButton>
```
