import { gql } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import merge from "lodash.merge";
import { completionTypeDefs, completionResolvers } from "./completion";
import { pingTypeDefs } from "./ping";
import { pingResolvers } from "./ping";
import { PrismaClient } from "@prisma/client";
import { lessonResolver, lessonTypeDefs } from "./lesson";
import { merchantResolver, merchantTypeDefs } from "./merchant";
import { contentResolver, contentTypeDefs } from "./content";

import { Session } from "@shopify/shopify-api/dist/auth/session";
import Shopify from "@shopify/shopify-api";
import { userTypeDefs, userResolvers } from "./user";
import { rewardResolvers, rewardTypeDefs } from "./reward";

// This sets up the root types. Then, in each specific type we can extend them for more flexibility in how we lay out our schema.
// Check the `ping.ts` file for an example of how to set up a new resolver.
const baseTypes = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

// Add any other GraphQL types you define to this array
// lessonTypeDefs
const typeDefs = [
  baseTypes,
  pingTypeDefs,
  merchantTypeDefs,
  lessonTypeDefs,
  contentTypeDefs,
  userTypeDefs,
  completionTypeDefs,
  rewardTypeDefs,
];

// Add any other resolvers you create here, right after `pingResolvers
const resolvers = merge(
  pingResolvers,
  merchantResolver,
  lessonResolver,
  contentResolver,
  userResolvers,
  completionResolvers,
  rewardResolvers,
);

export interface GraphQLContext {
  prisma: PrismaClient;
  shopifySession: Session | null;
  customerID: number | null;
  shopURL: string | null;
  userID: number | null;
  merchantID: number | null;
}

export const createGraphQLServer = (prisma: PrismaClient): ApolloServer => {
  return new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }): Promise<GraphQLContext> => {
      // This parses out the query params that we get from https://shopify.dev/apps/online-store/app-proxies and puts them into the GraphQL context

      let ctx: GraphQLContext = {
        prisma,
        shopifySession: null,
        customerID: null,
        shopURL: null,
        userID: null,
        merchantID: null,
      };

      if (req?.query["logged_in_customer_id"] !== undefined) {
        const idNum = parseInt(String(req.query["logged_in_customer_id"]));

        if (!isNaN(idNum)) {
          ctx.customerID = idNum;

          // Try and find the corresponding User in our database
          const user = await prisma.user.findFirst({
            where: {
              shopifyCustomerID: ctx.customerID,
            }
          });

          if (user) {
            // We found one!
            ctx.userID = user.id;
          }
        }
      }

      if (req?.query["shop"] !== undefined) {
        ctx.shopURL = String(req.query["shop"]);

        // Tries to load the cached session token from the database
        // I found this function here: https://github.com/Shopify/shopify-api-node/blob/main/docs/usage/oauth.md
        let session = await Shopify.Utils.loadOfflineSession(ctx.shopURL);
        ctx.shopifySession = session || null; // Need to coalesce undefined to null

        // Try and find the merchant in our database identified by their shop URL
        const merchant = await prisma.merchant.findFirst({
          where: {
            url: ctx.shopURL,
          }
        });

        if (merchant) {
          // We found a match, let's remember the merchantID for later
          ctx.merchantID = merchant.id;
        }
      }

      return ctx;
    },
  });
};
