import { expect } from "chai";
import { prisma as PrismaClient } from "../data/mockDB";
import { createGraphQLServer } from "./schema";

describe('The ping resolver', async () => {
	const prisma = PrismaClient;
	const testServer = createGraphQLServer(prisma);
	
	it('echoes back the input I give it', async () => {
		const result = await testServer.executeOperation({
			query: `
				query EchoMessage($msg: String!) {
					ping(msg: $msg)
				}`,
			variables: { msg: "hello" },
		});

		expect(result.errors).to.be.undefined;
		expect(result.data?.ping).to.be.eq("Pong: hello");
	})

	it('throws an error when I tell it to', async () => {
		const result = await testServer.executeOperation({
			query: `
				query EchoMessage($msg: String!) {
					ping(msg: $msg)
				}`,
			variables: { msg: "error" },
		});

		expect(result.errors).to.not.be.undefined;
		expect(result.errors).to.have.length(1);
		expect(result.errors?.[0]?.message).to.be.eq("This is a test error")
	})
})
