# FixedLayout

A full-viewport layout with no chrome: the whole screen is one content slot. It locks the document, so the page behind never scrolls or rubber-bands, and gives a full-height slot inside the safe areas. Use it for log-in and error screens, and other full-screen pages.

**Things to know:**

- It is a frame only. It does not scroll or centre. Fill the slot with `<Scroll vertical cover>`, so the content scrolls inside it.
- Centre the content in the page itself, for example with `<Block height="full" middle width="narrow">`: it puts the content in the middle of the screen, and it still scrolls when it is taller.
- The slot stays clear of the home bar and the rounded screen corners (safe-area insets).
- The slot goes up to the top of the screen. It sets `--scroll-inset-top` to the notch, so `<Scroll vertical cover>` starts its content below the notch, and the content scrolls up under it.
- For pages that you move back and forth between, put a `<RouteCache>` around the scroll box, as in `<AppLayout>`.
- Pick it above the router, or in each page inside `<RouteCache>`, for example for a full-screen page in a stack where the other pages have a tab bar. See "Composing an app" on `<App>`.

## Usage

### A log-in screen

The content is in the middle of the screen, and scrolls when it is taller.

```tsx live "A log-in screen"
import { useState } from "react";
import { Block, Button, Field, FixedLayout, Paragraph, Scroll, TextInput, Title } from "shelving/ui";

function LoginPage() {
	const [email, setEmail] = useState("");
	return (
		<FixedLayout>
			<Scroll vertical cover>
				<Block height="full" middle width="narrow" padding="xlarge" indent="normal">
					<Title>Log in</Title>
					<Paragraph>We'll email you a link to log in.</Paragraph>
					<Field title="Email address">
						<TextInput name="email" input="email" value={email} onValue={setEmail} />
					</Field>
					<Button solid color="primary" full onClick={() => {}}>
						Send link
					</Button>
				</Block>
			</Scroll>
		</FixedLayout>
	);
}

<LoginPage />;
```

### With a router

```tsx
import { Block, FixedLayout, Router, Scroll } from "shelving/ui";

// The signed-out screens: one layout around their own router.
<FixedLayout>
	<Scroll vertical cover>
		<Router
			routes={{
				"/login": LoginPage,
				"/register": RegisterPage,
			}}
		/>
	</Scroll>
</FixedLayout>;

// Each page centres its own content.
function LoginPage() {
	return (
		<Page title="Log in">
			<Block height="full" middle width="narrow" padding="xxlarge" indent="normal">
				<LoginForm />
			</Block>
		</Page>
	);
}
```

An app-level error, outside every other layout:

```tsx
import { Catcher, ErrorPage, type ErrorProps, FixedLayout, Scroll } from "shelving/ui";

function AppError({ reason }: ErrorProps) {
	return (
		<FixedLayout>
			<Scroll vertical cover>
				<ErrorPage reason={reason} />
			</Scroll>
		</FixedLayout>
	);
}

<Catcher as={AppError}>…</Catcher>;
```

## Styling

Override these hooks at `:root`. The tint hooks (`--fixed-layout-background`, `--fixed-layout-color`) are declared again in every tint scope, so override them at `:root, .tint`.

| Variable                    | Styles                                      | Default                   |
| --------------------------- | ------------------------------------------- | ------------------------- |
| `--fixed-layout-background` | Page background while the layout is mounted | `var(--tint-100)` (white) |
| `--fixed-layout-color`      | Text colour for the layout                  | `var(--tint-00)` (black)  |

**Global tokens it reads** — `--tint-00` and `--tint-100`.
