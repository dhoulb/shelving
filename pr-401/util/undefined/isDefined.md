# isDefined()

- Kind: function
- Import: `import { isDefined } from "shelving/util/undefined";`

Is a value defined (i.e. not `undefined`)?

## Signatures

```ts
isDefined(value: T | undefined): value is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `T \| undefined` | The value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is T` | `true` if the value is not `undefined`, otherwise `false`. |
