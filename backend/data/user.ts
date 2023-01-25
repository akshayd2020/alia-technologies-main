import { User, PrismaClient } from "@prisma/client";
import { currentTime } from "../helpers/time";

/**
 * Creates a new user with the given details.
 * @param prisma the Prisma database object
 * @param shopifyCustomerId the customerID in Shopify
 * @param merchantId merchant foreign key
 * @param name of the user
 * @param password user's password
 * @param lifetimePoints the user's total lifetime points earned
 * @param currentPoints the user's current number of points
 * @param coolDownTime the user's cooldown time between lessons
 * @returns the value of the user row created in the database
 */
export const createUser = async function (
  prisma: PrismaClient,
  shopifyCustomerID: number,
  merchantId: number,
  name: string,
  lifetimePoints = 0,
  currentPoints = 0,
  cooldownTime = null
): Promise<User> {
  return await prisma.user.create({
    data: {
      shopifyCustomerID: shopifyCustomerID,
      merchantId: merchantId,
      name: name,
      lifetimePoints: lifetimePoints,
      currentPoints: currentPoints,
      cooldownTime: cooldownTime,
    },
  });
};

/**
 * Attempts to find the merchant with the given `id`.
 * @param prisma the Prisma database object
 * @param id the user's id
 * @returns either the corresponding user row if it exists, or null
 */
export const findUserByID = async function (
  prisma: PrismaClient,
  id: number
): Promise<User | null> {
  return await prisma.user.findFirst({
    where: {
      id: id,
    },
  });
};

export const findUserByCustomerID = async function (
  prisma: PrismaClient,
  customerID: number
): Promise<User | null> {
  return await prisma.user.findFirst({
    where: {
      shopifyCustomerID: customerID,
    },
  });
};
