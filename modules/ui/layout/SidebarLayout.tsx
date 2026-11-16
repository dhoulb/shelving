import { type ReactElement, type ReactNode, useEffect, useState } from "react";
import { CloseIcon } from "shelving/icon/CloseIcon";
import { MenuIcon } from "shelving/icon/MenuIcon";
import { Button } from "../button/Button.js";
import { requireMetaURL } from "../misc/MetaContext.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import LAYOUT_CSS from "./SidebarLayout.module.css";

const LAYOUT_SIDEBAR_CLASS = getModuleClass(LAYOUT_CSS, "sidebar");
const LAYOUT_CONTENT_CLASS = getModuleClass(LAYOUT_CSS, "content");
const LAYOUT_TOGGLE_CLASS = getModuleClass(LAYOUT_CSS, "toggle");
const LAYOUT_OVERLAY_CLASS = getModuleClass(LAYOUT_CSS, "overlay");
const LAYOUT_MAIN_CLASS = getModuleClass(LAYOUT_CSS, "main");
const LAYOUT_OPEN_CLASS = getModuleClass(LAYOUT_CSS, "open");
const LAYOUT_RIGHT_CLASS = getModuleClass(LAYOUT_CSS, "right");

/**
 * Props for `<SidebarLayout>` — the `sidebar` column content, main `children`, and a `right` placement flag.
 *
 * @see https://shelving.cc/ui/SidebarLayoutProps
 */
export interface SidebarLayoutProps extends OptionalChildProps {
	/** Content rendered in the fixed-width side column. */
	sidebar: ReactNode;
	/** Render the sidebar on the right rather than the left. */
	right?: boolean | undefined;
}

/**
 * Layout with a fixed-width side column (typically navigation) next to a content slot.
 * - The sidebar is rendered as `<nav>` — it almost always contains the page's primary navigation.
 * - On narrow viewports the sidebar becomes an off-canvas drawer toggled by a single menu button that switches between a burger and a close icon.
 * - While the drawer is open an overlay dims the rest of the page; clicking the overlay closes the drawer.
 * - Inside a `<Navigation>` the drawer closes itself whenever the route changes (e.g. tapping a sidebar link).
 * - It is a frame only: the content slot does not scroll. Fill it with `<Scroll vertical cover>`, inside `<RouteCache>`, so each page scrolls in its own box. The sidebar stays outside the cache, so it keeps its own state and scroll.
 *
 * @kind component
 * @see https://shelving.cc/ui/SidebarLayout
 */
export function SidebarLayout({ sidebar, children, right = false }: SidebarLayoutProps): ReactElement {
	const { path } = requireMetaURL();
	const [open, setOpen] = useState(false);

	// Close the drawer whenever navigation changes the URL — covers tapping a link inside the sidebar.
	useEffect(() => {
		if (path) setOpen(false);
	}, [path]);

	// DOM order is always sidebar → content → overlay; the `right` variant flips the visual column order in CSS, so the markup never reshuffles.
	return (
		<main className={getClass(LAYOUT_MAIN_CLASS, right && LAYOUT_RIGHT_CLASS)}>
			<nav
				className={getClass(
					LAYOUT_SIDEBAR_CLASS, //
					open && LAYOUT_OPEN_CLASS,
				)}
			>
				{sidebar}
			</nav>
			{/* The content slot is a positioned box: the app fills it with `<Scroll vertical cover>` inside `<RouteCache>`. The menu toggle floats above it. */}
			<div className={LAYOUT_CONTENT_CLASS}>
				<div className={LAYOUT_TOGGLE_CLASS}>
					<Button title={open ? "Close menu" : "Show menu"} onClick={() => setOpen(o => !o)}>
						{open ? <CloseIcon /> : <MenuIcon />}
					</Button>
				</div>
				{children}
			</div>
			{/* Overlay is always mounted (on narrow viewports) so it can fade both in and out via the `open` class — a conditionally-mounted element can't animate on the way out. */}
			<button
				type="button"
				className={getClass(LAYOUT_OVERLAY_CLASS, open && LAYOUT_OPEN_CLASS)}
				aria-label="Close menu"
				onClick={() => setOpen(false)}
			/>
		</main>
	);
}
