import type { ReactElement } from "react";
import { Clickable, type ClickableProps } from "../form/Clickable.js";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getPaddingClass, type PaddingVariants } from "../style/Padding.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getStatusClass, type StatusVariants } from "../style/Status.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import CARD_CSS from "./Card.module.css";

export interface CardProps
	extends ClickableProps,
		ColorVariants,
		StatusVariants,
		PaddingVariants,
		SpaceVariants,
		TypographyVariants,
		WidthVariants {}

/**
 * Cards are boxed areas for content to sit within — rendered as `<article>` since each card represents a self-contained piece of content.
 * - When `href` or `onClick` is set the card becomes navigable: a stretched overlay `<a>` / `<button>` covers the entire card while the children render normally inside.
 * - Real interactive elements inside the card (e.g. inline `<a>` links) stay clickable thanks to `position: relative; z-index: 2` rules in the stylesheet.
 * - Accepts a `status` colour and raw `ColorProps` — the card styles the box; lay out its contents however the use case needs.
 *
 * @example <Card><Subheading>Static</Subheading></Card>
 * @example <Card href="/foo" title="Open foo"><Subheading>Clickable</Subheading></Card>
 * @example <Card status="error"><Subheading>Not found</Subheading></Card>
 */
export function Card({ children, href, onClick, title = "Open", ...props }: CardProps): ReactElement {
	const overlay = (href || onClick) && <Clickable title={title} href={href} onClick={onClick} {...props} className={CARD_CSS.overlay} />;
	return (
		<article
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
		</article>
	);
}
