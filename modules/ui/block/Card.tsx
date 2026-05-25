import type { ReactElement } from "react";
import { Clickable, type ClickableProps } from "../form/Clickable.js";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getPaddingClass, type PaddingVariants } from "../style/Padding.js";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getStatusClass, type Status } from "../style/Status.js";
import { getThicknessClass, type ThicknessVariants } from "../style/Thickness.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import CARD_CSS from "./Card.module.css";

export interface CardProps
	extends ClickableProps,
		ColorVariants,
		PaddingVariants,
		SpacingVariants,
		ThicknessVariants,
		TypographyVariants,
		WidthVariants {
	/** Status colour for the card (e.g. `"error"`, `"success"`). */
	status?: Status | undefined;
}

/**
 * Cards are boxed areas for content to sit within — rendered as `<article>` since each card represents a self-contained piece of content.
 * - When `href` or `onClick` is set the card becomes navigable: a stretched overlay `<a>` / `<button>` covers the entire card while the children render normally inside.
 * - Real interactive elements inside the card (e.g. inline `<a>` links) stay clickable thanks to `position: relative; z-index: 2` rules in the stylesheet.
 * - Accepts a `status` colour and raw `ColorVariants` — the card styles the box; lay out its contents however the use case needs.
 *
 * @example <Card><Subheading>Static</Subheading></Card>
 * @example <Card href="/foo" title="Open foo"><Subheading>Clickable</Subheading></Card>
 * @example <Card status="error"><Subheading>Not found</Subheading></Card>
 */
export function Card({ children, href, onClick, title = "Open", status, ...props }: CardProps): ReactElement {
	const overlay = (href || onClick) && <Clickable title={title} href={href} onClick={onClick} {...props} className={CARD_CSS.overlay} />;
	return (
		<article
			className={getClass(
				getModuleClass(CARD_CSS, "card"),
				status && getStatusClass(status),
				getColorClass(props),
				getPaddingClass(props),
				getSpacingClass(props),
				getThicknessClass(props),
				getTypographyClass(props),
				getWidthClass(props),
			)}
		>
			{overlay}
			{overlay ? <div>{children}</div> : children}
		</article>
	);
}
