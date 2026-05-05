import type { CSSProperties, ReactElement } from "react";
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
		<div className={styles.track} style={progressStyle}>
			<span className={`${styles.fill} ${success ? styles.success : ""} ${warning ? styles.warning : ""} ${danger ? styles.danger : ""}`} />
		</div>
	);
}
