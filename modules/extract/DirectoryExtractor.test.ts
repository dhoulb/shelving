import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AbsolutePath } from "../util/path.js";
import type { TreeElement } from "../util/tree.js";
import { DirectoryExtractor } from "./DirectoryExtractor.js";

let root: string;

beforeAll(async () => {
	root = await mkdtemp(join(tmpdir(), "shelving-direxttest-"));
	// `util/` containing source files and a README.
	await mkdir(join(root, "util"), { recursive: true });
	await writeFile(join(root, "util", "string.ts"), "/** Strings. */ export const STR = 1;");
	await writeFile(join(root, "util", "string.md"), "# String\n\nGuide.");
	await writeFile(join(root, "util", "README.md"), "# Util\n\nIntro.");
	await writeFile(join(root, "util", "_internal.ts"), "export const X = 1;"); // ignored (underscore-prefixed)
	await writeFile(join(root, "util", "string.test.ts"), "import x;"); // ignored (test file)
	// `nested/sub/` containing a TS file.
	await mkdir(join(root, "nested", "sub"), { recursive: true });
	await writeFile(join(root, "nested", "sub", "thing.ts"), "export const X = 1;");
});

afterAll(async () => {
	await rm(root, { recursive: true, force: true });
});

describe("DirectoryExtractor", () => {
	test("produces a directory element with the directory name as key", async () => {
		const out = await new DirectoryExtractor().extract(root as AbsolutePath);
		expect(out.type).toBe("tree-element");
		expect(out.key).toBe(out.props.name);
	});

	test("keys files with the verbatim filename including extension", async () => {
		const out = await new DirectoryExtractor().extract(join(root, "util") as AbsolutePath);
		const keys = Array.from(out.props.children as Iterable<TreeElement>)
			.map(c => c.key)
			.sort();
		expect(keys).toEqual(["README.md", "string.md", "string.ts"]);
	});

	test("keys directories with the verbatim directory name", async () => {
		const out = await new DirectoryExtractor().extract(root as AbsolutePath);
		const kids = Array.from(out.props.children as Iterable<TreeElement>);
		const utilDir = kids.find(k => k.type === "tree-element" && k.key === "util");
		expect(utilDir).toBeDefined();
	});

	test("does NOT merge same-base sibling files (verbatim keys, no merging)", async () => {
		const out = await new DirectoryExtractor().extract(join(root, "util") as AbsolutePath);
		const kids = Array.from(out.props.children as Iterable<TreeElement>);
		// Both string.md and string.ts present as separate children — no merge.
		expect(kids.filter(k => k.key === "string.md")).toHaveLength(1);
		expect(kids.filter(k => k.key === "string.ts")).toHaveLength(1);
	});

	test("does NOT absorb README into the directory (no index handling)", async () => {
		const out = await new DirectoryExtractor().extract(join(root, "util") as AbsolutePath);
		// README.md is just another child, not absorbed.
		expect(out.props.content).toBeUndefined();
		expect(out.props.title).toBeUndefined();
		const kids = Array.from(out.props.children as Iterable<TreeElement>);
		expect(kids.some(k => k.key === "README.md")).toBe(true);
	});

	test("skips test files, underscore-prefixed files, and files with no matching extractor", async () => {
		const out = await new DirectoryExtractor().extract(join(root, "util") as AbsolutePath);
		const keys = Array.from(out.props.children as Iterable<TreeElement>).map(c => c.key);
		expect(keys).not.toContain("string.test.ts");
		expect(keys).not.toContain("_internal.ts");
	});

	test("recurses into subdirectories", async () => {
		const out = await new DirectoryExtractor().extract(join(root, "nested") as AbsolutePath);
		const kids = Array.from(out.props.children as Iterable<TreeElement>);
		expect(kids).toHaveLength(1);
		const sub = kids[0];
		expect(sub?.type).toBe("tree-element");
		expect(sub?.key).toBe("sub");
		const subKids = Array.from((sub?.props.children ?? []) as Iterable<TreeElement>);
		expect(subKids).toHaveLength(1);
		expect(subKids[0]?.key).toBe("thing.ts");
	});
});
