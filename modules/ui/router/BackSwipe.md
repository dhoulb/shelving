# BackSwipe

Swipe from the left edge of the screen to go back one page in the current stack, by scrubbing the normal back slide with the finger.

**Things to know:**

- It renders nothing. Put it inside `<Navigation>`, next to the pages.
- It is built on `useSwipe()`. When the swipe starts, it publishes the page below as a `"back"` event with `NavigationSequence.publish()`. History does not change yet. `<Navigation>` shows that page in a back transition, with every transition the layout has, and the finger scrubs it.
- On release past about a third, or after a flick, the slide ends and it calls `NavigationSequence.back()`. That publishes the same page again, which `<Navigation>` skips, so there is no second slide.
- A swipe that goes back plays the slide back and publishes the page it started on again. The URL never changes.
- On the bottom page of a stack, or on a floating page, it does nothing, so it never goes back into another tab.
- It ignores touches in a `<nav>` and in dialogs.
- Browsers and web apps on iOS have their own edge swipe. Render `BackSwipe` only where the app owns the gesture, for example in a native wrapper.

## Usage

```tsx
import { BackSwipe, Navigation, RouteCache, Router } from "shelving/ui";

<Navigation>
	<BackSwipe />
	<RouteCache>
		<Router routes={ROUTES} />
	</RouteCache>
</Navigation>;
```
