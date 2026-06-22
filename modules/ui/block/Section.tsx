import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import type { BlockElement } from "./Block.js";
import SECTION_CSS from "./Section.module.css";

const SECTION_CLASS = getModuleClass(SECTION_CSS, "section");

/**
 * Props for `Section` and its semantic siblings — colour, space, typography, and width variants plus an optional `as` element override.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Section/SectionProps
 */
export interface SectionProps extends ColorVariants, SpaceVariants, TypographyVariants, WidthVariants, OptionalChildProps {
	/**
	 * Element this `<Section>` renders as, e.g. "header" to output a "<header>"
	 * @default "section"
	 */
	as?: BlockElement | undefined;
}

/**
 * Get the combined `className` string for a section from its styling variants.
 *
 * Composes the base section class with the colour, space, typography, and width variant helpers, so anything that wants section-level styling can apply it.
 *
 * @param variants Colour, space, typography, and width variants.
 * @returns A space-separated `className` string combining the section class and resolved variant classes.
 * @example getSectionClass({ space: "large" }) // "section …"
 * @see https://dhoulb.github.io/shelving/ui/block/Section/getSectionClass
 */
export function getSectionClass(variants: SectionProps): string {
	return getClass(
		SECTION_CLASS, //
		getColorClass(variants),
		getSpaceClass(variants),
		getTypographyClass(variants),
		getWidthClass(variants),
	);
}

/**
 * `<section>` block with section-level spacing.
 * - Pass `as` to render a different semantic element.
 *
 * @kind component
 * @returns Rendered `<section>` element.
 * @example <Section><Heading>About</Heading></Section>
 * @see https://dhoulb.github.io/shelving/ui/block/Section/Section
 */
export function Section({ as: Element = "section", children, ...variants }: SectionProps): ReactElement {
	return <Element className={getSectionClass(variants)}>{children}</Element>;
}

/**
 * `<header>` block with section-level spacing.
 *
 * @kind component
 * @returns Rendered `<header>` element.
 * @example <Header><Title>Welcome</Title></Header>
 * @see https://dhoulb.github.io/shelving/ui/block/Section/Header
 */
export function Header({ as: Element = "section", children, ...variants }: SectionProps): ReactElement {
	return <Element className={getSectionClass(variants)}>{children}</Element>;
}

/**
 * `<footer>` block with section-level spacing.
 *
 * @kind component
 * @returns Rendered `<footer>` element.
 * @example <Footer><Small>© 2026</Small></Footer>
 * @see https://dhoulb.github.io/shelving/ui/block/Section/Footer
 */
export function Footer({ as: Element = "section", children, ...variants }: SectionProps): ReactElement {
	return <Element className={getSectionClass(variants)}>{children}</Element>;
}

/**
 * `<article>` block with section-level spacing.
 * - Use a `<Card>` instead to display boxed content.
 *
 * @kind component
 * @returns Rendered `<article>` element.
 * @see https://dhoulb.github.io/shelving/ui/block/Section/Article
 */
export function Article({ as: Element = "article", children, ...variants }: SectionProps): ReactElement {
	return <Element className={getSectionClass(variants)}>{children}</Element>;
}

/**
 * `<figure>` block with section-level spacing.
 * - Pair with `<Caption>` for `<figcaption>` content.
 *
 * @kind component
 * @returns Rendered `<figure>` element.
 * @example <Figure><Image src="/cat.jpg" /><Caption>A cat</Caption></Figure>
 * @see https://dhoulb.github.io/shelving/ui/block/Section/Figure
 */
export function Figure({ as: Element = "figure", children, ...variants }: SectionProps): ReactElement {
	return <Element className={getSectionClass(variants)}>{children}</Element>;
}
