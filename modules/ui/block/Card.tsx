import type { ReactElement, ReactNode } from "react";
import { type ClickableProps, getClickable } from "../form/Clickable.js";
import { getModuleClass } from "../util/css.js";
import styles from "./Card.module.css";

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
 * @example <Card><Heading>Static</Heading></Card>
 * @example <Card href="/foo" title="Open foo"><Heading>Clickable</Heading></Card>
 */
export function Card({ children, disabled, href, onClick, title, target, download, ...variants }: CardProps): ReactElement {
	const overlay =
		href || onClick ? getClickable({ disabled, href, onClick, title, target, download, children: title ?? "Open" }, styles.overlay) : null;
	return (
		<article className={getModuleClass(styles, "card", variants)}>
			{overlay}
			{overlay ? <div>{children}</div> : children}
		</article>
	);
}
