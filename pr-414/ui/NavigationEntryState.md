# NavigationEntryState

- Kind: interface
- Import: `import { NavigationEntryState } from "shelving/ui";`

State that `NavigationStore` saves on each browser history entry.

## Signatures

```ts
{
	readonly stack: AbsolutePath;
	readonly depth: number;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `stack` | `AbsolutePath` | Root path of the stack this page is in. Read only. |
| `depth` | `number` | Position of this page in its stack, where `0` is the root. Read only. |
