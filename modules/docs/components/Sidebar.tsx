import type { ReactElement } from "react";
import { getClass } from "../../ui/util/css.js";
import styles from "./Sidebar.module.css";

export interface SidebarItem {
	readonly label: string;
	readonly href: string;
	readonly path: string;
	readonly children?: readonly SidebarItem[] | undefined;
	readonly tokens?: readonly SidebarItem[] | undefined;
}

export interface SidebarProps {
	readonly title?: string | undefined;
	readonly items: readonly SidebarItem[];
	readonly currentPath: string;
}

/** Renders the contents of the docs sidebar — a hierarchical link tree with tokens shown under the active page. */
export function Sidebar({ title, items, currentPath }: SidebarProps): ReactElement {
	return (
		<nav className={styles.sidebar}>
			{title ? <h1 className={styles.title}>{title}</h1> : null}
			<ul className={styles.list}>
				{items.map(item => (
					<SidebarNode key={item.href} item={item} currentPath={currentPath} />
				))}
			</ul>
		</nav>
	);
}

function SidebarNode({ item, currentPath }: { readonly item: SidebarItem; readonly currentPath: string }): ReactElement {
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
						<SidebarNode key={child.href} item={child} currentPath={currentPath} />
					))}
				</ul>
			) : null}
		</li>
	);
}
