# SequenceTransitionOptions

- Kind: interface
- Import: `import { SequenceTransitionOptions } from "shelving/react";`

Options for `useSequenceTransition()`.

## Signatures

```ts
{
	readonly current: () => T;
	readonly transition?: string | ((value: T) => string | null | undefined) | undefined;
	readonly equal?: ((a: T, b: T) => boolean) | undefined;
	readonly wait?: ((value: T) => PromiseLike<void> | void) | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `current` | `() => T` | Read the current value. - Called for the first render, and again when the subscription starts, to catch up on values sent before it started. Read only. |
| `transition` | `string \| ((value: T) => string \| null \| undefined) \| undefined` | Transition type for a value, or a fixed type for every value. - A value with a type is set inside `startTransition()` with that type, so a `<ViewTransition>` can animate it. - A value with no type (`undefined` or `null`) is set at once, with no transition. Read only. Optional. |
| `equal` | `((a: T, b: T) => boolean) \| undefined` | Is a new value the same as the shown value? A value that is the same is skipped, so it starts no second transition. Read only. Defaults to `Object.is`. |
| `wait` | `((value: T) => PromiseLike<void> \| void) \| undefined` | Wait before a value with a transition type is set, for example until the on-screen keyboard is down. - Return a promise to wait for it, or nothing to set the value at once. - A newer value that arrives while it waits wins: the older value is never set. - Values with no transition type never wait. Read only. Optional. |
