import type { ReactElement } from "react";
import { RouteCache } from "../router/RouteCache.js";
import { getIndentClass, type IndentVariants } from "../style/Indent.js";
import { getPaddingClass, type PaddingVariants } from "../style/Padding.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import LAYOUT_CSS from "./CenteredLayout.module.css";

const LAYOUT_MAIN_CLASS = getModuleClass(LAYOUT_CSS, "main");
const LAYOUT_INNER_CLASS = getModuleClass(LAYOUT_CSS, "inner");

/**
 * Props for `<CenteredLayout>` — optional `children` plus `width` (of the centred column) and `padding` / `indent`
 * (block / inline padding of the scroll area) variants.
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
	//
	// The `padding` / `indent` variants set the scroll area's block / inline padding on `<main>`, while the `width`
	// variant sizes the centred `.inner` column. The column stays free of variant/block classes so its `margin: auto`
	// (which does the vertical + horizontal centring) is never zeroed by the `:first-child` / `:last-child` margin
	// collapses that `.block` carries in `@layer overrides`.
	return (
		<RouteCache>
			<main
				className={getClass(
					LAYOUT_MAIN_CLASS, //
					getPaddingClass(props),
					getIndentClass(props),
				)}
			>
				<div
					className={getClass(
						LAYOUT_INNER_CLASS, //
						getWidthClass(props),
					)}
				>
					{children}
				</div>
			</main>
		</RouteCache>
	);
}
