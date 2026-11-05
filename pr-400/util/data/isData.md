# isData()

- Kind: function
- Import: `import { isData } from "shelving/util/data";`

Is an unknown value a data object?

## Signatures

```ts
isData(value: unknown): value is Data
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to check. |

## Returns

| Type | Description |
| --- | --- |
| `value is Data` | `true` if the value is a plain data object, narrowing it to `Data`. |
