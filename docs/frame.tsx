/**
 * Browser entry point of the playground frame page (`frame.html`).
 *
 * The frame runs TSX from its URL hash (see `formatPlaygroundHash()`), all in the browser:
 * 1. Load the TypeScript compiler from esm.sh (only once, and only when there is code to run).
 * 2. Wrap the code so each top-level expression becomes an element to show (see `wrapCode()`).
 * 3. Transpile the code to JavaScript, and import it as a module from a `blob:` URL. The page's import map
 *    resolves `shelving/*`, `react`, and `react-dom`, and any other import fails.
 * 4. Render the elements into `#root`, and post the content height to the parent page.
 *
 * This file is bundled with `shelving/*`, `react`, and `react-dom` kept external, so the frame and the code it
 * runs share one copy of each, from the import map.
 */

import { createElement, Fragment, isValidElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Catcher, ErrorNotice, PLAYGROUND_HEIGHT_MESSAGE, parsePlaygroundHash } from "shelving/ui";

/** URL of the TypeScript compiler, replaced at build time (see `docs/build.tsx`). */
declare const TYPESCRIPT_URL: string;

/** The parts of the TypeScript compiler API that the frame uses. */
interface TypeScript {
	createSourceFile(name: string, text: string, target: number, parents: boolean, kind: number): { statements: readonly TypeScriptNode[] };
	isExpressionStatement(node: TypeScriptNode): node is TypeScriptNode & { expression: TypeScriptNode };
	isBinaryExpression(
		node: TypeScriptNode,
	): node is TypeScriptNode & { left: TypeScriptNode; operatorToken: TypeScriptNode; right: TypeScriptNode };
	transpileModule(code: string, options: { compilerOptions: Record<string, unknown>; fileName: string }): { outputText: string };
	ScriptTarget: { ES2022: number; Latest: number };
	ScriptKind: { TSX: number };
	ModuleKind: { ESNext: number };
	JsxEmit: { ReactJSX: number };
}
interface TypeScriptNode {
	getStart(): number;
	getEnd(): number;
}

/** Name of the array that collects the elements to show. */
const ELEMENTS = "__elements";

let _typescript: Promise<TypeScript> | undefined;
function _loadTypeScript(): Promise<TypeScript> {
	_typescript ||= import(TYPESCRIPT_URL).then(m => (m.default ?? m) as TypeScript);
	return _typescript;
}

/**
 * Wrap code so each top-level expression statement is collected as an element to show.
 * - `<Button>Hi</Button>` becomes `__elements.push(<Button>Hi</Button>);`, so a snippet does not need a `return` or an export.
 * - Elements next to each other (`<A />` then `<B />` on the next line) are not valid TSX, so TypeScript reads them as one
 *   expression joined by a missing comma. Each part of that expression is collected as its own element.
 * - Imports, functions, and other statements are left as they are.
 */
function wrapCode(ts: TypeScript, code: string): string {
	const file = ts.createSourceFile("example.tsx", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	let output = "";
	let last = 0;
	for (const statement of file.statements) {
		if (!ts.isExpressionStatement(statement)) continue;
		const parts = _splitMissingCommas(ts, statement.expression).map(part => code.slice(part.getStart(), part.getEnd()));
		output += `${code.slice(last, statement.getStart())}${ELEMENTS}.push(${parts.join(", ")});`;
		last = statement.getEnd();
	}
	return `const ${ELEMENTS} = [];\n${output}${code.slice(last)}\nexport { ${ELEMENTS} };\n`;
}

/** Split an expression at each comma that TypeScript added because the comma was missing (it has no width in the source). */
function _splitMissingCommas(ts: TypeScript, node: TypeScriptNode): TypeScriptNode[] {
	if (ts.isBinaryExpression(node) && node.operatorToken.getStart() === node.operatorToken.getEnd())
		return [..._splitMissingCommas(ts, node.left), ..._splitMissingCommas(ts, node.right)];
	return [node];
}

/** Transpile and import code, and return the elements it shows. */
async function runCode(code: string): Promise<ReactNode> {
	const ts = await _loadTypeScript();
	const { outputText } = ts.transpileModule(wrapCode(ts, code), {
		fileName: "example.tsx",
		compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
	});
	const url = URL.createObjectURL(new Blob([outputText], { type: "text/javascript" }));
	try {
		const module = (await import(url)) as { __elements: unknown[]; default?: unknown };
		const shown: unknown[] = [...module.__elements];
		// A snippet can also export a component or an element as its default.
		if (typeof module.default === "function") shown.push(createElement(module.default as () => ReactNode));
		else if (isValidElement(module.default)) shown.push(module.default);
		return createElement(Fragment, null, ...(shown as ReactNode[]));
	} finally {
		URL.revokeObjectURL(url);
	}
}

/** Get an element of the frame page, or throw if it is missing. */
function _requireElement(id: string): HTMLElement {
	const el = document.getElementById(id);
	if (!el) throw new ReferenceError(`Frame page needs a #${id} element`);
	return el;
}

// Elements.
const root = _requireElement("root");
const style = _requireElement("css");
const reactRoot = createRoot(root);

/** Run the code and CSS in the current URL hash. */
async function run(): Promise<void> {
	const { code = "", css = "" } = parsePlaygroundHash(window.location.hash);
	style.textContent = css;
	let content: ReactNode;
	try {
		content = code.trim() ? await runCode(code) : null;
	} catch (thrown) {
		content = <ErrorNotice reason={thrown} />;
	}
	// A new key makes a fresh `<Catcher>` for each run, so an error from the last run is cleared.
	reactRoot.render(<Catcher key={Math.random()}>{content}</Catcher>);
}

// Post the content height to the parent page, so it can make the frame fit.
let height = 0;
new ResizeObserver(() => {
	const next = Math.ceil(root.getBoundingClientRect().bottom + window.scrollY);
	if (next === height) return;
	height = next;
	window.parent.postMessage({ type: PLAYGROUND_HEIGHT_MESSAGE, height }, "*");
}).observe(root);

window.addEventListener("hashchange", () => void run());
void run();
