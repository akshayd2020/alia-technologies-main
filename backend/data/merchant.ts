import { Merchant, PrismaClient } from "@prisma/client"

// These functions are mostly just examples so you see how to implement database functions that
// interface with Prisma, as well as how to test them

// The database functions we end up created will generally be much more complicated, and will involve
// creating child rows also (ie creating a Content involves creating it's question)

/**
 * Creates a new merchant with the given `title` and `url`.
 * @param prisma the Prisma database object
 * @param title the merchant's title
 * @param url the URL to the merchant's Shopify store
 * @returns the value of the merchant row created in the database
 */
export const createMerchant = async function (
  prisma: PrismaClient,
  title: string,
  url: string
): Promise<Merchant> {
  return await prisma.merchant.create({
    data: {
      title: title,
      url: url,
      createdAt: new Date(),
    },
  });
};

/**
 * Attempts to find the merchant with the given `id`.
 * @param prisma the Prisma database object
 * @param id the merchant's id
 * @returns either the corresponding merchant row if it exists, or null
 */
export const findMerchantByID = async function(prisma: PrismaClient, id: number): Promise<Merchant | null> {
	return await prisma.merchant.findFirst({
		where: {
			id: id,
		},
	});
}

export const findMerchantByURL = async function(prisma: PrismaClient, shopURL: string): Promise<Merchant | null> {
	return await prisma.merchant.findFirst({
		where: {
			url: shopURL,
		},
	});
}
