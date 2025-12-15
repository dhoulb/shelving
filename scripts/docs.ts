import { globSync } from "node:fs";
import { join } from "node:path";
import { writeDocs } from "../modules/docs/index.js";
import { getFileNode } from "../modules/docs/util/file.js";
import { nestPathNodes } from "../modules/docs/util/nodes.js";

const OUTPUT_PATH = join(process.cwd(), "./.build/docs");

const paths = globSync("./modules/**/*.{ts,tsx,js,jsx,md}", {
	exclude: ["./modules/test/**/*"],
});

const files = await Promise.all(paths.map(getFileNode));

const dirs = nestPathNodes(files);

await writeDocs(dirs, OUTPUT_PATH);

process.stdout.write(`Docs written to ${OUTPUT_PATH}`);
