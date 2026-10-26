# D1PreparedStatement

- Kind: interface
- Import: `import { D1PreparedStatement } from "shelving/cloudflare";`

Minimal prepared statement interface for D1 databases and sessions.

Declares only the subset of the D1 prepared-statement API used by `CloudflareD1Provider`.

## Signatures

```ts
{
	bind(...values: D1Value[]): D1PreparedStatement;
	first<T = Record<string, unknown>>(column?: string): Promise<T | null>;
	raw<T = unknown[]>(options?: { columnNames?: boolean }): Promise<readonly T[]>;
	run<T extends Record<string, unknown> = Record<string, unknown>>(): Promise<D1Result<T>>;
}
```

## Methods

- [bind](D1PreparedStatement/bind.md)
- [first](D1PreparedStatement/first.md)
- [raw](D1PreparedStatement/raw.md)
- [run](D1PreparedStatement/run.md)
