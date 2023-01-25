import { PrismaClient } from "@prisma/client";
import { join } from "path";
import { URL } from "url";
import { v4 } from "uuid";
import { execSync } from "child_process";

// I got the idea for this mock DB from https://blog.ludicroushq.com/a-better-way-to-run-integration-tests-with-prisma-and-postgresql

// NOTE: this is a bit slow as is. I've already spent a decent chunk of time trying to get it working at
// all though, so we'll have to use this for now

const generateDatabaseURL = (schema: string): string => {
	if (!process.env.DATABASE_URL) {
		throw new Error('please provide a DATABASE_URL environment variable');
	}
	const url = new URL(process.env.DATABASE_URL!);
	url.searchParams.append('schema', schema);
	return url.toString();
};

const schemaID = `test-${v4()}`;
const prismaBinary = join(__dirname, '..', 'node_modules', '.bin', 'prisma');

const url = generateDatabaseURL(schemaID);
process.env.DATABASE_URL = url;

export const prisma = new PrismaClient({
	datasources: { db: { url } },
});

beforeEach(function() {
	this.timeout(10000);

	execSync(`${prismaBinary} db push`, {
		env: {
			...process.env,
			DATABASE_URL: url,
		},
	});
});

afterEach(async function() {
	this.timeout(10000);

	await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaID}" CASCADE;`);
	await prisma.$disconnect();
});
