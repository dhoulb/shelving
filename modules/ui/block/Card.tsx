import type { ReactElement } from "react";
import { Clickable, type ClickableProps } from "../form/Clickable.js";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getPaddingClass, type PaddingVariants } from "../style/Padding.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getStatusClass, type StatusVariants } from "../style/Status.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { BlockElement } from "./Block.js";
import CARD_CSS from "./Card.module.css";

/**
 * Props for `Card` — combines `ClickableProps` (for navigable cards) with colour, status, padding, space, typography, and width variants.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Card/CardProps
 */
export interface CardProps
	extends ClickableProps,
		ColorVariants,
		StatusVariants,
		PaddingVariants,
		SpaceVariants,
		TypographyVariants,
		WidthVariants {
	/**
	 * Element this `<Card>` renders as, e.g. "header" to output a "<header>"
	 * @default "article"
	 */
	as?: BlockElement | undefined;
}

/**
 * Cards are boxed areas for content to sit within.
 * - Rendered as `<article>`  since each card represents a self-contained piece of content (override with `props.as`).
 * - When `href` or `onClick` is set the card becomes navigable: a stretched overlay `<a>` / `<button>` covers the entire card while the children render normally inside.
 * - Real interactive elements inside the card (e.g. inline `<a>` links) stay clickable thanks to `position: relative; z-index: 2` rules in the stylesheet.
 * - Accepts a `status` colour and raw `ColorProps` — the card styles the box; lay out its contents however the use case needs.
 *
 * @kind component
 * @example <Card><Subheading>Static</Subheading></Card>
 * @example <Card href="/foo" title="Open foo"><Subheading>Clickable</Subheading></Card>
 * @example <Card status="error"><Subheading>Not found</Subheading></Card>
 * @see https://dhoulb.github.io/shelving/ui/block/Card/Card
 */
export function Card({ as: Element = "article", children, href, onClick, title = "Open", ...props }: CardProps): ReactElement {
	const overlay = (href || onClick) && (
		<Clickable title={title} href={href} onClick={onClick} {...props} className={getModuleClass(CARD_CSS, "overlay")} />
	);
	return (
		<Element
			className={getClass(
				getModuleClass(CARD_CSS, "card"),
				getStatusClass(props),
				getColorClass(props),
				getPaddingClass(props),
				getSpaceClass(props),
				getTypographyClass(props),
				getWidthClass(props),
			)}
		>
			{overlay}
			{overlay ? <div>{children}</div> : children}
		</Element>
	);
}
