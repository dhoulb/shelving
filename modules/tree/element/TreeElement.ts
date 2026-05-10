import type { Element, ElementProps, Elements } from "../../util/element.js";

/** Props for a tree element — must have a `tree-` prefixed type. */
export interface TreeElementProps extends ElementProps {
	readonly title?: string | undefined;
	readonly description?: string | undefined;
	readonly content?: Elements | undefined;
}

/** Element in a tree with a `tree-` prefixed type string. */
export interface TreeElement<P extends TreeElementProps = TreeElementProps> extends Element<P> {
	readonly type: `tree-${string}`;
}
