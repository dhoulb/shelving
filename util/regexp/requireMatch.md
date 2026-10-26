# requireMatch()

- Kind: function
- Import: `import { requireMatch } from "shelving/util/regexp";`

Get a required regular expression match, or throw `ValueError` if no match could be made.

## Signatures

```ts
requireMatch(str: string, regexp: NamedRegExp<T>): NamedRegExpExecArray<T>
requireMatch(str: string, regexp: TypedRegExp<T>): TypedRegExpExecArray<T>
requireMatch(str: string, regexp: RegExp): RegExpExecArray
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
| `NamedRegExpExecArray<T>` | The match array. |
| `TypedRegExpExecArray<T>` |  |
| `RegExpExecArray` |  |

## Throws

| Type | Description |
| --- | --- |
| `ValueError` | If the string did not match the regular expression. |
