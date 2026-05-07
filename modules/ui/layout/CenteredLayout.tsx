import type { ReactElement, ReactNode } from "react";
import { getClass } from "../util/css.js";
import CENTERED_LAYOUT_CSS from "./CenteredLayout.module.css";
import { LAYOUT_CSS } from "./Layout.js";

export interface CenteredLayoutProps {
	children?: ReactNode;
	fullWidth?: boolean;
}

/**
 * Layout that puts the content in the center of the screen with no header/footer and a narrow max-width.
 * - Used for e.g. login/register/error/form pages where the content is the only focus.
 */
export function CenteredLayout({ children, fullWidth = false }: CenteredLayoutProps): ReactElement {
	return (
		<main className={getClass(CENTERED_LAYOUT_CSS.main, LAYOUT_CSS.layout)}>
			<div className={CENTERED_LAYOUT_CSS.mainInner} style={fullWidth ? { maxWidth: "none" } : undefined}>
				{children}
			</div>
		</main>
	);
}
