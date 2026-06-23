import type { ReactNode } from "react";

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
