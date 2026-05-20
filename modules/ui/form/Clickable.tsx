import type { MouseEvent, ReactElement, ReactNode } from "react";
import { useInstance } from "../../react/useInstance.js";
import { useStore } from "../../react/useStore.js";
import { BusyStore } from "../../store/BusyStore.js";
import { isURLActive } from "../../util/index.js";
import { getLink } from "../../util/link.js";
import type { Path } from "../../util/path.js";
import type { ImmutableURI, URIString } from "../../util/uri.js";
import { LOADING } from "../misc/Loading.js";
import { requireMeta } from "../misc/MetaContext.js";
import { callNotifiedElement } from "../util/notice.js";

/***
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
	href?: ImmutableURI | Path | URIString | undefined;
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

export interface StylableClickableProps extends ClickableProps {
	className?: string | undefined;
}

/** Return either a `<button>` or an `<a href="">` based on whether an `onClick` or `href` prop is provided. */
export function Clickable(props: StylableClickableProps): ReactElement {
	return props.href ? <LinkClickable {...props} /> : <ButtonClickable {...props} />;
}

/** Return an `<a href="">` element. */
export function LinkClickable({
	disabled = false,
	href,
	title,
	target,
	download,
	children = "Go",
	className,
}: StylableClickableProps): ReactElement {
	// Resolve `href` against the current page URL and site root so site-absolute paths (`/foo`) honour the base subfolder.
	const { url, root } = requireMeta();
	const link = disabled ? undefined : getLink(href, url, root);
	const active = isURLActive(link, url);
	return (
		<a href={link?.href} title={title} download={download} target={target} className={className} aria-current={active ? "page" : undefined}>
			{children}
		</a>
	);
}

/** Return a `<button>` element. */
export function ButtonClickable({ disabled = false, onClick, title, children = "Click", className }: StylableClickableProps): ReactElement {
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
