# validateArray()

- Kind: function
- Import: `import { validateArray } from "shelving/util/validate";`

Validate an array of items with a validator.

- Returns the original array reference unchanged when every item was already valid (and the input was an array).

## Signatures

```ts
validateArray(unsafeArray: PossibleArray<unknown>, validator: Validator<T>): ImmutableArray<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `unsafeArray` | `PossibleArray<unknown>` | The array (or iterable) of potentially invalid items. |
| `validator` | `Validator<T>` | The validator to validate each item with. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<T>` | Array with valid items. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `string` if one or more items did not validate (one `"index: message"` line per failure, joined by newlines). |
