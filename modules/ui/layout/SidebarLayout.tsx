import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { type ReactElement, type ReactNode, use, useEffect, useState } from "react";
import { useStore } from "../../react/useStore.js";
import { Button } from "../form/Button.js";
import { NavigationContext } from "../router/NavigationContext.js";
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
 * - On narrow viewports the sidebar becomes an off-canvas drawer toggled by a single menu button that switches between a burger and a close icon.
 * - While the drawer is open an overlay dims the rest of the page; clicking the overlay closes the drawer.
 * - Inside a `<Navigation>` the drawer closes itself whenever the route changes (e.g. tapping a sidebar link).
 * - Use the `--sidebar-layout-width` and `--sidebar-layout-bg` custom properties to override defaults.
 */
export function SidebarLayout({ sidebar, children, right = false }: SidebarLayoutProps): ReactElement {
	const [open, setOpen] = useState(false);

	// Close the drawer whenever navigation changes the URL — covers tapping a link inside the sidebar.
	const href = useStore(use(NavigationContext))?.href;
	useEffect(() => {
		if (href) setOpen(false);
	}, [href]);

	const sidebarEl = (
		<nav key="sidebar" className={getClass(SIDEBAR_LAYOUT_CSS.sidebar, open && SIDEBAR_LAYOUT_CSS.open)}>
			{sidebar}
		</nav>
	);
	const contentEl = (
		<div key="content" className={getClass(LAYOUT_CSS.layout, SIDEBAR_LAYOUT_CSS.content)}>
			<div className={SIDEBAR_LAYOUT_CSS.toggle}>
				<Button fit cyan={!open} title={open ? "Close menu" : "Show menu"} onClick={() => setOpen(o => !o)}>
					{open ? <XMarkIcon /> : <Bars3Icon />}
				</Button>
			</div>
			<div className={SIDEBAR_LAYOUT_CSS.contentInner}>{children}</div>
		</div>
	);
	const overlayEl = open && (
		<button key="overlay" type="button" className={SIDEBAR_LAYOUT_CSS.overlay} aria-label="Close menu" onClick={() => setOpen(false)} />
	);
	return (
		<main className={getClass(SIDEBAR_LAYOUT_CSS.main, LAYOUT_CSS.layout)}>
			{right ? [contentEl, sidebarEl, overlayEl] : [sidebarEl, contentEl, overlayEl]}
		</main>
	);
}

export { SIDEBAR_LAYOUT_CSS };
