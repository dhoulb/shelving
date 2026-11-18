# requireNotNullish()

- Kind: function
- Import: `import { requireNotNullish } from "shelving/util/null";`

Get the not-nullish version of a value, or throw `RequiredError` if it is `null` or `undefined`.

## Signatures

```ts
requireNotNullish(value: Nullish<T>, caller: AnyCaller = requireNotNullish): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `Nullish<T>` | The value to require. |
| `caller` | `AnyCaller` | Function used to attribute a thrown error to the calling site. Defaults to `requireNotNullish`. |

## Returns

| Type | Description |
| --- | --- |
| `T` | The value, narrowed to `T`. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | RequiredError if `value` is `null` or `undefined`. |
