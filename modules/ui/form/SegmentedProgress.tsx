import type { CSSProperties, ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import styles from "./SegmentedProgress.module.css";

export interface SegmentedProgressProps {
	total: number;
	current: number;
	success?: boolean;
	warning?: boolean;
	danger?: boolean;
}

/** Show step progress as a horizontal bar of segments. */
export function SegmentedProgress({ total, current, success, warning, danger }: SegmentedProgressProps): ReactElement | null {
	if (total <= 0) return null;
	const progressStyle = { ["--steps" as string]: total } as CSSProperties;
	const hasStateVariant = !!(success || warning || danger);

	return (
		<div
			className={getModuleClass(styles, "progress", {
				primary: !hasStateVariant,
				success,
				warning,
				danger,
			})}
			style={progressStyle}
		>
			{Array.from({ length: total }, (_, i) => (
				<span key={i.toString()} className={`${styles.item} ${i <= current ? styles.active : ""}`} />
			))}
		</div>
	);
}
