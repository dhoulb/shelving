# getIndentClass()

- Kind: function
- Import: `import { getIndentClass } from "shelving/ui";`

Get the inline-padding ("indent") class for a component from its `indent` variant prop.

## Signatures

```ts
getIndentClass({ indent }: IndentVariants): string | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `IndentVariants` |  |
| `.indent` | `IndentVariant \| undefined` | Inline-padding (left + right) of the element, keeping its content off the edges. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string \| undefined` | The indent class string, or `undefined` when no `indent` is set. |

## Examples

```ts
getIndentClass({ indent: "normal" }) // "indent-normal"
```
