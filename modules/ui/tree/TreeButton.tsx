import type { ReactElement, ReactNode } from "react";
import { joinPath } from "../../util/path.js";
import { Button, type ButtonVariants } from "../form/Button.js";
import { useTreeMap } from "./TreeContext.js";

/** Props for `TreeButton`. */
export interface TreeButtonProps extends ButtonVariants {
	/** Name of an element in the tree, e.g. `"Store"` or `"Store.get"`. */
	readonly name: string;
	/** Visible label — defaults to `to`. */
	readonly children?: ReactNode | undefined;
}

/**
 * Small button linking to a specific `tree-documentation` element, resolved by reference string.
 * - Looks `to` up in the flattened tree map (`useTreeMap()`); a hit becomes an `<a>` link, a miss a disabled `<button>` so builtins still read as labels.
 * - Defaults to `small plain` styling; pass other `ButtonVariants` to override.
 *
 * @example <TreeButton to="Store.get">Store.get()</TreeButton>
 */
export function TreeButton({ name, children, small = true, plain = true, ...variants }: TreeButtonProps): ReactElement {
	const entry = useTreeMap().get(name);
	const href = entry ? joinPath("/", entry.path) : undefined;
	return (
		<Button small={small} plain={plain} {...variants} href={href} disabled={!href}>
			{children ?? entry?.element.props.title ?? name}
		</Button>
	);
}
