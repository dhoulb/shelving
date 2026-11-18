# CHOICE()

- Kind: function
- Import: `import { CHOICE } from "shelving/schema";`

Create a schema for a valid choice from an allowed set of values.

Sugar factory for `ChoiceSchema`.

## Signatures

```ts
CHOICE(options: PossibleChoiceOptions<K>): ChoiceSchema<K>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `PossibleChoiceOptions<K>` | The allowed choices, as a `{ key: title }` dictionary or an array of keys. |

## Returns

| Type | Description |
| --- | --- |
| `ChoiceSchema<K>` |  |

## Examples

```ts
CHOICE({ yes: "Yes", no: "No" }) // ChoiceSchema<"yes" | "no">
```
