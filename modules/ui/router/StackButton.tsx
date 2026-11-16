import { type ReactElement, use } from "react";
import { useStore } from "../../react/useStore.js";
import type { AbsolutePath } from "../../util/path.js";
import { Button, type ButtonProps } from "../button/Button.js";
import { NavigationPositionContext, requireNavigation } from "./NavigationContext.js";

/**
 * Props for `<StackButton>`: the `stack` it opens, plus the usual `Button` props except `href` and `onClick`.
 *
 * @see https://shelving.cc/ui/StackButtonProps
 */
export interface StackButtonProps extends Omit<ButtonProps, "href" | "onClick" | "selected"> {
	/** Root path of the stack this button opens. It must be one of the `stacks` on `<Navigation>`. */
	readonly stack: AbsolutePath;
}

/**
 * Button for one stack in a tab bar.
 * - Tap another stack's button: go to the page you left in that stack. The page slides left or right by tab order.
 * - Tap the current stack's button: go back to its root.
 * - Tap it again at the root: scroll the page to the top.
 * - It is selected while its stack is the current stack.
 * - Without the browser Navigation API (and in a server render) it is a plain link to the stack's root.
 *
 * @kind component
 * @see https://shelving.cc/ui/StackButton
 */
export function StackButton({ stack, ...props }: StackButtonProps): ReactElement {
	const nav = requireNavigation();
	const current = useStore(nav.stack).value;
	const position = use(NavigationPositionContext);

	// No Navigation API (or a server render): a plain link to the root, selected while its stack is the current stack.
	if (!position) return <Button {...props} href={stack} selected={current === stack} />;

	const onClick = () => {
		if (current !== stack) return nav.forward(nav.history(stack).at(-1) ?? stack, stack);
		if (nav.history(stack).length > 1) return nav.back(stack, stack);
		window.scrollTo({ top: 0, behavior: "smooth" });
		for (const el of document.querySelectorAll<HTMLElement>("main, [data-scroll]"))
			if (el.offsetParent) el.scrollTo({ top: 0, behavior: "smooth" });
	};
	return <Button {...props} selected={current === stack} onClick={onClick} />;
}
