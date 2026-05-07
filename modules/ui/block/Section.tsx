import type { ReactElement, ReactNode } from "react";
import { getModuleClass } from "../util/css.js";
import styles from "./Section.module.css";

export interface SectionProps {
	children?: ReactNode;
	/** Constrain the section to narrow width (defaults to full-width). */
	narrow?: boolean;
	/** Constrain the section to wide width (defaults to full-width). */
	wide?: boolean;
	/** Constrain the section to spacious spacing (defaults to full-width). */
	spacious?: boolean;
}

function renderSection(
	Component: "header" | "footer" | "nav" | "section" | "aside",
	{ children, ...variants }: SectionProps,
): ReactElement {
	return <Component className={getModuleClass(styles, "section", variants)}>{children}</Component>;
}

export interface HeaderProps extends SectionProps {}

/** A single HTML `<header>` with correct spacing. */
export function Header(props: HeaderProps): ReactElement {
	return renderSection("header", props);
}

/** A single HTML `<section>` with correct spacing. */
export function Section(props: SectionProps): ReactElement {
	return renderSection("section", props);
}

export interface NavigationProps extends SectionProps {}

/** A single HTML `<nav>` with correct spacing. */
export function Navigation(props: NavigationProps): ReactElement {
	return renderSection("nav", props);
}

export interface AsideProps extends SectionProps {}

/** A single HTML `<aside>` with correct spacing. */
export function Aside(props: AsideProps): ReactElement {
	return renderSection("aside", props);
}

export interface FooterProps extends SectionProps {}

/** A single HTML `<footer>` with correct spacing. */
export function Footer(props: FooterProps): ReactElement {
	return renderSection("footer", props);
}
