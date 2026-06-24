import type { ReactElement } from "react";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import BLOCKQUOTE_CSS from "./Blockquote.module.css";

const BLOCKQUOTE_CLASS = getModuleClass(BLOCKQUOTE_CSS, "blockquote");

/**
 * Props for `Blockquote` — colour, space, and typography variants plus optional children.
 *
 * @see https://shelving.cc/ui/BlockquoteProps
 */
export interface BlockquoteProps extends BlockVariants, OptionalChildProps {}

/**
 * Quoted block of text — rendered as `<blockquote>`.
 *
 * @kind component
 * @example <Blockquote>To be or not to be.</Blockquote>
 * @see https://shelving.cc/ui/Blockquote
 */
export function Blockquote({ children, ...props }: BlockquoteProps): ReactElement {
	return (
		<blockquote
			className={getClass(
				BLOCKQUOTE_CLASS, //
				getBlockClass(props),
			)}
		>
			{children}
		</blockquote>
	);
}
