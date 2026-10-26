# isSet()

- Kind: function
- Import: `import { isSet } from "shelving/util/set";`

Is an unknown value a set?

## Signatures

```ts
isSet(value: unknown): value is ImmutableSet
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

## Returns

| Type | Description |
| --- | --- |
| `value is ImmutableSet` | `true` if `value` is a `Set` instance, otherwise `false`. |
