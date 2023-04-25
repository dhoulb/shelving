import type { DataProp, FlatData, FlatDataProp } from "../index.js";
import { Data } from "../index.js";

test("Typescript", () => {
	type T = {
		readonly a: {
			readonly a1: number;
			readonly a2: { readonly a2a: boolean };
		};
		readonly g: string;
	};

	const a: {
		readonly "a.a1": number;
		readonly "a.a2.a2a": boolean;
		readonly "g": string;
	} = undefined as unknown as FlatData<T>;

	const b: ["a.a1", number] | ["a.a2.a2a", boolean] | ["g", string] = undefined as unknown as FlatDataProp<T>;

	const d: ["a", { readonly a1: number; readonly a2: { readonly a2a: boolean } }] | ["g", string] = undefined as unknown as DataProp<T>;
});
