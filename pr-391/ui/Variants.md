# Variants

- Kind: interface
- Import: `import { Variants } from "shelving/ui";`

Dictionary of boolean variant flags whose `true`-valued keys become class names.

- `true` or `false` item values in dictionaries use the string `key` of the item if the value is `true`, or ignore it if the value is falsy.
- Anything that is not `true` has no effect, so other values can be passed in and will be ignored. This means you can pass the entire `props` into this and it'll work just fine.

Typed as `object` (not `Data`/`Record<string, unknown>`) so plain `interface` types are accepted —
interfaces lack an implicit string index signature, so they don't satisfy index-signature types.

## Signatures

```ts
{
	readonly [key: string]: boolean;
}
```
