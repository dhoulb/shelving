import type { MouseEvent, ReactElement, ReactNode } from "react";
import { BusyStore, type PossibleURL, requireURL } from "shelving";
import { useInstance, useStore } from "shelving/react";
import { LOADING } from "../misc/Loading.js";
import { callNotifiedElement } from "../util/notice.js";

/**
 * Handler for a clickable `onClick` event.
 * - Returned value (if defined) is notified to the user using `notifySuccess()`
 * - Thrown value is notified to the user using `notifyError()`
 */
export type ClickableCallback = (event: MouseEvent<HTMLButtonElement>) => ReactNode | void | PromiseLike<ReactNode | void>;

/** Props for a thing that can be clicked, either has a string `href` link or an `onClick` callback handler. */
export interface ClickableProps {
	/** Whether the clickable is currently disabled. */
	disabled?: boolean | undefined;
	/** If present then render this element as an `<a>` link (takes precidence over `onClick`). */
	href?: PossibleURL | undefined;
	/** If present then render this element as a `<button>` */
	onClick?: ClickableCallback | undefined;
	/** Target, e.g. `_blank` */
	target?: string | undefined;
	/** If `href` is present then this is the suggested filename for downloading. */
	download?: string | undefined;
	/** Title shown on hover. */
	title?: string | undefined;
	/** The contents of the clickable. */
	children?: ReactNode | undefined;
}

/** Return either a `<button>` or an `<a href="">` based on whether an `onClick` or `href` prop is provided. */
export function getClickable(props: ClickableProps, className?: string): ReactElement {
	return props.href ? <LinkClickable {...props} className={className} /> : <ButtonClickable {...props} className={className} />;
}

/** Return an `<a href="">` element. */
function LinkClickable({
	disabled = false,
	href,
	title,
	target,
	download,
	children = "Go",
	className,
}: ClickableProps & { className: string | undefined }): ReactElement {
	const url = disabled ? undefined : href ? requireURL(href, undefined).href : undefined;
	return (
		<a href={url} title={title} download={download} target={target} className={className}>
			{children}
		</a>
	);
}

/** Return a `<button>` element. */
function ButtonClickable({
	disabled = false,
	onClick,
	title,
	children = "Click",
	className,
}: ClickableProps & { className: string | undefined }): ReactElement {
	// Create a `BusyStore<undefined>` to keep track of the `onClick` call and any thrown errors.
	const store = useInstance(BusyStore, undefined);

	// Track the `busy/unbusy` state of the button to show a loading spinner appropriately.
	const busy = useStore(store.busy).value;

	return (
		<button //
			type="button"
			title={title}
			onClick={e => {
				if (!store.busy.value && onClick) {
					const el = e.currentTarget;
					store.run(callNotifiedElement, el, onClick, e);
				}
			}}
			disabled={busy || disabled}
			className={className}
		>
			{busy ? LOADING : children}
		</button>
	);
}
