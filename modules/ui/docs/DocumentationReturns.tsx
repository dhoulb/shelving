import type { ReactNode } from "react";
import type { ImmutableArray } from "../../util/array.js";
import type { DocumentationReturn } from "../../util/tree.js";
import { Section } from "../block/Section.js";
import { Scroll } from "../style/Scroll.js";
import { Cell } from "../table/Cell.js";
import { Table } from "../table/Table.js";
import { getTreeElement, useTreeMap } from "../tree/TreeContext.js";
import { TreeLink } from "../tree/TreeLink.js";
import { DocumentationDescription } from "./DocumentationDescription.js";

const DEFAULT_TYPE = "unknown";

/**
 * Props for `DocumentationReturns` — the `@returns` entries to render, one row each.
 *
 * @see https://shelving.cc/ui/DocumentationReturnsProps
 */
export interface DocumentationReturnsProps {
	/** Return entries to render — one row per documented return type. */
	readonly returns?: ImmutableArray<DocumentationReturn> | undefined;
}

/**
 * Render a documented symbol's `@returns` entries as a scrollable table — one row per return type.
 * - Self-contained: pulls its own copy of the tree map from `useTreeMap()` so the `Type` column can link each type to its documented page via `TreeLink` (exact-match only; compound or builtin types stay plain text).
 * - A row with no hand-written description falls back to the referenced type's own `description`.
 * - Renders nothing when there are no return entries.
 *
 * @kind component
 * @example <DocumentationReturns returns={returns} />
 * @see https://shelving.cc/ui/DocumentationReturns
 */
export function DocumentationReturns({ returns }: DocumentationReturnsProps): ReactNode {
	const map = useTreeMap();
	if (!returns?.length) return null;
	return (
		<Section>
			<Scroll horizontal>
				<Table>
					<thead>
						<tr>
							<Cell header width="fit">
								Return
							</Cell>
							<Cell header width="xxnarrow" grow />
						</tr>
					</thead>
					<tbody>
						{returns.map(({ type = DEFAULT_TYPE, description }) => (
							<tr key={`${type}-${description}`}>
								<td>
									<TreeLink name={type} nowrap />
								</td>
								<td>
									<DocumentationDescription description={description || getTreeElement(map, type)?.props.description} />
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			</Scroll>
		</Section>
	);
}
