# DICTIONARY()

- Kind: function
- Import: `import { DICTIONARY } from "shelving/schema";`

Create a schema for a valid dictionary object with specified entry values.

Sugar factory for `DictionarySchema`.

## Signatures

```ts
DICTIONARY(items: Schema<T>): DictionarySchema<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `Schema<T>` | Schema every entry value in the dictionary must conform to. |

## Returns

| Type | Description |
| --- | --- |
| `DictionarySchema<T>` |  |

## Examples

```ts
DICTIONARY(NUMBER) // DictionarySchema<number>
```
