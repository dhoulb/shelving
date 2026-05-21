import type { ReactElement, ReactNode } from "react";
import { Clickable, type ClickableProps } from "../form/Clickable.js";
import { getModuleClass } from "../util/css.js";
import CARD_CSS from "./Card.module.css";

export interface CardProps extends ClickableProps {
	children?: ReactNode;

	/** Constrain the card to narrow width (defaults to full-width). */
	narrow?: boolean | undefined;

	/** Constrain the card to wide width (defaults to full-width). */
	wide?: boolean | undefined;
}

/**
 * Cards are boxed areas for content to sit within — rendered as `<article>` since each card represents a self-contained piece of content.
 * - When `href` or `onClick` is set the card becomes navigable: a stretched overlay `<a>` / `<button>` covers the entire card while the children render normally inside.
 * - Real interactive elements inside the card (e.g. inline `<a>` links) stay clickable thanks to `position: relative; z-index: 2` rules in the stylesheet.
 *
 * @example <Card><Subheading>Static</Subheading></Card>
 * @example <Card href="/foo" title="Open foo"><Subheading>Clickable</Subheading></Card>
 */
export function Card({ children, href, onClick, title = "Open", ...props }: CardProps): ReactElement {
	const overlay = (href || onClick) && <Clickable title={title} href={href} onClick={onClick} {...props} className={CARD_CSS.overlay} />;
	return (
		<article className={getModuleClass(CARD_CSS, "card", props)}>
			{overlay}
			{overlay ? <div>{children}</div> : children}
		</article>
	);
}
