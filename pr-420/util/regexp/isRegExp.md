# isRegExp()

- Kind: function
- Import: `import { isRegExp } from "shelving/util/regexp";`

Is an unknown value a `RegExp` instance?

## Signatures

```ts
isRegExp(value: unknown): value is RegExp
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is RegExp` | `true` if `value` is a `RegExp` instance, narrowing its type. |
