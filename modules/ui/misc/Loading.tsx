import type { ReactElement } from "react";
import type { ColorVariants } from "../style/Color.js";
import type { SpaceVariants } from "../style/Space.js";
import { getStatusClass, type StatusVariants } from "../style/Status.js";
import type { TintVariant } from "../style/Tint.js";
import { getTypographyClass, type SizeVariant } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import ICON_CSS from "./Icon.module.css";
import LOADING_CSS from "./Loading.module.css";

const LOADING_CLASS = getModuleClass(LOADING_CSS, "loading");

/**
 * Props for `<Loading>` — the same styling variants as `<Icon>`.
 *
 * - Mirrors `IconProps` minus the `icon` prop, since the spinner is its own fixed graphic.
 *
 * @see https://shelving.cc/ui/LoadingProps
 */
export interface LoadingProps extends ColorVariants, StatusVariants, SpaceVariants {
	/**
	 * Size of the spinner.
	 * @default var(--size-icon)
	 */
	size?: SizeVariant | undefined;
	/**
	 * Tint of the selected color.
	 * @default "50"
	 */
	tint?: TintVariant | undefined;
}

/**
 * Animated spinner SVG used as a loading indicator.
 *
 * - Self-contained inline SVG with a rotating indicator arc.
 * - Shares `<Icon>`'s `Icon.module.css` styling and accepts the same colour, status, space, size, and tint variants, so it sizes and centres like any other icon.
 *
 * @kind component
 * @see https://shelving.cc/ui/Loading
 */
export function Loading(props: LoadingProps): ReactElement {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			className={getClass(
				getModuleClass(ICON_CSS, "icon"), //
				LOADING_CLASS,
				getStatusClass(props),
				getTypographyClass(props), // Used for colour, size, and tint.
			)}
			data-slot="icon"
		>
			<title>Loading...</title>
			<circle className={getModuleClass(LOADING_CSS, "track")} cx="12" cy="12" r="9" pathLength="100" />
			<g>
				<animateTransform
					attributeName="transform"
					attributeType="xml"
					type="rotate"
					from="0 12 12"
					to="360 12 12"
					dur="0.5s"
					repeatCount="indefinite"
				/>
				<circle className={getModuleClass(LOADING_CSS, "indicator")} cx="12" cy="12" r="9" pathLength="100" />
			</g>
		</svg>
	);
}

/**
 * Shared `<Loading>` element with a stable `key`, ready to drop into `Suspense` fallbacks and lists.
 *
 * @see https://shelving.cc/ui/LOADING
 */
export const LOADING = <Loading key="loading" />;
