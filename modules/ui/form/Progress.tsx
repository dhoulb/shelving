import type { CSSProperties, ReactElement } from "react";
import { getClass, getModuleClass } from "../util/css.js";
import styles from "./Progress.module.css";

/**
 * Props for `Progress`, a continuous horizontal progress bar.
 *
 * @see https://shelving.cc/ui/ProgressProps
 */
export interface ProgressProps {
	value: number;
	success?: boolean;
	warning?: boolean;
	danger?: boolean;
}

/**
 * Show progress as a single continuous horizontal bar, filled to `value` clamped between `0` and `1`.
 *
 * @returns A progress bar element.
 * @kind component
 * @example <Progress value={0.5} />
 * @see https://shelving.cc/ui/Progress
 */
export function Progress({ value, success, warning, danger }: ProgressProps): ReactElement | null {
	const clamped = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
	const progressStyle = { ["--progress-value" as string]: `${clamped * 100}%` } as CSSProperties;

	return (
		<div
			className={getClass(
				getModuleClass(styles, "track"),
				success && getModuleClass(styles, "success"),
				warning && getModuleClass(styles, "warning"),
				danger && getModuleClass(styles, "danger"),
			)}
			style={progressStyle}
		>
			<span className={getModuleClass(styles, "fill")} />
		</div>
	);
}

/**
 * Props for `SegmentedProgress`, a stepped progress bar of discrete segments.
 *
 * @see https://shelving.cc/ui/SegmentedProgressProps
 */
export interface SegmentedProgressProps {
	total: number;
	current: number;
	success?: boolean;
	warning?: boolean;
	danger?: boolean;
}

/**
 * Show step progress as a horizontal bar of `total` segments, of which `current + 1` are filled.
 *
 * @returns A segmented progress bar element, or `null` when `total` is not positive.
 * @kind component
 * @example <SegmentedProgress total={4} current={1} />
 * @see https://shelving.cc/ui/SegmentedProgress
 */
export function SegmentedProgress({ total, current, success, warning, danger }: SegmentedProgressProps): ReactElement | null {
	if (total <= 0) return null;
	const progressStyle = { ["--progress-steps" as string]: total } as CSSProperties;

	return (
		<div
			className={getClass(
				getModuleClass(styles, "segmented"),
				success && getModuleClass(styles, "success"),
				warning && getModuleClass(styles, "warning"),
				danger && getModuleClass(styles, "danger"),
			)}
			style={progressStyle}
		>
			{Array.from({ length: total }, (_, i) => (
				<span key={i.toString()} className={getClass(getModuleClass(styles, "item"), i <= current && getModuleClass(styles, "active"))} />
			))}
		</div>
	);
}
