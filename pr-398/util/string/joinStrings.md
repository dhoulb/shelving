# joinStrings()

- Kind: function
- Import: `import { joinStrings } from "shelving/util/string";`

Concatenate an iterable set of strings together.

## Signatures

```ts
joinStrings(strs: Iterable<string> & NotString, joiner = ""): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `strs` | `Iterable<string> & NotString` | The iterable of strings to join (must not be a bare `string`). |
| `joiner` | `unknown` | The separator to insert between strings (defaults to `""`). Defaults to `""`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The joined string. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `strs` is not a valid array of strings. |
