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
import { DocumentationDescription } from "./DocumentationDescription.js";

const DEFAULT_TYPE = "unknown";

/** Indentation (non-breaking spaces, so HTML doesn't collapse it) prefixed to a flattened sub-property's name so it reads as nested under its parent param. */
const SUBPARAM_INDENT = "\u00A0\u00A0\u00A0\u00A0";

/**
 * Split a type expression on ` | ` into its individual union members.
 * - An `undefined` member is dropped from display and instead flags the value as optional — we often write `| undefined` explicitly (e.g. for `exactOptionalPropertyTypes`, or to allow an explicit `undefined` to trigger a default), which reads as noise in the docs.
 * - When nothing but `undefined` is left, the members are kept as-is rather than emptied.
 */
function _splitType(type: string): { readonly members: readonly string[]; readonly optional: boolean } {
	const parts = type
		.split(" | ")
		.map(part => part.trim())
		.filter(Boolean);
	const members = parts.filter(part => part !== "undefined");
	return members.length ? { members, optional: members.length !== parts.length } : { members: parts, optional: false };
}

/** Render a type expression as one linked `Type`-column token per union member, each stacked on its own line (an `undefined` member is dropped — see `_splitType`). */
function _renderType(members: readonly string[]): ReactNode {
	return members.map((member, index) => (
		<Fragment key={member}>
			{index > 0 && <br />}
			<TreeLink name={member} nowrap />
		</Fragment>
	));
}

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
 * - A union type renders one linked token per member, each on its own line; a `| undefined` member is dropped and instead marks the parameter optional.
 * - Descriptions render as inline markup, with a trailing `Defaults to …` (linked when documented) or `Required.` note — see [`DocumentationDescription`](/ui/DocumentationDescription). A row with no hand-written description falls back to the referenced type's own `description`.
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
						{params.map(({ name, type = DEFAULT_TYPE, description, default: def, optional }) => {
							const { members, optional: typeOptional } = _splitType(type);
							// An options-bag param whose (single, concrete) type resolves to a documented interface/object type is flattened into its individual fields as indented child rows.
							const single = members.length === 1 ? members[0] : undefined;
							const resolved = single ? (getTreeElement(map, single)?.props as DocumentationElementProps | undefined) : undefined;
							return (
								<Fragment key={`${name}-${type}`}>
									<tr>
										<td>
											<Code nowrap>{name}</Code>
										</td>
										<td>{_renderType(members)}</td>
										<td>
											<DocumentationDescription
												description={description || resolved?.description}
												default={def}
												optional={!!optional || typeOptional}
											/>
										</td>
									</tr>
									{resolved?.properties?.map(
										({
											name: propName,
											type: propType = DEFAULT_TYPE,
											description: propDescription,
											default: propDef,
											optional: propOptional,
										}) => {
											const { members: propMembers, optional: propTypeOptional } = _splitType(propType);
											const propSingle = propMembers[0] ?? DEFAULT_TYPE;
											return (
												<tr key={`${propName}-${propType}-${propDescription}`}>
													<Cell nowrap>
														{SUBPARAM_INDENT}
														<Code nowrap>{`.${propName}`}</Code>
													</Cell>
													<td>{_renderType(propMembers)}</td>
													<td>
														<DocumentationDescription
															description={propDescription || getTreeElement(map, propSingle)?.props.description}
															default={propDef}
															optional={!!propOptional || propTypeOptional}
														/>
													</td>
												</tr>
											);
										},
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
