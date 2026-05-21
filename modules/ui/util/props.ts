import type { ReactNode } from "react";

/** Props for a component that requires `children`. */
export interface ChildProps {
	readonly children: ReactNode;
}

/** Props for a component that optionally accepts `children`. */
export interface OptionalChildProps {
	readonly children?: ReactNode | undefined;
}
