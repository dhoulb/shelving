import type { ReactElement, ReactNode } from "react";
import APP_CSS from "../../ui/app/App.module.css";
import { SidebarLayout } from "../../ui/layout/SidebarLayout.js";
import { getClass } from "../../ui/util/css.js";
import styles from "./Page.module.css";
import { Sidebar, type SidebarItem } from "./Sidebar.js";

export interface PageProps {
	readonly title: string;
	readonly lede?: string | undefined;
	readonly stylesheet: string;
	readonly sidebarTitle?: string | undefined;
	readonly sidebarItems: readonly SidebarItem[];
	readonly currentPath: string;
	readonly children: ReactNode;
}

/**
 * Render a complete HTML document for a single docs page.
 * - `stylesheet` is the relative href to the bundled stylesheet for this page.
 * - The `App` theme class is applied to `<body>` directly so static HTML picks up the design tokens without client-side JS.
 */
export function Page({ title, lede, stylesheet, sidebarTitle, sidebarItems, currentPath, children }: PageProps): ReactElement {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{title}</title>
				<link rel="stylesheet" href={stylesheet} />
			</head>
			<body className={getClass(APP_CSS.app, styles.body)}>
				<SidebarLayout sidebar={<Sidebar title={sidebarTitle} items={sidebarItems} currentPath={currentPath} />}>
					<header className={styles.header}>
						<h1 className={styles.title}>{title}</h1>
						{lede ? <p className={styles.lede}>{lede}</p> : null}
					</header>
					{children}
				</SidebarLayout>
			</body>
		</html>
	);
}
