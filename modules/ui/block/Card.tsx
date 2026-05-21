import type { ReactElement, ReactNode } from "react";
import { Clickable, type ClickableProps } from "../form/Clickable.js";
import { type ColorVariants, getColorClass } from "../misc/Color.js";
import { getStatusClass, type Status } from "../misc/Status.js";
import { getClass, getModuleClass } from "../util/css.js";
import CARD_CSS from "./Card.module.css";

export interface CardProps extends ClickableProps, ColorVariants {
	children?: ReactNode;

	/** Constrain the card to narrow width (defaults to full-width). */
	narrow?: boolean | undefined;

	/** Constrain the card to wide width (defaults to full-width). */
	wide?: boolean | undefined;

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
 * @example <Card status="error"><StatusIcon status="error" xxlarge /><Subheading>Not found</Subheading></Card>
 */
export function Card({ children, href, onClick, title = "Open", status, ...props }: CardProps): ReactElement {
	const overlay = (href || onClick) && <Clickable title={title} href={href} onClick={onClick} {...props} className={CARD_CSS.overlay} />;
	return (
		<article
			className={getClass(
				getModuleClass(CARD_CSS, "card", props), //
				status && getStatusClass(status), // Cards can have status colours.
				getColorClass(props), // Cards can also have raw colour overrides.
			)}
		>
			{overlay}
			{overlay ? <div>{children}</div> : children}
		</article>
	);
}
