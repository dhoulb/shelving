import { createElement, type ReactNode } from "react";

/**
 * parseMarkup — demo of the tiered / masking engine.
 *
 * Rules are grouped into priority tiers. Tiers resolve highest-first; once a
 * tier claims a region it is "masked" (blanked in a working copy of the string)
 * so lower-priority rules cannot match into it OR across it — but they can still
 * match *around* it. That single mechanism is the whole fix:
 *
 *   [`code`](/url)        => <a href="/url"><code>code</code></a>
 *   [text `code](/url`)   => [text <code>code](/url</code>)
 *
 * In the first the code span sits inside the link's title, so the link wraps it.
 * In the second the code span straddles the `]`, so masking removes the `]` and
 * the link cannot form — the code span wins.
 *
 * Rules own the recursion into their own children: they call `parseMarkup`
 * again, optionally with a different context (that is how "a link cannot nest
 * in a link" is expressed — see LINK.contexts below). The engine never reaches
 * inside a rule's content itself.
 *
 * This is a self-contained demo: it hardcodes a small inline RULES set and
 * defaults to the "inline" context. The real parseMarkup would take `options`
 * (carrying the rule stack + data passed deep into rules) and default to
 * "block". It replaces today's render.ts / renderMarkup.
 */

type DemoRule = {
	/** Must carry the `g` flag — the scanner drives it with `lastIndex`. */
	regexp: RegExp;
	/** Contexts this rule is active in. */
	contexts: string[];
	/** Higher = resolved (and masked) earlier. */
	priority: number;
	/** Turn a match into a node. May call `parseMarkup` to parse its own children. */
	render: (capture: RegExpExecArray, context: string, key: string) => ReactNode;
};

const RULES: DemoRule[] = [
	// Inline code. Highest tier -> resolved and masked before anything else, so
	// no link/bold regex can ever see the delimiters inside (or across) it.
	// Verbatim: its render does NOT recurse.
	{
		regexp: /`([^`]+)`/g,
		contexts: ["inline", "link"],
		priority: 10,
		render: (m, _context, key) => createElement("code", { key }, m[1]),
	},
	// Link. `contexts` omits "link", so a link cannot nest inside a link.
	// Recurses into its title with the "link" context.
	{
		regexp: /\[([^\]]*)\]\(([^)]*)\)/g,
		contexts: ["inline"],
		priority: 0,
		render: (m, _context, key) => createElement("a", { key, href: m[2] }, parseMarkup(m[1], "link")),
	},
	// Bold. Active inline and inside links. Recurses, keeping the current context.
	{
		regexp: /\*([^*]+)\*/g,
		contexts: ["inline", "link"],
		priority: 0,
		render: (m, context, key) => createElement("strong", { key }, parseMarkup(m[1], context)),
	},
	// Hashtag. A brand-new rule is just this — a regexp, a render, a tier.
	// A token rule: no children, no recursion.
	{
		regexp: /#(\w+)/g,
		contexts: ["inline", "link"],
		priority: 0,
		render: (m, _context, key) => createElement("span", { key, className: "tag" }, `#${m[1]}`),
	},
];

/** Parse a markup string into React nodes. */
export function parseMarkup(text: string, context = "inline"): ReactNode {
	const nodes = parseNodes(text, context);
	return nodes.length === 0 ? null : nodes.length === 1 ? nodes[0] : nodes;
}

type Claim = { rule: DemoRule; start: number; end: number };

function parseNodes(text: string, context: string): ReactNode[] {
	// Resolve tier by tier. `claimed` collects the winning regions; `masked`
	// hides each resolved region from every lower tier.
	const claimed: Claim[] = [];
	let masked = text;

	for (const tier of getTiers(context)) {
		for (const claim of scanTier(masked, tier)) {
			// A claim that wraps earlier claims absorbs them: the wrapper re-parses
			// that text itself (e.g. a link re-parsing its own title).
			for (let i = claimed.length - 1; i >= 0; i--)
				if (claimed[i].start >= claim.start && claimed[i].end <= claim.end) claimed.splice(i, 1);
			claimed.push(claim);
			masked = `${masked.slice(0, claim.start)}${"\0".repeat(claim.end - claim.start)}${masked.slice(claim.end)}`;
		}
	}

	// Walk left to right: raw text in the gaps, rendered elements for the claims.
	claimed.sort((a, b) => a.start - b.start);
	const out: ReactNode[] = [];
	let pos = 0;
	for (const claim of claimed) {
		if (claim.start > pos) out.push(text.slice(pos, claim.start));
		// Re-run the regexp on the ORIGINAL slice. The claim was found against
		// `masked`, so its capture groups would otherwise hold blanked chars.
		// Masking only ever blanks chars that fall inside a lower rule's *content*
		// group, so the match on the original slice is identical.
		const slice = text.slice(claim.start, claim.end);
		claim.rule.regexp.lastIndex = 0;
		const capture = claim.rule.regexp.exec(slice);
		out.push(capture ? claim.rule.render(capture, context, String(claim.start)) : slice);
		pos = claim.end;
	}
	if (pos < text.length) out.push(text.slice(pos));
	return out;
}

/** Rules for `context`, grouped into priority tiers, highest first. */
function getTiers(context: string): DemoRule[][] {
	const byPriority = new Map<number, DemoRule[]>();
	for (const rule of RULES)
		if (rule.contexts.includes(context)) {
			const tier = byPriority.get(rule.priority);
			if (tier) tier.push(rule);
			else byPriority.set(rule.priority, [rule]);
		}
	return [...byPriority.entries()].sort(([a], [b]) => b - a).map(([, tier]) => tier);
}

/**
 * Yield one tier's winning matches, left to right, non-overlapping.
 *
 * "Leftmost wins" needs every rule's next match up front — but instead of
 * throwing the losers away we cache one match per rule, and only recompute a
 * rule's match when the chosen match actually invalidated it. A rule whose
 * match still lies ahead is reused untouched.
 */
function* scanTier(masked: string, rules: DemoRule[]): Generator<Claim> {
	const next: (Claim | null)[] = rules.map(rule => findFrom(rule, masked, 0));

	for (;;) {
		let best: Claim | null = null;
		for (const claim of next) if (claim && (!best || claim.start < best.start)) best = claim;
		if (!best) return;

		yield best;

		// Keep every cached match still ahead of `best`; recompute only the rules
		// whose match overlapped (or was) `best`.
		for (let i = 0; i < rules.length; i++) {
			const claim = next[i];
			if (!claim || claim.start < best.end) next[i] = findFrom(rules[i], masked, best.end);
		}
	}
}

/** First match of `rule` in `masked` at or after `from`, or null. */
function findFrom(rule: DemoRule, masked: string, from: number): Claim | null {
	rule.regexp.lastIndex = from;
	const capture = rule.regexp.exec(masked);
	return capture ? { rule, start: capture.index, end: capture.index + capture[0].length } : null;
}
