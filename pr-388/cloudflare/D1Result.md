# D1Result

- Kind: interface
- Import: `import { D1Result } from "shelving/cloudflare";`

Result object returned by `D1PreparedStatement.run()`.

## Signatures

```ts
{
	readonly success: boolean;
	readonly meta?: D1Meta | undefined;
	readonly results?: readonly T[] | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Read only. |
| `meta` | `D1Meta \| undefined` | Read only. Optional. |
| `results` | `readonly T[] \| undefined` | Read only. Optional. |
