# D1Database

- Kind: interface
- Import: `import { D1Database } from "shelving/cloudflare";`

Minimal D1 binding/session interface used by `CloudflareD1Provider`.

Declares only the subset of the D1 binding API the provider needs, so the `@cloudflare/workers-types` package is not required as a dependency.

## Signatures

```ts
{
	batch<T extends Record<string, unknown> = Record<string, unknown>>(
		statements: readonly D1PreparedStatement[],
	): Promise<readonly D1Result<T>[]>;
	exec?(query: string): Promise<D1ExecResult>;
	prepare(query: string): D1PreparedStatement;
}
```

## Methods

- [batch](D1Database/batch.md)
- [exec](D1Database/exec.md)
- [prepare](D1Database/prepare.md)
