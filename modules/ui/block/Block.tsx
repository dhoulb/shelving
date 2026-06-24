import type { ReactElement } from "react";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import type { OptionalChildProps } from "../util/props.js";

/**
 * Semantic element names a block element may render as via its `as` prop.
 *
 * @see https://shelving.cc/ui/BlockElement
 */
export type BlockElement = "div" | "section" | "header" | "footer" | "article" | "nav" | "aside" | "figure";

/**
 * Props for `Block` — colour, space, typography, and width variants plus an optional `as` element override.
 *
 * @see https://shelving.cc/ui/BlockProps
 */
export interface BlockProps extends BlockVariants, OptionalChildProps {
	/**
	 * Element this `<Block>` renders as, e.g. "header" to output a "<header>"
	 * @default "div"
	 */
	as?: BlockElement | undefined;
}

/**
 * Plain `<div>` block with block-level spacing.
 * - Pass `as` to render a different semantic element (`section`, `header`, `footer`, `nav`, `aside`, `figure`).
 *
 * @kind component
 * @example <Block><Paragraph>Hello</Paragraph></Block>
 * @example <Block as="aside" width="narrow"><Paragraph>Sidebar</Paragraph></Block>
 * @see https://shelving.cc/ui/Block
 */
export function Block({ as: Element = "div", children, ...props }: BlockProps): ReactElement {
	return <Element className={getBlockClass(props)}>{children}</Element>;
}
