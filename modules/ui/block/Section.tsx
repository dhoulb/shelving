import type { ReactElement } from "react";
import { getBlockClass } from "../style/Block.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import type { BlockElement, BlockProps } from "./Block.js";
import SECTION_CSS from "./Section.module.css";

const SECTION_CLASS = getModuleClass(SECTION_CSS, "section");

/**
 * Props for `Section` and its semantic siblings — colour, space, typography, and width variants plus an optional `as` element override.
 *
 * @see https://shelving.cc/ui/SectionProps
 */
export interface SectionProps extends BlockProps, OptionalChildProps {
	/**
	 * Element this `<Section>` renders as, e.g. "header" to output a "<header>"
	 * @default "section"
	 */
	as?: BlockElement | undefined;
}

function _getSectionClass(props: SectionProps): string {
	return getClass(
		SECTION_CLASS, //
		getBlockClass(props),
	);
}

/**
 * `<section>` block with section-level spacing.
 * - Pass `as` to render a different semantic element.
 *
 * @kind component
 * @see https://shelving.cc/ui/Section
 */
export function Section({ as: Element = "section", children, ...variants }: SectionProps): ReactElement {
	return <Element className={_getSectionClass(variants)}>{children}</Element>;
}

/**
 * `<header>` block with section-level spacing.
 *
 * @kind component
 * @see https://shelving.cc/ui/Header
 */
export function Header({ as: Element = "section", children, ...variants }: SectionProps): ReactElement {
	return <Element className={_getSectionClass(variants)}>{children}</Element>;
}

/**
 * `<footer>` block with section-level spacing.
 *
 * @kind component
 * @see https://shelving.cc/ui/Footer
 */
export function Footer({ as: Element = "section", children, ...variants }: SectionProps): ReactElement {
	return <Element className={_getSectionClass(variants)}>{children}</Element>;
}

/**
 * `<article>` block with section-level spacing.
 * - Use a `<Card>` instead to display boxed content.
 *
 * @kind component
 * @see https://shelving.cc/ui/Article
 */
export function Article({ as: Element = "article", children, ...variants }: SectionProps): ReactElement {
	return <Element className={_getSectionClass(variants)}>{children}</Element>;
}

/**
 * `<figure>` block with section-level spacing.
 * - Pair with `<Caption>` for `<figcaption>` content.
 *
 * @kind component
 * @see https://shelving.cc/ui/Figure
 */
export function Figure({ as: Element = "figure", children, ...variants }: SectionProps): ReactElement {
	return <Element className={_getSectionClass(variants)}>{children}</Element>;
}
