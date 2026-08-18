import type { ReactElement } from "react";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ClassProps, OptionalChildProps } from "../util/props.js";
import PARAGRAPH_CSS from "./Paragraph.module.css";

const PARAGRAPH_CLASS = getModuleClass(PARAGRAPH_CSS, "paragraph");

/**
 * Props for `Paragraph` — colour, space, and typography variants.
 *
 * @see https://shelving.cc/ui/ParagraphProps
 */
export interface ParagraphProps extends BlockVariants, OptionalChildProps, ClassProps {}

/**
 * Paragraph block of body text — rendered as `<p>`.
 *
 * @kind component
 * @see https://shelving.cc/ui/Paragraph
 */
export function Paragraph({ children, className, ...props }: ParagraphProps): ReactElement {
	return (
		<p
			className={getClass(
				PARAGRAPH_CLASS, //
				getBlockClass(props),
				className,
			)}
		>
			{children}
		</p>
	);
}
