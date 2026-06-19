import type { ReactNode } from "react";
import type { MarkupRule, MarkupRules } from "../../markup/MarkupRule.js";
import { CODE_RULE } from "../../markup/rule/code.js";
import { MARKUP_RULES } from "../../markup/rule/index.js";
import { Markup, type MarkupProps } from "../misc/Markup.js";
import { TreeLink } from "./TreeLink.js";

/**
 * Markup rule that renders an inline code span as a tree-resolved [`<TreeLink>`](/ui/TreeLink) instead of a plain `<code>`.
 * - Reuses [`CODE_RULE`](/markup/rule/CODE_RULE)'s regexp, contexts, and priority — only the renderer changes — so it masks and matches identically to the default inline-code rule.
 * - The span's text becomes the link `name`: a hit links to the token's canonical page, a miss falls back to a plain code token (see [`TreeLink`](/ui/TreeLink)), so unknown spans (`bun run fix`, `string`, …) stay code.
 *
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeMarkup/TREE_CODE_RULE
 */
export const TREE_CODE_RULE: MarkupRule = {
	...CODE_RULE,
	render: (key, data) => <TreeLink key={key} name={data?.code ?? ""} />,
};

/**
 * Default markup rules with the inline-code rule swapped for [`TREE_CODE_RULE`](/ui/TREE_CODE_RULE) — every backtick span auto-links to its documented token.
 * - Identical to [`MARKUP_RULES`](/markup/MARKUP_RULES) with only [`CODE_RULE`](/markup/rule/CODE_RULE) replaced, so any future change to the default rule set flows through.
 *
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeMarkup/TREE_MARKUP_RULES
 */
export const TREE_MARKUP_RULES: MarkupRules = MARKUP_RULES.map(rule => (rule === CODE_RULE ? TREE_CODE_RULE : rule));

/**
 * Render a markup string with inline code spans auto-linked to their documented tree elements.
 * - Like [`<Markup>`](/ui/Markup) but defaults to [`TREE_MARKUP_RULES`](/ui/TREE_MARKUP_RULES), so each backtick span resolves through [`TreeLink`](/ui/TreeLink) against the surrounding [`<TreeProvider>`](/ui/TreeProvider) — a known token links to its canonical page, an unknown one stays plain code.
 * - The standard way to render documentation-site content (READMEs, docblocks, per-symbol pages); plain [`<Markup>`](/ui/Markup) stays the choice for general user content that shouldn't cross-link.
 * - Falls back to plain code spans outside a [`<TreeProvider>`](/ui/TreeProvider), so it's safe to use anywhere. Pass any [`MarkupOptions`](/markup/MarkupOptions) prop (including `rules`) to override.
 *
 * @param children The source markup string to parse and render (renders `null` when empty).
 * @returns The parsed markup as React nodes, or `null` when `children` is empty.
 * @kind component
 * @example <Prose><TreeMarkup>{`Use \`BooleanSchema\` to validate.`}</TreeMarkup></Prose>
 * @see https://dhoulb.github.io/shelving/ui/tree/TreeMarkup/TreeMarkup
 */
export function TreeMarkup({ rules = TREE_MARKUP_RULES, ...props }: MarkupProps): ReactNode {
	return <Markup rules={rules} {...props} />;
}
