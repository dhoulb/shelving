import type { ReactElement } from "react";
import { CODE_PROSE_CLASS } from "../inline/Code.js";
import { DELETED_PROSE_CLASS } from "../inline/Deleted.js";
import { EMPHASIS_PROSE_CLASS } from "../inline/Emphasis.js";
import { INSERTED_PROSE_CLASS } from "../inline/Inserted.js";
import { LINK_PROSE_CLASS } from "../inline/Link.js";
import { MARK_PROSE_CLASS } from "../inline/Mark.js";
import { SMALL_PROSE_CLASS } from "../inline/Small.js";
import { STRONG_PROSE_CLASS } from "../inline/Strong.js";
import { SUBSCRIPT_PROSE_CLASS } from "../inline/Subscript.js";
import { SUPERSCRIPT_PROSE_CLASS } from "../inline/Superscript.js";
import { getClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import { ADDRESS_PROSE_CLASS } from "./Address.js";
import { BLOCKQUOTE_PROSE_CLASS } from "./Blockquote.js";
import { CAPTION_PROSE_CLASS } from "./Caption.js";
import { DEFINITIONS_PROSE_CLASS } from "./Definitions.js";
import { DIVIDER_PROSE_CLASS } from "./Divider.js";
import { HEADING_PROSE_CLASS } from "./Heading.js";
import { IMAGE_PROSE_CLASS } from "./Image.js";
import { LIST_PROSE_CLASS } from "./List.js";
import { PARAGRAPH_PROSE_CLASS } from "./Paragraph.js";
import { PREFORMATTED_PROSE_CLASS } from "./Preformatted.js";
import { SECTION_PROSE_CLASS } from "./Section.js";
import { SUBHEADING_PROSE_CLASS } from "./Subheading.js";
import { TABLE_PROSE_CLASS } from "./Table.js";
import { TITLE_PROSE_CLASS } from "./Title.js";

const PROSE_STYLES = getClass(
	PARAGRAPH_PROSE_CLASS,
	HEADING_PROSE_CLASS,
	SUBHEADING_PROSE_CLASS,
	ADDRESS_PROSE_CLASS,
	BLOCKQUOTE_PROSE_CLASS,
	SECTION_PROSE_CLASS,
	CODE_PROSE_CLASS,
	DEFINITIONS_PROSE_CLASS,
	DELETED_PROSE_CLASS,
	EMPHASIS_PROSE_CLASS,
	IMAGE_PROSE_CLASS,
	INSERTED_PROSE_CLASS,
	CAPTION_PROSE_CLASS,
	LIST_PROSE_CLASS,
	TITLE_PROSE_CLASS,
	LINK_PROSE_CLASS,
	MARK_PROSE_CLASS,
	PREFORMATTED_PROSE_CLASS,
	SMALL_PROSE_CLASS,
	STRONG_PROSE_CLASS,
	SUBSCRIPT_PROSE_CLASS,
	SUPERSCRIPT_PROSE_CLASS,
	TABLE_PROSE_CLASS,
	DIVIDER_PROSE_CLASS,
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
 * @param props The longform `children` to render inside the prose container.
 * @returns Rendered `<div>` wrapping the prose content.
 * @example <Prose><Paragraph>First.</Paragraph><Paragraph>Second.</Paragraph></Prose>
 * @see https://dhoulb.github.io/shelving/ui/block/Prose/Prose
 */
export function Prose({ children }: ProseProps): ReactElement {
	return <div className={PROSE_STYLES}>{children}</div>;
}
