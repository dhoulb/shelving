import { ArrowPathIcon } from "@heroicons/react/16/solid";
import { createContext, type ReactElement, use } from "react";
import type { Callback } from "../../util/function.js";
import type { OptionalChildProps } from "../util/index.js";
import { Button, type ButtonVariants } from "./Button.js";

/**
 * Context for providing a "retry" callback to descendant `<RetryButton>` elements.
 * - Used by `<Catcher>` to provide a retry callback to its children.
 * - Default `<ErrorNotice>` and `<ErrorPage>` elements include `<RetryButton>` to trigger a retry on their parent `<Catcher>`
 */
export const RetryContext = createContext<Callback | undefined>(undefined);
RetryContext.displayName = "RetryContext";

/**
 * Component props for `<RetryButton>`
 *
 * @property children - The content of the button. Defaults to a refresh icon and `"Retry"`
 *
 * @see https://shelving.cc/ui/RetryButtonProps
 */
export interface RetryButtonProps extends ButtonVariants, OptionalChildProps {}

const _RETRY_CHILDREN = (
	<>
		<ArrowPathIcon />
		Retry
	</>
);

/**
 * Button that retries the nearest `<Catcher>` error boundary when clicked.
 *
 * - Reads the retry callback from `<Catcher>`'s private context, so it renders `null` when there is no boundary above it to retry.
 * - Defaults to an "Retry" label with a refresh icon; pass `children` to override.
 *
 * @kind component
 * @see https://shelving.cc/ui/RetryButton
 */
export function RetryButton({ children = _RETRY_CHILDREN, ...props }: RetryButtonProps): ReactElement | null {
	const retry = use(RetryContext);
	if (!retry) return null;
	return (
		<Button onClick={retry} {...props}>
			{children}
		</Button>
	);
}
