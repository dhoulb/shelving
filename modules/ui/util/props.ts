import type { ReactNode } from "react";
import type { Classes } from "./css.js";

/**
 * Props for a component that requires `children`.
 *
 * @see https://shelving.cc/ui/ChildProps
 */
export interface ChildProps {
	readonly children: ReactNode;
}

/**
 * Props for a component that optionally accepts `children`.
 *
 * @see https://shelving.cc/ui/OptionalChildProps
 */
export interface OptionalChildProps {
	readonly children?: ReactNode | undefined;
}

/**
 * Props for a component that accepts an additional `className`, merged _after_ the classes the component computes for itself.
 * - Accepts anything `Classes` allows — a string, a nested array of strings, or a `Variants` dictionary of `true` flags.
 * - Merged last so an app's own (unlayered) stylesheet reliably beats the library's `@layer components` rules.
 * - Component hooks (`--card-background` etc.) and the tint ladder remain the primary theming surface; `className` is the escape hatch for one-off treatments they can't express.
 *
 * @see https://shelving.cc/ui/ClassProps
 */
export interface ClassProps {
	readonly className?: Classes | undefined;
}
