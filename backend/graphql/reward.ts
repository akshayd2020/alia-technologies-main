import { Reward, PrismaClient, ClaimedReward, User } from "@prisma/client";
import {
  ApolloError,
  ApolloServerPluginUsageReportingDisabled,
  gql,
} from "apollo-server-core";
import { findMerchantByID } from "../data/merchant";
import {addCustomerToDiscount, findAvailableRewards, updateDiscount} from "../data/reward";
import { GraphQLContext } from "./schema";
import { userResolvers } from "./user";

export const rewardTypeDefs = gql`
  type Reward {
    id: ID!
    merchantId: Int!
    pointCost: Int!
    rewardVal: Int
    rewardPer: Float
    enabled: Boolean!
    userCapacity: Int
    deletedAt: String
  }

  type ClaimedReward {
    id: ID!
    createdAt: String!
    reward: Reward!
  }

  extend type Query {
    # all rewards which haven't been "deleted"
    getMerchantRewards(merchantID: ID!): [Reward!]!

  }

  extend type User {
    # finds all rewards which are "enabled", have a null deletedAt, and have at least
    # one remaining "userCapacity" (basically a way to optionally control how
    # many times a user can claim each reward. Calculated by #claimedReward
    # (with the same id) - userCapacity
    availableRewards: [Reward!]!

    claimedRewards: [ClaimedReward!]!
  }

  # a special type that can be passed as ... input
  input RewardData {
    merchantID: ID!
    pointCost: Int!
    rewardVal: Int
    rewardPer: Int
    enabled: Boolean!
    userCapacity: Int
  }

  extend type Mutation {
    createReward(rewardData: RewardData!): Reward!

    # note: this is a complete update, in contrast to a partial update. Basically just overwrite all of the fields
    # and set them to what's passed in here
    updateReward(id: ID!, data: RewardData!): Reward!

    # note: this is a "soft delete". It doesn't actually delete anything, but
    # instead sets the deletedAt column to the current time
    # also, GraphQL requires us to return something from this, so right now
    # it just echoes the id you give it
    deleteReward(id: ID!): ID!

    # attempts to claim the reward for the given user, following pretty much the
    # same logic as for findAvailableRewards
    claimReward(userID: ID!, rewardID: ID!): ID!
  }
`;

// Input types

interface RewardData {
  merchantID: number;
  pointCost: number;
  rewardVal: number;
  rewardPer: number;
  enabled: boolean;
  userCapacity: number;
}

// Resolver args

interface findAvailableRewardsArgs {
  userId: number;
}

interface getMerchantRewardsArgs {
  merchantId: number;
}
interface getClaimedRewardsArgs {
  userId: number;
}

interface newRewardArgs {
  rewardData: RewardData;
}

interface updateRewardArgs {
  id: number;
  rewardData: RewardData;
}

interface deleteRewardArgs {
  id: number;
}

interface claimRewardArgs {
  userId: number;
  rewardId: number;
}


export const rewardResolvers = {
  Query: {

    // all rewards which haven't been "deleted"
    getMerchantRewards: async (
      parent: any,
      args: getMerchantRewardsArgs,
      context: GraphQLContext,
      info: any
    ): Promise<Reward[]> => {
      return await context.prisma.reward.findMany({
        where: {
          merchantId: args.merchantId,
          deletedAt: null,
        },
      });
    },
  },

  User: {
    availableRewards: async (
      parent: User,
      args: {},
      context: GraphQLContext,
      info: any
    ): Promise<Reward[]> => {
      return findAvailableRewards(parent.id, parent.merchantId, context.prisma);
    },

    claimedRewards: async (
      parent: User,
      args: {},
      context: GraphQLContext,
      info: any
    ): Promise<ClaimedReward[]> => {
      return context.prisma.claimedReward.findMany({
        where: {
          userID: parent.id
        }
      });
    },
  },

  ClaimedReward: {
    reward: async (
      parent: ClaimedReward,
      args: {},
      context: GraphQLContext,
      info: any
    ): Promise<Reward> => {
      return context.prisma.reward.findFirstOrThrow({
        where: {
          id: parent.rewardId,
        }
      })
    },
  },

  Mutation: {
    // createReward(data: RewardData!): Reward!
    createReward: async (
      parent: any,
      args: newRewardArgs,
      context: GraphQLContext,
      info: any
    ): Promise<Reward> => {
      const reward = await context.prisma.reward.create({
        data: {
          merchantId: Number(args.rewardData.merchantID),
          pointCost: args.rewardData.pointCost,
          rewardVal: args.rewardData.rewardVal,
          rewardPer: args.rewardData.rewardPer,
          enabled: args.rewardData.enabled,
          shopifyCode: "secret-code" // TODO for Graham: make the call to Shopify to create the reward and store the code
        },
      });

      return reward;
    },

    // note: this is a complete update, in contrast to a partial update. Basically just overwrite all of the fields
    // and set them to what's passed in here
    // updateReward(id: ID!, data: RewardData!): Reward!

    updateReward: async (
      parent: any,
      args: updateRewardArgs,
      context: GraphQLContext,
      info: any
    ): Promise<Reward> => {
      const reward = await context.prisma.reward.update({
        where: {
          id: args.id,
        },
        data: {
          merchantId: args.rewardData.merchantID,
          pointCost: args.rewardData.pointCost,
          rewardVal: args.rewardData.rewardVal,
          rewardPer: args.rewardData.rewardPer,
          enabled: args.rewardData.enabled,
          userCapacity: args.rewardData.userCapacity,
        },
      });

      return reward;
    },

    // note: this is a "soft delete". It doesn't actually delete anything, but
    // instead sets the deletedAt column to the current time
    // also, GraphQL requires us to return something from this, so right now
    // it just echoes the id you give it
    // deleteReward(id: ID!): ID!
    deleteReward: async (
      parent: any,
      args: deleteRewardArgs,
      context: GraphQLContext,
      info: any
    ): Promise<number> => {
      await context.prisma.reward.update({
        where: {
          id: args.id,
        },
        data: {
          deletedAt: Date(),
        },
      });

      return args.id;
    },

    // attempts to claim the reward for the given user, following pretty much the
    // same logic as for findAvailableRewards
    // claimReward(userID: ID!, rewardID: ID!): ID!
    claimReward: async (
      parent: any,
      args: claimRewardArgs,
      context: GraphQLContext,
      info: any
    ): Promise<Number> => {
      if (!context.merchantID) {
        throw new ApolloError("No merchant ID provided in context");
      }

      const availableRewards = await findAvailableRewards(
        args.userId,
        context.merchantID,
        context.prisma
      );

      for (var reward of availableRewards) {
        if (reward.id == args.rewardId) {
            await addCustomerToDiscount(context.prisma, context.shopifySession, reward.shopifyCode, args.userId);
          await context.prisma.claimedReward.create({
            data: {
              rewardId: args.rewardId,
              userID: args.userId,
              createdAt: Date(),
            },
          });

          return reward.id;
        }
      }
      
      throw new ApolloError("Couldn't find the given reward");
    },
  },
};
