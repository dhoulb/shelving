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
	value: number;
	min?: number;
	max?: number;
	success?: boolean;
	warning?: boolean;
	danger?: boolean;
}

/**
 * Show progress as a single continuous horizontal bar, filled to `value` within the `min`–`max` range (matches `getPercent()` and `formatPercent()`).
 * - The fill is allowed to overspill; CSS clamps it to the `0%`–`100%` range via `min-width`/`max-width`.
 *
 * @returns A progress bar element.
 * @kind component
 * @example <Progress value={3} max={4} />
 * @see https://shelving.cc/ui/Progress
 */
export function Progress({ value, min = 0, max = 100, success, warning, danger }: ProgressProps): ReactElement | null {
	const percent = getPercent(value - min, max - min);
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
			aria-valuemin={min}
			aria-valuemax={max}
			aria-valuenow={value}
			aria-valuetext={formatPercent(value - min, max - min)}
		>
			<span className={getModuleClass(styles, "fill")} style={fillStyle} />
		</figure>
	);
}
