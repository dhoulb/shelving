# D1Meta

- Kind: interface
- Import: `import { D1Meta } from "shelving/cloudflare";`

Metadata returned by the D1 Worker API alongside a query result.

## Signatures

```ts
{
	readonly changed_db?: boolean | undefined;
	readonly duration?: number | undefined;
	readonly last_row_id?: number | undefined;
	readonly rows_read?: number | undefined;
	readonly rows_written?: number | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `changed_db` | `boolean \| undefined` | Read only. Optional. |
| `duration` | `number \| undefined` | Read only. Optional. |
| `last_row_id` | `number \| undefined` | Read only. Optional. |
| `rows_read` | `number \| undefined` | Read only. Optional. |
| `rows_written` | `number \| undefined` | Read only. Optional. |
