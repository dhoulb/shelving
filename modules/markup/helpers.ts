import { serialise } from "../util/index.js";
import type { MarkupElement, MarkupNode } from "./types.js";

/**
 * Take a Markup JSX node and strip all tags from it to produce a plain text string.
 *
 * @param node A JsxNode, e.g. either a JSX element, a plain string, or null/undefined (or an array of those things).
 * @returns The combined string made from the JSX node.
 *
 * @example `- Item with *strong*\n- Item with _em_` becomes `Item with strong Item with em`
 */
export function nodeToText(node: MarkupNode): string {
	if (typeof node === "string") return node;
	if (node instanceof Array) return node.map(nodeToText).join(" ");
	if (typeof node === "object" && node) return nodeToText(node.props.children);
	return "";
}

/**
 * Take a Markup JSX node and convert it to an HTML string.
 *
 * @param node Any `MarkupNode`, i.e. a string, `MarkupElement`, or array of those.
 * - Any props in the node will be rendered if they are strings or numbers or `true`. All other props are skipped.
 * @returns The HTML generated from the node.
 *
 * @example `- Item with *strong*\n- Item with _em_` becomes `<ul><li>Item with <strong>strong</strong></li><li>Item with <em>em</em></ul>`
 */
export function nodeToHtml(node: MarkupNode): string {
	if (typeof node === "string") return node;
	if (node instanceof Array) return node.map(nodeToHtml).join("");
	if (typeof node === "object" && node) {
		const {
			type,
			props: { children, ...props },
		} = node;
		const strings = Object.entries(props).map(propToString).filter(Boolean);
		return `<${type}${strings.length ? ` ${strings.join(" ")}` : ""}>${nodeToHtml(children)}</${type}>`;
	}
	return "";
}
const propToString = ([key, value]: [string, unknown]) =>
	value === true
		? key
		: typeof value === "number" && Number.isFinite(value)
		? `${key}="${value.toString()}"`
		: typeof value === "string"
		? `${key}=${serialise(value)}`
		: "";

/**
 * Iterate through all elements in a node.
 * - This is useful if you, e.g. want to apply a `className` to all `<h1>` elements, or make a list of all URLs found in a Node.
 */
export function* yieldElements(node: MarkupNode): Generator<MarkupElement, void> {
	if (node instanceof Array) for (const n of node) yield* yieldElements(n);
	else if (typeof node === "object" && node) {
		yield node;
		if (node.props.children) yield* yieldElements(node.props.children);
	}
}
