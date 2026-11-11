# validateData()

- Kind: function
- Import: `import { validateData } from "shelving/util/validate";`

Validate a data object with a set of validators.
- Defined props in the object will be validated against the corresponding validator.
- `undefined` props in the object will be set to the default value of that prop.
- `undefined` props after validation will not be set in the output object.
- Excess keys not present in `validators` are stripped from the output.
- Returns the original `unsafeData` reference unchanged when nothing changed and no excess keys exist.

## Signatures

```ts
validateData(unsafeData: Data, validators: Validators<T>): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `unsafeData` | `Data` | The potentially invalid data object. |
| `validators` | `Validators<T>` | The set of named validators to validate each prop with. |

## Returns

| Type | Description |
| --- | --- |
| `T` | Valid object. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `string` if one or more props did not validate (one `"key: message"` line per failure, joined by newlines). |
