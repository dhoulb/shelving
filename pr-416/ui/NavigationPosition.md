# NavigationPosition

- Kind: interface
- Import: `import { NavigationPosition } from "shelving/ui";`
- Extends: `NavigationEntryState`

Where the app is now in its stacks: the current stack and depth, the top depth of each stack, and the page before the current one.
- `undefined` when the browser has no Navigation API, or during a server render.

## Signatures

```ts
{
	readonly tops: { readonly [stack: AbsolutePath]: number };
	readonly parent: AbsolutePath | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `tops` | `{ readonly [stack: AbsolutePath]: number }` | Depth of the top page of each stack that has pages. Read only. |
| `parent` | `AbsolutePath \| undefined` | The page before the current one in its stack, or `undefined` at the bottom of the stack. Read only. |
