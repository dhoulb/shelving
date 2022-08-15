import { AddChange, Datas, DataUpdate, SetChange, UpdateChange, DeleteChange, ItemChanges, WriteChanges } from "../index.js";

test("Typescript", () => {
	type T = { myCollection1: { myProp1: number }; myCollection2: { myProp2: number } };

	const addTyped: AddChange<T, "myCollection1"> = { action: "ADD", collection: "myCollection1", data: { myProp1: 123 } };
	const addAll: AddChange<T> = addTyped;
	const addUntyped: AddChange<Datas> = addTyped;

	const setTyped: SetChange<T, "myCollection1"> = { action: "SET", collection: "myCollection1", id: "abc", data: { myProp1: 123 } };
	const setAll: SetChange<T> = setTyped;
	const setUntyped: SetChange<Datas> = setTyped;

	const updateTyped: UpdateChange<T, "myCollection1"> = { action: "UPDATE", collection: "myCollection1", id: "abc", updates: { myProp1: 123 } };
	const updateAll: UpdateChange<T> = updateTyped;
	const updateUntyped: UpdateChange<Datas> = updateTyped;

	const deleteTyped: DeleteChange<T, "myCollection1"> = { action: "DELETE", collection: "myCollection1", id: "abc" };
	const deleteAll: DeleteChange<T> = deleteTyped;
	const deleteUntyped: DeleteChange<Datas> = deleteTyped;

	const itemChanges: ItemChanges<T> = [setTyped, updateTyped, deleteTyped];

	const writeChanges: WriteChanges<T> = [addTyped, setTyped, updateTyped, deleteTyped];
});
