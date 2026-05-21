import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { Component, createContext, type ReactElement, type ReactNode, use } from "react";
import { getMessage } from "../../util/error.js";
import type { Callback } from "../../util/function.js";
import { Card } from "../block/Card.js";
import { Flex } from "../block/Flex.js";
import { Subheading } from "../block/Subheading.js";
import { Button, type ButtonVariants } from "../form/Button.js";
import { CenteredLayout } from "../layout/CenteredLayout.js";
import { Notice } from "../notice/Notice.js";
import { Page } from "../page/Page.js";
import type { ChildProps, OptionalChildProps } from "../util/props.js";
import { StatusIcon } from "./StatusIcon.js";

const RetryContext = createContext<Callback | undefined>(undefined);
RetryContext.displayName = "RetryContext";

export interface RetryButtonProps extends ButtonVariants, OptionalChildProps {}

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

export interface CatcherProps extends ChildProps {
	/** Component to render an error (defaults to `<ErrorNotice />`) */
	as: (props: ErrorComponentProps) => ReactElement;
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

export interface PageCatcherProps extends ChildProps {}

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

/** Output a `<Page>` with an error `<Card>` for an unknown error reason. */
export function ErrorPage({ reason }: ErrorPageProps): ReactElement {
	const message = getMessage(reason) ?? "Unknown error";
	return (
		<Page title="Error">
			<CenteredLayout>
				<Card status="error">
					<Subheading>
						<Flex left>
							<StatusIcon status="error" xlarge /> {message}
						</Flex>
						<RetryButton />
					</Subheading>
				</Card>
			</CenteredLayout>
		</Page>
	);
}
