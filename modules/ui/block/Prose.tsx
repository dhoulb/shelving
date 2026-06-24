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
import BLOCK_CSS from "../style/Block.module.css";
import TABLE_CSS from "../table/Table.module.css";
import { getClass, getModuleClass } from "../util/css.js";
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
import TITLE_CSS from "./Title.module.css";
import VIDEO_CSS from "./Video.module.css";

// Combine the `.prose` class from every block and inline component's CSS module into a single string.
const PROSE_STYLES = getClass(
	getModuleClass(BLOCK_CSS, "block"),
	getModuleClass(VIDEO_CSS, "video"),
	getModuleClass(PARAGRAPH_CSS, "prose"),
	getModuleClass(HEADING_CSS, "prose"),
	getModuleClass(SUBHEADING_CSS, "prose"),
	getModuleClass(ADDRESS_CSS, "prose"),
	getModuleClass(BLOCKQUOTE_CSS, "prose"),
	getModuleClass(SECTION_CSS, "prose"),
	getModuleClass(CODE_CSS, "prose"),
	getModuleClass(DEFINITIONS_CSS, "prose"),
	getModuleClass(DELETED_CSS, "prose"),
	getModuleClass(EMPHASIS_CSS, "prose"),
	getModuleClass(IMAGE_CSS, "prose"),
	getModuleClass(INSERTED_CSS, "prose"),
	getModuleClass(CAPTION_CSS, "prose"),
	getModuleClass(LIST_CSS, "prose"),
	getModuleClass(TITLE_CSS, "prose"),
	getModuleClass(LINK_CSS, "prose"),
	getModuleClass(MARK_CSS, "prose"),
	getModuleClass(PREFORMATTED_CSS, "prose"),
	getModuleClass(SMALL_CSS, "prose"),
	getModuleClass(STRONG_CSS, "prose"),
	getModuleClass(SUBSCRIPT_CSS, "prose"),
	getModuleClass(SUPERSCRIPT_CSS, "prose"),
	getModuleClass(TABLE_CSS, "prose"),
	getModuleClass(DIVIDER_CSS, "prose"),
);

/**
 * Props for `Prose` — just the longform `children` to style.
 *
 * @see https://shelving.cc/ui/ProseProps
 */
export interface ProseProps extends OptionalChildProps {}

/**
 * A section of longform text containing lots of `<p>` or `<ul>` style elements.
 * - Applies the prose variant of every block and inline component so nested content picks up the right longform spacing and typography.
 *
 * @kind component
 * @returns Rendered `<div>` wrapping the prose content.
 * @example <Prose><Paragraph>First.</Paragraph><Paragraph>Second.</Paragraph></Prose>
 * @see https://shelving.cc/ui/Prose
 */
export function Prose({ children }: ProseProps): ReactElement {
	return <div className={PROSE_STYLES}>{children}</div>;
}
