import type { ReactElement } from "react";
import CODE_CSS from "../inline/Code.module.css";
import DELETED_CSS from "../inline/Deleted.module.css";
import EMPHASIS_CSS from "../inline/Emphasis.module.css";
import INSERTED_CSS from "../inline/Inserted.module.css";
import LINK_CSS from "../inline/Link.module.css";
import MARK_CSS from "../inline/Mark.module.css";
import SMALL_CSS from "../inline/Small.module.css";
import STRONG_CSS from "../inline/Strong.module.css";
import SUBSCRIPT_CSS from "../inline/Subscript.module.css";
import SUPERSCRIPT_CSS from "../inline/Superscript.module.css";
import { getClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import ADDRESS_CSS from "./Address.module.css";
import BLOCKQUOTE_CSS from "./Blockquote.module.css";
import CAPTION_CSS from "./Caption.module.css";
import DEFINITIONS_CSS from "./Definitions.module.css";
import DIVIDER_CSS from "./Divider.module.css";
import HEADING_CSS from "./Heading.module.css";
import IMAGE_CSS from "./Image.module.css";
import LIST_CSS from "./List.module.css";
import PARAGRAPH_CSS from "./Paragraph.module.css";
import PREFORMATTED_CSS from "./Preformatted.module.css";
import SECTION_CSS from "./Section.module.css";
import SUBHEADING_CSS from "./Subheading.module.css";
import TABLE_CSS from "./Table.module.css";
import TITLE_CSS from "./Title.module.css";

// Combine the `.prose` class from every block and inline component's CSS module into a single string.
const PROSE_STYLES = getClass(
	PARAGRAPH_CSS.prose,
	HEADING_CSS.prose,
	SUBHEADING_CSS.prose,
	ADDRESS_CSS.prose,
	BLOCKQUOTE_CSS.prose,
	SECTION_CSS.prose,
	CODE_CSS.prose,
	DEFINITIONS_CSS.prose,
	DELETED_CSS.prose,
	EMPHASIS_CSS.prose,
	IMAGE_CSS.prose,
	INSERTED_CSS.prose,
	CAPTION_CSS.prose,
	LIST_CSS.prose,
	TITLE_CSS.prose,
	LINK_CSS.prose,
	MARK_CSS.prose,
	PREFORMATTED_CSS.prose,
	SMALL_CSS.prose,
	STRONG_CSS.prose,
	SUBSCRIPT_CSS.prose,
	SUPERSCRIPT_CSS.prose,
	TABLE_CSS.prose,
	DIVIDER_CSS.prose,
);

/**
 * Props for `Prose` — just the longform `children` to style.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Prose/ProseProps
 */
export interface ProseProps extends OptionalChildProps {}

/**
 * A section of longform text containing lots of `<p>` or `<ul>` style elements.
 * - Applies the prose variant of every block and inline component so nested content picks up the right longform spacing and typography.
 *
 * @kind component
 * @param props The longform `children` to render inside the prose container.
 * @returns Rendered `<div>` wrapping the prose content.
 * @example <Prose><Paragraph>First.</Paragraph><Paragraph>Second.</Paragraph></Prose>
 * @see https://dhoulb.github.io/shelving/ui/block/Prose/Prose
 */
export function Prose({ children }: ProseProps): ReactElement {
	return <div className={PROSE_STYLES}>{children}</div>;
}
