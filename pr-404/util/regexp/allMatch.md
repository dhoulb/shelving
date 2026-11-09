# allMatch()

- Kind: function
- Import: `import { allMatch } from "shelving/util/regexp";`

All of the provided regular expressions match the string.

## Signatures

```ts
allMatch(str: string, ...regexps: Matchables): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | String to test against the regular expressions. |
| `regexps` | `Matchables` | - Regular expressions to match against the string. - If empty the function returns `true` (since all zero of the provided regexps match everything). - If a `RegExp` it is tested against the string using `RegExp.test()`. - If a `string` it is simply tested against the string using `===` equality. - If `null` or `undefined` it is ignored. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` if every provided regular expression matches the string, otherwise `false`. |
