import type { ReactElement, ReactNode } from "react";
import { getClass } from "../util/css.js";
import { LAYOUT_CSS } from "./Layout.js";
import SIDEBAR_LAYOUT_CSS from "./SidebarLayout.module.css";

export interface SidebarLayoutProps {
	/** Content rendered in the fixed-width side column. */
	sidebar: ReactNode;
	/** Main content rendered in the scrollable content column. */
	children?: ReactNode;
	/** Render the sidebar on the right rather than the left. */
	right?: boolean | undefined;
}

/**
 * Layout with a fixed-width side column (typically navigation) next to a scrollable main content column.
 * - The sidebar is rendered as `<nav>` — it almost always contains the page's primary navigation.
 * - The sidebar collapses above the main content on narrow viewports.
 * - Use the `--sidebar-layout-width` and `--sidebar-layout-bg` custom properties to override defaults.
 */
export function SidebarLayout({ sidebar, children, right = false }: SidebarLayoutProps): ReactElement {
	const sidebarEl = (
		<nav key="sidebar" className={SIDEBAR_LAYOUT_CSS.sidebar}>
			{sidebar}
		</nav>
	);
	const contentEl = (
		<div key="content" className={getClass(LAYOUT_CSS.layout, SIDEBAR_LAYOUT_CSS.content)}>
			<div className={SIDEBAR_LAYOUT_CSS.contentInner}>{children}</div>
		</div>
	);
	return (
		<main className={getClass(SIDEBAR_LAYOUT_CSS.main, LAYOUT_CSS.layout)}>{right ? [contentEl, sidebarEl] : [sidebarEl, contentEl]}</main>
	);
}

export { SIDEBAR_LAYOUT_CSS };
