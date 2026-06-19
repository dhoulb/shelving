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
import type { OptionalChildProps } from "../util/props.js";

/**
 * Handler for a clickable `onClick` event.
 * - Returned value (if defined) is notified to the user using [`notifySuccess()`](/ui/notifySuccess)
 * - Thrown value is notified to the user using [`notifyError()`](/ui/notifyError)
 *
 * @param event The `MouseEvent` from the underlying `<button>`.
 * @returns A `ReactNode` (shown as a success notice), nothing, or a promise of either.
 * @see https://dhoulb.github.io/shelving/ui/form/Clickable/ClickableCallback
 */
export type ClickableCallback = (event: MouseEvent<HTMLButtonElement>) => ReactNode | void | PromiseLike<ReactNode | void>;

/**
 * Props for a thing that can be clicked — either has a string `href` link or an `onClick` callback handler.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/Clickable/ClickableProps
 */
export interface ClickableProps extends OptionalChildProps {
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
}

/**
 * Props for a clickable that also accepts a `className` for styling.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/Clickable/StylableClickableProps
 */
export interface StylableClickableProps extends ClickableProps {
	className?: string | undefined;
}

/**
 * Render either a `<button>`, an `<a href="">`, or a plain `<span>` based on whether an `onClick` or `href` prop is provided.
 * - `href` renders a `LinkClickable`; `onClick` renders a `ButtonClickable`; neither renders a `SpanClickable`.
 *
 * @kind component
 * @example <Clickable href="/about">About</Clickable>
 * @example <Clickable onClick={save}>Save</Clickable>
 * @see https://dhoulb.github.io/shelving/ui/form/Clickable/Clickable
 */
export function Clickable(props: StylableClickableProps): ReactElement {
	return "href" in props ? (
		<LinkClickable {...props} />
	) : "onClick" in props ? (
		<ButtonClickable {...props} />
	) : (
		<SpanClickable {...props} />
	);
}

/**
 * Render an `<a href="">` element, resolving its `href` against the current page URL and marking it active when it matches.
 * - The `href` is resolved against the current page URL and site root so site-absolute paths (`/foo`) honour the base subfolder.
 * - Sets `aria-current="page"` when the link points at the current URL.
 *
 * @example <LinkClickable href="/about" className="link">About</LinkClickable>
 * @see https://dhoulb.github.io/shelving/ui/form/Clickable/LinkClickable
 */
export function LinkClickable({
	href,
	disabled = !href,
	target,
	download,
	title,
	children = "Go",
	className,
}: StylableClickableProps): ReactElement {
	// Resolve `href` against the current page URL and site root so site-absolute paths (`/foo`) honour the base subfolder.
	const { url, root } = requireMeta();
	const link = disabled ? undefined : getLink(href, url, root);

	// Is this link "active" compared to the current URL?
	const active = isURLActive(link, url);

	return (
		<a //
			href={link?.href}
			title={title}
			download={download}
			target={target}
			className={className}
			aria-current={active ? "page" : undefined}
		>
			{children}
		</a>
	);
}

/**
 * Render a `<button>` element that runs its `onClick` handler through a `BusyStore` and shows a loading spinner while busy.
 * - Notifies the user of the handler's returned value (success) or thrown value (error).
 * - Disabled and ignores clicks while a previous click is still pending.
 *
 * @example <ButtonClickable onClick={save} className="btn">Save</ButtonClickable>
 * @see https://dhoulb.github.io/shelving/ui/form/Clickable/ButtonClickable
 */
export function ButtonClickable({
	onClick,
	disabled = !onClick,
	title,
	children = "Click",
	className,
}: StylableClickableProps): ReactElement {
	// Create a `BusyStore<undefined>` to keep track of the `onClick` call and any thrown errors.
	const store = useInstance(BusyStore, undefined);

	// Track the `busy/unbusy` state of the button to show a loading spinner appropriately.
	const busy = useStore(store.busy).value;

	return (
		<button //
			type="button"
			title={title}
			disabled={busy || disabled}
			className={className}
			onClick={
				disabled
					? undefined
					: e => {
							if (!store.busy.value && onClick) {
								const el = e.currentTarget;
								store.run(callNotifiedElement, el, onClick, e);
							}
						}
			}
		>
			{busy ? LOADING : children}
		</button>
	);
}

/**
 * Render a non-interactive `<span>` element, used as the fallback when neither `href` nor `onClick` is provided.
 *
 * @example <SpanClickable className="label">Static</SpanClickable>
 * @see https://dhoulb.github.io/shelving/ui/form/Clickable/SpanClickable
 */
export function SpanClickable({
	title,
	children = "Click", //
	className,
}: StylableClickableProps): ReactElement {
	return (
		<span //
			title={title}
			className={className}
		>
			{children}
		</span>
	);
}
