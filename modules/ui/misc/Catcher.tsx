import { Component, createContext, type ReactElement, type ReactNode, use } from "react";
import { type Callback, getMessage } from "shelving";
import { ArrowPathIcon } from "shelving/icon";
import { Button, type ButtonVariants } from "../form/Button.js";
import { CenteredLayout } from "../layout/CenteredLayout.js";
import { Notice } from "../notice/Notice.js";
import { Page } from "../page/Page.js";

const RetryContext = createContext<Callback | undefined>(undefined);
RetryContext.displayName = "RetryContext";

export interface RetryButtonProps extends ButtonVariants {
	children?: ReactNode | undefined;
}

const RETRY_CHILDREN = (
	<>
		<ArrowPathIcon />
		Retry
	</>
);

export function RetryButton({ children = RETRY_CHILDREN, ...props }: RetryButtonProps): ReactElement | null {
	const retry = use(RetryContext);
	if (!retry) return null;
	return (
		<Button onClick={retry} {...props}>
			{children}
		</Button>
	);
}

export interface ErrorComponentProps {
	reason: unknown;
}

export interface CatcherProps {
	/** Component to render an error (defaults to `<ErrorNotice />`) */
	as: (props: ErrorComponentProps) => ReactElement;
	/** Content that's shown if there's no error. */
	children: ReactNode;
}

type CatcherState = {
	/** The error that was caught. */
	reason: unknown;
};

/**
 * React component that provides an Error Boundary.
 * If an error occurs in any component under this, a general error will be shown to the user.
 */
export class Catcher extends Component<CatcherProps, CatcherState> {
	static defaultProps: CatcherProps = {
		as: ErrorNotice,
		children: null,
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

export interface PageCatcherProps {
	children?: ReactNode;
}

/** Catch errors in a page. */
export function PageCatcher({ children }: PageCatcherProps): ReactElement {
	return <Catcher as={ErrorPage}>{children}</Catcher>;
}

export interface ErrorNoticeProps extends ErrorComponentProps {}

/** Output a `<Notice>` for an unknown error reason. */
export function ErrorNotice({ reason }: ErrorNoticeProps): ReactElement {
	const message = getMessage(reason) ?? "Unknown error";
	return (
		<Notice status="error">
			<p>{message}</p>
			<RetryButton small fit />
		</Notice>
	);
}

export interface ErrorPageProps extends ErrorComponentProps {}

/** Output a `<Page>` with a `<Notice>` for an unknown error reason. */
export function ErrorPage({ reason }: ErrorPageProps): ReactElement {
	return (
		<Page title="Error">
			<CenteredLayout>
				<ErrorNotice reason={reason} />
			</CenteredLayout>
		</Page>
	);
}
