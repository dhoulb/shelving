# debugObject()

- Kind: function
- Import: `import { debugObject } from "shelving/util/debug";`

Convert an object into a readable debug string.
- Prefixes the constructor name for non-plain objects.
- Expands entries down to `depth` levels.

## Signatures

```ts
debugObject(value: object, depth = 1): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `object` | The object to debug. |
| `depth` | `unknown` | How many levels of nested containers to expand (defaults to `1`). Defaults to `1`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | A human-readable string representation of the object. |
