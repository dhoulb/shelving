import { PALETTE, type PaletteColor } from "../util/style.js";

interface BadgeProps {
	readonly label: string;
	readonly color: PaletteColor;
}

export function Badge({ label, color }: BadgeProps) {
	return (
		<span
			style={{
				display: "inline-block",
				borderRadius: "999px",
				padding: "2px 8px",
				fontSize: "12px",
				fontWeight: 700,
				color: "#0f1115",
				backgroundColor: PALETTE[color],
				marginLeft: "8px",
			}}
		>
			{label}
		</span>
	);
}
