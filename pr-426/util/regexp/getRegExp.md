# getRegExp()

- Kind: function
- Import: `import { getRegExp } from "shelving/util/regexp";`

Convert a possible regular expression into a `RegExp` instance.
- If `pattern` is a `string` a new `RegExp` is created from it, otherwise it is returned as-is.

## Signatures

```ts
getRegExp(pattern: NamedRegExp<T>, flags?: string): T extends NamedRegExpData ? NamedRegExp<T> : RegExp
getRegExp(pattern: PossibleRegExp, flags?: string): T extends NamedRegExpData ? NamedRegExp<T> : RegExp
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `pattern` | `NamedRegExp<T>` | The regular expression or string source to convert. |
| `flags` | `string` | The flags to use when creating a `RegExp` from a string source. Optional. |
| `pattern` | `PossibleRegExp` |  |
| `flags` | `string` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `T extends NamedRegExpData ? NamedRegExp<T> : RegExp` | The corresponding `RegExp` instance. |
| `T extends NamedRegExpData ? NamedRegExp<T> : RegExp` |  |
