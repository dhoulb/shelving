import type { ReactNode } from "react";
import type { ImmutableArray } from "../../util/array.js";
import type { DocumentationParam } from "../../util/tree.js";
import { Section } from "../block/Section.js";
import { Code } from "../inline/Code.js";
import { Scroll } from "../style/Scroll.js";
import { Cell } from "../table/Cell.js";
import { Table } from "../table/Table.js";
import { getTreeElement, useTreeMap } from "../tree/TreeContext.js";
import { DocumentationDescription } from "./DocumentationDescription.js";
import { DocumentationType, splitType } from "./DocumentationType.js";

const DEFAULT_TYPE = "unknown";

/**
 * Props for `DocumentationProperties` — the data members of a class/interface/object-literal type to render, one row each.
 *
 * @see https://shelving.cc/ui/DocumentationPropertiesProps
 */
export interface DocumentationPropertiesProps {
	/** Properties to render — one row each. */
	readonly properties?: ImmutableArray<DocumentationParam> | undefined;
}

/**
 * Render a documented type's data members (properties, getters/setters) as a scrollable table — one row per property.
 * - Self-contained: pulls its own copy of the tree map from `useTreeMap()` so the `Type` column can link each type to its documented page via `TreeLink` (exact-match only; compound or builtin types stay plain text).
 * - Each property name carries a leading `.` (e.g. `.caller`); a union type renders one linked token per member, each on its own line, with a `| undefined` member dropped and marking the property optional.
 * - Descriptions render as inline markup, with a trailing `Defaults to …` (linked when documented) or `Required.` note — see `DocumentationDescription`. A row with no hand-written description falls back to the referenced type's own `description`.
 * - These are the same structured entries an options-bag parameter is flattened from in `DocumentationParams`, so the two stay in sync by construction.
 * - Renders nothing when there are no properties.
 *
 * @kind component
 * @example <DocumentationProperties properties={properties} />
 * @see https://shelving.cc/ui/DocumentationProperties
 */
export function DocumentationProperties({ properties }: DocumentationPropertiesProps): ReactNode {
	const map = useTreeMap();
	if (!properties?.length) return null;
	return (
		<Section>
			<Scroll horizontal>
				<Table>
					<thead>
						<tr>
							<Cell header width="fit">
								Property
							</Cell>
							<Cell header width="fit">
								Type
							</Cell>
							<Cell header width="narrow" grow />
						</tr>
					</thead>
					<tbody>
						{properties.map(({ name, type = DEFAULT_TYPE, description, default: def, optional, readonly }) => {
							const { members, optional: typeOptional } = splitType(type);
							return (
								<tr key={`${name}-${type}`}>
									<Cell nowrap>
										<Code nowrap>{`.${name}`}</Code>
									</Cell>
									<td>
										<DocumentationType members={members} />
									</td>
									<td>
										<DocumentationDescription
											description={description || getTreeElement(map, members[0] ?? DEFAULT_TYPE)?.props.description}
											default={def}
											optional={!!optional || typeOptional}
											readonly={readonly}
										/>
									</td>
								</tr>
							);
						})}
					</tbody>
				</Table>
			</Scroll>
		</Section>
	);
}
