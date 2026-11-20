# getProp()

- Kind: function
- Import: `import { getProp } from "shelving/util/object";`

Extract the value of a named prop from an object.

## Signatures

```ts
getProp(obj: T, key: K): T[K]
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `obj` | `T` | The object to read the prop from. |
| `key` | `K` | The key of the prop to read. |

## Returns

| Type | Description |
| --- | --- |
| `T[K]` | The value of the named prop. |
