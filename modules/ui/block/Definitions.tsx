import type { ReactElement, ReactNode } from "react";
import { getModuleClass } from "../util/css.js";
import styles from "./Definitions.module.css";

export interface DefinitionsProps {
	children?: ReactNode;
	/** Lay out each term/value pair side-by-side instead of stacked (collapses to stacked at narrow widths). */
	row?: boolean | undefined;
}

/**
 * Description list — a sequence of term/value pairs rendered as a `<dl>`.
 * - Each child should be a `<Definition>` (which renders the `<dt>`/`<dd>` pair wrapped in a `<div>`).
 * - Defaults to stacked layout (term above value). Pass `row` for side-by-side layout that collapses to stacked at narrow widths.
 *
 * @example
 * <Definitions>
 *   <Definition term="Name">Dave</Definition>
 *   <Definition term="Role">Engineer</Definition>
 * </Definitions>
 */
export function Definitions({ children, ...variants }: DefinitionsProps): ReactElement {
	return <dl className={getModuleClass(styles, "definitions", variants)}>{children}</dl>;
}

export interface DefinitionProps {
	/** The term — what's being defined. Rendered as `<dt>`. */
	term: ReactNode;
	/** The value — the definition. Rendered as `<dd>`. */
	children?: ReactNode;
}

/**
 * A single term/value pair within a `<Definitions>` list.
 * - Wraps the `<dt>`/`<dd>` pair in a `<div>` so each pair is a single grouped element (valid HTML5 inside `<dl>`).
 * - This sidesteps the dl-shaped wart of having no per-pair wrapper; it also gives the row/stacked layout something concrete to target.
 */
export function Definition({ term, children }: DefinitionProps): ReactElement {
	return (
		<div className={styles.pair}>
			<dt className={styles.term}>{term}</dt>
			<dd className={styles.value}>{children}</dd>
		</div>
	);
}
