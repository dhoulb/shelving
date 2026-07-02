import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import { Icon } from "./Icon.js";
import LOADING_CSS from "./Loading.module.css";

const LOADING_TRACK_CLASS = getModuleClass(LOADING_CSS, "track");
const LOADING_INDICATOR_CLASS = getModuleClass(LOADING_CSS, "indicator");

/**
 * Animated loading spinner shaped like a Heroicon — a faint track plus a rotating indicator arc.
 *
 * - Self-contained inline SVG; the spin is driven by an inline SMIL `<animateTransform>`.
 * - The track and indicator paint from scaled steps of the current tint ladder (`--tint-70` / `--tint-80`), so their colour follows whatever tint `<Icon>` (or an ancestor) sets.
 * - Takes only `className` like the Heroicons, so it slots straight into `<Icon icon={Loading} />` to pick up icon sizing, colour, and centring.
 *
 * @kind component
 * @see https://shelving.cc/ui/Loading
 */
export function Loading({ className }: { className?: string | undefined }): ReactElement {
	return (
		<svg aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} data-slot="icon">
			<title>Loading...</title>
			<circle className={LOADING_TRACK_CLASS} cx="12" cy="12" r="9" pathLength="100" />
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
				<circle className={LOADING_INDICATOR_CLASS} cx="12" cy="12" r="9" pathLength="100" />
			</g>
		</svg>
	);
}

/**
 * Shared loading spinner element with a stable `key`, ready to drop into `Suspense` fallbacks and lists.
 *
 * - A `<Loading>` rendered through `<Icon>`, so it picks up icon sizing, colour, and centring.
 *
 * @see https://shelving.cc/ui/LOADING
 */
export const LOADING = <Icon icon={Loading} key="loading" />;
