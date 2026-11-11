# isConstructor()

- Kind: function
- Import: `import { isConstructor } from "shelving/util/class";`

Is a given value a class constructor?

## Signatures

```ts
isConstructor(value: unknown): value is AnyConstructor
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is AnyConstructor` | `true` if `value` is a class constructor, narrowing its type. |
