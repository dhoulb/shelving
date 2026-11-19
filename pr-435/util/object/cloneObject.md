# cloneObject()

- Kind: function
- Import: `import { cloneObject } from "shelving/util/object";`

Shallow clone an object with the same prototype.

## Signatures

```ts
cloneObject(input: T): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `input` | `T` | The object to clone. |

## Returns

| Type | Description |
| --- | --- |
| `T` | A new object with the same prototype and props as `input`. |
