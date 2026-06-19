import type { ReactElement, ReactNode } from "react";
import { Button, type ButtonVariants } from "../form/Button.js";
import { getTreeElement, useTreeMap } from "./TreeContext.js";

/**
 * Props for the `TreeButton` component — the element reference plus button variants.
 *
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeButton/TreeButtonProps
 */
export interface TreeButtonProps extends ButtonVariants {
	/** Reference to an element in the tree — a flat key (`"Store"`, `"Store.get"`) or a canonical path (`"/schema/BooleanSchema"`). */
	readonly name: string;
	/** Visible label — defaults to the resolved element's `title`, falling back to `name`. */
	readonly children?: ReactNode | undefined;
}

/**
 * Small button linking to a specific tree element, resolved by reference string.
 *
 * - Resolves `name` via [`getTreeElement()`](/ui/getTreeElement) — by flat key (`"Store"`, `"Store.get"`) or canonical path (`"/schema/BooleanSchema"`), falling back to the bare name for a single generic type (`"Schema<T>"` → `"Schema"`) — and links to the element's canonical `path`.
 * - A hit becomes an `<a>` link; a miss (e.g. a builtin like `Serializable`, or a compound type like `Foo | null`) stays a plain non-link label so it still reads as text.
 * - Defaults to `small plain` styling; pass other [`ButtonVariants`](/ui/ButtonVariants) to override.
 *
 * @returns A [`<Button>`](/ui/Button) element linking to the resolved element, or a plain label on a miss.
 * @kind component
 * @example <TreeButton name="Store.get">Store.get()</TreeButton>
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeButton/TreeButton
 */
export function TreeButton({ name, children, small = true, plain = true, ...variants }: TreeButtonProps): ReactElement {
	const element = getTreeElement(useTreeMap(), name);
	const href = element?.props.path;
	// A resolved element links via its canonical `path`; an unresolved reference is disabled (no `href`) so it renders as a non-link label rather than an empty `<a>`.
	return (
		<Button small={small} plain={plain} {...variants} {...(href ? { href } : { disabled: true })}>
			{children ?? element?.props.title ?? name}
		</Button>
	);
}
