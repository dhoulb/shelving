import type { ReactNode } from "react";
import type { SidebarItem } from "./Sidebar.js";
import { Sidebar } from "./Sidebar.js";

interface LayoutProps {
	readonly title: string;
	readonly sidebarItems: readonly SidebarItem[];
	readonly currentPath: string;
	readonly children: ReactNode;
}

export function Layout({ title, sidebarItems, currentPath, children }: LayoutProps) {
	return (
		<div
			style={{
				minHeight: "100vh",
				backgroundColor: "#22252a",
				color: "#f1f2f4",
				display: "flex",
				flexDirection: "row",
				fontFamily: "Inter, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
			}}
		>
			<Sidebar items={sidebarItems} currentPath={currentPath} />
			<main
				style={{
					flex: 1,
					padding: "24px",
					maxWidth: "1100px",
					margin: "0 auto",
				}}
			>
				<header style={{ marginBottom: "18px" }}>
					<h1 style={{ margin: 0, fontSize: "28px", color: "#ffffff" }}>{title}</h1>
				</header>
				{children}
			</main>
		</div>
	);
}
