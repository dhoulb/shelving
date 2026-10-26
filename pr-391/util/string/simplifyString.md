# simplifyString()

- Kind: function
- Import: `import { simplifyString } from "shelving/util/string";`

Simplify a string by removing anything that isn't a number, letter, or space.
- Normalizes the string by
- Useful when you're running a query against a string entered by a user.

@todo Convert confusables (e.g. `ℵ` alef symbol or `℮` estimate symbol) to their letterlike equivalent (e.g. `N` and `e`).

## Signatures

```ts
simplifyString(str: string): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | The string to simplify. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The simplified, lowercased string containing only numbers, letters, and single spaces. |
