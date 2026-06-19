import type { ReactNode } from "react";
import type { ImmutableArray } from "../../util/array.js";
import { Section } from "../block/Section.js";
import { Scroll } from "../style/Scroll.js";
import { Cell } from "../table/Cell.js";
import { Table } from "../table/Table.js";
import { getTreeElement, useTreeMap } from "../tree/TreeContext.js";
import { TreeLink } from "../tree/TreeLink.js";
import { DocumentationDescription } from "./DocumentationDescription.js";

/**
 * Props for `DocumentationReferences` — the referenced type names to render, one row each.
 *
 * @see https://dhoulb.github.io/shelving/ui/docs/DocumentationReferences/DocumentationReferencesProps
 */
export interface DocumentationReferencesProps {
	/** Type names referenced by a `type` alias's body — one row each, resolved to links at render time. */
	readonly types?: ImmutableArray<string> | undefined;
}

/**
 * Render a `type` alias's referenced type names as a scrollable table — one row per referenced type.
 * - Self-contained: pulls its own copy of the tree map from `useTreeMap()` so each name links to its documented page via `TreeLink` (exact-match only; unresolved names stay plain text), with the row carrying the resolved element's `description`.
 * - Renders nothing when there are no referenced types.
 *
 * @kind component
 * @returns A `<Section>` containing the references table, or `null` when there are none.
 * @example <DocumentationReferences types={types} />
 * @see https://dhoulb.github.io/shelving/ui/docs/DocumentationReferences/DocumentationReferences
 */
export function DocumentationReferences({ types }: DocumentationReferencesProps): ReactNode {
	const map = useTreeMap();
	if (!types?.length) return null;
	return (
		<Section>
			<Scroll horizontal>
				<Table>
					<thead>
						<tr>
							<Cell header width="fit">
								Type
							</Cell>
							<Cell header width="xxnarrow" grow />
						</tr>
					</thead>
					<tbody>
						{types.map(type => (
							<tr key={type}>
								<td>
									<TreeLink name={type} />
								</td>
								<td>
									<DocumentationDescription description={getTreeElement(map, type)?.props.description} />
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			</Scroll>
		</Section>
	);
}
