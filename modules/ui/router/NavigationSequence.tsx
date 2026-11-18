import { DeferredSequence } from "../../sequence/DeferredSequence.js";
import { createDeferred } from "../../util/async.js";
import { BLACKHOLE } from "../../util/function.js";
import type { AbsolutePath } from "../../util/path.js";
import { getURL, type ImmutableURL, matchURLPrefix, type PossibleURL, requireURL } from "../../util/url.js";

/**
 * State that `NavigationSequence` saves on each browser history entry.
 *
 * @see https://shelving.cc/ui/NavigationEntryState
 */
export interface NavigationEntryState {
	/** Root path of the stack this page is in, or `null` for a floating page. */
	readonly stack: AbsolutePath | null;
	/** Position of this page in its stack, where `0` is the root. */
	readonly ordinal: number;
}

/**
 * Direction of a move in a `NavigationEvent`: `"forward"` or `"back"`.
 *
 * @see https://shelving.cc/ui/NavigationDirection
 */
export type NavigationDirection = "forward" | "back";

/**
 * One change of page, published by `NavigationSequence`.
 * - A move (a link, a back button, the browser back and forward buttons) has a `direction`, so `<Navigation>` shows it inside a view transition of that type.
 * - A replace has no `direction`, so it shows at once with no transition.
 *
 * @see https://shelving.cc/ui/NavigationEvent
 */
export interface NavigationEvent {
	/** URL of the page. */
	readonly url: ImmutableURL;
	/** Root path of the stack the page is in, or `null` for a floating page. */
	readonly stack: AbsolutePath | null;
	/** Position of the page in its stack, where `0` is the root, or `undefined` without the Navigation API. */
	readonly ordinal: number | undefined;
	/** Direction of the move, or `undefined` for a replace or a change with no slide. */
	readonly direction?: NavigationDirection | undefined;
}

/** One page in a stack: the entry that holds it, plus its saved state. */
interface _Page extends NavigationEntryState {
	readonly url: ImmutableURL;
	readonly path: AbsolutePath;
	readonly index: number;
	readonly key: string;
}

/** The parts of `Navigation` the store uses (so tests can pass a fake). */
type _Navigation = Pick<
	Navigation,
	"entries" | "currentEntry" | "traverseTo" | "updateCurrentEntry" | "addEventListener" | "removeEventListener"
>;

/**
 * Sequence of navigation events that drives browser history and keeps a stack of pages for each tab.
 *
 * - It is not a store: it holds no "current page" for the UI. Each change of page (a move, a replace, or the browser back and forward buttons) publishes one `NavigationEvent`, and `<Navigation>` keeps the page it shows in its own state.
 * - `url`, `stack` and `ordinal` say where the browser history is now. The page on screen can differ for a moment, for example during a swipe-back preview. To read the page on screen, read `Meta`.
 * - `publish()` sends an event by hand, for example to show the page below during a swipe-back.
 * - With the browser Navigation API, each history entry saves a `NavigationEntryState`, and each stack is read from `navigation.entries()` when it is needed. Nothing else is kept.
 * - A page outside the listed stacks is floating: its stack is `null`. The floating stack has no root page and no tab.
 * - In a listed stack, ordinal `0` is always the stack's root path.
 * - Without the Navigation API (older browsers and server renders) there are no stacks: `stack` stays the starting stack, `history()` is empty, and `stack` arguments are ignored.
 * - Owned by `<Navigation>`. Read it with `requireNavigation()`.
 *
 * @see https://shelving.cc/ui/NavigationSequence
 */
export class NavigationSequence extends DeferredSequence<NavigationEvent> {
	/** Root path of each stack, in tab order. With none, every page floats. */
	readonly stacks: readonly AbsolutePath[];

	/**
	 * Base URL of the app, used to resolve relative URLs and to work out paths.
	 *
	 * @see https://shelving.cc/ui/NavigationSequence/base
	 */
	readonly base: ImmutableURL | undefined;

	/** URL the browser history is on now. */
	private _url: ImmutableURL;
	/** Stack the browser history is on now. Without the Navigation API, it stays at the starting stack. */
	private _stack: AbsolutePath | null;
	/** Callbacks waiting for `<Navigation>` to commit the next event. */
	private _waiting: (() => void)[] = [];

	/** The browser Navigation API, or `undefined` when it is not available. */
	private readonly _navigation: _Navigation | undefined;
	/** Transition sent with the next navigation, and whether the browser animates it. */
	private _info: NavigationDirection | null | undefined = undefined;
	/** `true` while the store changes history itself, so it ignores the events that causes. */
	private _busy = false;

	/** Stack of the page the app opens at, when its history entry has no saved stack. */
	private readonly _start: AbsolutePath | null;

	constructor(
		url: PossibleURL = typeof window === "undefined" ? "/" : window.location.href,
		base?: PossibleURL,
		stack: AbsolutePath | null = null,
		...stacks: AbsolutePath[]
	) {
		super();
		this.base = getURL(base);
		this._url = requireURL(url, this.base, NavigationSequence);
		this.stacks = stacks;
		this._start = stack !== null && stacks.includes(stack) ? stack : null;
		this._navigation = _getNavigation();
		this._stack = this._navigation ? this._getState(this._navigation.currentEntry).stack : this._start;
	}

	/**
	 * URL the browser history is on now.
	 *
	 * @see https://shelving.cc/ui/NavigationSequence/url
	 */
	get url(): ImmutableURL {
		return this._url;
	}

	/**
	 * Root path of the stack the browser history is on now, or `null` for a floating page.
	 *
	 * @see https://shelving.cc/ui/NavigationSequence/stack
	 */
	get stack(): AbsolutePath | null {
		return this._stack;
	}

	/**
	 * Where the browser history is now, as an event with no direction.
	 * - `<Navigation>` reads it for its first render, and again when it starts listening, to catch up on changes it missed.
	 *
	 * @see https://shelving.cc/ui/NavigationSequence/current
	 */
	current(): NavigationEvent {
		const navigation = this._navigation;
		return { url: this._url, stack: this._stack, ordinal: navigation ? this._getState(navigation.currentEntry).ordinal : undefined };
	}

	/**
	 * Publish an event by hand, without changing history.
	 * - For example, a swipe-back publishes the page below with `direction: "back"`, so React runs its back transition, and the swipe scrubs it.
	 * - Then the real `back()` publishes the same page again, which `<Navigation>` skips, or the swipe publishes the current page again to cancel.
	 *
	 * @param event The event to publish.
	 * @returns A promise that resolves when `<Navigation>` has committed the event.
	 * @see https://shelving.cc/ui/NavigationSequence/publish
	 */
	publish(event: NavigationEvent): Promise<void> {
		const { promise, resolve } = createDeferred<void>();
		this._waiting.push(resolve);
		this.resolve(event);
		return promise;
	}

	/**
	 * Tell waiting `publish()` calls that `<Navigation>` has committed a page.
	 * - `<Navigation>` calls it after each commit.
	 *
	 * @see https://shelving.cc/ui/NavigationSequence/committed
	 */
	committed(): void {
		for (const resolve of this._waiting.splice(0)) resolve();
	}

	/**
	 * Path of the current URL relative to the app root (without its `?query`), or `undefined` if the URL is outside the app.
	 *
	 * @see https://shelving.cc/ui/NavigationSequence/path
	 */
	get path(): AbsolutePath | undefined {
		return this._getPath(this._url);
	}

	/**
	 * Start listening to the browser (back, forward and swipe).
	 * - Saves the current stack and ordinal on the current history entry, if it has none.
	 * - `<Navigation>` calls it once, when it mounts.
	 *
	 * @returns A function that stops listening.
	 * @see https://shelving.cc/ui/NavigationSequence/listen
	 */
	listen(): () => void {
		const navigation = this._navigation;
		if (!navigation) {
			if (typeof window === "undefined") return BLACKHOLE;
			const onPopState = () => this._change(window.location.href, null);
			window.addEventListener("popstate", onPopState);
			return () => window.removeEventListener("popstate", onPopState);
		}

		// Save the state of the entry the app opened at.
		const { currentEntry } = navigation;
		if (currentEntry && !_isEntryState(currentEntry.getState())) this._update(this._getState(currentEntry));

		const onNavigate = (e: NavigateEvent) => {
			const info = e.info;
			this._info = e.hasUAVisualTransition ? null : info === "forward" || info === "back" ? info : undefined;
		};
		const onChange = (e: NavigationCurrentEntryChangeEvent) => {
			if (this._busy) return;
			const entry = navigation.currentEntry;
			if (!entry?.url) return;
			// Another script replaced the entry with no state (for example `history.replaceState()`), so put the old state back.
			if (e.navigationType === "replace" && !_isEntryState(entry.getState())) {
				const from = e.from.getState();
				if (_isEntryState(from)) this._update(from);
			}
			const info = this._info;
			this._info = undefined;
			this._change(entry.url, info === undefined ? this._getDirection(e) : info, this._getState(entry).stack);
		};
		navigation.addEventListener("navigate", onNavigate);
		navigation.addEventListener("currententrychange", onChange);
		return () => {
			navigation.removeEventListener("navigate", onNavigate);
			navigation.removeEventListener("currententrychange", onChange);
		};
	}

	/**
	 * Get the pages in a stack, root first, or every page in every stack.
	 * - Read from the browser history entries up to the current one.
	 * - A listed stack whose root entry is not in the history (a deep link, or the browser keeps a limited history) still starts with its root.
	 * - The floating stack (`null`) has no root, so it starts with its oldest page.
	 * - Without the Navigation API this is always empty.
	 *
	 * @param stack Root path of the stack, or `null` for the floating stack. Defaults to the current stack.
	 * @returns Paths relative to the app root, each with its `?query`.
	 * @example nav.history("/home") // ["/home", "/home/post/2"]
	 * @see https://shelving.cc/ui/NavigationSequence/history
	 */
	history(stack: AbsolutePath | null = this._stack): AbsolutePath[] {
		const pages = this._getPages(stack);
		const paths = pages.map(p => _getPathWithQuery(p));
		if (stack !== null && pages[0] && pages[0].ordinal > 0) paths.unshift(stack);
		return paths;
	}

	/**
	 * Go forward to a URL, as a link does.
	 * - The URL is the top page of `stack`: switch to that stack, at the same ordinal. This is a tab switch.
	 * - Else push the URL onto `stack`, one level deeper than its top page.
	 * - The URL you are already on: replace it instead.
	 * - A change of stack slides by tab order. Else it slides forward.
	 *
	 * @param possible The destination URL, resolved against `base`.
	 * @param stack Root path of the stack to go to, or `null` for the floating stack. Defaults to the current stack.
	 * @throws RequiredError If `possible` cannot be resolved to a valid URL.
	 * @example nav.forward("/settings");
	 * @see https://shelving.cc/ui/NavigationSequence/forward
	 */
	forward(possible: PossibleURL, stack: AbsolutePath | null = this._stack): void {
		const url = requireURL(possible, this.base, this.forward);
		if (!this._navigation) {
			this._push(url, "forward");
			return;
		}
		const current = this._stack;
		if (stack === current && url.href === this._url.href) {
			this.replace(url);
			return;
		}
		const top = this._getPages(stack).at(-1);
		const ordinal = top ? (top.url.href === url.href ? top.ordinal : top.ordinal + 1) : this._getBottomOrdinal(url, stack);
		this._push(url, this._getOrder(current, stack) ?? "forward", { stack, ordinal });
	}

	/**
	 * Go back to a URL, as a back button does.
	 * - The URL is an earlier page in `stack`: go back to it. When it is the entry just before the current one, this goes back in the browser history. Else it pushes the URL again at that page's ordinal.
	 * - The URL is the root of `stack`: push it at ordinal 0.
	 * - Else push the URL in place of the top page of `stack`.
	 * - It works when the app was opened at the current page, so a back button always has somewhere to go.
	 *
	 * @param possible The destination URL, resolved against `base`.
	 * @param stack Root path of the stack to go back in, or `null` for the floating stack. Defaults to the current stack.
	 * @throws RequiredError If `possible` cannot be resolved to a valid URL.
	 * @example nav.back("/profile");
	 * @see https://shelving.cc/ui/NavigationSequence/back
	 */
	back(possible: PossibleURL, stack: AbsolutePath | null = this._stack): void {
		const url = requireURL(possible, this.base, this.back);
		const navigation = this._navigation;
		if (!navigation) {
			this._push(url, "back");
			return;
		}
		const current = this._stack;
		const pages = this._getPages(stack);
		const page = pages.slice(0, -1).findLast(p => p.url.href === url.href);
		if (page && stack === current && page.index === (navigation.currentEntry?.index ?? 0) - 1) {
			navigation.traverseTo(page.key, { info: this._getOrder(current, stack) ?? "back" }).finished?.catch(BLACKHOLE);
			return;
		}
		// The URL is an earlier page in the stack, else the root of the stack, else it takes the place of the top page.
		const ordinal = page ? page.ordinal : this._getPath(url) === stack ? 0 : (pages.at(-1)?.ordinal ?? this._getBottomOrdinal(url, stack));
		this._push(url, this._getOrder(current, stack) ?? "back", { stack, ordinal });
	}

	/**
	 * Replace the current URL, with no transition.
	 * - The page stays in the same stack, at the same ordinal, so a cached page stays mounted.
	 * - Use it for a page that knows its canonical URL, or for in-page tabs.
	 * - Pass a `stack` to move the page into that stack: at its root if the URL is the root, else on top of its pages. For example, a login page calls `replace("/home", "/home")`.
	 *
	 * @param possible The destination URL, resolved against `base`.
	 * @param stack Root path of the stack to move the page into, or `null` for the floating stack. Defaults to the current stack.
	 * @throws RequiredError If `possible` cannot be resolved to a valid URL.
	 * @example nav.replace("/login");
	 * @see https://shelving.cc/ui/NavigationSequence/replace
	 */
	replace(possible: PossibleURL, stack: AbsolutePath | null = this._stack): void {
		const url = requireURL(possible, this.base, this.replace);
		const saved = this._navigation?.currentEntry?.getState();
		let state = _isEntryState(saved) ? saved : undefined;
		if (state && stack !== state.stack) {
			const top = this._getPages(stack)
				.filter(p => p.index !== this._navigation?.currentEntry?.index)
				.at(-1);
			state = { stack, ordinal: this._getPath(url) === stack ? 0 : top ? top.ordinal + 1 : this._getBottomOrdinal(url, stack) };
		}
		this._write(() => window.history.replaceState(null, "", url.href), state);
		this._change(url, null, state?.stack);
	}

	/** Push a URL as a new history entry, with an optional state. */
	private _push(url: ImmutableURL, transition: NavigationDirection, state?: NavigationEntryState): void {
		this._write(() => window.history.pushState(null, "", url.href), state);
		this._change(url, this._navigation ? transition : null, state?.stack);
	}

	/** Change history and then save a state on the new entry, ignoring the events that causes. */
	private _write(write: () => void, state: NavigationEntryState | undefined): void {
		this._busy = true;
		try {
			write();
			if (state) this._update(state);
		} finally {
			this._busy = false;
		}
	}

	/** Save a state on the current entry. */
	private _update(state: NavigationEntryState): void {
		const busy = this._busy;
		this._busy = true;
		try {
			this._navigation?.updateCurrentEntry({ state });
		} finally {
			this._busy = busy;
		}
	}

	/** Record where history is now, and publish it as an event. */
	private _change(url: PossibleURL, direction: NavigationDirection | null, stack?: AbsolutePath | null): void {
		this._url = requireURL(url, this.base, this._change);
		if (stack !== undefined) this._stack = stack;
		this.resolve({ ...this.current(), direction: direction ?? undefined });
	}

	/** Get the pages in a stack, root first: the newest entry in the stack, then the newest earlier entry at a lower ordinal, down to ordinal 0. */
	private _getPages(stack: AbsolutePath | null): _Page[] {
		const navigation = this._navigation;
		if (!navigation) return [];
		const entries = navigation.entries();
		const pages: _Page[] = [];
		let ordinal = Number.POSITIVE_INFINITY;
		const current = navigation.currentEntry?.index ?? -1;
		for (let i = current; i >= 0 && ordinal > 0; i--) {
			const entry = entries[i];
			// The current entry may not have its state saved yet (before `listen()`), so use its default.
			const state = i === current && entry ? this._getState(entry) : entry?.getState();
			if (!entry?.url || !_isEntryState(state) || state.stack !== stack || state.ordinal >= ordinal) continue;
			const url = requireURL(entry.url, undefined, this._getPages);
			const path = this._getPath(url);
			if (!path) continue;
			ordinal = state.ordinal;
			pages.unshift({ ...state, url, path, index: entry.index, key: entry.key });
		}
		return pages;
	}

	/** Get the saved state of an entry, or for an entry with none (for example the page the app opened at), the starting stack at its bottom ordinal. */
	private _getState(entry: NavigationHistoryEntry | null): NavigationEntryState {
		const state = entry?.getState();
		if (_isEntryState(state) && this._getStacks().includes(state.stack)) return state;
		const url = entry?.url ? requireURL(entry.url, undefined, this._getState) : undefined;
		return { stack: this._start, ordinal: url ? this._getBottomOrdinal(url, this._start) : 0 };
	}

	/** Get the ordinal of a URL that is the first page of a stack: `0` for the stack's root path or for the floating stack, else `1` so the root stays below it. */
	private _getBottomOrdinal(url: ImmutableURL, stack: AbsolutePath | null): number {
		return stack === null || this._getPath(url) === stack ? 0 : 1;
	}

	/** Get every stack a page can be in: the listed stacks, plus the floating stack (`null`). */
	private _getStacks(): (AbsolutePath | null)[] {
		return [...this.stacks, null];
	}

	/** Get the path of a URL relative to the app root, or `undefined` if it is outside the app. */
	private _getPath(url: ImmutableURL): AbsolutePath | undefined {
		return matchURLPrefix(url, this.base ?? new URL("/", url));
	}

	/** Direction of a change the store did not make: tab order across stacks, else ordinal, else position. */
	private _getDirection(e: NavigationCurrentEntryChangeEvent): NavigationDirection | null {
		if (e.navigationType !== "traverse") return null;
		const from = this._getState(e.from);
		const to = this._getState(this._navigation?.currentEntry ?? null);
		const order = this._getOrder(from.stack, to.stack);
		if (order) return order;
		if (to.ordinal !== from.ordinal) return to.ordinal < from.ordinal ? "back" : "forward";
		return (this._navigation?.currentEntry?.index ?? 0) < e.from.index ? "back" : "forward";
	}

	/** Slide direction between two stacks by tab order, or `undefined` for the same stack. */
	private _getOrder(from: AbsolutePath | null, to: AbsolutePath | null): NavigationDirection | undefined {
		if (from === to || from === null || to === null) return;
		const a = this.stacks.indexOf(from);
		const b = this.stacks.indexOf(to);
		if (a < 0 || b < 0) return;
		return b > a ? "forward" : "back";
	}
}

/** Get the browser Navigation API, or `undefined` if it is missing or unusable (for example in a sandboxed frame). */
function _getNavigation(): _Navigation | undefined {
	if (typeof navigation === "undefined" || typeof window === "undefined") return;
	if (!navigation.currentEntry) return;
	return navigation;
}

/** Get a page's path with its `?query`. */
function _getPathWithQuery({ path, url }: _Page): AbsolutePath {
	return `${path}${url.search}` as AbsolutePath;
}

/** Is a value a `NavigationEntryState`? */
function _isEntryState(state: unknown): state is NavigationEntryState {
	return (
		typeof state === "object" &&
		state !== null &&
		"stack" in state &&
		(typeof state.stack === "string" || state.stack === null) &&
		"ordinal" in state &&
		typeof state.ordinal === "number"
	);
}
