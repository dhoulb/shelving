# validateDictionary()

- Kind: function
- Import: `import { validateDictionary } from "shelving/util/validate";`

Validate the values of the entries in a dictionary object with a validator.

- Returns the original dictionary reference unchanged when every value was already valid (and the input was a plain dictionary, not an iterable).

## Signatures

```ts
validateDictionary(unsafeDictionary: PossibleDictionary<unknown>, validator: Validator<T>): ImmutableDictionary<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `unsafeDictionary` | `PossibleDictionary<unknown>` | The dictionary (or iterable of entries) of potentially invalid values. |
| `validator` | `Validator<T>` | The validator to validate each value with. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableDictionary<T>` | Dictionary with valid values. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `string` if one or more entry values did not validate (one `"key: message"` line per failure, joined by newlines). |
