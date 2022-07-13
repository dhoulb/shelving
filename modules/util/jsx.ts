import { Data } from "./data.js";

/** Function that creates a JSX element. */
export type JSXElementCreator<P extends Data = Data> = (props: P) => JSXElement | null;

/** Set of valid props for a JSX element. */
export type JSXProps = { readonly [key: string]: unknown; readonly children?: JSXNode };

/** JSX element (similar to `React.ReactElement`)  */
export type JSXElement<P extends JSXProps = JSXProps> = {
	type: string | JSXElementCreator<P>;
	props: P;
	key: string | number | null;
	ref: null;
	$$typeof?: symbol;
};

/** JSX node (similar to `React.ReactNode`) */
export type JSXNode = undefined | null | string | JSXElement | JSXNode[];

/** Is an unknown value a JSX element? */
export const isElement = <T extends JSXNode>(el: T | unknown): el is T => typeof el === "object" && el !== null && "type" in el;

/** Is an unknown value a JSX node? */
export const isNode = <T extends JSXNode>(node: T | unknown): node is T => node === null || typeof node === "string" || isElement(node) || node instanceof Array;

/**
 * Take a Markup JSX node and strip all tags from it to produce a plain text string.
 *
 * @param node A JsxNode, e.g. either a JSX element, a plain string, or null/undefined (or an array of those things).
 * @returns The combined string made from the JSX node.
 *
 * @example `- Item with *strong*\n- Item with _em_` becomes `Item with strong Item with em`
 */
export function nodeToText(node?: JSXNode): string {
	if (typeof node === "string") return node;
	if (node instanceof Array) return node.map(nodeToText).join(" ");
	if (typeof node === "object" && node) return nodeToText(node.props.children);
	return "";
}

/**
 * Iterate through all elements in a node.
 * - This is useful if you, e.g. want to apply a `className` to all `<h1>` elements, or make a list of all URLs found in a Node.
 */
export function* yieldElements(node: JSXNode): Generator<JSXElement, void> {
	if (node instanceof Array) for (const n of node) yield* yieldElements(n);
	else if (typeof node === "object" && node) {
		yield node;
		if (isNode(node.props.children)) yield* yieldElements(node.props.children);
	}
}
