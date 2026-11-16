import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { NavigationStore } from "shelving/ui";

// A small fake of the browser Navigation API and `window.history`, enough for `NavigationStore`.

type Listener = (e: Record<string, unknown>) => void;

class FakeEntry {
	readonly url: string;
	readonly key: string;
	readonly index: number;
	state: unknown;
	constructor(url: string, key: string, index: number, state: unknown) {
		this.url = url;
		this.key = key;
		this.index = index;
		this.state = state;
	}
	getState(): unknown {
		return this.state;
	}
}

class FakeNavigation {
	list: FakeEntry[] = [];
	index = 0;
	count = 0;
	readonly listeners = new Map<string, Set<Listener>>();
	constructor(url: string) {
		this.list = [new FakeEntry(url, "k0", 0, undefined)];
	}
	entries(): FakeEntry[] {
		return this.list;
	}
	get currentEntry(): FakeEntry {
		return this.list[this.index] as FakeEntry;
	}
	updateCurrentEntry({ state }: { state: unknown }): void {
		this.currentEntry.state = state;
	}
	addEventListener(type: string, listener: Listener): void {
		this.listeners.set(type, (this.listeners.get(type) ?? new Set()).add(listener));
	}
	removeEventListener(type: string, listener: Listener): void {
		this.listeners.get(type)?.delete(listener);
	}
	fire(type: string, e: Record<string, unknown>): void {
		for (const l of this.listeners.get(type) ?? []) l(e);
	}
	push(url: string): void {
		const from = this.currentEntry;
		this.fire("navigate", { info: undefined, hasUAVisualTransition: false });
		this.index++;
		this.list = [...this.list.slice(0, this.index), new FakeEntry(new URL(url, from.url).href, `k${++this.count}`, this.index, undefined)];
		this.fire("currententrychange", { navigationType: "push", from });
	}
	replace(url: string): void {
		const from = this.currentEntry;
		this.list[this.index] = new FakeEntry(new URL(url, from.url).href, from.key, this.index, undefined);
		this.fire("currententrychange", { navigationType: "replace", from });
	}
	traverseTo(key: string, { info }: { info?: unknown } = {}): { finished: Promise<void> } {
		const from = this.currentEntry;
		this.fire("navigate", { info, hasUAVisualTransition: false });
		this.index = this.list.findIndex(e => e.key === key);
		this.fire("currententrychange", { navigationType: "traverse", from });
		return { finished: Promise.resolve() };
	}
	go(delta: number): void {
		const target = this.list[this.index + delta];
		if (target) this.traverseTo(target.key);
	}
}

const ORIGIN = "https://app.test";
const STACKS = ["/home", "/discover", "/profile"] as const;
const globals = globalThis as { navigation?: unknown; window?: unknown };
let fake: FakeNavigation;

function setup(path = "/home"): NavigationStore {
	fake = new FakeNavigation(`${ORIGIN}${path}`);
	globals.navigation = fake;
	globals.window = {
		location: { href: `${ORIGIN}${path}` },
		history: {
			pushState: (_s: unknown, _t: string, url: string) => fake.push(url),
			replaceState: (_s: unknown, _t: string, url: string) => fake.replace(url),
		},
		addEventListener: () => undefined,
		removeEventListener: () => undefined,
	};
	const nav = new NavigationStore(`${ORIGIN}${path}`, `${ORIGIN}/`, ...STACKS);
	nav.listen();
	return nav;
}

function getEntries(): string[] {
	return fake.list.map(e => {
		const s = e.state as { stack: string; depth: number } | undefined;
		return `${new URL(e.url).pathname}${s ? ` ${s.stack}@${s.depth}` : ""}`;
	});
}

beforeEach(() => {
	delete globals.navigation;
	delete globals.window;
});

afterEach(() => {
	delete globals.navigation;
	delete globals.window;
});

describe("NavigationStore", () => {
	test("has no history without the Navigation API", () => {
		const nav = new NavigationStore(`${ORIGIN}/home`, `${ORIGIN}/`, ...STACKS);
		expect(nav.stack.value).toBe("/home");
		expect(nav.history("/home")).toEqual([]);
		expect(nav.position).toBe(undefined);
	});

	test("defaults to one stack at the root", () => {
		expect(new NavigationStore(`${ORIGIN}/home`, `${ORIGIN}/`).stack.value).toBe("/");
		fake = new FakeNavigation(`${ORIGIN}/a/b`);
		globals.navigation = fake;
		expect(new NavigationStore(`${ORIGIN}/a/b`, `${ORIGIN}/`).stack.value).toBe("/");
	});

	test("follows the path without the Navigation API", () => {
		globals.window = {
			location: { href: `${ORIGIN}/home` },
			history: { pushState: () => undefined, replaceState: () => undefined },
		};
		const nav = new NavigationStore(`${ORIGIN}/home`, `${ORIGIN}/`, ...STACKS);
		nav.forward("/profile/settings");
		expect(nav.stack.value).toBe("/profile");
		nav.back("/discover");
		expect(nav.stack.value).toBe("/discover");
	});

	test("saves the stack of the start page", () => {
		const nav = setup("/profile/settings");
		expect(nav.stack.value).toBe("/profile");
		expect(getEntries()).toEqual(["/profile/settings /profile@0"]);
	});

	describe("forward()", () => {
		test("pushes one level deeper in the current stack", () => {
			const nav = setup();
			nav.forward("/home/post/1");
			nav.forward("/home/post/1/comments");
			expect(nav.history("/home")).toEqual(["/home", "/home/post/1", "/home/post/1/comments"]);
			expect(nav.transition).toBe("forward");
		});

		test("pushes onto the current stack wherever the link points", () => {
			const nav = setup();
			nav.forward("/profile/settings");
			expect(nav.stack.value).toBe("/home");
			expect(nav.history("/home")).toEqual(["/home", "/profile/settings"]);
		});

		test("switches stack at the same depth and slides by tab order", () => {
			const nav = setup();
			nav.forward("/home/post/1");
			nav.forward("/profile", "/profile");
			expect(nav.transition).toBe("forward");
			nav.forward("/home/post/1", "/home");
			expect(nav.transition).toBe("back");
			expect(nav.stack.value).toBe("/home");
			expect(getEntries().at(-1)).toBe("/home/post/1 /home@1");
			expect(nav.history("/home")).toEqual(["/home", "/home/post/1"]);
			expect(nav.history("/profile")).toEqual(["/profile"]);
		});

		test("replaces when the URL is the current one", () => {
			const nav = setup();
			nav.forward("/home");
			expect(fake.list.length).toBe(1);
			expect(nav.transition).toBe(null);
		});
	});

	describe("back()", () => {
		test("goes back in the browser history when the page is the previous entry", () => {
			const nav = setup();
			nav.forward("/home/post/1");
			nav.back("/home");
			expect(fake.index).toBe(0);
			expect(fake.list.length).toBe(2);
			expect(nav.transition).toBe("back");
			expect(nav.history("/home")).toEqual(["/home"]);
		});

		test("pushes the page again when other stacks are in between", () => {
			const nav = setup();
			nav.forward("/home/post/1");
			nav.forward("/profile", "/profile");
			nav.forward("/profile/settings");
			nav.forward("/home/post/1", "/home");
			nav.back("/home");
			expect(getEntries().at(-1)).toBe("/home /home@0");
			expect(nav.history("/home")).toEqual(["/home"]);
			expect(nav.history("/profile")).toEqual(["/profile", "/profile/settings"]);
		});

		test("pushes the root at depth 0 when the page is not in the stack", () => {
			const nav = setup("/profile/settings");
			nav.back("/profile");
			expect(getEntries().at(-1)).toBe("/profile /profile@0");
			expect(nav.history("/profile")).toEqual(["/profile"]);
		});
	});

	describe("replace()", () => {
		test("keeps the stack and depth", () => {
			const nav = setup();
			nav.forward("/home/post/1");
			nav.replace("/home/post/1/info");
			expect(getEntries().at(-1)).toBe("/home/post/1/info /home@1");
			expect(nav.transition).toBe(null);
		});

		test("puts the state back after another script replaces the entry", () => {
			const nav = setup();
			nav.forward("/home/post/1");
			fake.replace(`${ORIGIN}/home/post/1?x=1`);
			expect(getEntries().at(-1)).toBe("/home/post/1 /home@1");
			expect(nav.value.href).toBe(`${ORIGIN}/home/post/1?x=1`);
		});
	});

	describe("history()", () => {
		test("allows the same page twice in one stack", () => {
			const nav = setup();
			nav.forward("/home/post/1");
			nav.forward("/home/user/ada");
			nav.forward("/home/post/1");
			expect(nav.history("/home")).toEqual(["/home", "/home/post/1", "/home/user/ada", "/home/post/1"]);
		});

		test("starts with the root when its entry is gone", () => {
			const nav = setup();
			nav.forward("/home/post/1");
			fake.list = fake.list.slice(1).map((e, i) => new FakeEntry(e.url, e.key, i, e.state));
			fake.index = 0;
			expect(nav.history("/home")).toEqual(["/home", "/home/post/1"]);
		});

		test("ignores entries with no state", () => {
			fake = new FakeNavigation(`${ORIGIN}/landing`);
			const nav = setup();
			fake.list = [
				new FakeEntry(`${ORIGIN}/landing`, "x", 0, undefined),
				...fake.list.map((e, i) => new FakeEntry(e.url, e.key, i + 1, e.state)),
			];
			fake.index = 1;
			expect(nav.history("/home")).toEqual(["/home"]);
		});

		test("returns every page in every stack with no stack", () => {
			const nav = setup();
			nav.forward("/home/post/1");
			nav.forward("/profile", "/profile");
			expect(nav.history()).toEqual(["/home", "/home/post/1", "/profile"]);
		});

		test("keeps the query", () => {
			const nav = setup();
			nav.forward("/home/search?q=birds");
			expect(nav.history("/home")).toEqual(["/home", "/home/search?q=birds"]);
		});
	});

	describe("browser back and forward", () => {
		test("slides by depth in a stack and by tab order across stacks", () => {
			const nav = setup();
			nav.forward("/home/post/1");
			nav.forward("/profile", "/profile");
			fake.go(-1);
			expect(nav.transition).toBe("back");
			expect(nav.stack.value).toBe("/home");
			fake.go(-1);
			expect(nav.transition).toBe("back");
			expect(nav.value.pathname).toBe("/home");
			fake.go(1);
			expect(nav.transition).toBe("forward");
		});

		test("slides forward when undoing a pushed back", () => {
			const nav = setup();
			nav.forward("/home/post/1");
			nav.forward("/profile", "/profile");
			nav.forward("/home/post/1", "/home");
			nav.back("/home");
			fake.go(-1);
			expect(nav.transition).toBe("forward");
		});
	});

	test("position has the depth of each stack's top page and the parent", () => {
		const nav = setup();
		nav.forward("/home/post/1");
		nav.forward("/profile", "/profile");
		nav.forward("/home/post/1", "/home");
		expect(nav.position).toEqual({ stack: "/home", depth: 1, tops: { "/home": 1, "/profile": 0 }, parent: "/home" });
	});
});
