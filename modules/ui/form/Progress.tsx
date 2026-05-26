import type { CSSProperties, ReactElement } from "react";
import { getClass } from "../util/css.js";
import styles from "./Progress.module.css";

export interface ProgressProps {
	value: number;
	success?: boolean;
	warning?: boolean;
	danger?: boolean;
}

/** Show progress as a single continuous horizontal bar. */
export function Progress({ value, success, warning, danger }: ProgressProps): ReactElement | null {
	const clamped = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
	const progressStyle = { ["--progress-value" as string]: `${clamped * 100}%` } as CSSProperties;

	return (
		<div
			className={getClass(styles.track, success && styles.success, warning && styles.warning, danger && styles.danger)}
			style={progressStyle}
		>
			<span className={styles.fill} />
		</div>
	);
}

export interface SegmentedProgressProps {
	total: number;
	current: number;
	success?: boolean;
	warning?: boolean;
	danger?: boolean;
}

/** Show step progress as a horizontal bar of `total` segments, of which `current + 1` are filled. */
export function SegmentedProgress({ total, current, success, warning, danger }: SegmentedProgressProps): ReactElement | null {
	if (total <= 0) return null;
	const progressStyle = { ["--progress-steps" as string]: total } as CSSProperties;

	return (
		<div
			className={getClass(styles.segmented, success && styles.success, warning && styles.warning, danger && styles.danger)}
			style={progressStyle}
		>
			{Array.from({ length: total }, (_, i) => (
				<span key={i.toString()} className={getClass(styles.item, i <= current && styles.active)} />
			))}
		</div>
	);
}
