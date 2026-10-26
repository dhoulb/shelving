# createRegExpAny()

- Kind: function
- Import: `import { createRegExpAny } from "shelving/util/regexp";`

Create a regular expression that matches any one of a list of other expressions.
- If the list is empty the returned expression matches nothing (`NEVER_REGEXP`).

## Signatures

```ts
createRegExpAny(patterns: Iterable<PossibleRegExp> & NotString, flags?: string): RegExp
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `patterns` | `Iterable<PossibleRegExp> & NotString` | The regular expressions or string sources to combine. |
| `flags` | `string` | The flags to use when creating the combined `RegExp`. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `RegExp` | A `RegExp` that matches if any of the provided expressions match. |
