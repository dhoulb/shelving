# isMap()

- Kind: function
- Import: `import { isMap } from "shelving/util/map";`

Is an unknown value a map?

## Signatures

```ts
isMap(value: unknown): value is ImmutableMap
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is ImmutableMap` | `true` if `value` is a `Map` instance, otherwise `false`. |
