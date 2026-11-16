import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import LAYOUT_CSS from "./FixedLayout.module.css";

const LAYOUT_CLASS = getModuleClass(LAYOUT_CSS, "layout");

/**
 * Props for `<FixedLayout>`: the content slot `children`.
 *
 * @see https://shelving.cc/ui/FixedLayoutProps
 */
export interface FixedLayoutProps extends OptionalChildProps {}

/**
 * Layout with no chrome: the whole screen is one content slot.
 * - It locks the document and gives a full-height slot inside the safe areas. It does not scroll or centre.
 * - Fill the slot with `<Scroll vertical cover>`. Used for e.g. log-in and error screens, and full-screen pages.
 *
 * @kind component
 * @see https://shelving.cc/ui/FixedLayout
 */
export function FixedLayout({ children }: FixedLayoutProps): ReactElement {
	return <main className={LAYOUT_CLASS}>{children}</main>;
}
