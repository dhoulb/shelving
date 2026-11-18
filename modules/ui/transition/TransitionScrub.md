# TransitionScrub

Take manual control of the view transition that an update starts: move it to any point, then play it to the end, or play it back and undo the update.

**Things to know:**

- The constructor runs the update at once and catches the next view transition that starts. With React, that is the transition React starts for a state change inside `startTransition()`.
- When the transition is ready, every animation in it is paused. `TransitionScrub.seek()` moves them, from `0` (start) to `1` (end).
- `TransitionScrub.finish()` plays from where it is to the end. `TransitionScrub.cancel()` plays back to the start, runs your undo, waits for it, and then ends the transition. The undo must put the page back as it was before the update.
- If the update returns `false`, nothing is caught and `TransitionScrub.started` is `false`.
- Without view transitions, or when the update starts none within a second, the update still happens: `seek()` does nothing, `finish()` ends at once, and `cancel()` only runs the undo.
- Only one view transition runs at a time. Another one that starts skips this one to its end.
- `useSwipe()` drives a `TransitionScrub` from a finger. Use the class directly for other inputs, such as a slider.

## Usage

```ts
import { TransitionScrub } from "shelving/ui";

const scrub = new TransitionScrub(() => dialogs.delete(dialog));
scrub.seek(0.4); // 40% of the way through the close.
await scrub.finish(); // Play to the end.
// Or play back to the start and undo the change:
await scrub.cancel(() => dialogs.add(dialog));
```
