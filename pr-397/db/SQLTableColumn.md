# SQLTableColumn

- Kind: type
- Import: `import { SQLTableColumn } from "shelving/db";`

Column definition in a live SQL table, pairing a column name with its raw definition statement.

## Signatures

```ts
{
	readonly name: string;
	readonly statement: string;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | Read only. |
| `statement` | `string` | Read only. |
