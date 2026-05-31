import type { ReactElement } from "react";
import { joinPath } from "../../util/path.js";
import { Button, type ButtonVariants } from "../form/Button.js";
import { useTreeMap } from "../tree/TreeContext.js";

/** Props for `DocumentationButton`. */
export interface DocumentationButtonProps extends ButtonVariants {
	/**
	 * Raw reference string for the target symbol — a bare name (`"Store"`) or a qualified member (`"Store.get"`).
	 * - Resolved against the tree index from `<TreeContext>`; an unresolved reference (e.g. a builtin like `"Serializable"`) renders as a non-linking label.
	 */
	readonly to: string;
	/** Visible label — defaults to `to`. */
	readonly children?: string | undefined;
}

/**
 * Small button linking to a specific `tree-documentation` element, resolved by reference string.
 * - Looks `to` up in the flattened tree map (`useTreeMap()`); a hit becomes an `<a>` link, a miss a disabled `<button>` so builtins still read as labels.
 * - Defaults to `small plain` styling; pass other `ButtonVariants` to override.
 *
 * @example <DocumentationButton to="Store.get">Store.get()</DocumentationButton>
 */
export function DocumentationButton({
	to,
	children = to,
	small = true,
	plain = true,
	...variants
}: DocumentationButtonProps): ReactElement {
	const entry = useTreeMap().get(to);
	const href = entry ? joinPath("/", entry.path) : undefined;
	return (
		<Button small={small} plain={plain} {...variants} href={href} disabled={!href}>
			{children}
		</Button>
	);
}
