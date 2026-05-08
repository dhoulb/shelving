import type { ReactElement, ReactNode } from "react";
import { requireMeta } from "../misc/Meta.js";
import { Head } from "./Head.js";

export interface HTMLProps {
	children: ReactNode;
}

/** Output a `<html>` element. */
export function HTML({ children }: HTMLProps): ReactElement {
	const { language } = requireMeta();
	return (
		<html lang={language}>
			<Head />
			<body id="root">{children}</body>
		</html>
	);
}
