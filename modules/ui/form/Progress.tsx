import type { CSSProperties, ReactElement } from "react";
import { formatPercent } from "../../util/format.js";
import { getPercent } from "../../util/number.js";
import { getClass, getModuleClass } from "../util/css.js";
import styles from "./Progress.module.css";

/**
 * Props for `Progress`, a continuous horizontal progress bar.
 *
 * @see https://shelving.cc/ui/ProgressProps
 */
export interface ProgressProps {
	numerator: number;
	denumerator?: number;
	success?: boolean;
	warning?: boolean;
	danger?: boolean;
}

/**
 * Show progress as a single continuous horizontal bar, filled to `numerator` as a percentage of `denumerator` (matches `getPercent()` and `formatPercent()`).
 * - The fill is allowed to overspill; CSS clamps it to the `0%`–`100%` range via `min-width`/`max-width`.
 *
 * @returns A progress bar element.
 * @kind component
 * @example <Progress numerator={3} denumerator={4} />
 * @see https://shelving.cc/ui/Progress
 */
export function Progress({ numerator, denumerator, success, warning, danger }: ProgressProps): ReactElement | null {
	const percent = getPercent(numerator, denumerator);
	const fillStyle = { width: `${Number.isFinite(percent) ? percent : 0}%` } as CSSProperties;

	return (
		<figure
			className={getClass(
				getModuleClass(styles, "track"),
				success && getModuleClass(styles, "success"),
				warning && getModuleClass(styles, "warning"),
				danger && getModuleClass(styles, "danger"),
			)}
			role="progressbar"
			aria-valuemin={0}
			aria-valuemax={denumerator ?? 100}
			aria-valuenow={numerator}
			aria-valuetext={formatPercent(numerator, denumerator)}
		>
			<span className={getModuleClass(styles, "fill")} style={fillStyle} />
		</figure>
	);
}
