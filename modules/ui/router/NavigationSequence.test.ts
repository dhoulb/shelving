import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { type NavigationEvent, NavigationSequence } from "shelving/ui";

/** Records the last event, so tests can read its direction straight away. */
class TestSequence extends NavigationSequence {
	last: NavigationEvent | undefined;
	override resolve(event: NavigationEvent): void {
		this.last = event;
		super.resolve(event);
	}
}

// A small fake of the browser Navigation API and `window.history`, enough for `NavigationSequence`.

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

/** Open the app at `path`, in `stack` (by default the stack whose root is `path`, else `/`). */
function setup(path = "/home", stack: string | null = (STACKS as readonly string[]).includes(path) ? path : null): TestSequence {
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
	const nav = new TestSequence(`${ORIGIN}${path}`, `${ORIGIN}/`, stack as `/${string}` | null, ...STACKS);
	nav.listen();
	return nav;
}

function getEntries(): string[] {
	return fake.list.map(e => {
		const s = e.state as { stack: string | null; ordinal: number } | undefined;
		return `${new URL(e.url).pathname}${s ? ` ${s.stack}@${s.ordinal}` : ""}`;
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

describe("NavigationSequence", () => {
	test("has no history without the Navigation API", () => {
		const nav = new TestSequence(`${ORIGIN}/home`, `${ORIGIN}/`, "/home", ...STACKS);
		expect(nav.stack).toBe("/home");
		expect(nav.history("/home")).toEqual([]);
		expect(nav.current().ordinal).toBe(undefined);
	});

	test("floats every page with no stacks", () => {
		expect(new TestSequence(`${ORIGIN}/home`, `${ORIGIN}/`).stack).toBe(null);
		fake = new FakeNavigation(`${ORIGIN}/a/b`);
		globals.navigation = fake;
		globals.window = { location: { href: `${ORIGIN}/a/b` } };
		const nav = new TestSequence(`${ORIGIN}/a/b`, `${ORIGIN}/`);
		expect(nav.stack).toBe(null);
		expect(nav.history()).toEqual(["/a/b"]);
	});

	test("keeps the starting stack without the Navigation API", () => {
		globals.window = {
			location: { href: `${ORIGIN}/home` },
			history: { pushState: () => undefined, replaceState: () => undefined },
		};
		const nav = new TestSequence(`${ORIGIN}/home`, `${ORIGIN}/`, "/home", ...STACKS);
		nav.forward("/profile/settings");
		nav.back("/discover");
		expect(nav.stack).toBe("/home");
	});

	test("opens in the starting stack", () => {
		const nav = setup("/profile/settings", "/profile");
		expect(nav.stack).toBe("/profile");
		expect(getEntries()).toEqual(["/profile/settings /profile@1"]);
	});

	test("opens a stack root at ordinal 0", () => {
		setup("/profile", "/profile");
		expect(getEntries()).toEqual(["/profile /profile@0"]);
	});

	test("keeps the stack root below a deep page the app opens at", () => {
		const nav = setup("/discover/fitness", "/discover");
		expect(nav.history()).toEqual(["/discover", "/discover/fitness"]);
		expect(nav.history().at(-2)).toBe("/discover");
		nav.back("/discover");
		expect(getEntries()).toEqual(["/discover/fitness /discover@1", "/discover /discover@0"]);
		expect(nav.history()).toEqual(["/discover"]);
	});

	test("keeps the root below a deep page in a single-stack app", () => {
		fake = new FakeNavigation(`${ORIGIN}/a/b`);
		globals.navigation = fake;
		globals.window = { location: { href: `${ORIGIN}/a/b` } };
		const nav = new TestSequence(`${ORIGIN}/a/b`, `${ORIGIN}/`, "/", "/");
		expect(nav.history()).toEqual(["/", "/a/b"]);
	});

	test("treats / as a normal stack when it is listed", () => {
		fake = new FakeNavigation(`${ORIGIN}/post/1`);
		globals.navigation = fake;
		globals.window = { location: { href: `${ORIGIN}/post/1` } };
		const nav = new TestSequence(`${ORIGIN}/post/1`, `${ORIGIN}/`, null, "/", "/discover");
		expect(nav.stack).toBe(null);
		expect(nav.history("/")).toEqual([]);
	});

	test("opens a stack root as floating with no starting stack", () => {
		const nav = setup("/profile", null);
		expect(nav.stack).toBe(null);
		expect(getEntries()).toEqual(["/profile null@0"]);
	});

	test("floats a starting stack that is not listed", () => {
		const nav = setup("/other/1", "/other");
		expect(nav.stack).toBe(null);
	});

	test("keeps the saved stack after a reload", () => {
		fake = new FakeNavigation(`${ORIGIN}/home/post/1`);
		(fake.list[0] as FakeEntry).state = { stack: "/home", ordinal: 1 };
		globals.navigation = fake;
		globals.window = { location: { href: `${ORIGIN}/home/post/1` } };
		const nav = new TestSequence(`${ORIGIN}/home/post/1`, `${ORIGIN}/`, "/profile", ...STACKS);
		expect(nav.stack).toBe("/home");
	});

	describe("floating pages", () => {
		test("open any other page in the floating stack", () => {
			const nav = setup("/profile/settings");
			expect(nav.stack).toBe(null);
			expect(getEntries()).toEqual(["/profile/settings null@0"]);
		});

		test("push links deeper in the floating stack", () => {
			const nav = setup("/login");
			nav.forward("/login/reset");
			expect(nav.stack).toBe(null);
			expect(nav.history()).toEqual(["/login", "/login/reset"]);
		});

		test("stay floating when a link or a replace goes to a stack root", () => {
			const nav = setup("/login");
			nav.forward("/home");
			expect(getEntries().at(-1)).toBe("/home null@1");
			nav.replace("/profile");
			expect(getEntries().at(-1)).toBe("/profile null@1");
			expect(nav.stack).toBe(null);
		});

		test("move back into the floating stack when forward names it", () => {
			const nav = setup("/home");
			nav.forward("/login", null);
			expect(nav.stack).toBe(null);
			expect(getEntries().at(-1)).toBe("/login null@0");
		});

		test("move into a stack when forward names it", () => {
			const nav = setup("/login");
			nav.forward("/home", "/home");
			expect(nav.stack).toBe("/home");
			expect(getEntries().at(-1)).toBe("/home /home@0");
		});

		test("move into a stack when a replace names it", () => {
			const nav = setup("/login");
			nav.replace("/home", "/home");
			expect(nav.stack).toBe("/home");
			expect(getEntries()).toEqual(["/home /home@0"]);
		});

		test("move onto the top of a stack when a replace names it", () => {
			const nav = setup("/home");
			nav.forward("/home/post/1");
			nav.forward("/login", null);
			nav.replace("/home/post/2", "/home");
			expect(getEntries().at(-1)).toBe("/home/post/2 /home@2");
			expect(nav.history("/home")).toEqual(["/home", "/home/post/1", "/home/post/2"]);
		});

		test("move into a stack when back names it", () => {
			const nav = setup("/home/post/1");
			nav.back("/home", "/home");
			expect(nav.stack).toBe("/home");
			expect(getEntries().at(-1)).toBe("/home /home@0");
		});

		test("have no parent", () => {
			const nav = setup("/home/post/1");
			expect(nav.history().at(-2)).toBe(undefined);
		});
	});

	describe("forward()", () => {
		test("keeps the root below the first page of an empty stack", () => {
			const nav = setup("/login");
			nav.forward("/discover/fitness", "/discover");
			expect(getEntries().at(-1)).toBe("/discover/fitness /discover@1");
			expect(nav.history("/discover")).toEqual(["/discover", "/discover/fitness"]);
		});

		test("pushes one level deeper in the current stack", () => {
			const nav = setup();
			nav.forward("/home/post/1");
			nav.forward("/home/post/1/comments");
			expect(nav.history("/home")).toEqual(["/home", "/home/post/1", "/home/post/1/comments"]);
			expect(nav.last?.direction ?? null).toBe("forward");
		});

		test("pushes onto the current stack wherever the link points", () => {
			const nav = setup();
			nav.forward("/profile/settings");
			expect(nav.stack).toBe("/home");
			expect(nav.history("/home")).toEqual(["/home", "/profile/settings"]);
		});

		test("switches stack at the same ordinal and slides by tab order", () => {
			const nav = setup();
			nav.forward("/home/post/1");
			nav.forward("/profile", "/profile");
			expect(nav.last?.direction ?? null).toBe("forward");
			nav.forward("/home/post/1", "/home");
			expect(nav.last?.direction ?? null).toBe("back");
			expect(nav.stack).toBe("/home");
			expect(getEntries().at(-1)).toBe("/home/post/1 /home@1");
			expect(nav.history("/home")).toEqual(["/home", "/home/post/1"]);
			expect(nav.history("/profile")).toEqual(["/profile"]);
		});

		test("replaces when the URL is the current one", () => {
			const nav = setup();
			nav.forward("/home");
			expect(fake.list.length).toBe(1);
			expect(nav.last?.direction ?? null).toBe(null);
		});
	});

	describe("back()", () => {
		test("goes back in the browser history when the page is the previous entry", () => {
			const nav = setup();
			nav.forward("/home/post/1");
			nav.back("/home");
			expect(fake.index).toBe(0);
			expect(fake.list.length).toBe(2);
			expect(nav.last?.direction ?? null).toBe("back");
			expect(nav.history("/home")).toEqual(["/home"]);
		});

		test("falls back to history.back() when traverseTo() throws", () => {
			const nav = setup();
			nav.forward("/home/post/1");
			const win = globals.window as { history: { back?: () => void } };
			const traverse = fake.traverseTo.bind(fake);
			win.history.back = () => void traverse(fake.list[fake.index - 1]?.key ?? "");
			fake.traverseTo = () => {
				throw new Error("Invalid state");
			};
			nav.back("/home");
			expect(fake.index).toBe(0);
			expect(nav.history("/home")).toEqual(["/home"]);
		});

		test("falls back to history.back() when traverseTo() rejects", async () => {
			const nav = setup();
			nav.forward("/home/post/1");
			let backs = 0;
			const win = globals.window as { history: { back?: () => void } };
			win.history.back = () => void backs++;
			const fail = Object.assign(new Error("Invalid state"), { name: "SecurityError" });
			fake.traverseTo = () => ({ committed: Promise.reject(fail), finished: Promise.reject(fail) }) as never;
			nav.back("/home");
			await Promise.resolve();
			await Promise.resolve();
			expect(backs).toBe(1);
		});

		test("does not fall back when a newer navigation stops the traverse", async () => {
			const nav = setup();
			nav.forward("/home/post/1");
			let backs = 0;
			const win = globals.window as { history: { back?: () => void } };
			win.history.back = () => void backs++;
			const abort = Object.assign(new Error("Stopped"), { name: "AbortError" });
			fake.traverseTo = () => ({ committed: Promise.reject(abort), finished: Promise.reject(abort) }) as never;
			nav.back("/home");
			await Promise.resolve();
			await Promise.resolve();
			expect(backs).toBe(0);
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

		test("goes back to the root of another stack when it is named", () => {
			const nav = setup("/profile");
			nav.forward("/profile/settings");
			nav.forward("/discover", "/discover");
			nav.back("/profile", "/profile");
			expect(getEntries().at(-1)).toBe("/profile /profile@0");
			expect(nav.history("/profile")).toEqual(["/profile"]);
		});
	});

	describe("replace()", () => {
		test("keeps the stack and ordinal", () => {
			const nav = setup();
			nav.forward("/home/post/1");
			nav.replace("/home/post/1/info");
			expect(getEntries().at(-1)).toBe("/home/post/1/info /home@1");
			expect(nav.last?.direction ?? null).toBe(null);
		});

		test("puts the state back after another script replaces the entry", () => {
			const nav = setup();
			nav.forward("/home/post/1");
			fake.replace(`${ORIGIN}/home/post/1?x=1`);
			expect(getEntries().at(-1)).toBe("/home/post/1 /home@1");
			expect(nav.url.href).toBe(`${ORIGIN}/home/post/1?x=1`);
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

		test("returns the current stack with no stack", () => {
			const nav = setup();
			nav.forward("/home/post/1");
			nav.forward("/profile", "/profile");
			expect(nav.history()).toEqual(["/profile"]);
		});

		test("keeps the query", () => {
			const nav = setup();
			nav.forward("/home/search?q=birds");
			expect(nav.history("/home")).toEqual(["/home", "/home/search?q=birds"]);
		});
	});

	describe("browser back and forward", () => {
		test("slides by ordinal in a stack and by tab order across stacks", () => {
			const nav = setup();
			nav.forward("/home/post/1");
			nav.forward("/profile", "/profile");
			fake.go(-1);
			expect(nav.last?.direction ?? null).toBe("back");
			expect(nav.stack).toBe("/home");
			fake.go(-1);
			expect(nav.last?.direction ?? null).toBe("back");
			expect(nav.url.pathname).toBe("/home");
			fake.go(1);
			expect(nav.last?.direction ?? null).toBe("forward");
		});

		test("slides forward when undoing a pushed back", () => {
			const nav = setup();
			nav.forward("/home/post/1");
			nav.forward("/profile", "/profile");
			nav.forward("/home/post/1", "/home");
			nav.back("/home");
			fake.go(-1);
			expect(nav.last?.direction ?? null).toBe("forward");
		});
	});

	test("path is the current path relative to the root", () => {
		const nav = setup("/home");
		nav.forward("/home/post/1?x=1");
		expect(nav.path).toBe("/home/post/1");
	});

	test("current() has the stack and ordinal of the history entry", () => {
		const nav = setup();
		nav.forward("/home/post/1");
		nav.forward("/profile", "/profile");
		nav.forward("/home/post/1", "/home");
		expect(nav.current()).toEqual({ url: nav.url, stack: "/home", ordinal: 1 });
		expect(nav.history().at(-2)).toBe("/home");
	});

	test("each change publishes one event", async () => {
		const nav = setup();
		const next = nav.next();
		nav.forward("/home/post/1");
		const { value } = await next;
		expect(value).toEqual({ url: nav.url, stack: "/home", ordinal: 1, direction: "forward" });
	});

	test("publish() resolves when committed() is called", async () => {
		const nav = setup();
		let done = false;
		const promise = nav.publish({ ...nav.current(), direction: "back" }).then(() => {
			done = true;
		});
		await Promise.resolve();
		expect(done).toBe(false);
		nav.committed();
		await promise;
		expect(done).toBe(true);
	});
});
