/** @type import("@jest/types").Config.InitialOptions */
const config = {
	roots: ["./dist"],
	collectCoverage: false,
	// transform: {
	// 	"^.+\\.(ts|tsx)$": "ts-jest",
	// },
	transform: {}, // Disable Babel transformations.
	testRegex: "\\.test\\.js$",
	moduleDirectories: ["node_modules", "dist"],
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};
module.exports = config;
