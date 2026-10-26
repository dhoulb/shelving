# MockDBCall

- Kind: type
- Import: `import { MockDBCall } from "shelving/db";`

Structured log entry recording one operation performed through a `MockDBProvider`.

- `type` is the operation name; `collection` is the collection name; `id`, `query`, `data`, `updates`, and `result` carry whichever fields apply to that operation.

## Signatures

```ts
{
	readonly type:
		| "getItem"
		| "addItem"
		| "setItem"
		| "updateItem"
		| "deleteItem"
		| "countQuery"
		| "getQuery"
		| "setQuery"
		| "updateQuery"
		| "deleteQuery";
	readonly collection: string;
	readonly id?: Identifier | undefined;
	readonly query?: unknown;
	readonly data?: Data;
	readonly updates?: unknown;
	readonly result?: unknown;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `type` | `\| "getItem" \| "addItem" \| "setItem" \| "updateItem" \| "deleteItem" \| "countQuery" \| "getQuery" \| "setQuery" \| "updateQuery" \| "deleteQuery"` | Read only. |
| `collection` | `string` | Read only. |
| `id` | `Identifier \| undefined` | Read only. Optional. |
| `query` | `unknown` | Read only. Optional. |
| `data` | `Data` | Read only. Optional. |
| `updates` | `unknown` | Read only. Optional. |
| `result` | `unknown` | Read only. Optional. |

## Types

- [Identifier](../util/item/Identifier.md): Allowed types for the "id" property (identifier) for an item.
- [Data](../util/data/Data.md): Data object — a plain object with string keys and unknown values.
