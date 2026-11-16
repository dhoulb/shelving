import { type ReactElement, type ReactNode, Suspense } from "react";
import { Block } from "../block/Block.js";
import { Row } from "../block/Row.js";
import type { ChildProps } from "../util/props.js";
import { Catcher, PageCatcher } from "./Catcher.js";
import { LOADING } from "./Icon.js";

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

/** Default page loading state: the spinner, in the middle of the screen. It renders no layout. */
const PAGE_LOADING = (
	<Block middle padding="xxlarge">
		<Row center>{LOADING}</Row>
	</Block>
);

/**
 * Load a page.
 *
 * - Wrapped in `<PageCatcher>` so child components can throw errors.
 * - Wrapped in `<Suspense>` so child components can throw promises.
 * - It renders no layout, so its loading state and error page show inside whatever layout is around it.
 *
 * @kind component
 * @see https://shelving.cc/ui/PageLoader
 */
export function PageLoader({ children, fallback = PAGE_LOADING }: LoaderProps): ReactElement {
	return (
		<PageCatcher>
			<Suspense fallback={fallback}>{children}</Suspense>
		</PageCatcher>
	);
}
