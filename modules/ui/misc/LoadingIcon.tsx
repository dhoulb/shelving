import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import LOADING_ICON_CSS from "./LoadingIcon.module.css";

/**
 * Animated loading spinner shaped like a Heroicon — a faint track plus a rotating indicator arc.
 *
 * - Self-contained inline SVG; the spin is driven by an inline SMIL `<animateTransform>`.
 * - The track and indicator paint from scaled steps of the current tint ladder (`--tint-70` / `--tint-80`), so their colour follows whatever tint `<Icon>` (or an ancestor) sets.
 * - Takes only `className` like the Heroicons, so it slots straight into `<Icon icon={LoadingIcon} />` to pick up icon sizing, colour, and centring.
 *
 * @kind component
 * @see https://shelving.cc/ui/LoadingIcon
 */
export function LoadingIcon({ className }: { className?: string | undefined }): ReactElement {
	return (
		<svg aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} data-slot="icon">
			<title>Loading...</title>
			<circle className={getModuleClass(LOADING_ICON_CSS, "track")} cx="12" cy="12" r="9" pathLength="100" />
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
				<circle className={getModuleClass(LOADING_ICON_CSS, "indicator")} cx="12" cy="12" r="9" pathLength="100" />
			</g>
		</svg>
	);
}
