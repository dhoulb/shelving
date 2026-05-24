import type { ReactElement } from "react";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Block.module.css";

export const BLOCK_CLASS = getModuleClass(styles, "block");

export interface BlockProps extends SpacingVariants, TypographyVariants, OptionalChildProps {
	/** Constrain the block to narrow width. */
	narrow?: boolean | undefined;
	/** Constrain the block to wide width. */
	wide?: boolean | undefined;
	/** Mark as a keyboard-focusable horizontal scroll region — adds `tabindex="0"`, `role="region"`, an `aria-label`, and `overflow-x: auto`. */
	scrollable?: boolean | undefined;
}

type BlockElement = "div" | "section" | "header" | "footer" | "nav" | "aside" | "figure";

function renderBlock(Component: BlockElement, { children, ...variants }: BlockProps): ReactElement {
	const className = getClass(
		getModuleClass(styles, "block", variants), //
		getSpacingClass(variants),
		getTypographyClass(variants),
	);
	return variants.scrollable ? (
		<Component className={className} tabIndex={0} role="region" aria-label="Scrollable region">
			{children}
		</Component>
	) : (
		<Component className={className}>{children}</Component>
	);
}

/** Plain `<div>` block with block-level spacing. Base building block; use a semantic variant (`<Section>`, `<Figure>`, etc.) when the element matters. */
export function Block(props: BlockProps): ReactElement {
	return renderBlock("div", props);
}

/** `<section>` block with block-level spacing. */
export function Section(props: BlockProps): ReactElement {
	return renderBlock("section", props);
}

/** `<header>` block with block-level spacing. */
export function Header(props: BlockProps): ReactElement {
	return renderBlock("header", props);
}

/** `<footer>` block with block-level spacing. */
export function Footer(props: BlockProps): ReactElement {
	return renderBlock("footer", props);
}

/** `<nav>` block with block-level spacing. */
export function Nav(props: BlockProps): ReactElement {
	return renderBlock("nav", props);
}

/** `<aside>` block with block-level spacing. */
export function Aside(props: BlockProps): ReactElement {
	return renderBlock("aside", props);
}

/** `<figure>` block with block-level spacing. Pair with `<Caption>` for `<figcaption>` content. */
export function Figure(props: BlockProps): ReactElement {
	return renderBlock("figure", props);
}

export interface CaptionProps extends OptionalChildProps {}

/** `<figcaption>` block — caption text for a `<Figure>`. */
export function Caption({ children }: CaptionProps): ReactElement {
	return <figcaption className={getModuleClass(styles, "caption")}>{children}</figcaption>;
}
