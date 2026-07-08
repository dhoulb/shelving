import { Component, type ReactElement, type ReactNode } from "react";
import { getMessage } from "../../util/error.js";
import type { Callback } from "../../util/function.js";
import { Paragraph } from "../block/Paragraph.js";
import { RetryButton, RetryContext } from "../button/RetryButton.js";
import { CenteredLayout } from "../layout/CenteredLayout.js";
import { Notice } from "../notice/Notice.js";
import { Page } from "../page/Page.js";
import type { ChildProps } from "../util/props.js";

/**
 * Props for a component that renders a caught error `reason`.
 *
 * @see https://shelving.cc/ui/ErrorProps
 */
export interface ErrorProps {
	reason: unknown;
}

/**
 * Props for `<Catcher>` — the `children` to guard plus the `as` component used to render any caught error.
 *
 * @see https://shelving.cc/ui/CatcherProps
 */
export interface CatcherProps extends ChildProps {
	/** Component to render an error (defaults to `<ErrorNotice />`) */
	as: (props: ErrorProps) => ReactElement;
}

type CatcherState = {
	/** The error that was caught. */
	reason: unknown;
};

/**
 * React error boundary that renders a fallback component when any descendant throws.
 *
 * - Catches render-time errors below it and shows the `as` component (defaults to `<ErrorNotice>`) with the caught `reason`.
 * - Provides a retry callback to descendant `<RetryButton>`s that clears the error and re-renders `children`.
 *
 * @kind component
 * @see https://shelving.cc/ui/Catcher
 */
export class Catcher extends Component<CatcherProps, CatcherState> {
	static defaultProps: Pick<CatcherProps, "as"> = {
		as: ErrorNotice,
	};
	override state: CatcherState = {
		reason: undefined,
	};
	readonly retry: Callback = () => {
		this.setState({ reason: undefined });
	};
	static getDerivedStateFromError(reason: unknown): CatcherState {
		return { reason };
	}
	override render(): ReactNode {
		const { retry, state, props } = this;
		const { reason } = state;
		const { as: ErrorComponent, children } = props;
		if (!reason) return children;
		return (
			<RetryContext value={retry}>
				<ErrorComponent reason={reason} />
			</RetryContext>
		);
	}
}

/**
 * Render a caught error as an inline `<Notice>` with a retry button.
 *
 * - Uses `getMessage()` to extract a human-readable message, falling back to `"Unknown error"`.
 *
 * @kind component
 * @see https://shelving.cc/ui/ErrorNotice
 */
export function ErrorNotice({ reason }: ErrorProps): ReactElement {
	const message = getMessage(reason) ?? "Unknown error";
	return (
		<Notice status="error">
			<Paragraph>{message}</Paragraph>
			<RetryButton small />
		</Notice>
	);
}

/**
 * Error boundary for a whole page that renders a full `<ErrorPage>` fallback on error.
 *
 * @kind component
 * @see https://shelving.cc/ui/PageCatcher
 */
export function PageCatcher({ children }: ChildProps): ReactElement {
	return <Catcher as={ErrorPage}>{children}</Catcher>;
}

/**
 * Render a caught error as a full-page `<Page>` with a centered `<ErrorNotice>`.
 *
 * @kind component
 * @see https://shelving.cc/ui/ErrorPage
 */
export function ErrorPage({ reason }: ErrorProps): ReactElement {
	return (
		<Page title="Error">
			<CenteredLayout>
				<ErrorNotice reason={reason} />
			</CenteredLayout>
		</Page>
	);
}
