import { expect, test } from "bun:test";
import { MarkupParser } from "../index.js";

const PARSER = new MarkupParser();

test("table renders thead and tbody with th and td cells", () => {
	expect(PARSER.parse("| A | B |\n| --- | --- |\n| 1 | 2 |")).toMatchObject({
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

test("table outer pipes are optional", () => {
	expect(PARSER.parse("A | B\n--- | ---\n1 | 2")).toMatchObject({
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
	expect(PARSER.parse("|A|B|\n|-|-|\n|1|2|")).toMatchObject(expected);
	expect(PARSER.parse("|   A   |   B   |\n| -------- | -------- |\n|   1   |   2   |")).toMatchObject(expected);
});

test("table renders a tfoot from a second delimiter row", () => {
	expect(PARSER.parse("| H |\n| --- |\n| B |\n| --- |\n| F |")).toMatchObject({
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
	expect(PARSER.parse("| H |\n| --- |\n| B1 |\n| --- |\n| B2 |\n| --- |\n| F |")).toMatchObject({
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
	expect(PARSER.parse("| H |\n| --- |")).toMatchObject({
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
	expect(PARSER.parse("| A | B |\n| --- | --- |\n| x \\| y | z |")).toMatchObject({
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
	expect(PARSER.parse("| A | B | C |\n| --- | --- | --- |\n| 1 |  | 3 |")).toMatchObject({
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
	expect(PARSER.parse("| A |\n| --- |\n| **bold** |")).toMatchObject({
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
	expect(PARSER.parse("| A | B | C |\n| --- | --- | --- |\n| 1 | 2 |\n| w | x | y | z |")).toMatchObject({
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
	expect(PARSER.parse("| L | C | R |\n| :-- | :-: | --: |\n| 1 | 2 | 3 |")).toMatchObject({
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
	expect(PARSER.parse("| a | b |\n| c | d |")).toMatchObject({ type: "p" });
});

test("table renders alongside other blocks", () => {
	const result = PARSER.parse("Before.\n\n| H |\n| --- |\n| C |\n\nAfter.");
	expect(Array.isArray(result)).toBe(true);
	expect(result).toMatchObject([{ type: "p" }, { type: "table" }, { type: "p" }]);
});
