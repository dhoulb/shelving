import type { ReactElement } from "react";
import { RouteCache } from "../router/RouteCache.js";
import { getBlockClass } from "../style/Block.js";
import type { IndentVariants } from "../style/Indent.js";
import type { PaddingVariants } from "../style/Padding.js";
import type { WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import LAYOUT_CSS from "./CenteredLayout.module.css";

const LAYOUT_MAIN_CLASS = getModuleClass(LAYOUT_CSS, "main");
const LAYOUT_INNER_CLASS = getModuleClass(LAYOUT_CSS, "inner");

/**
 * Props for `<CenteredLayout>` — optional `children` and a `fullWidth` flag to drop the max-width.
 *
 * @see https://shelving.cc/ui/CenteredLayoutProps
 */
export interface CenteredLayoutProps extends WidthVariants, PaddingVariants, IndentVariants, OptionalChildProps {}

/**
 * Layout that centres its content with no header/footer and a narrow max-width.
 * - Used for e.g. login/register/error/form pages where the content is the only focus.
 *
 * @kind component
 * @see https://shelving.cc/ui/CenteredLayout
 */
export function CenteredLayout({ children, ...props }: CenteredLayoutProps): ReactElement {
	// Wrap the scrolling `<main>` in `<RouteCache>` so recently-visited pages stay mounted but hidden,
	// keeping their scroll position and state intact across back/forward navigation.
	return (
		<RouteCache>
			<main className={LAYOUT_MAIN_CLASS}>
				<div
					className={getClass(
						LAYOUT_INNER_CLASS, //
						getBlockClass(props),
					)}
				>
					{children}
				</div>
			</main>
		</RouteCache>
	);
}
