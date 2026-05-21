import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import BLOCK_CSS from "./Block.module.css";

export const BLOCK_CLASS = getModuleClass(BLOCK_CSS, "block");

/** Variants for elements. */
export interface BlockProps extends OptionalChildProps {}

/** A single `<div>` element with element spacing. */
export function Block({ children }: BlockProps): ReactElement {
	return <div className={BLOCK_CSS.element}>{children}</div>;
}
