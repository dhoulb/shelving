import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import PARAGRAPH_CSS from "./Paragraph.module.css";

export interface ParagraphProps extends OptionalChildProps {
	/** Align the paragraph to the right. */
	right?: boolean | undefined;
	/** Align the paragraph to the center. */
	center?: boolean | undefined;
	/** Align the paragraph to the left. */
	left?: boolean | undefined;
	/** Give the paragraph more space. */
	spacious?: boolean | undefined;
}

export function Paragraph({ children, ...variants }: ParagraphProps): ReactElement {
	return <p className={getModuleClass(PARAGRAPH_CSS, "paragraph", variants)}>{children}</p>;
}

export { PARAGRAPH_CSS };
