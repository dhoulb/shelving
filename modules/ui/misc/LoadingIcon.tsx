import type { ReactElement } from "react";

/**
 * Animated loading spinner shaped like a Heroicon — a faint track plus a rotating indicator arc.
 *
 * - Self-contained inline SVG: both arcs paint with `currentColor`, and the spin is driven by an inline SMIL `<animateTransform>`.
 * - Takes only `className` like the Heroicons, so it slots straight into `<Icon icon={LoadingIcon} />` to pick up icon sizing, colour, and centring.
 *
 * @kind component
 * @see https://shelving.cc/ui/LoadingIcon
 */
export function LoadingIcon({ className }: { className?: string | undefined }): ReactElement {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			stroke="currentColor"
			strokeWidth={2.5}
			className={className}
			data-slot="icon"
		>
			<title>Loading...</title>
			<circle cx="12" cy="12" r="9" strokeOpacity={0.25} pathLength={100} />
			<g>
				<animateTransform
					attributeName="transform"
					attributeType="xml"
					type="rotate"
					from="0 12 12"
					to="360 12 12"
					dur="0.5s"
					repeatCount="indefinite"
				/>
				<circle cx="12" cy="12" r="9" strokeLinecap="round" strokeDasharray="28 100" pathLength={100} />
			</g>
		</svg>
	);
}
