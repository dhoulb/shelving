import { SQL } from "bun";
import { BunPostgresProvider } from "../modules/bun/BunPostgresProvider.js";
import { PostgresMigrator } from "../modules/db/migrate/PostgresMigrator.js";
import { BASICS_COLLECTION } from "../modules/test/basics.js";
import { PEOPLE_COLLECTION } from "../modules/test/people.js";
import { getDelay } from "../modules/util/async.js";
import { BLACKHOLE } from "../modules/util/function.js";

// Runs the PostgreSQL provider test suite against a real server:
// 1. Waits for the PostgreSQL server at `POSTGRES_URL` (an admin/server connection, not the test database).
// 2. Drops and recreates a fresh test database, and makes the fixture tables with `PostgresMigrator`.
// 3. Runs `bun test ./modules/bun` with `POSTGRES_URL` pointing at the test database.
// 4. Drops the test database and exits with the test run's exit code.

// Constants.
const ADMIN_URL = process.env.POSTGRES_URL || "postgres://postgres:postgres@127.0.0.1:5432/postgres";
const DATABASE = "shelving-test";
const ATTEMPTS = 10;

/** Wait for the PostgreSQL server to accept connections, or throw with a hint for starting one. */
async function _awaitServer(): Promise<void> {
	for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
		if (attempt) await getDelay(1000);
		const admin = new SQL(ADMIN_URL);
		try {
			await admin`SELECT 1`;
			return;
		} catch {
			// Server not ready yet — retry.
		} finally {
			await admin.close().catch(BLACKHOLE);
		}
	}
	throw new Error(
		`No PostgreSQL server reachable at ${ADMIN_URL}\n` +
			`Start one with: docker run --rm -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:17\n` +
			`Or point POSTGRES_URL at an existing server.`,
	);
}

console.debug(`Waiting for PostgreSQL at ${ADMIN_URL}`);
await _awaitServer();

// Recreate the test database so every run starts from a clean slate.
const admin = new SQL(ADMIN_URL);
console.debug(`Creating database "${DATABASE}"`);
await admin`DROP DATABASE IF EXISTS ${admin(DATABASE)} WITH (FORCE)`;
await admin`CREATE DATABASE ${admin(DATABASE)}`;

// Make the fixture tables with `PostgresMigrator`, so the provider tests also prove the migrator's table layout.
const url = new URL(ADMIN_URL);
url.pathname = `/${DATABASE}`;
const databaseUrl = url.toString();
const db = new SQL(databaseUrl);
console.debug(`Creating fixture tables`);
await new PostgresMigrator(new BunPostgresProvider(db)).migrate(BASICS_COLLECTION, PEOPLE_COLLECTION);
await db.close();

// Run the provider tests against the test database.
console.debug(`Running bun test ./modules/bun`);
const test = Bun.spawn(["bun", "test", "./modules/bun"], {
	env: { ...process.env, POSTGRES_URL: databaseUrl },
	stdout: "inherit",
	stderr: "inherit",
});
const code = await test.exited;

// Tear down the test database (best-effort) and forward the test run's exit code.
await admin`DROP DATABASE IF EXISTS ${admin(DATABASE)} WITH (FORCE)`.catch(BLACKHOLE);
await admin.close().catch(BLACKHOLE);
process.exit(code);
