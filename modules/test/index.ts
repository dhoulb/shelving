import { Collection } from "../db/collection/Collection.js";
import { STRING } from "../schema/StringSchema.js";
import { BASIC_SCHEMA, type BasicData } from "./basics.js";
import { PERSON_SCHEMA, type PersonData } from "./people.js";

export * from "./basics.js";
export * from "./people.js";
export * from "./util.js";

export const BASICS_COLLECTION = new Collection<"basics", string, BasicData>("basics", STRING, BASIC_SCHEMA);
export const PEOPLE_COLLECTION = new Collection<"people", string, PersonData>("people", STRING, PERSON_SCHEMA);
