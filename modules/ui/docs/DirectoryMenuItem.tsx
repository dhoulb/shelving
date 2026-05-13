import type { ReactNode } from "react";
import type { DirectoryElementProps } from "../../util/element.js";

/** Menu item renderer for a `tree-directory` element. */
export function DirectoryMenuItem({ title, name }: DirectoryElementProps): ReactNode {
	return <span>{title ?? name}</span>;
}
