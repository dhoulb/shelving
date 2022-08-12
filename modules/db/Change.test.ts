import { Datas } from "../index.js";
import { SetChange } from "./Change.js";

test("Typescript", () => {
	type T = { myCollection: { myProp: number } };
	const setTyped: SetChange<T> = { action: "SET", collection: "myCollection", id: "abc", data: { myProp: 123 } };
	const setUntyped: SetChange<Datas> = setTyped;
});
