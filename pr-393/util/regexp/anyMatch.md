# anyMatch()

- Kind: function
- Import: `import { anyMatch } from "shelving/util/regexp";`

At least one of the provided regular expressions matches the string.

## Signatures

```ts
anyMatch(str: string, ...regexps: Matchables): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | String to test against the regular expressions. |
| `regexps` | `Matchables` | - Regular expressions to match against the string. - If empty the function returns `false` (since none of zero provided regexps can match). - If a `RegExp` it is tested against the string using `RegExp.test()`. - If a `string` it is simply tested against the string using `===` equality. - If `null` or `undefined` it is ignored. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `true` if at least one provided regular expression matches the string, otherwise `false`. |
