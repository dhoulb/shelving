import { type ReactElement, use } from "react";
import { LeftIcon } from "../../icon/LeftIcon.js";
import type { AbsolutePath } from "../../util/path.js";
import { Button, type ButtonProps } from "../button/Button.js";
import { requireMeta } from "../misc/MetaContext.js";
import { getClass } from "../util/css.js";
import { NavigationContext } from "./NavigationContext.js";

/**
 * Props for `<BackButton>`: an optional `href` to go back to when the stack has no page before this one, plus the usual `Button` props except `onClick`.
 *
 * @see https://shelving.cc/ui/BackButtonProps
 */
export interface BackButtonProps extends Omit<ButtonProps, "href" | "onClick"> {
	/** Where to go back to when the current stack has no page before this one (for example, the app was opened at this page). Without it, the button does not show then. */
	readonly href?: AbsolutePath | undefined;
}

/**
 * Back button for the current stack.
 * - Goes back to the page before this one in the current stack, wherever you came from.
 * - Goes to `href` when the stack has no page before this one: the app was opened at this page, or the browser has no Navigation API.
 * - Renders nothing when the stack has no page before this one and there is no `href` (for example, at the root of a stack).
 * - It is a plain link with `className="back"`, so it slides back, and it works in a server render and with a middle-click.
 *
 * @kind component
 * @see https://shelving.cc/ui/BackButton
 */
export function BackButton({ href, className, title = "Back", children = <LeftIcon />, ...props }: BackButtonProps): ReactElement | null {
	const nav = use(NavigationContext);
	const { stack = null, ordinal } = requireMeta();
	const parent = nav && ordinal ? nav.history(stack)[ordinal - 1] : undefined;
	const target = parent ?? href;
	if (!target) return null;
	return (
		<Button {...props} title={title} href={target} className={getClass("back", className)}>
			{children}
		</Button>
	);
}
