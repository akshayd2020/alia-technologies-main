import { prisma } from "./mockDB"; // Import this in all of your DB tests
import { expect } from "chai";
import { createMerchant, findMerchantByID, } from "./merchant";

describe('createMerchant', async () => {
	it('creates a new merchant with the specified info', async () => {
		const newMerchant = await createMerchant(prisma, "Test merchant", "google.com");

		expect(newMerchant.title).to.be.eq("Test merchant");
		expect(newMerchant.url).to.be.eq("google.com");
	});
});

describe('getMerchant', async () => {
	it('returns null when no such merchant exists', async () => {
		const possibleMerchant = await findMerchantByID(prisma, 0);

		expect(possibleMerchant).to.be.null;
	})
})