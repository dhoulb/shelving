# SwipeOptions

- Kind: interface
- Import: `import { SwipeOptions } from "shelving/ui";`

Options for `useSwipe()`.

## Signatures

```ts
{
	readonly direction: SwipeDirection;
	readonly start: () => unknown;
	readonly cancel: () => PromiseLike<void> | void;
	readonly commit?: (() => void) | undefined;
	readonly edge?: number | undefined;
	readonly distance?: number | undefined;
	readonly ignore?: string | undefined;
	readonly disabled?: boolean | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `direction` | `SwipeDirection` | Which way the finger moves to complete the swipe. Read only. |
| `start` | `() => unknown` | Make the change that starts the view transition, for example close a dialog inside `startTransition()`. - Return `false` to start no swipe (for example when there is nothing to go back to). Read only. |
| `cancel` | `() => PromiseLike<void> \| void` | Put back the state from before `start()`, when the swipe is cancelled. - Return a promise that resolves after React commits, so the transition ends on the right page. Read only. |
| `commit` | `(() => void) \| undefined` | Finish the change for real, after the slide reaches the end. Read only. Optional. |
| `edge` | `number \| undefined` | Start only when the finger goes down this close to the screen edge it moves away from, in pixels (for example `24` for swipe-back). - Leave it out to start anywhere on the target. Read only. Optional. |
| `distance` | `number \| undefined` | Part of the target's size a slow drag must pass to complete. Read only. Defaults to `0.35`. |
| `ignore` | `string \| undefined` | Never start a swipe on an element inside one that matches this selector, for example `"nav"`. Read only. Optional. |
| `disabled` | `boolean \| undefined` | Turn the swipe off. Read only. Optional. |
