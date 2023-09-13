import { isArray } from "./array.js";

/** Set of valid props for a JSX element. */
export type JSXProps = {
	[key: string]: unknown;
	children?: JSXNode;
};

/** JSX element (similar to `React.ReactElement`)  */
export type JSXElement<P extends JSXProps = JSXProps> = {
	type: string | ((props: P) => JSXElement | null);
	props: P;
	key: string | number | null;
	ref?: null;
	$$typeof?: symbol;
};

/** JSX node (similar to `React.ReactNode`) */
export type JSXNode = undefined | null | string | JSXElement | JSXNode[];

/** Is an unknown value a JSX element? */
export const isJSXElement = (value: unknown): value is JSXElement => typeof value === "object" && value !== null && "type" in value;

/** Is an unknown value a JSX node? */
export const isJSXNode = (value: unknown): value is JSXNode => value === null || typeof value === "string" || isJSXElement(value) || isArray(value);

/**
 * Take a Markup JSX node and strip all tags from it to produce a plain text string.
 *
 * @param node A JsxNode, e.g. either a JSX element, a plain string, or null/undefined (or an array of those things).
 * @returns The combined string made from the JSX node.
 *
 * @example `- Item with *strong*\n- Item with _em_` becomes `Item with strong Item with em`
 */
export function getJSXNodeText(node?: JSXNode): string {
	if (typeof node === "string") return node;
	if (isArray(node)) return node.map(getJSXNodeText).filter(Boolean).join(" ");
	if (isJSXElement(node)) return getJSXNodeText(node.props.children);
	return "";
}

/**
 * Iterate through all elements in a node.
 * - This is useful if you, e.g. want to apply a `className` to all `<h1>` elements, or make a list of all URLs found in a Node.
 */
export function* getJSXNodeElements(node: JSXNode): Iterable<JSXElement> {
	if (isArray(node)) {
		for (const n of node) yield* getJSXNodeElements(n);
	} else if (isJSXElement(node)) {
		yield node;
		if (node.props.children) yield* getJSXNodeElements(node.props.children);
	}
}
