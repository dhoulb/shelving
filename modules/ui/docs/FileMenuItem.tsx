import type { ReactNode } from "react";
import type { FileElementProps } from "../../util/element.js";
import { MenuItem } from "../menu/MenuItem.js";

/** Menu item renderer for a `tree-file` element. */
export function FileMenuItem({ title, name }: FileElementProps): ReactNode {
	return <MenuItem>{title ?? name}</MenuItem>;
}
