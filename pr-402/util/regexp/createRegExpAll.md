# createRegExpAll()

- Kind: function
- Import: `import { createRegExpAll } from "shelving/util/regexp";`

Create a regular expression that matches all of a list of other expressions.
- If the list is empty the returned expression matches everything (`ALWAYS_REGEXP`).

## Signatures

```ts
createRegExpAll(patterns: Iterable<PossibleRegExp> & NotString, flags?: string): RegExp
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `patterns` | `Iterable<PossibleRegExp> & NotString` | The regular expressions or string sources to combine. |
| `flags` | `string` | The flags to use when creating the combined `RegExp`. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `RegExp` | A `RegExp` that matches only if all of the provided expressions match. |
