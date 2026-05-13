import type { ReactNode } from "react";
import type { FileElementProps } from "../../util/element.js";

/** Menu item renderer for a `tree-file` element. */
export function FileMenuItem({ title, name }: FileElementProps): ReactNode {
	return <span>{title ?? name}</span>;
}
