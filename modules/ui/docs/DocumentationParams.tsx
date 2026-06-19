import { Fragment, type ReactNode } from "react";
import type { ImmutableArray } from "../../util/array.js";
import type { DocumentationElementProps, DocumentationParam } from "../../util/tree.js";
import { Section } from "../block/Section.js";
import { Code } from "../inline/Code.js";
import { Scroll } from "../style/Scroll.js";
import { Cell } from "../table/Cell.js";
import { Table } from "../table/Table.js";
import { getTreeElement, useTreeMap } from "../tree/TreeContext.js";
import { TreeLink } from "../tree/TreeLink.js";

const DEFAULT_TYPE = "unknown";

/**
 * Props for `DocumentationParams` — the parameter list to render, one row per parameter.
 *
 * @see https://dhoulb.github.io/shelving/ui/docs/DocumentationParams/DocumentationParamsProps
 */
export interface DocumentationParamsProps {
	/** Parameters to render — one row each, with options-bag params flattened into indented child rows. */
	readonly params?: ImmutableArray<DocumentationParam> | undefined;
}

/**
 * Render a documented symbol's parameters as a scrollable table — one row per parameter.
 * - Self-contained: pulls its own copy of the tree map from [`useTreeMap()`](/ui/useTreeMap) so the `Type` column can link each type to its documented page via [`TreeLink`](/ui/TreeLink) (exact-match only; compound or builtin types stay plain text).
 * - A row with no hand-written description falls back to the referenced type's own `description`, and a default renders as a `Defaults to …` line at the foot of the description cell (linking the value when it's a documented token).
 * - An options-bag parameter whose type resolves to a documented interface/object type is flattened into indented child rows (one per property), so readers see the individual fields inline.
 * - Renders nothing when there are no parameters.
 *
 * @kind component
 * @returns A [`<Section>`](/ui/Section) containing the parameters table, or `null` when there are none.
 * @example <DocumentationParams params={params} />
 * @see https://dhoulb.github.io/shelving/ui/docs/DocumentationParams/DocumentationParams
 */
export function DocumentationParams({ params }: DocumentationParamsProps): ReactNode {
	const map = useTreeMap();
	if (!params?.length) return null;
	return (
		<Section>
			<Scroll horizontal>
				<Table>
					<thead>
						<tr>
							<Cell header width="fit">
								Param
							</Cell>
							<Cell header width="fit">
								Type
							</Cell>
							<Cell header width="xxnarrow" grow />
						</tr>
					</thead>
					<tbody>
						{params.map(({ name, type = DEFAULT_TYPE, description, default: def }) => {
							// An options-bag param whose type resolves to a documented interface/object type is flattened into its individual fields as indented child rows.
							const resolved = getTreeElement(map, type)?.props as DocumentationElementProps | undefined;
							return (
								<Fragment key={`${name}-${type}`}>
									<tr>
										<td>
											<Code nowrap>{name}</Code>
										</td>
										<td>
											<TreeLink name={type} nowrap />
										</td>
										<td>
											{description || getTreeElement(map, type)?.props.description}
											{def && (
												<>
													Defaults to <TreeLink name={def} />
												</>
											)}
										</td>
									</tr>
									{resolved?.properties?.map(
										({ name: propName, type: propType = DEFAULT_TYPE, description: propDescription, default: propDef }) => (
											<tr key={`${propName}-${propType}-${propDescription}`}>
												<td>
													<Code nowrap>{`.${propName}`}</Code>
												</td>
												<td>
													<TreeLink name={propType} nowrap />
												</td>
												<td>
													{propDescription || getTreeElement(map, propType)?.props.description}
													{propDef && (
														<>
															Defaults to <TreeLink name={propDef} />
														</>
													)}
												</td>
											</tr>
										),
									)}
								</Fragment>
							);
						})}
					</tbody>
				</Table>
			</Scroll>
		</Section>
	);
}
