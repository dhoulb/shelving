# getUpdates()

- Kind: function
- Import: `import { getUpdates } from "shelving/util/update";`

Decode the prop updates in an `Updates` object into a set of `Update` objects.

- Props with `undefined` value are skipped.

## Signatures

```ts
getUpdates(data: Updates<T>): ImmutableArray<Update>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `data` | `Updates<T>` | The `Updates` object to decode. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<Update>` | Array of decoded `Update` objects. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `RequiredError` if a `+=`/`-=` sum update has a non-number value. |
