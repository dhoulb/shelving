import type { ReactElement, ReactNode } from "react";
import codeStyles from "../inline/Code.module.css";
import deletedStyles from "../inline/Deleted.module.css";
import emphasisStyles from "../inline/Emphasis.module.css";
import insertedStyles from "../inline/Inserted.module.css";
import linkStyles from "../inline/Link.module.css";
import markStyles from "../inline/Mark.module.css";
import smallStyles from "../inline/Small.module.css";
import strongStyles from "../inline/Strong.module.css";
import subscriptStyles from "../inline/Subscript.module.css";
import superscriptStyles from "../inline/Superscript.module.css";
import { getClass } from "../util/css.js";
import addressStyles from "./Address.module.css";
import blockquoteStyles from "./Blockquote.module.css";
import dividerStyles from "./Divider.module.css";
import figureStyles from "./Figure.module.css";
import headingStyles from "./Heading.module.css";
import imageStyles from "./Image.module.css";
import listStyles from "./List.module.css";
import paragraphStyles from "./Paragraph.module.css";
import preformattedStyles from "./Preformatted.module.css";
import subheadingStyles from "./Subheading.module.css";
import tableStyles from "./Table.module.css";

const PROSE_STYLES = getClass(
	paragraphStyles.prose,
	headingStyles.prose,
	subheadingStyles.prose,
	addressStyles.prose,
	blockquoteStyles.prose,
	codeStyles.prose,
	deletedStyles.prose,
	emphasisStyles.prose,
	figureStyles.prose,
	imageStyles.prose,
	insertedStyles.prose,
	listStyles.prose,
	linkStyles.prose,
	markStyles.prose,
	preformattedStyles.prose,
	smallStyles.prose,
	strongStyles.prose,
	subscriptStyles.prose,
	superscriptStyles.prose,
	tableStyles.prose,
	dividerStyles.prose,
);

export interface ProseProps {
	children?: ReactNode;
}

/** A section of longform text containing lots of `<p>` or `<ul>` style elements. */
export function Prose({ children }: ProseProps): ReactElement {
	return <div className={PROSE_STYLES}>{children}</div>;
}
