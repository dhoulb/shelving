import type { ReactElement } from "react";
import { RouteCache } from "../router/RouteCache.js";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import CENTERED_LAYOUT_CSS from "./CenteredLayout.module.css";

/**
 * Props for `<CenteredLayout>` — optional `children` and a `fullWidth` flag to drop the max-width.
 *
 * @see https://shelving.cc/ui/CenteredLayoutProps
 */
export interface CenteredLayoutProps extends OptionalChildProps {
	/**
	 * Drop the narrow max-width and let content fill the width.
	 * @default false
	 */
	fullWidth?: boolean;
}

/**
 * Layout that centres its content with no header/footer and a narrow max-width.
 * - Used for e.g. login/register/error/form pages where the content is the only focus.
 *
 * @kind component
 * @see https://shelving.cc/ui/CenteredLayout
 */
export function CenteredLayout({ children, fullWidth = false }: CenteredLayoutProps): ReactElement {
	// Wrap the scrolling `<main>` in `<RouteCache>` so recently-visited pages stay mounted but hidden,
	// keeping their scroll position and state intact across back/forward navigation.
	return (
		<RouteCache>
			<main className={getModuleClass(CENTERED_LAYOUT_CSS, "main")}>
				<div className={getModuleClass(CENTERED_LAYOUT_CSS, "mainInner")} style={fullWidth ? { maxWidth: "none" } : undefined}>
					{children}
				</div>
			</main>
		</RouteCache>
	);
}
