# notMatch()

- Kind: function
- Import: `import { notMatch } from "shelving/util/regexp";`

Does a string not match against a regular expressions or string.
- Use with `filter()` to negatively filter iterable sets of items.

## Signatures

```ts
notMatch(str: string, regexp: Matchable): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | String to test against the regular expression. |
| `regexp` | `Matchable` | Regular expression to test against the string. - If `regexp` is a `RegExp` it is tested against the string using `RegExp.test()`. - If `regexp` is a `string` it is simply tested against the string using `!==` equality. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` if the string does not match the regular expression, otherwise `false`. |
