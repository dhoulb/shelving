import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { type ReactElement, type ReactNode, useEffect, useState } from "react";
import { Button } from "../form/Button.js";
import { requireMetaURL } from "../misc/MetaContext.js";
import { getClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import { LAYOUT_CLASS } from "./Layout.js";
import SIDEBAR_LAYOUT_CSS from "./SidebarLayout.module.css";

export interface SidebarLayoutProps extends OptionalChildProps {
	/** Content rendered in the fixed-width side column. */
	sidebar: ReactNode;
	/** Render the sidebar on the right rather than the left. */
	right?: boolean | undefined;
}

/**
 * Layout with a fixed-width side column (typically navigation) next to a scrollable main content column.
 * - The sidebar is rendered as `<nav>` — it almost always contains the page's primary navigation.
 * - On narrow viewports the sidebar becomes an off-canvas drawer toggled by a single menu button that switches between a burger and a close icon.
 * - While the drawer is open an overlay dims the rest of the page; clicking the overlay closes the drawer.
 * - Inside a `<Navigation>` the drawer closes itself whenever the route changes (e.g. tapping a sidebar link).
 * - Use the `--sidebar-layout-width`, `--sidebar-layout-bg`, `--sidebar-layout-border`, and `--sidebar-layout-color-border` custom properties to override defaults.
 */
export function SidebarLayout({ sidebar, children, right = false }: SidebarLayoutProps): ReactElement {
	const { path } = requireMetaURL();
	const [open, setOpen] = useState(false);

	// Close the drawer whenever navigation changes the URL — covers tapping a link inside the sidebar.
	useEffect(() => {
		if (path) setOpen(false);
	}, [path]);

	const sidebarEl = (
		<nav key="sidebar" className={getClass(SIDEBAR_LAYOUT_CSS.sidebar, open && SIDEBAR_LAYOUT_CSS.open)}>
			{sidebar}
		</nav>
	);
	const contentEl = (
		<div key={path} className={getClass(LAYOUT_CLASS, SIDEBAR_LAYOUT_CSS.content)}>
			<div className={SIDEBAR_LAYOUT_CSS.toggle}>
				<Button title={open ? "Close menu" : "Show menu"} onClick={() => setOpen(o => !o)}>
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
		<main className={getClass(SIDEBAR_LAYOUT_CSS.main, LAYOUT_CLASS)}>
			{right ? [contentEl, sidebarEl, overlayEl] : [sidebarEl, contentEl, overlayEl]}
		</main>
	);
}
