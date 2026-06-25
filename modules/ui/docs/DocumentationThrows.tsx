import type { ReactNode } from "react";
import type { ImmutableArray } from "../../util/array.js";
import type { DocumentationThrow } from "../../util/tree.js";
import { Section } from "../block/Section.js";
import { Scroll } from "../style/Scroll.js";
import { Cell } from "../table/Cell.js";
import { Table } from "../table/Table.js";
import { getTreeElement, useTreeMap } from "../tree/TreeContext.js";
import { TreeLink } from "../tree/TreeLink.js";
import { DocumentationDescription } from "./DocumentationDescription.js";

const DEFAULT_TYPE = "unknown";

/**
 * Props for `DocumentationThrows` — the `@throws` entries to render, one row each.
 *
 * @see https://shelving.cc/ui/DocumentationThrowsProps
 */
export interface DocumentationThrowsProps {
	/** Throw entries to render — one row per documented thrown type. */
	readonly throws?: ImmutableArray<DocumentationThrow> | undefined;
}

/**
 * Render a documented symbol's `@throws` entries as a scrollable table — one row per thrown type.
 * - Self-contained: pulls its own copy of the tree map from `useTreeMap()` so the `Type` column can link each type to its documented page via `TreeLink` (exact-match only; compound or builtin types stay plain text).
 * - A row with no hand-written description falls back to the referenced type's own `description`.
 * - Renders nothing when there are no throw entries.
 *
 * @kind component
 * @example <DocumentationThrows throws={throws} />
 * @see https://shelving.cc/ui/DocumentationThrows
 */
export function DocumentationThrows({ throws }: DocumentationThrowsProps): ReactNode {
	const map = useTreeMap();
	if (!throws?.length) return null;
	return (
		<Section>
			<Scroll horizontal>
				<Table>
					<thead>
						<tr>
							<Cell header width="fit">
								Throws
							</Cell>
							<Cell header width="xxnarrow" grow />
						</tr>
					</thead>
					<tbody>
						{throws.map(({ type = DEFAULT_TYPE, description }) => (
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
