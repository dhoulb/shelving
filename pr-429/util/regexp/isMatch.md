# isMatch()

- Kind: function
- Import: `import { isMatch } from "shelving/util/regexp";`

Does a string match against a regular expressions or string.
- Use with `filter()` to positively filter iterable sets of items.

## Signatures

```ts
isMatch(str: string, regexp: Matchable): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | String to test against the regular expression. |
| `regexp` | `Matchable` | Regular expression to test against the string. - If `regexp` is a `RegExp` it is tested against the string using `RegExp.test()`. - If `regexp` is a `string` it is simply tested against the string using `===` equality. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` if the string matches the regular expression, otherwise `false`. |
