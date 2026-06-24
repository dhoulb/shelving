import type { ReactElement } from "react";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/index.js";
import CAPTION_CSS from "./Caption.module.css";

const CAPTION_CLASS = getModuleClass(CAPTION_CSS, "divider");

/**
 * Props for `Caption` — colour, space, and typography variants plus optional children.
 *
 * @see https://shelving.cc/ui/CaptionProps
 */
export interface CaptionProps extends BlockVariants, OptionalChildProps {}

/**
 * `<figcaption>` block — caption text for a `<Figure>`.
 *
 * @kind component
 * @example <Figure><Image src="/cat.jpg" /><Caption>A cat</Caption></Figure>
 * @see https://shelving.cc/ui/Caption
 */
export function Caption({ children, ...props }: CaptionProps): ReactElement {
	return (
		<figcaption
			className={getClass(
				CAPTION_CLASS, //
				getBlockClass(props),
			)}
		>
			{children}
		</figcaption>
	);
}
