# isElements()

- Kind: function
- Import: `import { isElements } from "shelving/util/element";`

Is an unknown value a collection of elements?

## Signatures

```ts
isElements(value: unknown): value is Elements
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is Elements` | `true` if `value` is an `Elements` value, narrowing its type. |
