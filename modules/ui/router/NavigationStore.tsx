import { Store } from "../../store/Store.js";
import { URLStore } from "../../store/URLStore.js";
import { BLACKHOLE } from "../../util/function.js";
import type { AbsolutePath } from "../../util/path.js";
import { type ImmutableURL, matchURLPrefix, type PossibleURL, requireURL } from "../../util/url.js";
import type { TransitionType } from "../transition/util.js";

/**
 * State that `NavigationStore` saves on each browser history entry.
 *
 * @see https://shelving.cc/ui/NavigationEntryState
 */
export interface NavigationEntryState {
	/** Root path of the stack this page is in. */
	readonly stack: AbsolutePath;
	/** Position of this page in its stack, where `0` is the root. */
	readonly depth: number;
}

/**
 * Where the app is now in its stacks: the current stack and depth, the top depth of each stack, and the page before the current one.
 * - `undefined` when the browser has no Navigation API, or during a server render.
 *
 * @see https://shelving.cc/ui/NavigationPosition
 */
export interface NavigationPosition extends NavigationEntryState {
	/** Depth of the top page of each stack that has pages. */
	readonly tops: { readonly [stack: AbsolutePath]: number };
	/** The page before the current one in its stack, or `undefined` at the bottom of the stack. */
	readonly parent: AbsolutePath | undefined;
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
 * Store that holds the current navigation URL, drives browser history, and keeps a stack of pages for each tab.
 *
 * - Extends `URLStore`, so its `value` is the current URL.
 * - With the browser Navigation API, each history entry saves a `NavigationEntryState`, and each stack is read from `navigation.entries()` when it is needed. Nothing else is kept.
 * - `stack` is a sub-store that holds the root of the current stack. It only changes when the stack changes.
 * - Without the Navigation API (older browsers and server renders) there are no stacks: `stack` is the stack whose root is the current path (else `"/"`), `history()` is empty, and `stack` arguments are ignored.
 * - Owned by `<Navigation>`. Read it with `requireNavigation()`.
 *
 * @see https://shelving.cc/ui/NavigationStore
 */
export class NavigationStore extends URLStore {
	/** Root path of each stack, in tab order. A single-stack app has one root. */
	readonly stacks: readonly AbsolutePath[];

	/**
	 * Root path of the current stack.
	 * - Always set. With no `stacks`, it is `"/"`.
	 * - Without the Navigation API, it is the stack whose root is the current path, else the unstacked `"/"` stack.
	 */
	readonly stack: Store<AbsolutePath>;

	/**
	 * Transition type of the most recent change, read by `<Navigation>` when the value changes.
	 * - `null` means no transition: a replace, a change the browser already animated (for example a swipe-back), or no Navigation API.
	 */
	transition: TransitionType | null = null;

	/** The browser Navigation API, or `undefined` when it is not available. */
	private readonly _navigation: _Navigation | undefined;
	/** Transition sent with the next navigation, and whether the browser animates it. */
	private _info: TransitionType | null | undefined = undefined;
	/** `true` while the store changes history itself, so it ignores the events that causes. */
	private _busy = false;

	constructor(
		url: PossibleURL = typeof window === "undefined" ? "/" : window.location.href,
		base?: PossibleURL,
		...stacks: AbsolutePath[]
	) {
		super(url, base);
		this.stacks = stacks.length ? stacks : ["/"];
		this._navigation = _getNavigation();
		this.stack = new Store<AbsolutePath>(
			this._navigation ? this._getState(this._navigation.currentEntry).stack : this._getStack(this.value),
		);
	}

	/**
	 * Where the app is now: the current stack and depth, and the top depth of each stack.
	 *
	 * @returns The position, or `undefined` without the Navigation API.
	 * @see https://shelving.cc/ui/NavigationStore/position
	 */
	get position(): NavigationPosition | undefined {
		if (!this._navigation) return undefined;
		const { stack, depth } = this._getState(this._navigation.currentEntry);
		const tops: { [stack: AbsolutePath]: number } = {};
		for (const s of this._getStacks()) {
			const top = this._getPages(s).at(-1);
			if (top) tops[s] = top.depth;
		}
		return { stack, depth, tops, parent: this.history(stack).at(-2) };
	}

	/**
	 * Start listening to the browser (back, forward and swipe).
	 * - Saves the current stack and depth on the current history entry, if it has none.
	 * - `<Navigation>` calls it once, when it mounts.
	 *
	 * @returns A function that stops listening.
	 * @see https://shelving.cc/ui/NavigationStore/listen
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
	 * - A stack whose root entry is gone (the browser keeps a limited history) still starts with its root.
	 * - Without the Navigation API this is always empty.
	 *
	 * @param stack Root path of the stack. Defaults to the current stack.
	 * @returns Paths relative to the app root, each with its `?query`.
	 * @example nav.history("/home") // ["/home", "/home/post/2"]
	 * @see https://shelving.cc/ui/NavigationStore/history
	 */
	history(stack: AbsolutePath = this.stack.value): AbsolutePath[] {
		const pages = this._getPages(stack);
		const paths = pages.map(p => _getPathWithQuery(p));
		if (pages[0] && pages[0].depth > 0) paths.unshift(stack);
		return paths;
	}

	/**
	 * Go forward to a URL, as a link does.
	 * - The URL is the top page of `stack`: switch to that stack, at the same depth. This is a tab switch.
	 * - Else push the URL onto `stack`, one level deeper than its top page.
	 * - The URL you are already on: replace it instead.
	 * - A change of stack slides by tab order. Else it slides forward.
	 *
	 * @param possible The destination URL, resolved against `base`.
	 * @param stack Root path of the stack to go to. Defaults to the current stack.
	 * @throws RequiredError If `possible` cannot be resolved to a valid URL.
	 * @example nav.forward("/settings");
	 * @see https://shelving.cc/ui/NavigationStore/forward
	 */
	forward(possible: PossibleURL, stack: AbsolutePath = this.stack.value): void {
		const url = requireURL(possible, this.base, this.forward);
		if (!this._navigation) {
			this._push(url, "forward");
			return;
		}
		const current = this.stack.value;
		if (stack === current && url.href === this.value.href) {
			this.replace(url);
			return;
		}
		const top = this._getPages(stack).at(-1);
		const depth = top ? (top.url.href === url.href ? top.depth : top.depth + 1) : 0;
		this._push(url, this._getOrder(current, stack) ?? "forward", { stack, depth });
	}

	/**
	 * Go back to a URL, as a back button does.
	 * - The URL is an earlier page in `stack`: go back to it. When it is the entry just before the current one, this goes back in the browser history. Else it pushes the URL again at that page's depth.
	 * - The URL is the root of `stack`: push it at depth 0.
	 * - Else push the URL in place of the top page of `stack`.
	 * - It works when the app was opened at the current page, so a back button always has somewhere to go.
	 *
	 * @param possible The destination URL, resolved against `base`.
	 * @param stack Root path of the stack to go back in. Defaults to the current stack.
	 * @throws RequiredError If `possible` cannot be resolved to a valid URL.
	 * @example nav.back("/profile");
	 * @see https://shelving.cc/ui/NavigationStore/back
	 */
	back(possible: PossibleURL, stack: AbsolutePath = this.stack.value): void {
		const url = requireURL(possible, this.base, this.back);
		const navigation = this._navigation;
		if (!navigation) {
			this._push(url, "back");
			return;
		}
		const current = this.stack.value;
		const pages = this._getPages(stack);
		const page = pages.slice(0, -1).findLast(p => p.url.href === url.href);
		if (page && stack === current && page.index === (navigation.currentEntry?.index ?? 0) - 1) {
			navigation.traverseTo(page.key, { info: this._getOrder(current, stack) ?? "back" }).finished?.catch(BLACKHOLE);
			return;
		}
		// The URL is an earlier page in the stack, else the root of the stack, else it takes the place of the top page.
		const depth = page ? page.depth : this._getPath(url) === stack ? 0 : (pages.at(-1)?.depth ?? 0);
		this._push(url, this._getOrder(current, stack) ?? "back", { stack, depth });
	}

	/**
	 * Replace the current URL, with no transition.
	 * - The page stays in the same stack, at the same depth, so a cached page stays mounted.
	 * - Use it for a page that knows its canonical URL, or for in-page tabs.
	 * - Pass a `stack` to move the page into that stack: at its root if the URL is the root, else on top of its pages. For example, a login page calls `replace("/home", "/home")`.
	 *
	 * @param possible The destination URL, resolved against `base`.
	 * @param stack Root path of the stack to move the page into. Defaults to the current stack.
	 * @throws RequiredError If `possible` cannot be resolved to a valid URL.
	 * @example nav.replace("/login");
	 * @see https://shelving.cc/ui/NavigationStore/replace
	 */
	replace(possible: PossibleURL, stack: AbsolutePath = this.stack.value): void {
		const url = requireURL(possible, this.base, this.replace);
		const saved = this._navigation?.currentEntry?.getState();
		let state = _isEntryState(saved) ? saved : undefined;
		if (state && stack !== state.stack) {
			const top = this._getPages(stack)
				.filter(p => p.index !== this._navigation?.currentEntry?.index)
				.at(-1);
			state = { stack, depth: this._getPath(url) === stack ? 0 : top ? top.depth + 1 : 0 };
		}
		this._write(() => window.history.replaceState(null, "", url.href), state);
		this._change(url, null, state?.stack);
	}

	/** Push a URL as a new history entry, with an optional state. */
	private _push(url: ImmutableURL, transition: TransitionType, state?: NavigationEntryState): void {
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

	/** Set the stack first, then the URL, so both are ready when `<Navigation>` reads them. */
	private _change(url: PossibleURL, transition: TransitionType | null, stack?: AbsolutePath): void {
		this.transition = transition;
		// Without the Navigation API, the stack follows the path.
		const next = stack ?? (this._navigation ? undefined : this._getStack(requireURL(url, this.base, this._change)));
		if (next) this.stack.value = next;
		this.value = url;
	}

	/** Get the pages in a stack, root first: the newest entry in the stack, then the newest earlier entry at a lower depth, down to depth 0. */
	private _getPages(stack: AbsolutePath): _Page[] {
		const navigation = this._navigation;
		if (!navigation) return [];
		const entries = navigation.entries();
		const pages: _Page[] = [];
		let depth = Number.POSITIVE_INFINITY;
		const current = navigation.currentEntry?.index ?? -1;
		for (let i = current; i >= 0 && depth > 0; i--) {
			const entry = entries[i];
			// The current entry may not have its state saved yet (before `listen()`), so use its default.
			const state = i === current && entry ? this._getState(entry) : entry?.getState();
			if (!entry?.url || !_isEntryState(state) || state.stack !== stack || state.depth >= depth) continue;
			const url = requireURL(entry.url, undefined, this._getPages);
			const path = this._getPath(url);
			if (!path) continue;
			depth = state.depth;
			pages.unshift({ ...state, url, path, index: entry.index, key: entry.key });
		}
		return pages;
	}

	/** Get the saved state of an entry, or for an entry with none (the page the app opened at), the stack whose root is its path (else the unstacked `"/"` stack) at depth 0. */
	private _getState(entry: NavigationHistoryEntry | null): NavigationEntryState {
		const state = entry?.getState();
		if (_isEntryState(state) && this._getStacks().includes(state.stack)) return state;
		return { stack: entry?.url ? this._getStack(requireURL(entry.url, undefined, this._getState)) : this._getStack(), depth: 0 };
	}

	/** Get every stack a page can be in: the listed stacks, plus the unstacked `"/"` stack. */
	private _getStacks(): AbsolutePath[] {
		return this.stacks.includes("/") ? [...this.stacks] : [...this.stacks, "/"];
	}

	/** Get the stack whose root is exactly the path of a URL, or `undefined` if none is. */
	private _getRoot(url: ImmutableURL): AbsolutePath | undefined {
		const path = this._getPath(url);
		return path && this.stacks.includes(path) ? path : undefined;
	}

	/** Get the stack of a URL with no saved stack: the stack whose root is exactly its path, else the unstacked `"/"` stack. */
	private _getStack(url?: ImmutableURL): AbsolutePath {
		return (url && this._getRoot(url)) || "/";
	}

	/** Get the path of a URL relative to the app root, or `undefined` if it is outside the app. */
	private _getPath(url: ImmutableURL): AbsolutePath | undefined {
		return matchURLPrefix(url, this.base ?? new URL("/", url));
	}

	/** Direction of a change the store did not make: tab order across stacks, else depth, else position. */
	private _getDirection(e: NavigationCurrentEntryChangeEvent): TransitionType | null {
		if (e.navigationType !== "traverse") return null;
		const from = this._getState(e.from);
		const to = this._getState(this._navigation?.currentEntry ?? null);
		const order = this._getOrder(from.stack, to.stack);
		if (order) return order;
		if (to.depth !== from.depth) return to.depth < from.depth ? "back" : "forward";
		return (this._navigation?.currentEntry?.index ?? 0) < e.from.index ? "back" : "forward";
	}

	/** Slide direction between two stacks by tab order, or `undefined` for the same stack. */
	private _getOrder(from: AbsolutePath, to: AbsolutePath): TransitionType | undefined {
		if (from === to) return;
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
		typeof state.stack === "string" &&
		"depth" in state &&
		typeof state.depth === "number"
	);
}
