# getModuleClass()

- Kind: function
- Import: `import { getModuleClass } from "shelving/ui";`

Parse a list of possible `className` strings, match them in a `CSSModule` dictionary, and join them into a single string.
- See `Classes` type for parsing rules.

## Signatures

```ts
getModuleClass(module: CSSModule | string, ...classes: unknown[]): string | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `module` | `CSSModule \| string` | CSS module object _or_ a string. - Allows "string" because if this environment does not process `*.module.css` files then `import styles from "./styles.module.css"` will be a string. - This allows this situation to be handled gracefully and classes will be silently ignored in this environment. |
| `classes` | `unknown[]` | Class keys/values to merge. |

## Returns

| Type | Description |
| --- | --- |
| `string \| undefined` | The merged string classname, or `undefined` when `module` is a string (unprocessed CSS module) or no classes match. |
