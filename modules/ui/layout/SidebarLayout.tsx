import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { type ReactElement, type ReactNode, useId } from "react";
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
 * - On narrow viewports the sidebar slides off the left of the screen and is toggled with a "show menu" button.
 * - The toggle is driven by a hidden checkbox and pure CSS, so it works even when the page ships no client-side JavaScript.
 * - Use the `--sidebar-layout-width` and `--sidebar-layout-bg` custom properties to override defaults.
 */
export function SidebarLayout({ sidebar, children, right = false }: SidebarLayoutProps): ReactElement {
	// Ties the toggle checkbox to its `<label>` buttons — `useId()` is stable during static (non-hydrated) rendering.
	const id = useId();

	const sidebarEl = (
		<nav key="sidebar" className={SIDEBAR_LAYOUT_CSS.sidebar}>
			<label htmlFor={id} title="Close menu" className={SIDEBAR_LAYOUT_CSS.close}>
				<XMarkIcon />
			</label>
			{sidebar}
		</nav>
	);
	const contentEl = (
		<div key="content" className={getClass(LAYOUT_CSS.layout, SIDEBAR_LAYOUT_CSS.content)}>
			<label htmlFor={id} title="Show menu" className={SIDEBAR_LAYOUT_CSS.show}>
				<Bars3Icon />
			</label>
			<div className={SIDEBAR_LAYOUT_CSS.contentInner}>{children}</div>
		</div>
	);
	return (
		<main className={getClass(SIDEBAR_LAYOUT_CSS.main, LAYOUT_CSS.layout)}>
			<input type="checkbox" id={id} className={SIDEBAR_LAYOUT_CSS.toggle} aria-label="Show or hide menu" />
			{right ? [contentEl, sidebarEl] : [sidebarEl, contentEl]}
		</main>
	);
}

export { SIDEBAR_LAYOUT_CSS };
