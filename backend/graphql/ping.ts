import { ApolloError, gql } from "apollo-server-core";
import { GraphQLContext } from "./schema";

// This is an example for how to create a basic GraphQL resolver. This file sets up a "ping" action that echoes whatever
// you give it back to you

export const pingTypeDefs = gql`
	type ShopifyStatus {
		shopURL: String
		customerID: Int
		sessionActive: Boolean!
	}

	extend type Query {
		ping(msg: String!): String!

		"""
		This is a resolver you can use to just check the Shopify context status.
		"""
		pingShopifyContext: ShopifyStatus!
	}
`

/**
 * These are the arguments for the ping resolver. You might notice that they're an exact mirror of the above schema in Typescript form.
 * It's good practice to define an interface with the arguments for each of your resolvers.
 *  */
interface PingArgs {
	/**
	 * The message that the user wants us to echo
	 */
	msg: string
}

interface ShopifyStatus {
	shopURL: string | null,
	customerID: number | null,
	sessionActive: boolean
}

export const pingResolvers = {
	Query: {
		ping: (parent: any, args: PingArgs, context: GraphQLContext, info: any): String => {
			// Since this is the example, I just want to make clear that you can get the Prisma connection through context.prisma			

			// Just as an example of using errors
			if (args.msg === "error") {
				throw new ApolloError("This is a test error");
			}
			
			return `Pong: ${args.msg}`
		},

		pingShopifyContext: (parent: any, args: {}, context: GraphQLContext, info: any): ShopifyStatus  => ({
			shopURL: context.shopURL,
			customerID: context.customerID,
			sessionActive: context.shopifySession ? true : false,	
		})
	},
}
