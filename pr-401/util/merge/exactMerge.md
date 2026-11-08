# exactMerge()

- Kind: function
- Import: `import { exactMerge } from "shelving/util/merge";`

Exact merge two unknown values.
- Always returns `right`.

## Signatures

```ts
exactMerge(_left: unknown, right: unknown): unknown
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `_left` | `unknown` | The left value (ignored). |
| `right` | `unknown` | The right value. |

## Returns

| Type | Description |
| --- | --- |
| `unknown` | The `right` value, always. |
