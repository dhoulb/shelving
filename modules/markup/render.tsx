import type { ReactElement, ReactNode } from "react";
import type { MarkupOptions } from "./util/options.js";
import type { MarkupRule, MarkupRules } from "./util/rule.js";

/** A region of the input string claimed by a single rule. */
type MarkupClaim = {
	/** The rule that claimed the region. */
	readonly rule: MarkupRule;
	/** Offset of the first claimed character in the original input string. */
	readonly start: number;
	/** Offset just past the last claimed character in the original input string. */
	readonly end: number;
};

/**
 * Parse a text string as Markdownish syntax and render it as elements.
 * - Syntax is not defined by this code, but by the rules supplied to it.
 *
 * @param input The string content possibly containing markup syntax, e.g. "This is a *bold* string.
 * @param options An options object for the render.
 * @param context The context to render in (defaults to `"block"`).
 *
 * @returns A React node — an element, a string, `null`, or an array of zero or more of those.
 */
export function renderMarkup(input: string, options: MarkupOptions, context = "block"): ReactNode {
	const nodes = _parseNodes(input, options, context);
	return !nodes.length ? null : nodes.length === 1 ? nodes[0] : nodes;
}

/**
 * Parse a string into its rendered nodes using a tiered / masking engine.
 *
 * Rules are grouped into priority tiers and resolved highest tier first. Once a tier claims a
 * region it is "masked" (blanked in a working copy of the string) so lower-priority rules cannot
 * match into — or across — it, but can still match around it. That single mechanism is the fix
 * for code spans that straddle link delimiters: a code span is masked before links resolve, so a
 * link either wraps a whole masked code span (and re-parses it) or cannot form at all.
 *
 * Rules own the recursion into their own children — they call `renderMarkup` again, optionally
 * with a different context — so the engine never reaches inside a rule's content itself.
 */
function _parseNodes(input: string, options: MarkupOptions, context: string): (ReactElement | string)[] {
	// Resolve tier by tier. `claimed` collects the winning regions; `masked` hides each resolved
	// region from every lower tier.
	const claimed: MarkupClaim[] = [];
	let masked = input;
	for (const tier of _getTiers(options.rules, context)) {
		const higher = Array.from(claimed); // Snapshot — claims from already-resolved (higher) tiers.
		for (const claim of _scanTier(masked, input, tier, higher)) {
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

	// Walk left to right: raw text fills the gaps, rendered elements fill the claims.
	claimed.sort((a, b) => a.start - b.start);
	const nodes: (ReactElement | string)[] = [];
	let pos = 0;
	for (const { rule, start, end } of claimed) {
		if (start > pos) nodes.push(input.slice(pos, start));
		// Re-run the rule on the ORIGINAL slice. The claim was found against `masked`, so its
		// capture groups would otherwise hold blanked characters.
		const slice = input.slice(start, end);
		const match = rule.regexp.exec(slice);
		nodes.push(match ? rule.render(match, options, start.toString()) : slice);
		pos = end;
	}
	if (pos < input.length) nodes.push(input.slice(pos));
	return nodes;
}

/** Group the rules active in `context` into priority tiers, highest priority first. */
function _getTiers(rules: MarkupRules, context: string): MarkupRule[][] {
	const byPriority = new Map<number, MarkupRule[]>();
	for (const rule of rules) {
		if (rule.contexts.includes(context)) {
			const tier = byPriority.get(rule.priority);
			if (tier) tier.push(rule);
			else byPriority.set(rule.priority, [rule]);
		}
	}
	return Array.from(byPriority)
		.sort(([a], [b]) => b - a)
		.map(([, tier]) => tier);
}

/**
 * Yield one tier's winning claims, left to right, non-overlapping.
 *
 * "Leftmost wins" needs every rule's next match up front — but instead of throwing the losers
 * away we cache one match per rule, and only recompute a rule's match when the chosen claim
 * actually invalidated it. A rule whose match still lies ahead is reused untouched.
 */
function* _scanTier(masked: string, input: string, rules: MarkupRule[], higher: MarkupClaim[]): Generator<MarkupClaim> {
	const next: (MarkupClaim | undefined)[] = rules.map(rule => _findFrom(rule, masked, input, 0, higher));
	for (;;) {
		// The leftmost cached match wins; on a tie the earlier rule in the list wins.
		let best: MarkupClaim | undefined;
		for (const claim of next) if (claim && (!best || claim.start < best.start)) best = claim;
		if (!best) return;
		yield best;

		// Keep every cached match still ahead of `best`; recompute only the rules whose match
		// overlapped (or was) `best`.
		for (let i = 0; i < rules.length; i++) {
			const rule = rules[i];
			const claim = next[i];
			if (rule && (!claim || claim.start < best.end)) next[i] = _findFrom(rule, masked, input, best.end, higher);
		}
	}
}

/**
 * Find the first valid claim for `rule` in `masked` at or after `from`, or `undefined`.
 *
 * A claim is valid if it sits in free space, or if it genuinely wraps the higher-tier claims it
 * spans — confirmed by re-running the rule on the original (unmasked) slice and checking it still
 * matches the whole region. A match that merely straddles a masked region (e.g. a paragraph's
 * trailing whitespace swallowing a fenced block) is spurious and is retried bounded by the claim
 * it crossed.
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
		const overlapping = higher.filter(h => h.start < end && h.end > start);
		if (!overlapping.length) return { rule, start, end };

		// A higher claim starts at or before this match — it cannot begin here, skip past it.
		const leading = overlapping.find(h => h.start <= start);
		if (leading) {
			lo = leading.end;
			continue;
		}

		// A genuine wrapper holds every spanned claim strictly inside it (delimiters of its own on
		// both sides) and still matches the whole region when re-run on the original (unmasked)
		// slice. A claim that merely shares a boundary — a paragraph whose trailing whitespace
		// swallows the block below it — is spurious, not a wrapper.
		if (overlapping.every(h => h.start > start && h.end < end)) {
			const original = rule.regexp.exec(input.slice(start, end));
			if (original && !original.index && original[0].length === end - start) return { rule, start, end };
		}

		// Spurious span — retry bounded by the first claim it crossed.
		let wall = masked.length;
		let wallClaim: MarkupClaim | undefined;
		for (const h of overlapping)
			if (h.start < wall) {
				wall = h.start;
				wallClaim = h;
			}
		const bounded = rule.regexp.exec(masked.slice(lo, wall));
		if (bounded) {
			const s = lo + bounded.index;
			return { rule, start: s, end: s + bounded[0].length };
		}
		if (!wallClaim) return undefined;
		lo = wallClaim.end;
	}
}

/** Blank the `[start, end)` region of `text` — every character becomes a space, except newlines. */
function _mask(text: string, start: number, end: number): string {
	let blanked = "";
	for (let i = start; i < end; i++) blanked += text[i] === "\n" ? "\n" : " ";
	return `${text.slice(0, start)}${blanked}${text.slice(end)}`;
}
