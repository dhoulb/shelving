# getMatchGroups()

- Kind: function
- Import: `import { getMatchGroups } from "shelving/util/regexp";`

Get the named groups of an optional regular expression match, or `undefined` if no match could be made.

## Signatures

```ts
getMatchGroups(str: string, regexp: NamedRegExp<T>): T | undefined
getMatchGroups(str: string, regexp: RegExp): NamedRegExpData | undefined
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
| `T \| undefined` | The set of named match groups, or `undefined` if the string did not match. |
| `NamedRegExpData \| undefined` |  |
