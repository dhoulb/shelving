# getMatch()

- Kind: function
- Import: `import { getMatch } from "shelving/util/regexp";`

Get an optional regular expression match, or `undefined` if no match could be made.

## Signatures

```ts
getMatch(str: string, regexp: NamedRegExp<T>): NamedRegExpExecArray<T> | undefined
getMatch(str: string, regexp: TypedRegExp<T>): TypedRegExpExecArray<T> | undefined
getMatch(str: string, regexp: RegExp): RegExpExecArray | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | String to match against the regular expression. |
| `regexp` | `NamedRegExp<T>` | Regular expression to match against the string. |
| `str` | `string` |  |
| `regexp` | `TypedRegExp<T>` |  |
| `regexp` | `RegExp` |  |

## Returns

| Type | Description |
| --- | --- |
| `NamedRegExpExecArray<T> \| undefined` | The match array, or `undefined` if the string did not match. |
| `TypedRegExpExecArray<T> \| undefined` |  |
| `RegExpExecArray \| undefined` |  |
