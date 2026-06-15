import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import SECTION_CSS from "./Section.module.css";

/**
 * CSS class applied to the root element of every `Section` and its semantic siblings.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Section/SECTION_CLASS
 */
export const SECTION_CLASS = getModuleClass(SECTION_CSS, "section");

/**
 * CSS class that styles a `Section` when it appears inside `Prose` longform content.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Section/SECTION_PROSE_CLASS
 */
export const SECTION_PROSE_CLASS = getModuleClass(SECTION_CSS, "prose");

/**
 * Semantic element names a `Section` may render as via its `as` prop.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Section/SectionElement
 */
export type SectionElement = "section" | "header" | "footer" | "nav" | "aside" | "figure";

/**
 * Props for `Section` and its semantic siblings — colour, space, typography, and width variants plus an optional `as` element override.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Section/SectionProps
 */
export interface SectionProps extends ColorVariants, SpaceVariants, TypographyVariants, WidthVariants, OptionalChildProps {
	as?: SectionElement | undefined;
}

function renderSection(
	defaultComponent: SectionElement,
	{ as: Component = defaultComponent, children, ...variants }: SectionProps,
): ReactElement {
	return (
		<Component
			className={getClass(
				SECTION_CLASS,
				getColorClass(variants),
				getSpaceClass(variants),
				getTypographyClass(variants),
				getWidthClass(variants),
			)}
		>
			{children}
		</Component>
	);
}

/**
 * `<section>` block with block-level spacing.
 * - Pass `as` to render a different semantic element.
 *
 * @kind component
 * @param props Colour, space, typography, and width variants plus optional `as` override and `children`.
 * @returns Rendered `<section>` element.
 * @example <Section><Heading>About</Heading></Section>
 * @see https://dhoulb.github.io/shelving/ui/block/Section/Section
 */
export function Section(props: SectionProps): ReactElement {
	return renderSection("section", props);
}

/**
 * `<header>` block with block-level spacing.
 *
 * @kind component
 * @param props Colour, space, typography, and width variants plus optional `as` override and `children`.
 * @returns Rendered `<header>` element.
 * @example <Header><Title>Welcome</Title></Header>
 * @see https://dhoulb.github.io/shelving/ui/block/Section/Header
 */
export function Header(props: SectionProps): ReactElement {
	return renderSection("header", props);
}

/**
 * `<footer>` block with block-level spacing.
 *
 * @kind component
 * @param props Colour, space, typography, and width variants plus optional `as` override and `children`.
 * @returns Rendered `<footer>` element.
 * @example <Footer><Small>© 2026</Small></Footer>
 * @see https://dhoulb.github.io/shelving/ui/block/Section/Footer
 */
export function Footer(props: SectionProps): ReactElement {
	return renderSection("footer", props);
}

/**
 * `<nav>` block with block-level spacing.
 *
 * @kind component
 * @param props Colour, space, typography, and width variants plus optional `as` override and `children`.
 * @returns Rendered `<nav>` element.
 * @example <Nav><Link href="/">Home</Link></Nav>
 * @see https://dhoulb.github.io/shelving/ui/block/Section/Nav
 */
export function Nav(props: SectionProps): ReactElement {
	return renderSection("nav", props);
}

/**
 * `<aside>` block with block-level spacing.
 *
 * @kind component
 * @param props Colour, space, typography, and width variants plus optional `as` override and `children`.
 * @returns Rendered `<aside>` element.
 * @example <Aside width="narrow"><Paragraph>Sidebar</Paragraph></Aside>
 * @see https://dhoulb.github.io/shelving/ui/block/Section/Aside
 */
export function Aside(props: SectionProps): ReactElement {
	return renderSection("aside", props);
}

/**
 * `<figure>` block with block-level spacing. Pair with `<Caption>` for `<figcaption>` content.
 *
 * @kind component
 * @param props Colour, space, typography, and width variants plus optional `as` override and `children`.
 * @returns Rendered `<figure>` element.
 * @example <Figure><Image src="/cat.jpg" /><Caption>A cat</Caption></Figure>
 * @see https://dhoulb.github.io/shelving/ui/block/Section/Figure
 */
export function Figure(props: SectionProps): ReactElement {
	return renderSection("figure", props);
}
