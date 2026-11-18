# requireMatchGroups()

- Kind: function
- Import: `import { requireMatchGroups } from "shelving/util/regexp";`

Get the named groups of a required regular expression match, or throw `ValueError` if no match could be made.

## Signatures

```ts
requireMatchGroups(str: string, regexp: NamedRegExp<T>): T
requireMatchGroups(str: string, regexp: RegExp): NamedRegExpData
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | String to match against the regular expression. |
| `regexp` | `NamedRegExp<T>` | Regular expression to match against the string. |
| `str` | `string` |  |
| `regexp` | `RegExp` |  |

## Returns

| Type | Description |
| --- | --- |
| `T` | The set of named match groups. |
| `NamedRegExpData` |  |

## Throws

| Type | Description |
| --- | --- |
| `ValueError` | If the string did not match the regular expression. |
