import type { ReactElement, ReactNode } from "react";
import type { ImmutableArray, MutableArray } from "../util/array.js";
import { getLink, type PossibleLink } from "../util/link.js";
import type { Nullish } from "../util/null.js";
import type { NamedRegExpData } from "../util/regexp.js";
import { HTTP_SCHEMES, type ImmutableURI, type URISchemes } from "../util/uri.js";
import type { ImmutableURL } from "../util/url.js";
import type { MarkupRule, MarkupRules } from "./MarkupRule.js";
import type { Parser } from "./Parser.js";
import { MARKUP_RULES } from "./rule/index.js";

/**
 * Options configuring a `MarkupParser` (represents the current state of the parsing).
 * - Every field is optional — an empty object yields a parser with the default rules and behaviour.
 * - Link resolution honours `url`, `root`, and `schemes`; link safety hinges on `schemes`.
 *
 * @see https://dhoulb.github.io/shelving/markup/MarkupParser/MarkupOptions
 */
export type MarkupOptions = {
	/**
	 * The active list of parsing rules.
	 * @default MARKUP_RULES
	 */
	readonly rules?: MarkupRules | undefined;

	/**
	 * Set the `rel=""` property used for any links (e.g. `rel="nofollow ugc"`).
	 * @example "nofollow ugc" // Stop user-generated content ruining our SEO juice.
	 */
	readonly rel?: string | undefined;

	/**
	 * Current page URL — used as the base for resolving relative refs (`./foo`, `#x`, bare segments) in link hrefs.
	 */
	readonly url?: ImmutableURL | undefined;

	/**
	 * Site root URL — used as the base for resolving site-absolute path hrefs (`/foo`), honoring its subfolder.
	 */
	readonly root?: ImmutableURL | undefined;

	/**
	 * Valid URI schemes/protocols for URLs and URIs.
	 * @example ["http:", "https:"]
	 * @default ["http:", "https:"]
	 */
	readonly schemes?: URISchemes | undefined;

	/**
	 * Default context to use if one isn't set. Defaults to `"block"`
	 */
	readonly context?: string;
};

/**
 * Parses a Markdownish markup string and renders it as a React node using a tiered, masking rule engine.
 * - The syntax isn't hardcoded — it's defined entirely by the `rules` supplied (defaults to `MARKUP_RULES`).
 * - Rules are grouped into priority tiers and resolved highest tier first; a claimed region is masked so lower-priority rules can't match into or across it.
 * - Rules own the recursion into their own children by calling `parse()` again, optionally with a different context.
 *
 * @example
 * const node = new MarkupParser().parse("This is a *bold* string.");
 * @see https://dhoulb.github.io/shelving/markup/MarkupParser/MarkupParser
 */
export class MarkupParser implements Parser<string, ReactNode> {
	/**
	 * The list of parsing rules this parser applies.
	 * @see https://dhoulb.github.io/shelving/markup/MarkupParser/MarkupParser/rules
	 */
	readonly rules: MarkupRules;

	/**
	 * Calculated list of priorities to iterate over (extracted from the rules), e.g. [10, 0, -10]
	 * @see https://dhoulb.github.io/shelving/markup/MarkupParser/MarkupParser/priorities
	 */
	readonly priorities: ImmutableArray<number>;

	/**
	 * Set the `rel=""` property used for any links (e.g. `rel="nofollow ugc"`).
	 * @example "nofollow ugc"
	 * @see https://dhoulb.github.io/shelving/markup/MarkupParser/MarkupParser/rel
	 */
	readonly rel: string | undefined;

	/**
	 * Current page URL — used as the base for resolving relative refs (`./foo`, `#x`, bare segments) in link hrefs. Falls back to `root` if not set.
	 * @see https://dhoulb.github.io/shelving/markup/MarkupParser/MarkupParser/url
	 */
	readonly url: ImmutableURL | undefined;

	/**
	 * Site root URL — used as the base for resolving site-absolute path hrefs (`/foo`), honoring its subfolder. Falls back to `url` if not set.
	 * @see https://dhoulb.github.io/shelving/markup/MarkupParser/MarkupParser/root
	 */
	readonly root: ImmutableURL | undefined;

	/**
	 * Valid URI schemes/protocols for URLs and URIs.
	 * @example ["http:", "https:"]
	 * @default ["http:", "https:"]
	 * @see https://dhoulb.github.io/shelving/markup/MarkupParser/MarkupParser/schemes
	 */
	readonly schemes: URISchemes;

	/**
	 * Default context to use if one isn't set. Defaults to `"block"`
	 * @see https://dhoulb.github.io/shelving/markup/MarkupParser/MarkupParser/context
	 */
	readonly context: string;

	/**
	 * Create a new `MarkupParser` from a set of options.
	 *
	 * @example new MarkupParser({ rel: "nofollow ugc" })
	 * @see https://dhoulb.github.io/shelving/markup/MarkupParser/MarkupParser
	 */
	constructor({ rules = MARKUP_RULES, rel, url, root, schemes = HTTP_SCHEMES, context = "block" }: MarkupOptions = {}) {
		this.rules = rules;
		this.priorities = _getPriorities(rules);
		this.rel = rel;
		this.url = url;
		this.root = root;
		this.schemes = schemes;
		this.context = context;
	}

	/**
	 * Parse a text string as Markdownish markup syntax and render it as a React node.
	 * - Syntax is not defined by this code, but by the rules supplied to it.
	 *
	 * @param input The string content possibly containing markup syntax, e.g. `"This is a *bold* string."`.
	 * @param context The context to render in (defaults to this parser's `context`, i.e. `"block"` unless overridden).
	 * @returns A React node — an element, a string, `null`, or an array of zero or more of those.
	 * @example new MarkupParser().parse("This is a *bold* string.")
	 * @see https://dhoulb.github.io/shelving/markup/MarkupParser/MarkupParser/parse
	 */
	parse(input: string, context = this.context): ReactNode {
		const nodes = _parseNodes(input, this, context);
		return !nodes.length ? null : nodes.length === 1 ? nodes[0] : nodes;
	}

	/**
	 * Yield the rules active in `context` that sit in the given priority tier.
	 *
	 * @param context The render context to filter rules by (e.g. `"block"`, `"inline"`).
	 * @param priority The priority tier to filter rules by.
	 * @returns An iterable of the matching `MarkupRule` instances.
	 * @example for (const rule of parser.getRules("block", 0)) { ... }
	 * @see https://dhoulb.github.io/shelving/markup/MarkupParser/MarkupParser/getRules
	 */
	*getRules(context: string, priority: number): Iterable<MarkupRule> {
		for (const r of this.rules) if (r.priority === priority && r.contexts.includes(context)) yield r;
	}

	/**
	 * Resolve a link href against this parser's `url` and `root`, returning it only if its scheme is allowed.
	 *
	 * @param href The raw link reference to resolve (relative or absolute), or a nullish value.
	 * @returns An `ImmutableURI` if the link parses and its scheme is in `schemes`, otherwise `undefined`.
	 * @example parser.getLink("/about") // ImmutableURI | undefined
	 * @see https://dhoulb.github.io/shelving/markup/MarkupParser/MarkupParser/getLink
	 */
	getLink(href: Nullish<PossibleLink>): ImmutableURI | undefined {
		const link = getLink(href, this.url, this.root);
		if (link && this.schemes.includes(link.protocol)) return link;
	}
}

/** Extract the unique rule priorities, ordered highest first — these are the tiers to resolve in turn. */
function _getPriorities(rules: MarkupRules): ImmutableArray<number> {
	const priorities: MutableArray<number> = [];
	for (const { priority } of rules) if (!priorities.includes(priority)) priorities.push(priority);
	return priorities.sort().reverse();
}

/** A region of the input string claimed by a single rule. */
type MarkupClaim = {
	/** The rule that claimed the region. */
	readonly rule: MarkupRule;
	/** Offset of the first claimed character in the original input string. */
	readonly start: number;
	/** Offset just past the last claimed character in the original input string. */
	readonly end: number;
	/** Named capture groups from the rule's match, recovered against the original (unmasked) text. */
	readonly groups: NamedRegExpData | undefined;
};

/**
 * Parse a string into its rendered nodes using a tiered / masking engine.
 *
 * Rules are grouped into priority tiers and resolved highest tier first. Once a tier claims a
 * region it is "masked" (blanked in a working copy of the string) so lower-priority rules cannot
 * match into — or across — it, but can still match around it. That single mechanism is the fix
 * for code spans that straddle link delimiters: a code span is masked before links resolve, so a
 * link either wraps a whole masked code span (and re-parses it) or cannot form at all.
 *
 * Rules own the recursion into their own children — they call `parser.parse` again, optionally
 * with a different context — so the engine never reaches inside a rule's content itself.
 */
function _parseNodes(input: string, parser: MarkupParser, context: string): (ReactElement | string)[] {
	// Resolve tier by tier. `claimed` collects the winning regions; `masked` hides each resolved
	// region from every lower tier.
	const claimed: MarkupClaim[] = [];
	let masked = input;
	for (const priority of parser.priorities) {
		const higher = Array.from(claimed); // Snapshot — claims from already-resolved (higher) tiers.
		for (const claim of _scanTier(masked, input, parser, context, priority, higher)) {
			// A claim that wraps earlier (higher-tier) claims absorbs them: the wrapper re-parses
			// that text itself (e.g. a link re-parsing its own title).
			for (let i = claimed.length - 1; i >= 0; i--) {
				const c = claimed[i];
				if (c && c.start >= claim.start && c.end <= claim.end) claimed.splice(i, 1);
			}
			claimed.push(claim);
			masked = _mask(masked, claim.start, claim.end);
		}
	}

	// Walk left to right: raw text fills the gaps, rendered elements fill the claims. Each claim
	// already carries the capture groups recovered against the original text, so no rule's regexp
	// needs to run a second time here.
	claimed.sort((a, b) => a.start - b.start);
	const nodes: (ReactElement | string)[] = [];
	let pos = 0;
	for (const { rule, start, end, groups } of claimed) {
		if (start > pos) nodes.push(input.slice(pos, start));
		nodes.push(rule.render(start.toString(), groups, parser));
		pos = end;
	}
	if (pos < input.length) nodes.push(input.slice(pos));
	return nodes;
}

/**
 * Yield one tier's winning claims, left to right, non-overlapping.
 *
 * "Leftmost wins" needs every rule's next match up front — but instead of throwing the losers
 * away we cache one match per rule, and only recompute a rule's match when the chosen claim
 * actually invalidated it. A rule whose match still lies ahead is reused untouched.
 */
function* _scanTier(
	masked: string,
	input: string,
	parser: MarkupParser,
	context: string,
	priority: number,
	higher: MarkupClaim[],
): Generator<MarkupClaim> {
	// Materialise this tier's rules.
	const rules = Array.from(parser.getRules(context, priority));

	// Prime one cached match per rule.
	const cache: (MarkupClaim | undefined)[] = [];
	for (const rule of rules) cache.push(_findFrom(rule, masked, input, 0, higher));

	for (;;) {
		// The leftmost cached match wins; on a tie the earlier rule in the list wins.
		let best: MarkupClaim | undefined;
		for (const claim of cache) if (claim && (!best || claim.start < best.start)) best = claim;
		if (!best) return;
		yield best;

		// Keep every cached match still ahead of `best`; recompute only the rules whose match overlapped (or was) `best`.
		for (let i = 0; i < rules.length; i++) {
			const rule = rules[i];
			const claim = cache[i];
			if (rule && (!claim || claim.start < best.end)) cache[i] = _findFrom(rule, masked, input, best.end, higher);
		}
	}
}

/**
 * Find the first valid claim for `rule` in `masked` at or after `from`, or `undefined`.
 * - A claim is valid if it sits in free space, or if it genuinely wraps the higher-tier claims it spans.
 * - Confirmed by re-running the rule on the original (unmasked) slice and checking it still matches the whole region.
 * - A match that merely straddles a masked region (e.g. a paragraph's trailing whitespace swallowing a fenced block) is spurious and is retried bounded by the claim it crossed.
 */
function _findFrom(rule: MarkupRule, masked: string, input: string, from: number, higher: MarkupClaim[]): MarkupClaim | undefined {
	let lo = from;
	for (;;) {
		// Advance `lo` past any higher-tier claim that covers it.
		for (let moved = true; moved; ) {
			moved = false;
			for (const h of higher)
				if (h.start <= lo && lo < h.end) {
					lo = h.end;
					moved = true;
				}
		}
		if (lo >= masked.length) return undefined;

		const match = rule.regexp.exec(masked.slice(lo));
		if (!match) return undefined;
		const start = lo + match.index;
		const end = start + match[0].length;

		// Inspect the higher-tier claims this match touches in a single allocation-free pass:
		// - `leadingEnd` — a claim starts at/before the match, so the match cannot begin here.
		// - `interior` — every spanned claim sits strictly inside (a possible genuine wrapper).
		// - `wallStart`/`wallEnd` — the first claim the match crosses, used to bound a retry.
		let overlaps = false;
		let leadingEnd = -1;
		let interior = true;
		let wallStart = masked.length;
		let wallEnd = -1;
		for (const h of higher) {
			if (h.start < end && h.end > start) {
				overlaps = true;
				if (h.start <= start) {
					if (h.end > leadingEnd) leadingEnd = h.end;
				} else if (h.end >= end) {
					interior = false;
				}
				if (h.start < wallStart) {
					wallStart = h.start;
					wallEnd = h.end;
				}
			}
		}
		if (!overlaps) return { rule, start, end, groups: match.groups };

		// A higher claim starts at or before this match — it cannot begin here, skip past it.
		if (leadingEnd >= 0) {
			lo = leadingEnd;
			continue;
		}

		// A genuine wrapper holds every spanned claim strictly inside it (delimiters of its own on
		// both sides) and still matches the whole region when re-run on the original (unmasked)
		// slice. A claim that merely shares a boundary — a paragraph whose trailing whitespace
		// swallows the block below it — is spurious, not a wrapper.
		if (interior) {
			const original = rule.regexp.exec(input.slice(start, end));
			if (original && !original.index && original[0].length === end - start) return { rule, start, end, groups: original.groups };
		}

		// Spurious span — retry bounded by the first claim it crossed.
		const bounded = rule.regexp.exec(masked.slice(lo, wallStart));
		if (bounded) {
			const s = lo + bounded.index;
			return { rule, start: s, end: s + bounded[0].length, groups: bounded.groups };
		}
		lo = wallEnd;
	}
}

// Placeholder a claimed region is blanked to: non-whitespace and non-word, so lower tiers see a
// masked region as opaque *content* rather than whitespace. Blanking to a space made a leading or
// trailing code span look like whitespace to inline emphasis (which rejects whitespace at its
// start/end), so `**`code`**` failed to form. Newlines are kept so block structure survives.
const _MASK_CHAR = "\u0000";

/** Blank the `[start, end)` region of `text` — every character becomes `_MASK_CHAR`, except newlines. */
function _mask(text: string, start: number, end: number): string {
	let blanked = "";
	for (let i = start; i < end; i++) blanked += text[i] === "\n" ? "\n" : _MASK_CHAR;
	return `${text.slice(0, start)}${blanked}${text.slice(end)}`;
}

/**
 * Shared `MarkupParser` instance configured with the default markup rules and behaviour.
 * - Use this singleton when no custom rules, link resolution, or default context are needed.
 *
 * @example MARKUP_PARSER.parse("This is a *bold* string.")
 * @see https://dhoulb.github.io/shelving/markup/MarkupParser/MARKUP_PARSER
 */
export const MARKUP_PARSER = new MarkupParser();
