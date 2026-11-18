# isURI()

- Kind: function
- Import: `import { isURI } from "shelving/util/uri";`

Is an unknown value a URI object?

## Signatures

```ts
isURI(value: unknown): value is ImmutableURI
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is ImmutableURI` | `true` if `value` is an `ImmutableURI`, narrowing its type. |
