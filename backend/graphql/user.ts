import { gql } from "apollo-server-core";
import { GraphQLContext } from "./schema";
import { PrismaClient, User } from "@prisma/client";
import { parseDatetime } from "../helpers/time";
import { createUser, findUserByCustomerID, findUserByID } from "../data/user";

const prisma = new PrismaClient();

export const userTypeDefs = gql`
  type User {
    id: ID!
    shopifyCustomerID: Int!
    name: String
    merchantID: ID!
    lifetimePoints: Int!
    currentPoints: Int!
    cooldownTime: String
  }

  extend type Query {
    findUserByID(id: ID!): User!
    findAllUsersToMerchant(merchantID: ID!): [User]!

    currentUser: User
  }
  extend type Mutation {
    createUser(shopifyCustomerID: Int!, merchantID: ID!, name: String!): User!
    updateUser(
      id: ID!
      merchantID: ID!
      name: String!
      lifetimePoints: Int!
      currentPoints: Int!
      cooldownTime: String
    ): User!
    deleteUser(id: ID!): ID!
  }
`;

interface userArgs {
  shopifyCustomerID: number;
  merchantID: string;
  name: string;
}

interface updateUserArgs {
  id: string;
  merchantID: string;
  name: string;
  lifetimePoints: number;
  currentPoints: number;
  cooldownTime: string | null;
}

interface findUserByIDArgs {
  id: string;
}

interface findUsersByMerchantArgs {
  merchantID: string;
}

export const userResolvers = {
  Query: {
    findUserByID: async (
      parent: any,
      args: findUserByIDArgs,
      context: GraphQLContext,
      info: any
    ): Promise<User | null> => {
      return await findUserByID(prisma, parseInt(args.id));
    },
    findAllUsersToMerchant: async (
      parent: any,
      args: findUsersByMerchantArgs,
      context: GraphQLContext,
      info: any
    ): Promise<User[] | null> => {
      return await prisma.user.findMany({
        where: {
          merchantId: parseInt(args.merchantID),
        },
      });
    },
    currentUser: async (parent: any, args: {}, context: GraphQLContext, info: any): Promise<User | null> => {
        if (context.customerID) {
            return findUserByCustomerID(context.prisma, context.customerID);
        }
        
        return null;
    }
  },
  Mutation: {
    createUser: async (
      parent: any,
      args: userArgs,
      context: GraphQLContext,
      info: any
    ): Promise<User> => {
      console.log(args);
      return await createUser(
        prisma,
        args.shopifyCustomerID,
        parseInt(args.merchantID),
        args.name
      );
    },
    updateUser: async (
      parent: any,
      args: updateUserArgs,
      context: GraphQLContext,
      info: any
    ): Promise<User> => {
      console.log(args);
      return await context.prisma.user.update({
        where: {
          id: parseInt(args.id),
        },
        data: {
          merchantId: parseInt(args.merchantID),
          name: args.name,
          lifetimePoints: args.lifetimePoints,
          currentPoints: args.currentPoints,
          cooldownTime: args.cooldownTime
            ? parseDatetime(args.cooldownTime)
            : null,
        },
      });
    },
    deleteUser: async (
      parent: any,
      args: { id: string },
      context: GraphQLContext,
      info: any
    ): Promise<User> => {
      return await context.prisma.user.delete({
        where: {
          id: parseInt(args.id),
        },
      });
    },
  },
};
