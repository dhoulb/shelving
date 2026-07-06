import type { ReactElement } from "react";
import { formatPercent } from "../../util/format.js";
import { type Nullish, notNullish } from "../../util/null.js";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getStatusClass, type StatusVariants } from "../style/Status.js";
import { getClass, getModuleClass } from "../util/css.js";
import "./Progress.css";
import styles from "./Progress.module.css";

/**
 * Props for `Progress`, a continuous horizontal progress bar.
 *
 * @see https://shelving.cc/ui/ProgressProps
 */
export interface ProgressProps extends ColorVariants, StatusVariants {
	/** Position within the `min`–`max` range, or `null`/`undefined`/omitted for an indeterminate bar. */
	value?: Nullish<number>;
	min?: number;
	max?: number;
}

/**
 * Show progress as a single continuous horizontal bar, filled to `value` within the `min`–`max` range (matches `getPercent()` and `formatPercent()`).
 * - Renders a native `<progress>` element, so `role="progressbar"` and the value/max semantics come from the browser.
 * - `<progress>` has no `min` attribute (its implicit minimum is `0`), so the range is normalised to `value - min` / `max - min` before it's handed to the element.
 * - The browser clamps `value` to the `0`–`max` range, so an out-of-range `value` shows an empty or full bar rather than overspilling.
 * - Omit `value` (or pass `null`/`undefined`) to drop the attribute entirely — exactly as a native `<progress>` does, the element becomes `:indeterminate` (no `aria-valuenow`) and a block of fill colour flows across the track on a loop.
 * - Paints from the tint ladder, so `color=` / `status=` recolour the fill (and track) by moving the tint anchor.
 *
 * @returns A progress bar element.
 * @kind component
 * @example <Progress value={3} max={4} />
 * @example <Progress value={90} status="success" />
 * @example <Progress />
 * @see https://shelving.cc/ui/Progress
 */
export function Progress({ value, min = 0, max = 100, ...props }: ProgressProps): ReactElement {
	// `<progress>` has no `min`, so shift the range to a `0`-based one. A non-positive span would make `<progress>` indeterminate, so fall back to an empty determinate bar.
	const span = max - min;

	return (
		<progress
			className={getClass(
				getModuleClass(styles, "progress"), //
				getColorClass(props),
				getStatusClass(props),
			)}
			// A nullish `value` drops the attribute (and its announced text) so the element is natively `:indeterminate` and the flowing animation styled off that pseudo-class takes over.
			value={notNullish(value) ? (span > 0 ? value - min : 0) : undefined}
			max={span > 0 ? span : 1}
			aria-valuetext={notNullish(value) ? formatPercent(value - min, max - min) : undefined}
		/>
	);
}
