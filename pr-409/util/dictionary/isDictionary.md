# isDictionary()

- Kind: function
- Import: `import { isDictionary } from "shelving/util/dictionary";`

Is an unknown value a dictionary object?

## Signatures

```ts
isDictionary(value: unknown): value is ImmutableDictionary
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is ImmutableDictionary` | `true` if `value` is a dictionary (plain) object, narrowing its type. |
