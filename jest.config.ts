import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
	roots: ["<rootDir>"],
	collectCoverage: false,
	transform: {
		"^.+\\.(ts|tsx)$": "ts-jest",
	},
	testRegex: "\\.test\\.(ts|tsx|js|jsx)$",
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};

// eslint-disable-next-line import/no-default-export
export default config;
