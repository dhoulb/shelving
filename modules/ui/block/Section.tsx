import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import SECTION_CSS from "./Section.module.css";

export const SECTION_CLASS = getModuleClass(SECTION_CSS, "section");
export const SECTION_PROSE_CLASS = getModuleClass(SECTION_CSS, "prose");

export type SectionElement = "section" | "header" | "footer" | "nav" | "aside" | "figure";

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

/** `<section>` block with block-level spacing. */
export function Section(props: SectionProps): ReactElement {
	return renderSection("section", props);
}

/** `<header>` block with block-level spacing. */
export function Header(props: SectionProps): ReactElement {
	return renderSection("header", props);
}

/** `<footer>` block with block-level spacing. */
export function Footer(props: SectionProps): ReactElement {
	return renderSection("footer", props);
}

/** `<nav>` block with block-level spacing. */
export function Nav(props: SectionProps): ReactElement {
	return renderSection("nav", props);
}

/** `<aside>` block with block-level spacing. */
export function Aside(props: SectionProps): ReactElement {
	return renderSection("aside", props);
}

/** `<figure>` block with block-level spacing. Pair with `<Caption>` for `<figcaption>` content. */
export function Figure(props: SectionProps): ReactElement {
	return renderSection("figure", props);
}
