# KVNamespace

- Kind: interface
- Import: `import { KVNamespace } from "shelving/cloudflare";`

Minimal interface matching the Cloudflare Workers KV namespace runtime object.

Declares only the subset of methods `CloudflareKVProvider` uses, so the `@cloudflare/workers-types` package is not required as a dependency.

## Signatures

```ts
{
	get(key: string, options: { type: "json" }): Promise<unknown>;
	put(key: string, value: string): Promise<void>;
	delete(key: string): Promise<void>;
}
```

## Methods

- [get](KVNamespace/get.md)
- [put](KVNamespace/put.md)
- [delete](KVNamespace/delete.md)
