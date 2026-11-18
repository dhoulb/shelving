# NavigationEvent

- Kind: interface
- Import: `import { NavigationEvent } from "shelving/ui";`

One change of page, published by `NavigationSequence`.
- A move (a link, a back button, the browser back and forward buttons) has a `direction`, so `<Navigation>` shows it inside a view transition of that type.
- A replace has no `direction`, so it shows at once with no transition.

## Signatures

```ts
{
	readonly url: ImmutableURL;
	readonly stack: AbsolutePath | null;
	readonly ordinal: number | undefined;
	readonly direction?: NavigationDirection | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `url` | `ImmutableURL` | URL of the page. Read only. |
| `stack` | `AbsolutePath \| null` | Root path of the stack the page is in, or `null` for a floating page. Read only. |
| `ordinal` | `number \| undefined` | Position of the page in its stack, where `0` is the root, or `undefined` without the Navigation API. Read only. |
| `direction` | `NavigationDirection \| undefined` | Direction of the move, or `undefined` for a replace or a change with no slide. Read only. Optional. |
