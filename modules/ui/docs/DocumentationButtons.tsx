import type { ReactElement } from "react";
import type { ImmutableArray } from "../../util/array.js";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { TreeButton } from "../tree/TreeButton.js";
import { getClass } from "../util/css.js";
/**
 * Props for `DocumentationButtons` — the relational metadata of a documented symbol (`class`, `extends`, `implements`), plus block-space and flex overrides.
 *
 * @see https://shelving.cc/ui/DocumentationButtonsProps
 */
export interface DocumentationButtonsProps extends BlockVariants, FlexVariants {
	/** Name of the class/interface this member belongs to (e.g. `"Store"` for `Store.get()`). Set only on methods and properties. */
	readonly class?: string | undefined;
	/** Full type text of the class/interface this extends, including any generic arguments (e.g. `"AbstractStore<string>"`, `"Omit<StringSchemaOptions, 'value'>"`). Resolved to a link at render time, trimming generics to the bare name; builtins/wrappers that don't resolve stay as text. */
	readonly extends?: string | undefined;
	/** Full type text of the interfaces this implements, including generic arguments (e.g. `["Serializable<string>"]`). Resolved to links at render time (generics trimmed for lookup); builtins simply stay as text. */
	readonly implements?: ImmutableArray<string> | undefined;
}

/** One labelled relation — a sentence-case prefix plus the symbol it points at. */
function* _relations({
	class: className,
	extends: extendsName,
	implements: implementsNames,
}: DocumentationButtonsProps): Iterable<readonly [label: string, to: string]> {
	if (extendsName) yield ["extends", extendsName];
	for (const name of implementsNames ?? []) yield ["implements", name];
	// `member of` comes last — it's the broadest relation, the others are more specific.
	if (className) yield ["member of", className];
}

/**
 * Render a symbol's relational metadata as a `<nav>` column of labelled links.
 * - Each relation reads as `"{label} {Target}"` — e.g. `extends AbstractStore`, `implements Serializable`, `member of Store`.
 * - The target is a `<DocumentationButton>`, so it links to the referenced page when it exists in the tree and stays a plain label otherwise.
 * - Block spacing defaults to paragraph spacing (via `getParagraphClass()`); pass `space` to override. Inner spacing is the flex gap.
 * - Renders nothing when the symbol has no relations.
 *
 * @kind component
 */
export function DocumentationButtons({
	space = "paragraph",
	wrap = true,
	left = true,
	gap = "none",
	...props
}: DocumentationButtonsProps): ReactElement | null {
	const relations = Array.from(_relations(props));
	if (!relations.length) return null;
	const variants = { space, wrap, left, gap, ...props };
	return (
		<nav
			className={getClass(
				getBlockClass(variants), //
				getFlexClass(variants),
			)}
		>
			{relations.map(([label, to]) => (
				<TreeButton key={`${label}-${to}`} name={to}>
					{label} {to}
				</TreeButton>
			))}
		</nav>
	);
}
