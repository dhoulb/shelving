import type { NodeKind } from "./nodes.js";

export const PALETTE = {
	background: "#22252a",
	panel: "#2e3238",
	border: "#454b54",
	text: "#f1f2f4",
	muted: "#abb1ba",
	blue: "#2f78e5",
	lime: "#92f416",
	yellow: "#ffe01a",
	cyan: "#15f4e5",
	purple: "#f047ff",
	orange: "#ffb21a",
	white: "#ffffff",
	pink: "#f43789",
};
export type PaletteColor = keyof typeof PALETTE;

export const TOKEN_KIND_COLORS: { [K in NodeKind]: PaletteColor } = {
	class: "yellow",
	function: "lime",
	interface: "cyan",
	type: "cyan",
	constant: "purple",
	method: "lime",
	property: "purple",
	directory: "blue",
	file: "blue",
};
