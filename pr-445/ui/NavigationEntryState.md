# NavigationEntryState

- Kind: interface
- Import: `import { NavigationEntryState } from "shelving/ui";`

State that `NavigationSequence` saves on each browser history entry.

## Signatures

```ts
{
	readonly stack: AbsolutePath | null;
	readonly ordinal: number;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `stack` | `AbsolutePath \| null` | Root path of the stack this page is in, or `null` for a floating page. Read only. |
| `ordinal` | `number` | Position of this page in its stack, where `0` is the root. Read only. |
