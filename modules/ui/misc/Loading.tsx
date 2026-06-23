import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import styles from "./Loading.module.css";

declare const _componentProps: unique symbol;

/**
 * Props for `<Loading>` — takes no props (branded empty interface).
 *
 * @see https://shelving.cc/ui/LoadingProps
 */
export interface LoadingProps {
	readonly [_componentProps]?: never;
}

/**
 * Animated spinner SVG used as a loading indicator.
 *
 * - Self-contained inline SVG with a rotating indicator arc; inherits its colour and size from the surrounding text.
 *
 * @returns The spinner element.
 * @kind component
 * @example <Loading />
 * @see https://shelving.cc/ui/Loading
 */
export function Loading(): ReactElement {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			className={getModuleClass(styles, "spinner")}
			data-slot="icon"
		>
			<title>Loading...</title>
			<circle className={getModuleClass(styles, "track")} cx="12" cy="12" r="9" pathLength="100" />
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
				<circle className={getModuleClass(styles, "indicator")} cx="12" cy="12" r="9" pathLength="100" />
			</g>
		</svg>
	);
}

/**
 * Shared `<Loading>` element with a stable `key`, ready to drop into `Suspense` fallbacks and lists.
 *
 * @example <Suspense fallback={LOADING}>…</Suspense>
 * @see https://shelving.cc/ui/LOADING
 */
export const LOADING = <Loading key="loading" />;
