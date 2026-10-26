# SQLTable

- Kind: type
- Import: `import { SQLTable } from "shelving/db";`

Existing SQL table schema keyed by column name, as read back from the database.

## Signatures

```ts
{
	readonly columns: Readonly<Record<string, SQLTableColumn>>;
	readonly name: string;
	readonly sql?: string | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `columns` | `Readonly<Record<string, SQLTableColumn>>` | Read only. |
| `name` | `string` | Read only. |
| `sql` | `string \| undefined` | Read only. Optional. |

## Types

- `Readonly`
- `Record`
- [SQLTableColumn](SQLTableColumn.md): Column definition in a live SQL table, pairing a column name with its raw definition statement.
