import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DirectoryExtractor, IndexExtractor, MergingExtractor, PackageExtractor } from "shelving/extract";
import type { AbsolutePath } from "shelving/util/path";
import type { TreeElement } from "shelving/util/tree";

/** Build a self-contained source tree on disk (independent per test, so concurrent runs don't collide). */
async function _setup(
	layout: (root: string) => Promise<void>,
): Promise<{ root: AbsolutePath; tree: TreeElement; cleanup: () => Promise<void> }> {
	const root = (await mkdtemp(join(tmpdir(), "shelving-pkgexttest-"))) as AbsolutePath;
	await layout(root);
	const tree = await new IndexExtractor(new MergingExtractor(new DirectoryExtractor())).extract(root);
	return {
		root,
		tree,
		cleanup: () => rm(root, { recursive: true, force: true }),
	};
}

async function _writePackageJson(
	root: string,
	exports: Record<string, string>,
	name = "test-pkg",
	description = "Test package.",
): Promise<AbsolutePath> {
	const path = join(root, "package.json");
	await writeFile(path, JSON.stringify({ name, description, exports }));
	return path as AbsolutePath;
}

async function _basicLayout(root: string): Promise<void> {
	await mkdir(join(root, "util"), { recursive: true });
	await writeFile(join(root, "util", "README.md"), "# Util\n\nUtil intro.");
	await writeFile(join(root, "util", "string.ts"), "/** Strings. */ export const STR = 1;");
	await writeFile(join(root, "util", "string.md"), "# String\n\nGuide for strings.");
	await writeFile(join(root, "util", "array.ts"), "export const ARR = [];");
	await mkdir(join(root, "api"), { recursive: true });
	await writeFile(join(root, "api", "index.ts"), "/** API. */ export const API = 1;");
	await mkdir(join(root, "firestore"), { recursive: true });
	await writeFile(join(root, "firestore", "client.ts"), "/** FS Client. */ export const C = 1;");
}

describe("PackageExtractor", () => {
	test("produces one kind=module child per static export, in declaration order", async () => {
		const { root, tree, cleanup } = await _setup(_basicLayout);
		try {
			const pkg = await _writePackageJson(root, {
				".": "./index.js",
				"./api": "./api/index.js",
				"./firestore/client": "./firestore/client.js",
			});
			const out = await new PackageExtractor({ tree }).extract(pkg);
			const kids = Array.from(out.props.children as Iterable<TreeElement>);
			expect(kids.map(k => k.props.name)).toEqual(["api", "firestore/client"]);
			for (const k of kids) {
				expect(k.type).toBe("tree-documentation");
				expect((k as { props: { kind?: string } }).props.kind).toBe("module");
			}
		} finally {
			await cleanup();
		}
	});

	test("prefixes each module title with the package name", async () => {
		const { root, tree, cleanup } = await _setup(_basicLayout);
		try {
			const pkg = await _writePackageJson(root, { "./api": "./api/index.js", "./util/*": "./util/*.js" }, "shelving");
			const out = await new PackageExtractor({ tree }).extract(pkg);
			const kids = Array.from(out.props.children as Iterable<TreeElement>);
			// `name` stays the bare subpath; `title` is prefixed with the package name.
			expect(kids.map(k => k.props.name).sort()).toEqual(["api", "util/array", "util/string"]);
			expect(kids.map(k => k.props.title).sort()).toEqual(["shelving/api", "shelving/util/array", "shelving/util/string"]);
		} finally {
			await cleanup();
		}
	});

	test("expands a wildcard export into one module per matching child", async () => {
		const { root, tree, cleanup } = await _setup(_basicLayout);
		try {
			const pkg = await _writePackageJson(root, { "./util/*": "./util/*.js" });
			const out = await new PackageExtractor({ tree }).extract(pkg);
			const names = Array.from(out.props.children as Iterable<TreeElement>).map(k => k.props.name);
			// Only .ts files become modules; README is absorbed; .md was merged away.
			expect(names.sort()).toEqual(["util/array", "util/string"]);
		} finally {
			await cleanup();
		}
	});

	test("uses package.json name and description on the root element", async () => {
		const { root, tree, cleanup } = await _setup(_basicLayout);
		try {
			const pkg = await _writePackageJson(root, { "./api": "./api/index.js" });
			const out = await new PackageExtractor({ tree }).extract(pkg);
			expect(out.props.name).toBe("test-pkg");
			expect(out.props.description).toBe("Test package.");
		} finally {
			await cleanup();
		}
	});

	test("throws when a static export has no matching source", async () => {
		const { root, tree, cleanup } = await _setup(_basicLayout);
		try {
			const pkg = await _writePackageJson(root, { "./does-not-exist": "./does-not-exist.js" });
			expect(new PackageExtractor({ tree }).extract(pkg)).rejects.toThrow(/does-not-exist/);
		} finally {
			await cleanup();
		}
	});

	test("respects custom extensions when resolving exports to source files", async () => {
		const { TypescriptExtractor } = await import("shelving/extract");
		const { root, tree, cleanup } = await _setup(async r => {
			await mkdir(join(r, "api"), { recursive: true });
			await writeFile(join(r, "api", "mts-only.mts"), "export const X = 1;");
		}).then(async ({ root, cleanup }) => {
			// Re-extract with a custom DirectoryExtractor that recognises .mts files.
			const tree = await new IndexExtractor(
				new MergingExtractor(new DirectoryExtractor({ extractors: { mts: new TypescriptExtractor() } })),
			).extract(root);
			return { root, tree, cleanup };
		});
		try {
			const pkg = await _writePackageJson(root, { "./api/mts-only": "./api/mts-only.mjs" });
			const out = await new PackageExtractor({ tree, extensions: { mjs: ["mts", "ts"] } }).extract(pkg);
			const kids = Array.from(out.props.children as Iterable<TreeElement>);
			expect(kids).toHaveLength(1);
			expect(kids[0]?.props.name).toBe("api/mts-only");
		} finally {
			await cleanup();
		}
	});

	test("merged .md content shows up on the module's body", async () => {
		const { root, tree, cleanup } = await _setup(_basicLayout);
		try {
			const pkg = await _writePackageJson(root, { "./util/*": "./util/*.js" });
			const out = await new PackageExtractor({ tree }).extract(pkg);
			const stringMod = Array.from(out.props.children as Iterable<TreeElement>).find(k => k.props.name === "util/string");
			// `string.md` was merged into `string.ts`; the .md body should appear in the module's content.
			expect(stringMod?.props.content).toContain("Guide for strings.");
		} finally {
			await cleanup();
		}
	});
});
