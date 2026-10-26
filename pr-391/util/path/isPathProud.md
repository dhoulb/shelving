# isPathProud()

- Kind: function
- Import: `import { isPathProud } from "shelving/util/path";`

Is a target path proud relative to the current path?
- Proud means `target` is the current path, or is an ancestor of the current path.

## Signatures

```ts
isPathProud(target: AbsolutePath, current: AbsolutePath): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `AbsolutePath` | Path whose status to test. |
| `current` | `AbsolutePath` | Current path to test against. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` if `current` is `target` or a descendant of `target`. |
