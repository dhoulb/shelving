import type { ReactElement, ReactNode } from "react";
import { Code } from "../inline/Code.js";
import { Link } from "../inline/Link.js";
import { getTreeElement, useTreeMap } from "./TreeContext.js";

/**
 * Props for the `TreeLink` component — the element reference plus an optional label.
 *
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeLink/TreeLinkProps
 */
export interface TreeLinkProps {
	/** Reference to an element in the tree — a flat key (`"BooleanSchema"`, `"Store.get"`) or a canonical path (`"/schema/BooleanSchema"`). */
	readonly name: string;
	/** Visible label — defaults to `name` (typically a raw type expression like `"SlugSchemaOptions"`). */
	readonly children?: ReactNode | undefined;
}

/**
 * Inline [`Code`](/ui/Code) token linking to a specific tree element, resolved by reference string — the link-styled counterpart of [`TreeButton`](/ui/TreeButton).
 *
 * - Resolves `name` via [`getTreeElement()`](/ui/getTreeElement) — by flat key or canonical path, falling back to the bare name for a single generic type (`Schema<T>` → `Schema`) — and links to the element's canonical `path`.
 * - A hit becomes a [`<Link>`](/ui/Link) wrapping a `<Code>` token; a miss (e.g. a builtin like `string` or a compound type like `T | null` that isn't an exact token) stays a plain `<Code>` so it still reads as code.
 * - Designed for the `Type` column of the documentation Parameters / Returns / Throws / Types tables, where only exact-match type names should link.
 *
 * @kind component
 * @returns A `<Code>` token, wrapped in a `<Link>` when the reference resolves.
 * @example <TreeLink name="BooleanSchema" />
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeLink/TreeLink
 */
export function TreeLink({ name, children }: TreeLinkProps): ReactElement {
	const href = getTreeElement(useTreeMap(), name)?.props.path;
	const code = <Code>{children ?? name}</Code>;
	// A resolved reference links via its canonical `path`; an unresolved one stays a plain code token rather than an empty link.
	return href ? <Link href={href}>{code}</Link> : code;
}
