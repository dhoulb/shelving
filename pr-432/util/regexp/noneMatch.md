# noneMatch()

- Kind: function
- Import: `import { noneMatch } from "shelving/util/regexp";`

None of the provided regular expressions match the string.

## Signatures

```ts
noneMatch(str: string, ...regexps: Matchables): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | String to test against the regular expressions. |
| `regexps` | `Matchables` | - Regular expressions to match against the string. - If empty the function returns `false` (since the empty list of regexps matches everything). - If a `RegExp` it is tested against the string using `RegExp.test()`. - If a `string` it is simply tested against the string using `===` equality. - If `null` or `undefined` it is ignored. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` if none of the provided regular expressions match the string, otherwise `false`. |
