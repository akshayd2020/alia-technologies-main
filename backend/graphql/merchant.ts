import { Lesson, Merchant, PrismaClient } from "@prisma/client"
import {GraphQLContext} from "./schema";
import { gql } from "apollo-server-core";

export const merchantTypeDefs = gql` 
    type Merchant {
        id: ID!
        title: String!
        url: String!
    }
    input MerchantData {
        title: String
        url: String
    }

    extend type Query {
        findMerchantbyID(id: ID!): Merchant
    }
    extend type Mutation {
        createMerchant(title: String!, url: String!): Merchant!
    }

    extend type Merchant {
        lessons: [Lesson!]!
    }
`

interface createMerchantData {
    title: string
    url: string

}
interface findMerchantArgs {
    id: number
}

export const merchantResolver = {
    Query: {
        findMerchantbyID: async (parent: any, args: findMerchantArgs, context: GraphQLContext, info: any): Promise<Merchant | null> => {
            const id = +args.id;
            return await context.prisma.merchant.findUnique({
                where: {
                    id: id
                }
            })
        }
    },

    Mutation: {
        createMerchant: async (parent: any, args: createMerchantData, context: GraphQLContext, info: any): Promise<Merchant | null> => {
            return await context.prisma.merchant.create({
                data: {
                    title: args.title,
                    url: args.url
                }
            })
        }
    },

    Merchant: {
        lessons: async (parent: Merchant, args: {}, context: GraphQLContext, info: any): Promise<Lesson[]> => {
            let merchant = await context.prisma.merchant.findFirst({
                where: {
                    id: parent.id
                },
                include: {
                    lessons: {
                        orderBy: {
                            index: 'asc'
                        },
                    }
                }
            });

            return merchant?.lessons || [];
        }
    }
}
