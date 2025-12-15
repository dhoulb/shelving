import type { ImmutableArray } from "../../util/array.js";
import { requireMatch } from "../../util/regexp.js";
import type { SymbolParam, SymbolParams, SymbolReturn, SymbolReturns } from "./nodes.js";

/** Parsed docblock. */
export interface Docblock {
	description?: string;
	params?: SymbolParams;
	returns?: SymbolReturns;
	examples?: ImmutableArray<string>;
}

/** Parse a JSDoc/TS docblock into structured data. */
export function parseDocblock(raw: string): Docblock {
	const inner = raw
		.replace(/^\/\*\*?/, "")
		.replace(/\*\/$/, "")
		.split(/\r?\n/)
		.map(line => line.replace(/^\s*\* ?/, "").trimEnd());

	const lines: string[] = [];
	const params: SymbolParam[] = [];
	const examples: string[] = [];
	const returns: SymbolReturn[] = [];

	// Keep track of the current tag we're working on.
	let current: { tag: string | undefined; lines: string[]; type?: string; name?: string } | undefined;

	const flushCurrent = () => {
		if (!current) return;
		const { name, lines, tag, type = "unknown" } = current;
		const description = lines.join("\n").trim();
		if (tag === "example" && description) {
			examples.push(description);
		} else if (tag === "param" && name) {
			params.push({ name, type, description });
		} else if (tag === "returns" && type) {
			returns.push({ type, description });
		}
		current = undefined;
	};

	for (const line of inner) {
		const tagMatch = line.match(/^@(\w+)\s*(.*)$/);
		if (tagMatch) {
			flushCurrent();
			const [, tag = "", rest = ""] = tagMatch;
			if (tag === "param") {
				const [, type = "", name = "", description = ""] = requireMatch(rest, /^(?:\{([^}]+)\})?\s*(\S*)\s*(.*)$/);
				current = { tag: "param", lines: [description], type, name };
			} else if (tag === "returns" || tag === "return") {
				const [, type = "", description = ""] = requireMatch(rest, /^(?:\{([^}]+)\})?\s*(.*)$/);
				current = { tag: "returns", lines: description ? [description] : [], type };
			} else if (tag === "example") {
				current = { tag: "example", lines: rest ? [rest] : [] };
			} else {
				current = { tag, lines: rest ? [rest] : [] };
			}
			continue;
		}
		if (current) {
			current.lines.push(line);
		} else {
			lines.push(line);
		}
	}
	flushCurrent();

	return {
		...(lines.length ? { description: lines.join("\n").trim() } : undefined),
		...(params.length ? { params } : undefined),
		...(returns.length ? { returns } : undefined),
		...(params.length ? { params } : undefined),
	};
}
