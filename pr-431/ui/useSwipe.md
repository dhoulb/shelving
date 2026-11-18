# useSwipe()

- Kind: function
- Import: `import { useSwipe } from "shelving/ui";`

Swipe a target to complete a change, and scrub the change's view transition with the finger.

- When the finger moves the right way, it calls `start()` and catches the view transition that starts, with `TransitionScrub`.
- While the finger moves, the transition follows it. Progress is the drag distance divided by the target's size in that direction (the screen size for `document`).
- On release, past `distance` or after a flick, it plays the transition to the end and calls `commit()`. Otherwise it plays it back and calls `cancel()`.
- It does not start when the finger is on a field, inside an element that can still scroll that way, or inside a `<dialog>` that does not hold the target.
- Only one swipe runs at a time. A swipe on `document` listens first, so an edge swipe wins over a swipe on an element below it.

Swipe an element (or the whole page) to make a change, and scrub the change's view transition with the finger.

**Things to know:**

- Give it three functions. `start` makes the change, inside a transition, so React starts a view transition. `cancel` puts back the state from before. `commit` finishes the change for real after the slide ends.
- `start` runs when the finger has moved a few pixels in `direction`. Return `false` from it to start no swipe.
- While the finger moves, the transition follows it through `TransitionScrub`. Progress is the drag distance divided by the target's size in that direction (the screen size for `document`).
- On release past `distance` (default 35%), or after a flick, the slide plays to the end and `commit` runs. Otherwise the slide plays back and `cancel` runs. Return a promise from `cancel` that resolves after React commits, so the slide ends on the right state.
- It does not start on a field, inside an element that can still scroll the other way, or inside a `<dialog>` that does not hold the target.
- `edge` limits the start to a strip along the screen edge the finger moves away from, for example `24` for swipe-back from the left edge.
- Only one swipe runs at a time. A swipe on `document` decides first, so an edge swipe wins over a swipe on an element below it.
- While a swipe runs, the page does not scroll (also in Safari). If the end of a touch is lost, the next touch ends the swipe, so it never stays stuck halfway.
- The swipe keeps working when `start` takes the touched element out of the page. If the content can keep state, hide it in a React `<Activity>` instead of unmounting it, so `cancel` can show it again as it was.

## Usage

### Swipe a panel down to close it

`<Modal>` does this for every pinned panel in a `<Dialog>`:

```tsx
const ref = useRef<HTMLElement>(null);
useSwipe(ref, {
	direction: "down",
	start: () => dialog.hide(), // Hide in a transition.
	cancel: () => dialog.show(), // Show again at once.
	commit: () => dialog.close(),
});
```

### Swipe a notice away

A notice holds no state, so removing it and adding it back is enough:

```tsx
useSwipe(ref, {
	direction: "right",
	start: () => notice.close(),
	cancel: () => NOTICES.add(notice),
});
```

### Swipe between tabs

```tsx
useSwipe(ref, {
	direction: "left",
	start: () => {
		if (!next) return false;
		startTransition(() => {
			addTransitionType("tab-forward");
			setShown(next);
		});
	},
	cancel: () => flushSync(() => setShown(current)),
	commit: () => setTab(next),
});
```


## Signatures

```ts
useSwipe(target: RefObject<Element | null> | Document, options: SwipeOptions): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `RefObject<Element \| null> \| Document` | The element to swipe, or `document` for the whole page. |
| `options` | `SwipeOptions` | What the swipe does. |
| `.direction` | `SwipeDirection` | Which way the finger moves to complete the swipe. Read only. |
| `.start` | `() => unknown` | Make the change that starts the view transition, for example close a dialog inside `startTransition()`. - Return `false` to start no swipe (for example when there is nothing to go back to). Read only. |
| `.cancel` | `() => PromiseLike<void> \| void` | Put back the state from before `start()`, when the swipe is cancelled. - Return a promise that resolves after React commits, so the transition ends on the right page. Read only. |
| `.commit` | `(() => void) \| undefined` | Finish the change for real, after the slide reaches the end. Read only. Optional. |
| `.edge` | `number \| undefined` | Start only when the finger goes down this close to the screen edge it moves away from, in pixels (for example `24` for swipe-back). - Leave it out to start anywhere on the target. Read only. Optional. |
| `.distance` | `number \| undefined` | Part of the target's size a slow drag must pass to complete. Read only. Defaults to `0.35`. |
| `.ignore` | `string \| undefined` | Never start a swipe on an element inside one that matches this selector, for example `"nav"`. Read only. Optional. |
| `.disabled` | `boolean \| undefined` | Turn the swipe off. Read only. Optional. |
