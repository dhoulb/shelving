import { type ReactElement, type ReactNode, Suspense } from "react";
import { CenteredLayout } from "../layout/CenteredLayout.js";
import type { ChildProps } from "../util/props.js";
import { Catcher, PageCatcher } from "./Catcher.js";
import { LOADING } from "./Loading.js";

/**
 * Props for `<Loader>` and `<PageLoader>` — the `children` to load plus an optional `fallback` shown while they suspend.
 *
 * @see https://shelving.cc/ui/LoaderProps
 */
export interface LoaderProps extends ChildProps {
	/** Element rendered while `children` suspend (defaults to `LOADING`). */
	readonly fallback?: ReactNode | undefined;
}

/**
 * Load a component.
 *
 * - Wrapped in `<Catcher>` so child components can throw errors.
 * - Wrapped in `<Suspense>` so child components can throw promises.
 *
 * @kind component
 * @see https://shelving.cc/ui/Loader
 */
export function Loader({ children, fallback = LOADING }: LoaderProps): ReactElement {
	return (
		<Catcher>
			<Suspense fallback={fallback}>{children}</Suspense>
		</Catcher>
	);
}

/**
 * Load a page.
 *
 * - Wrapped in `<PageCatcher>` so child components can throw errors.
 * - Wrapped in `<Suspense>` so child components can throw promises.
 *
 * @kind component
 * @see https://shelving.cc/ui/PageLoader
 */
export function PageLoader({ children, fallback = <CenteredLayout>{LOADING}</CenteredLayout> }: LoaderProps): ReactElement {
	return (
		<PageCatcher>
			<Suspense fallback={fallback}>{children}</Suspense>
		</PageCatcher>
	);
}
