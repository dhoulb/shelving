# isPathActive()

- Kind: function
- Import: `import { isPathActive } from "shelving/util/path";`

Is a target path active relative to the current path?
- Active means `target` and `current` are exactly the same path.

## Signatures

```ts
isPathActive(target: AbsolutePath, current: AbsolutePath): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `AbsolutePath` | Path whose status to test. |
| `current` | `AbsolutePath` | Current path to test against. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` if `target` is exactly `current`. |
