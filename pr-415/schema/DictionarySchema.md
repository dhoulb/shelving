# DictionarySchema

- Kind: class
- Import: `import { DictionarySchema } from "shelving/schema";`
- Extends: `Schema<ImmutableDictionary<T>>`

Schema that validates a dictionary object whose entries all share the same value schema and have string keys.

- Every entry value is validated by the `items` schema.
- Entry count is checked against `min` and `max`.

## Signatures

```ts
new DictionarySchema<T>({
		items,
		one = items.one,
		many = items.many,
		placeholder = `No ${many}`,
		min = 0,
		max = Number.POSITIVE_INFINITY,
		title = "Items",
		value = {},
		...options
	}: DictionarySchemaOptions<T>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `DictionarySchemaOptions<T>` |  |
| `.items` | `Schema<T>` | Schema every entry value in the dictionary must conform to. Read only. |
| `.value` | `ImmutableDictionary \| undefined` | Default dictionary used when the input is `undefined`. Read only. Optional. |
| `.min` | `number \| undefined` | Minimum number of entries. Read only. Defaults to `0`. |
| `.max` | `number \| undefined` | Maximum number of entries. Read only. Defaults to `Number.POSITIVE_INFINITY`. |

## Returns

| Type | Description |
| --- | --- |
| `DictionarySchema<T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `items` | `Schema<T>` | Read only. |
| `min` | `number` | Read only. |
| `max` | `number` | Read only. |

## Examples

```ts
const schema = new DictionarySchema({ items: NUMBER });
 schema.validate({ a: 1, b: 2 }); // { a: 1, b: 2 }
```
