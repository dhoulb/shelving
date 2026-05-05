import type { ReactElement, ReactNode } from "react";
import { getModuleClass } from "../util/css.js";
import styles from "./Card.module.css";

export interface CardProps {
	children: ReactNode;

	/** Constrain the section to narrow width (defaults to full-width). */
	narrow?: boolean;

	/** Constrain the section to wide width (defaults to full-width). */
	wide?: boolean;
}

/** Cards are boxed areas for content to sit within. */
export function Card({ children, ...variants }: CardProps): ReactElement {
	return <section className={getModuleClass(styles, "card", variants)}>{children}</section>;
}
