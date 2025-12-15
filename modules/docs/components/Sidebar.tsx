export interface SidebarItem {
	readonly label: string;
	readonly href: string;
	readonly path: string;
	readonly children?: readonly SidebarItem[];
	readonly tokens?: readonly SidebarItem[];
}

interface SidebarProps {
	readonly items: readonly SidebarItem[];
	readonly currentPath: string;
}

export function Sidebar({ items, currentPath }: SidebarProps) {
	return (
		<nav
			style={{
				width: "280px",
				backgroundColor: "#2e3238",
				borderRight: "1px solid #454b54",
				padding: "20px 16px",
				overflowY: "auto",
			}}
		>
			{items.map((item) => (
				<SidebarNode key={item.href} item={item} currentPath={currentPath} />
			))}
		</nav>
	);
}

function SidebarNode({ item, currentPath }: { item: SidebarItem; currentPath: string }) {
	const isActive = currentPath === item.path || currentPath.startsWith(item.path + "/");
	return (
		<div style={{ marginBottom: "8px" }}>
			<a
				href={item.href}
				style={{
					color: isActive ? "#ffffff" : "#f1f2f4",
					textDecoration: "none",
					fontWeight: isActive ? 700 : 600,
					display: "block",
					padding: "8px 10px",
					borderRadius: "6px",
					backgroundColor: isActive ? "#454b54" : "transparent",
				}}
			>
				{item.label}
			</a>
			{isActive && item.tokens?.length ? (
				<ul style={{ listStyle: "none", paddingLeft: "14px", margin: "6px 0" }}>
					{item.tokens.map((token) => (
						<li key={token.href} style={{ marginBottom: "4px" }}>
							<a
								href={token.href}
								style={{
									color: token.href === currentPath ? "#ffffff" : "#abb1ba",
									textDecoration: "none",
									fontSize: "13px",
								}}
							>
								{token.label}
							</a>
						</li>
					))}
				</ul>
			) : null}
			{item.children && item.children.length ? (
				<div style={{ marginLeft: "12px" }}>
					{item.children.map((child) => (
						<SidebarNode key={child.href} item={child} currentPath={currentPath} />
					))}
				</div>
			) : null}
		</div>
	);
}
