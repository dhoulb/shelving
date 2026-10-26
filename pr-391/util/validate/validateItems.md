# validateItems()

- Kind: function
- Import: `import { validateItems } from "shelving/util/validate";`

Validate an iterable set of items with a validator, yielding each valid item.

- Validation messages for failing items are collected (keyed by index) and thrown together once iteration completes.

@yields Valid items.

## Signatures

```ts
validateItems(unsafeItems: PossibleArray<unknown>, validator: Validator<T>): Iterable<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `unsafeItems` | `PossibleArray<unknown>` | The iterable of potentially invalid items. |
| `validator` | `Validator<T>` | The validator to validate each item with. |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<T>` |  |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `string` if one or more items did not validate (one `"index: message"` line per failure, joined by newlines). |

## Examples

```ts
Array.from(validateItems(["a", "b"], STRING)) // ["a", "b"]
```
