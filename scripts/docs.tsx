import { globSync } from "node:fs";
import { join } from "node:path";
import { Storybook } from "../modules/docs/components/Storybook.js";
import { writeDocs } from "../modules/docs/index.js";
import { getFileNode } from "../modules/docs/util/file.js";
import { nestPathNodes } from "../modules/docs/util/nodes.js";

// The CSS-modules plugin is registered via the `--preload` flag (see `bunfig.toml`).

const OUTPUT_PATH = join(process.cwd(), ".build/docs");

const paths = globSync("modules/**/*.{ts,tsx,md}", {
	exclude: ["modules/test/**/*", "**/*.test.ts", "**/*.test.tsx"],
});

// Strip the leading `modules/` so URLs match module-name root paths (e.g. `ui/block/Card`).
const files = await Promise.all(paths.map(async path => ({ ...(await getFileNode(path)), path: path.replace(/^modules\//, "") })));
const dirs = nestPathNodes(files);

await writeDocs(dirs, OUTPUT_PATH, [
	{
		path: "storybook",
		title: "UI library",
		lede: "Live examples of every component in shelving/ui.",
		body: <Storybook />,
	},
]);

process.stdout.write(`Docs written to ${OUTPUT_PATH}\n`);
