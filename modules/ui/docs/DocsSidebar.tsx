import type { ReactElement } from "react";
import { getClass } from "../util/css.js";
import styles from "./DocsSidebar.module.css";

export interface DocsSidebarItem {
	readonly label: string;
	readonly href: string;
	readonly path: string;
	readonly children?: readonly DocsSidebarItem[] | undefined;
	readonly tokens?: readonly DocsSidebarItem[] | undefined;
}

export interface DocsSidebarProps {
	readonly title?: string | undefined;
	readonly items: readonly DocsSidebarItem[];
	readonly currentPath: string;
}

/** Hierarchical sidebar nav tree for the docs site, with per-symbol tokens shown under the active page. */
export function DocsSidebar({ title, items, currentPath }: DocsSidebarProps): ReactElement {
	return (
		<nav className={styles.sidebar}>
			{title ? <h1 className={styles.title}>{title}</h1> : null}
			<ul className={styles.list}>
				{items.map(item => (
					<DocsSidebarNode key={item.href} item={item} currentPath={currentPath} />
				))}
			</ul>
		</nav>
	);
}

function DocsSidebarNode({ item, currentPath }: { readonly item: DocsSidebarItem; readonly currentPath: string }): ReactElement {
	const isActive = currentPath === item.path || (!!item.path && currentPath.startsWith(`${item.path}/`));
	return (
		<li className={styles.group}>
			<a className={getClass(styles.itemLink, isActive ? styles.active : null)} href={item.href}>
				{item.label}
			</a>
			{isActive && item.tokens?.length ? (
				<ul className={styles.tokens}>
					{item.tokens.map(token => {
						const tokenActive = currentPath === token.path;
						return (
							<li key={token.href}>
								<a className={getClass(styles.tokenLink, tokenActive ? styles.active : null)} href={token.href}>
									{token.label}
								</a>
							</li>
						);
					})}
				</ul>
			) : null}
			{item.children?.length ? (
				<ul className={styles.children}>
					{item.children.map(child => (
						<DocsSidebarNode key={child.href} item={child} currentPath={currentPath} />
					))}
				</ul>
			) : null}
		</li>
	);
}
