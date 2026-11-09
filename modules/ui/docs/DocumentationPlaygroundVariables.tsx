import { type ReactNode, useEffect, useState } from "react";
import { Details } from "../block/Details.js";
import { Paragraph } from "../block/Paragraph.js";
import { Preformatted } from "../block/Preformatted.js";
import { Button } from "../button/Button.js";
import { TextInput } from "../input/TextInput.js";
import { formatPlaygroundCSS, PLAYGROUND_VARIABLES_PATH, type PlaygroundVariableGroup } from "./playground.js";

/**
 * Props for `<DocumentationPlaygroundVariables>`.
 *
 * @see https://shelving.cc/ui/DocumentationPlaygroundVariablesProps
 */
export interface DocumentationPlaygroundVariablesProps {
	/** Called with a `:root` CSS rule when you press "Add to CSS" for a group. */
	onAdd: (css: string) => void;
}

/**
 * Searchable index of every CSS variable that shelving components read, grouped by the module that owns it.
 * - Fetches the index from `PLAYGROUND_VARIABLES_PATH`, which the docs build writes.
 * - Each group shows a `:root` rule that you can copy, with each variable set to its default and its description as a comment.
 * - "Add to CSS" adds the group's rule (only the variables that match the search) to the playground CSS.
 *
 * @kind component
 * @see https://shelving.cc/ui/DocumentationPlaygroundVariables
 */
export function DocumentationPlaygroundVariables({ onAdd }: DocumentationPlaygroundVariablesProps): ReactNode {
	const [groups, setGroups] = useState<readonly PlaygroundVariableGroup[] | undefined>(undefined);
	const [query, setQuery] = useState("");

	// Fetch the index once.
	useEffect(() => {
		fetch(new URL(PLAYGROUND_VARIABLES_PATH, document.baseURI))
			.then(r => r.json() as Promise<readonly PlaygroundVariableGroup[]>)
			.then(setGroups, () => setGroups([]));
	}, []);

	if (!groups) return <Paragraph>Loading variables…</Paragraph>;
	if (!groups.length) return <Paragraph>No variables found.</Paragraph>;

	const q = query.trim().toLowerCase();
	const matches = groups
		.map(group => ({
			...group,
			variables:
				!q || group.name.toLowerCase().includes(q)
					? group.variables
					: group.variables.filter(({ name, description }) => name.includes(q) || description?.toLowerCase().includes(q)),
		}))
		.filter(({ variables }) => variables.length);

	return (
		<>
			<TextInput
				name="search"
				title="Search variables"
				placeholder="Search, e.g. card or radius…"
				value={query}
				onValue={v => setQuery(v ?? "")}
			/>
			{matches.map(({ name, tokens, variables }) => {
				const rule = formatPlaygroundCSS(variables);
				return (
					<Details key={name} title={`${name}${tokens ? " tokens" : ""} (${variables.length})`} open={!!q}>
						<Preformatted>{rule}</Preformatted>
						<Button small onClick={() => onAdd(rule)}>
							Add to CSS
						</Button>
					</Details>
				);
			})}
		</>
	);
}
