import type { ReactNode } from "react";

/**
 * Props for a component that requires `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/util/props/ChildProps
 */
export interface ChildProps {
	readonly children: ReactNode;
}

/**
 * Props for a component that optionally accepts `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/util/props/OptionalChildProps
 */
export interface OptionalChildProps {
	readonly children?: ReactNode | undefined;
}
