import { type ReactNode, useEffect, useState } from "react";
import { Details } from "../block/Details.js";
import { Heading } from "../block/Heading.js";
import { Paragraph } from "../block/Paragraph.js";
import { Row } from "../block/Row.js";
import { Button } from "../button/Button.js";
import { Dialog } from "../dialog/Dialog.js";
import { Modal } from "../dialog/Modal.js";
import { TextInput } from "../input/TextInput.js";
import {
	formatPlaygroundCSS,
	PLAYGROUND_COMPONENTS_PATH,
	PLAYGROUND_VARIABLES_PATH,
	type PlaygroundComponent,
	type PlaygroundVariable,
	type PlaygroundVariableGroup,
} from "./playground.js";

/**
 * Props for `<DocumentationPlaygroundInsert>`.
 *
 * @see https://shelving.cc/ui/DocumentationPlaygroundInsertProps
 */
export interface DocumentationPlaygroundInsertProps {
	/** What to list: shelving components for the TSX, or CSS variables for the CSS. */
	readonly type: "code" | "css";
	/** Called with a `PlaygroundComponent.snippet` (for the TSX) or a CSS declaration or rule (for the CSS) when you press an item. */
	readonly onInsert: (text: string) => void;
	/** Called when the panel closes. It must unmount the panel. */
	readonly onClose: () => void;
}

/** One group of items in the panel. */
interface _Group {
	readonly name: string;
	readonly items: readonly { readonly name: string; readonly title?: string | undefined; readonly text: string }[];
	/** Text that inserts the whole group, if the group has it. */
	readonly all?: string | undefined;
}

/** Fetch a JSON index that the docs build writes, once. */
function usePlaygroundIndex<T>(path: string): readonly T[] | undefined {
	const [index, setIndex] = useState<readonly T[] | undefined>(undefined);
	useEffect(() => {
		fetch(new URL(path, document.baseURI))
			.then(r => r.json() as Promise<readonly T[]>)
			.then(setIndex, () => setIndex([]));
	}, [path]);
	return index;
}

/** Get a CSS declaration line for a variable, e.g. `  --card-radius: var(--radius-normal); /* Corner radius *\/`. */
function _getDeclaration(variable: PlaygroundVariable): string {
	return formatPlaygroundCSS([variable]).split("\n")[1] ?? "";
}

/** Group the components by their group. */
function _getComponentGroups(components: readonly PlaygroundComponent[]): _Group[] {
	const groups = new Map<string, _Group["items"][number][]>();
	for (const { name, group, description, snippet } of components) {
		const items = groups.get(group) ?? [];
		items.push({ name, title: description, text: snippet });
		groups.set(group, items);
	}
	return Array.from(groups, ([name, items]) => ({ name, items }));
}

/** Group the variables by the module that owns them. */
function _getVariableGroups(groups: readonly PlaygroundVariableGroup[]): _Group[] {
	return groups.map(({ name, tokens, variables }) => ({
		name: tokens ? `${name} tokens` : name,
		items: variables.map(variable => ({
			name: variable.name,
			title: variable.description ? `${variable.description} (${variable.value})` : variable.value,
			text: _getDeclaration(variable),
		})),
		all: variables.map(_getDeclaration).join("\n"),
	}));
}

/** Keep the groups and items that match a search. */
function _search(groups: readonly _Group[], query: string): readonly _Group[] {
	const q = query.trim().toLowerCase();
	if (!q) return groups;
	return groups
		.map(group =>
			group.name.toLowerCase().includes(q)
				? group
				: { ...group, all: undefined, items: group.items.filter(({ name, title }) => `${name} ${title ?? ""}`.toLowerCase().includes(q)) },
		)
		.filter(({ items }) => items.length);
}

/**
 * Panel that slides in from the right of the playground, to insert a shelving component into the TSX, or a CSS variable into the CSS.
 * - Components come from `PLAYGROUND_COMPONENTS_PATH`, and variables from `PLAYGROUND_VARIABLES_PATH`. The docs build writes both.
 * - Items are grouped by module, and you can search them by name or description. Hover an item to see its description.
 * - Press an item to insert it and close the panel. A group of variables also has "Insert all", which inserts every variable in it.
 *
 * @kind component
 * @see https://shelving.cc/ui/DocumentationPlaygroundInsert
 */
export function DocumentationPlaygroundInsert({ type, onInsert, onClose }: DocumentationPlaygroundInsertProps): ReactNode {
	const [query, setQuery] = useState("");
	const components = usePlaygroundIndex<PlaygroundComponent>(PLAYGROUND_COMPONENTS_PATH);
	const variables = usePlaygroundIndex<PlaygroundVariableGroup>(PLAYGROUND_VARIABLES_PATH);
	const index = type === "code" ? components : variables;
	const groups = index && (type === "code" ? _getComponentGroups(components ?? []) : _getVariableGroups(variables ?? []));
	const matches = groups && _search(groups, query);
	const insert = (text: string) => {
		onInsert(text);
		onClose();
	};

	return (
		<Dialog onClose={onClose}>
			<Modal right>
				<Heading>{type === "code" ? "Insert a component" : "Insert a variable"}</Heading>
				<TextInput
					name="search"
					title="Search"
					placeholder={type === "code" ? "Search, e.g. button or row…" : "Search, e.g. card or radius…"}
					value={query}
					onValue={v => setQuery(v ?? "")}
				/>
				{!matches ? (
					<Paragraph>Loading…</Paragraph>
				) : !matches.length ? (
					<Paragraph>Nothing matches your search.</Paragraph>
				) : (
					matches.map(({ name, items, all }) => (
						<Details key={name} title={`${name} (${items.length})`} open={type === "code" || !!query.trim()}>
							<Row left wrap gap="xsmall">
								{items.map(item => (
									<Button key={item.name} small title={item.title} onClick={() => insert(item.text)}>
										{item.name}
									</Button>
								))}
								{all && (
									<Button small plain onClick={() => insert(all)}>
										Insert all
									</Button>
								)}
							</Row>
						</Details>
					))
				)}
			</Modal>
		</Dialog>
	);
}
