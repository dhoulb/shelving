import { expect, test } from "bun:test";
import { MARKUP_RULES, renderMarkup } from "../index.js";

const $$typeof = Symbol.for("react.transitional.element");
const OPTIONS = { rules: MARKUP_RULES };

test("table renders thead and tbody with th and td cells", () => {
	expect(renderMarkup("| A | B |\n| --- | --- |\n| 1 | 2 |", OPTIONS)).toMatchObject({
		$$typeof,
		type: "table",
		props: {
			children: [
				{
					$$typeof,
					type: "thead",
					props: {
						children: [
							{
								$$typeof,
								type: "tr",
								props: {
									children: [
										{ $$typeof, type: "th", props: { children: "A" } },
										{ $$typeof, type: "th", props: { children: "B" } },
									],
								},
							},
						],
					},
				},
				{
					$$typeof,
					type: "tbody",
					props: {
						children: [
							{
								$$typeof,
								type: "tr",
								props: {
									children: [
										{ $$typeof, type: "td", props: { children: "1" } },
										{ $$typeof, type: "td", props: { children: "2" } },
									],
								},
							},
						],
					},
				},
			],
		},
	});
});

test("table outer pipes are optional", () => {
	expect(renderMarkup("A | B\n--- | ---\n1 | 2", OPTIONS)).toMatchObject({
		type: "table",
		props: {
			children: [
				{
					type: "thead",
					props: {
						children: [
							{
								type: "tr",
								props: {
									children: [
										{ type: "th", props: { children: "A" } },
										{ type: "th", props: { children: "B" } },
									],
								},
							},
						],
					},
				},
				{
					type: "tbody",
					props: {
						children: [
							{
								type: "tr",
								props: {
									children: [
										{ type: "td", props: { children: "1" } },
										{ type: "td", props: { children: "2" } },
									],
								},
							},
						],
					},
				},
			],
		},
	});
});

test("table is forgiving of whitespace and delimiter dash length", () => {
	const expected = {
		type: "table",
		props: {
			children: [
				{
					type: "thead",
					props: {
						children: [
							{
								type: "tr",
								props: {
									children: [
										{ type: "th", props: { children: "A" } },
										{ type: "th", props: { children: "B" } },
									],
								},
							},
						],
					},
				},
				{
					type: "tbody",
					props: {
						children: [
							{
								type: "tr",
								props: {
									children: [
										{ type: "td", props: { children: "1" } },
										{ type: "td", props: { children: "2" } },
									],
								},
							},
						],
					},
				},
			],
		},
	};
	expect(renderMarkup("|A|B|\n|-|-|\n|1|2|", OPTIONS)).toMatchObject(expected);
	expect(renderMarkup("|   A   |   B   |\n| -------- | -------- |\n|   1   |   2   |", OPTIONS)).toMatchObject(expected);
});

test("table renders a tfoot from a second delimiter row", () => {
	expect(renderMarkup("| H |\n| --- |\n| B |\n| --- |\n| F |", OPTIONS)).toMatchObject({
		type: "table",
		props: {
			children: [
				{ type: "thead", props: { children: [{ type: "tr", props: { children: [{ type: "th", props: { children: "H" } }] } }] } },
				{ type: "tbody", props: { children: [{ type: "tr", props: { children: [{ type: "td", props: { children: "B" } }] } }] } },
				{ type: "tfoot", props: { children: [{ type: "tr", props: { children: [{ type: "td", props: { children: "F" } }] } }] } },
			],
		},
	});
});

test("table renders separate tbody sections when there are four sections", () => {
	expect(renderMarkup("| H |\n| --- |\n| B1 |\n| --- |\n| B2 |\n| --- |\n| F |", OPTIONS)).toMatchObject({
		type: "table",
		props: {
			children: [
				{ type: "thead", props: { children: [{ type: "tr", props: { children: [{ type: "th", props: { children: "H" } }] } }] } },
				{ type: "tbody", props: { children: [{ type: "tr", props: { children: [{ type: "td", props: { children: "B1" } }] } }] } },
				{ type: "tbody", props: { children: [{ type: "tr", props: { children: [{ type: "td", props: { children: "B2" } }] } }] } },
				{ type: "tfoot", props: { children: [{ type: "tr", props: { children: [{ type: "td", props: { children: "F" } }] } }] } },
			],
		},
	});
});

test("header-only table renders an empty tbody", () => {
	expect(renderMarkup("| H |\n| --- |", OPTIONS)).toMatchObject({
		type: "table",
		props: {
			children: [
				{ type: "thead", props: { children: [{ type: "tr", props: { children: [{ type: "th", props: { children: "H" } }] } }] } },
				{ type: "tbody", props: { children: [] } },
			],
		},
	});
});

test("table escaped pipes are literal within a cell", () => {
	expect(renderMarkup("| A | B |\n| --- | --- |\n| x \\| y | z |", OPTIONS)).toMatchObject({
		type: "table",
		props: {
			children: [
				{
					type: "thead",
					props: {
						children: [
							{
								type: "tr",
								props: {
									children: [
										{ type: "th", props: { children: "A" } },
										{ type: "th", props: { children: "B" } },
									],
								},
							},
						],
					},
				},
				{
					type: "tbody",
					props: {
						children: [
							{
								type: "tr",
								props: {
									children: [
										{ type: "td", props: { children: "x | y" } },
										{ type: "td", props: { children: "z" } },
									],
								},
							},
						],
					},
				},
			],
		},
	});
});

test("table supports empty cells", () => {
	expect(renderMarkup("| A | B | C |\n| --- | --- | --- |\n| 1 |  | 3 |", OPTIONS)).toMatchObject({
		type: "table",
		props: {
			children: [
				{ type: "thead" },
				{
					type: "tbody",
					props: {
						children: [
							{
								type: "tr",
								props: {
									children: [
										{ type: "td", props: { children: "1" } },
										{ type: "td", props: { children: null } },
										{ type: "td", props: { children: "3" } },
									],
								},
							},
						],
					},
				},
			],
		},
	});
});

test("table renders inline markup inside cells", () => {
	expect(renderMarkup("| A |\n| --- |\n| **bold** |", OPTIONS)).toMatchObject({
		type: "table",
		props: {
			children: [
				{ type: "thead" },
				{
					type: "tbody",
					props: {
						children: [
							{ type: "tr", props: { children: [{ type: "td", props: { children: { type: "strong", props: { children: "bold" } } } }] } },
						],
					},
				},
			],
		},
	});
});

test("table pads and truncates ragged rows to the header column count", () => {
	expect(renderMarkup("| A | B | C |\n| --- | --- | --- |\n| 1 | 2 |\n| w | x | y | z |", OPTIONS)).toMatchObject({
		type: "table",
		props: {
			children: [
				{ type: "thead" },
				{
					type: "tbody",
					props: {
						children: [
							{
								type: "tr",
								props: {
									children: [
										{ type: "td", props: { children: "1" } },
										{ type: "td", props: { children: "2" } },
										{ type: "td", props: { children: null } },
									],
								},
							},
							{
								type: "tr",
								props: {
									children: [
										{ type: "td", props: { children: "w" } },
										{ type: "td", props: { children: "x" } },
										{ type: "td", props: { children: "y" } },
									],
								},
							},
						],
					},
				},
			],
		},
	});
});

test("table applies column alignment from the delimiter row", () => {
	expect(renderMarkup("| L | C | R |\n| :-- | :-: | --: |\n| 1 | 2 | 3 |", OPTIONS)).toMatchObject({
		type: "table",
		props: {
			children: [
				{
					type: "thead",
					props: {
						children: [
							{
								type: "tr",
								props: {
									children: [
										{ type: "th", props: { children: "L" } },
										{ type: "th", props: { align: "center", children: "C" } },
										{ type: "th", props: { align: "right", children: "R" } },
									],
								},
							},
						],
					},
				},
				{
					type: "tbody",
					props: {
						children: [
							{
								type: "tr",
								props: {
									children: [
										{ type: "td", props: { children: "1" } },
										{ type: "td", props: { align: "center", children: "2" } },
										{ type: "td", props: { align: "right", children: "3" } },
									],
								},
							},
						],
					},
				},
			],
		},
	});
});

test("a block of pipe lines with no delimiter row is not a table", () => {
	expect(renderMarkup("| a | b |\n| c | d |", OPTIONS)).toMatchObject({ type: "p" });
});

test("table renders alongside other blocks", () => {
	const result = renderMarkup("Before.\n\n| H |\n| --- |\n| C |\n\nAfter.", OPTIONS);
	expect(Array.isArray(result)).toBe(true);
	expect(result).toMatchObject([{ type: "p" }, { type: "table" }, { type: "p" }]);
});
