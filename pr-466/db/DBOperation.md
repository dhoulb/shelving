# DBOperation

- Kind: type
- Import: `import { DBOperation } from "shelving/db";`

Structured log entry recording a single database operation performed through a `RecordingDBProvider`.

- `action` is the kind of operation; `collection` is the `Collection` it applies to; `id` is the item involved; `data` and `updates` carry whichever fields apply to that operation.
- A `"get"` operation records a read — `data` is the item that was observed, or `undefined` if the read confirmed the item absent.

## Signatures

```ts
{
	readonly action: "get" | "add" | "set" | "update" | "delete";
	readonly collection: Collection<string, I, T>;
	readonly id: I;
	readonly data?: unknown;
	readonly updates?: unknown;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `action` | `"get" \| "add" \| "set" \| "update" \| "delete"` | Read only. |
| `collection` | `Collection<string, I, T>` | Read only. |
| `id` | `I` | Read only. |
| `data` | `unknown` | Read only. Optional. |
| `updates` | `unknown` | Read only. Optional. |

## Types

- [Collection](Collection.md): Declarative definition of a database collection/table.
