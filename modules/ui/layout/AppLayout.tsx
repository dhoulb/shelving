import type { ReactElement, ReactNode } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import LAYOUT_CSS from "./AppLayout.module.css";

const LAYOUT_CLASS = getModuleClass(LAYOUT_CSS, "layout");
const LAYOUT_CONTENT_CLASS = getModuleClass(LAYOUT_CSS, "content");
const LAYOUT_NAV_CLASS = getModuleClass(LAYOUT_CSS, "nav");

/**
 * Props for `<AppLayout>`: the `nav` bar content and the content slot `children`.
 *
 * @see https://shelving.cc/ui/AppLayoutProps
 */
export interface AppLayoutProps extends OptionalChildProps {
	/** Items for the bar below the content, for example a `<StackButton>` for each tab. Set `false` (or leave it out) to show no bar. */
	nav?: ReactNode;
}

/**
 * Layout with a content slot above a bar of the app's main sections, like the tab bar of a phone app.
 * - It is a frame only: the content slot does not scroll. Fill it with `<Scroll vertical cover>`, inside `<RouteCache>`, so each page scrolls in its own box.
 * - The bar sits below the content slot, not over it.
 * - During a page slide, the bar stays still when both pages have it, and slides with its page when only one page has it.
 * - Render it once above the router, or let each page render its own layout inside `<RouteCache>`, so pages with no bar can use another layout.
 *
 * @kind component
 * @see https://shelving.cc/ui/AppLayout
 */
export function AppLayout({ nav, children }: AppLayoutProps): ReactElement {
	return (
		<div className={LAYOUT_CLASS}>
			<main className={LAYOUT_CONTENT_CLASS}>{children}</main>
			{nav ? <nav className={LAYOUT_NAV_CLASS}>{nav}</nav> : null}
		</div>
	);
}
