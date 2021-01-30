module.exports = {
	roots: ["<rootDir>"],
	collectCoverage: false,
	transform: {
		"^.+\\.(ts|tsx)$": "ts-jest",
	},
	testRegex: "\\.test\\.(ts|tsx|js|jsx)$",
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};
