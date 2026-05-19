import type { ReactElement, ReactNode } from "react";
import { getModuleClass } from "../util/css.js";
import BLOCK_CSS from "./Block.module.css";

export const BLOCK_CLASS = getModuleClass(BLOCK_CSS, "block");

/** Variants for elements. */
export interface BlockProps {
	children?: ReactNode;
}

/** A single `<div>` element with element spacing. */
export function Block({ children }: BlockProps): ReactElement {
	return <div className={BLOCK_CSS.element}>{children}</div>;
}
