import { CompletedQuestion } from "@prisma/client";
import { ApolloError, gql } from "apollo-server-core";
import { findMerchantByID } from "../data/merchant";
import { GraphQLContext } from "./schema";

export const completionTypeDefs = gql`
  type CompletedQuestion {
    id: ID!
    contentID: ID!
    questionID: ID!
    index: Int!
    pointValue: Int!
  }

  extend type Query {
    # finds all completed questions for a given user id
    findUserCompletedQuestions(userID: ID!): [CompletedQuestion!]!

    # finds all complete questions for a given user related to the given content id
    findUserCompletedQuestionsByContent(
      userID: ID!
      contentID: ID!
    ): [CompletedQuestion!]!
  }

  input CompletedQuestionData {
    contentID: ID!
    questionID: ID!
    index: Int!
    pointValue: Int!
  }

  extend type Mutation {
    completeQuestion(userID: ID!, QuestionID: ID!): ID!
  }
`;

// Resolver args

interface getUserCompletedQuestionsArgs {
  userId: number;
}

interface getUserCompletedQuestionsByLessonArgs {
  userId: number;
  contentId: number;
}

interface completeQuestionArgs {
  userId: number;
  questionId: number;
}
export const completionResolvers = {
  Query: {
    findUserCompletedQuestions: async (
      parent: any,
      args: getUserCompletedQuestionsArgs,
      context: GraphQLContext,
      info: any
    ): Promise<CompletedQuestion[]> => {
      return await context.prisma.completedQuestion.findMany({
        where: {
          userID: args.userId,
        },
      });
    },
  },

  Mutation: {
    completeQuestion: async (
      parent: any,
      args: completeQuestionArgs,
      context: GraphQLContext,
      info: any
    ): Promise<number> => {
      const question = await context.prisma.question.findFirst({
        where: {
          id: args.questionId,
        },
      });

      if (!question) {
        throw new ApolloError("Invalid question ID");
      }

      // TODO for Nick: go back later and check the logic for this function with fresh eyes

      const newCompletedQuestion =
        await context.prisma.completedQuestion.create({
          data: {
            userID: args.userId,
            questionID: args.questionId,
          },
        });

      const relatedLessonID: number = await context.prisma.$queryRaw`
        SELECT DISTINCT "Content"."lessonID" FROM "Question" INNER JOIN "Content" on "Question"."contentID" = "Content"."id" WHERE "Question"."id" = newCompletedQuestion.questionID
      `;

      const questions: number[] = await context.prisma.$queryRaw`
        SELECT "Question".id 
        FROM "Content"
        INNER JOIN "Question" on "Content"."id" = "Question"."contentID"
        WHERE "Content"."lessonID" = relatedLessonID
        `;

      const userQuestions: number[] = await context.prisma.$queryRaw`
        SELECT "CompletedQuestion"."questionID"
        FROM "CompletedQuestion"
        JOIN "Content" on "Content"."id" = "CompletedQuestion"."contentID"
        WHERE "CompletedQuestion"."userID" = newCompletedQuestion.userID
        AND "Content"."lessonID" = relatedLessonID
      `;

      for (var q of questions) {
        if (!userQuestions.includes(q)) {
          return newCompletedQuestion.id;
        }
      }

      await context.prisma.completedLesson.create({
        data: {
          lessonID: Number(relatedLessonID),
          userID: newCompletedQuestion.userID,
          cooldownDuration: 40, // TODO: actually plug in a real number here
        },
      });

      return newCompletedQuestion.id;
    },
  },
};
