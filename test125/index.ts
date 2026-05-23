import index from "./index.html";

const server = Bun.serve({
	port: 3125,
	development: true,
	routes: { "/": index },
});

console.warn(`Test #125 site running at ${server.url}`);
