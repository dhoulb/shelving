import type { ReactElement } from "react";
import { formatPercent } from "../../util/format.js";
import { getClass, getModuleClass } from "../util/css.js";
import styles from "./Progress.module.css";

/**
 * Props for `Progress`, a continuous horizontal progress bar.
 *
 * @see https://shelving.cc/ui/ProgressProps
 */
export interface ProgressProps {
	value: number;
	min?: number;
	max?: number;
	success?: boolean;
	warning?: boolean;
	danger?: boolean;
}

/**
 * Show progress as a single continuous horizontal bar, filled to `value` within the `min`–`max` range (matches `getPercent()` and `formatPercent()`).
 * - Renders a native `<progress>` element, so `role="progressbar"` and the value/max semantics come from the browser.
 * - `<progress>` has no `min` attribute (its implicit minimum is `0`), so the range is normalised to `value - min` / `max - min` before it's handed to the element.
 * - The browser clamps `value` to the `0`–`max` range, so an out-of-range `value` shows an empty or full bar rather than overspilling.
 *
 * @returns A progress bar element.
 * @kind component
 * @example <Progress value={3} max={4} />
 * @see https://shelving.cc/ui/Progress
 */
export function Progress({ value, min = 0, max = 100, success, warning, danger }: ProgressProps): ReactElement {
	// `<progress>` has no `min`, so shift the range to a `0`-based one. A non-positive span would make `<progress>` indeterminate, so fall back to an empty determinate bar.
	const span = max - min;

	return (
		<progress
			className={getClass(
				getModuleClass(styles, "progress"),
				success && getModuleClass(styles, "success"),
				warning && getModuleClass(styles, "warning"),
				danger && getModuleClass(styles, "danger"),
			)}
			value={span > 0 ? value - min : 0}
			max={span > 0 ? span : 1}
			aria-valuetext={formatPercent(value - min, max - min)}
		/>
	);
}
