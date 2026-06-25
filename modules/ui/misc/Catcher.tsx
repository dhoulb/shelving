import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { Component, createContext, type ReactElement, type ReactNode, use } from "react";
import { getMessage } from "../../util/error.js";
import type { Callback } from "../../util/function.js";
import { Card } from "../block/Card.js";
import { Row } from "../block/Row.js";
import { Subheading } from "../block/Subheading.js";
import { Button, type ButtonVariants } from "../form/Button.js";
import { CenteredLayout } from "../layout/CenteredLayout.js";
import { Notice } from "../notice/Notice.js";
import { Page } from "../page/Page.js";
import type { ChildProps, OptionalChildProps } from "../util/props.js";
import { Icon } from "./Icon.js";

const RetryContext = createContext<Callback | undefined>(undefined);
RetryContext.displayName = "RetryContext";

/**
 * Props for `<RetryButton>` — `<Button>` variants plus optional `children` to override the default "Retry" label.
 *
 * @see https://shelving.cc/ui/RetryButtonProps
 */
export interface RetryButtonProps extends ButtonVariants, OptionalChildProps {}

const RETRY_CHILDREN = (
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
export function RetryButton({ children = RETRY_CHILDREN, ...props }: RetryButtonProps): ReactElement | null {
	const retry = use(RetryContext);
	if (!retry) return null;
	return (
		<Button onClick={retry} {...props}>
			{children}
		</Button>
	);
}

/**
 * Props for a component that renders a caught error `reason`.
 *
 * @see https://shelving.cc/ui/ErrorComponentProps
 */
export interface ErrorComponentProps {
	reason: unknown;
}

/**
 * Props for `<Catcher>` — the `children` to guard plus the `as` component used to render any caught error.
 *
 * @see https://shelving.cc/ui/CatcherProps
 */
export interface CatcherProps extends ChildProps {
	/** Component to render an error (defaults to `<ErrorNotice />`) */
	as: (props: ErrorComponentProps) => ReactElement;
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
 * Props for `<PageCatcher>` — the page `children` to guard.
 *
 * @see https://shelving.cc/ui/PageCatcherProps
 */
export interface PageCatcherProps extends ChildProps {}

/**
 * Error boundary for a whole page that renders a full `<ErrorPage>` fallback on error.
 *
 * @kind component
 * @see https://shelving.cc/ui/PageCatcher
 */
export function PageCatcher({ children }: PageCatcherProps): ReactElement {
	return <Catcher as={ErrorPage}>{children}</Catcher>;
}

/**
 * Props for `<ErrorNotice>` — the caught error `reason`.
 *
 * @see https://shelving.cc/ui/ErrorNoticeProps
 */
export interface ErrorNoticeProps extends ErrorComponentProps {}

/**
 * Render a caught error as an inline `<Notice>` with a retry button.
 *
 * - Uses `getMessage()` to extract a human-readable message, falling back to `"Unknown error"`.
 *
 * @kind component
 * @see https://shelving.cc/ui/ErrorNotice
 */
export function ErrorNotice({ reason }: ErrorNoticeProps): ReactElement {
	const message = getMessage(reason) ?? "Unknown error";
	return (
		<Notice status="error">
			<p>{message}</p>
			<RetryButton small />
		</Notice>
	);
}

/**
 * Props for `<ErrorPage>` — the caught error `reason`.
 *
 * @see https://shelving.cc/ui/ErrorPageProps
 */
export interface ErrorPageProps extends ErrorComponentProps {}

/**
 * Render a caught error as a full-page `<Page>` with an error `<Card>` and retry button.
 *
 * - Uses `getMessage()` to extract a human-readable message, falling back to `"Unknown error"`.
 *
 * @kind component
 * @see https://shelving.cc/ui/ErrorPage
 */
export function ErrorPage({ reason }: ErrorPageProps): ReactElement {
	const message = getMessage(reason) ?? "Unknown error";
	return (
		<Page title="Error">
			<CenteredLayout>
				<Card status="error">
					<Subheading>
						<Row left>
							<Icon status="error" /> {message}
						</Row>
					</Subheading>
					<RetryButton />
				</Card>
			</CenteredLayout>
		</Page>
	);
}
