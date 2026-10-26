# requireNotNull()

- Kind: function
- Import: `import { requireNotNull } from "shelving/util/null";`

Get the not-null version of a value, or throw `RequiredError` if it is `null`.

## Signatures

```ts
requireNotNull(value: Nullable<T>, caller: AnyCaller = requireNotNull): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `Nullable<T>` | The value to require. |
| `caller` | `AnyCaller` | Function used to attribute a thrown error to the calling site. Defaults to `requireNotNull`. |

## Returns

| Type | Description |
| --- | --- |
| `T` | The value, narrowed to `T`. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | RequiredError if `value` is `null`. |
