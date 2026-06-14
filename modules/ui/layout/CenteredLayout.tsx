import type { ReactElement } from "react";
import { requireMetaURL } from "../misc/MetaContext.js";
import { getClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import CENTERED_LAYOUT_CSS from "./CenteredLayout.module.css";
import { LAYOUT_CLASS } from "./Layout.js";

/**
 * Props for `<CenteredLayout>` — optional `children` and a `fullWidth` flag to drop the max-width.
 *
 * @see https://dhoulb.github.io/shelving/ui/layout/CenteredLayout/CenteredLayoutProps
 */
export interface CenteredLayoutProps extends OptionalChildProps {
	fullWidth?: boolean;
}

/**
 * Layout that centres its content with no header/footer and a narrow max-width.
 * - Used for e.g. login/register/error/form pages where the content is the only focus.
 *
 * @param children The content to centre.
 * @param fullWidth Drop the narrow max-width and let content fill the width (defaults to `false`).
 * @returns The centred layout element.
 * @example <CenteredLayout><LoginForm /></CenteredLayout>
 * @see https://dhoulb.github.io/shelving/ui/layout/CenteredLayout/CenteredLayout
 */
export function CenteredLayout({ children, fullWidth = false }: CenteredLayoutProps): ReactElement {
	const { path } = requireMetaURL();
	return (
		<main key={path} className={getClass(CENTERED_LAYOUT_CSS.main, LAYOUT_CLASS)}>
			<div className={CENTERED_LAYOUT_CSS.mainInner} style={fullWidth ? { maxWidth: "none" } : undefined}>
				{children}
			</div>
		</main>
	);
}
