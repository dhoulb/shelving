# StackButton

A button for one stack in a tab bar. It acts like a tab button in a phone app.

**Things to know:**

- Tap another stack's button: go to the page you left in that stack. The page slides left or right, by tab order.
- Tap the current stack's button: go back to the root path of the stack. The page slides back. If the root is not in the history (for example after a deep link), it opens the root.
- Tap it again on the root path: scroll the page to the top. It scrolls the window, and each visible `<main>` or `[data-scroll]` element.
- It is selected (`aria-current`) while its stack is the current stack. On a floating page (for example a deep link or a login page), no stack button is selected.
- `stack` must be one of the `stacks` on `<Navigation>`.
- It takes the usual `<Button>` props, except `href`, `onClick` and `selected`.
- Without the browser Navigation API, and in a server render, it is a plain link to the stack's root. It is selected while its stack is the starting stack.
- In a server-rendered app, the server renders a link and the browser renders a button, so React warns about a hydration mismatch on the first render. A client-only app (with `<App>`) has no mismatch.

## Usage

```tsx
import { Navigation, StackButton } from "shelving/ui";
import { HomeIcon, SearchIcon, UserIcon } from "./icons.js";

<Navigation stacks={["/home", "/discover", "/profile"]}>
	{/* … */}
	<nav className="tab-bar">
		<StackButton stack="/home" title="Home">
			<HomeIcon />
		</StackButton>
		<StackButton stack="/discover" title="Discover">
			<SearchIcon />
		</StackButton>
		<StackButton stack="/profile" title="Profile">
			<UserIcon />
		</StackButton>
	</nav>
</Navigation>;
```

## Styling

`<StackButton>` renders a `<Button>`, so it has the same styling hooks. See `<Button>`.
