# useSwipe

Swipe an element (or the whole page) to make a change, and scrub the change's view transition with the finger.

**Things to know:**

- Give it three functions. `start` makes the change, inside a transition, so React starts a view transition. `cancel` puts back the state from before. `commit` finishes the change for real after the slide ends.
- `start` runs when the finger has moved a few pixels in `direction`. Return `false` from it to start no swipe.
- While the finger moves, the transition follows it through `TransitionScrub`. Progress is the drag distance divided by the target's size in that direction (the screen size for `document`).
- On release past `distance` (default 35%), or after a flick, the slide plays to the end and `commit` runs. Otherwise the slide plays back and `cancel` runs. Return a promise from `cancel` that resolves after React commits, so the slide ends on the right state.
- It does not start on a field, inside an element that can still scroll the other way, or inside a `<dialog>` that does not hold the target.
- `edge` limits the start to a strip along the screen edge the finger moves away from, for example `24` for swipe-back from the left edge.
- Only one swipe runs at a time. A swipe on `document` decides first, so an edge swipe wins over a swipe on an element below it.
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
