import {PrismaClient, Content, Question, CompletedQuestion} from "@prisma/client"
import {GraphQLContext} from "./schema";
import { gql } from "apollo-server-core";

export const contentTypeDefs = gql` 
type Question {
    id: ID!
    index: Int!
    body: String!
    pointValue: Int!
    answerChoices: [String!]!
    correctAnswer: Int!
    contentID: ID!
    createdAt: String!
    deletedAt: String
}
type CompletedQuestion {
    id: ID!
    userID: ID!
    createdAt: String!
    deletedAt: String
}
type Content {
    id: ID!
    lessonID: ID!
    index: Int!
    body: String
    videoURL: String
    createdAt: String!
    deletedAt: String
}

extend type Content {
    questions: [Question!]!
}

extend type Query {
    findContentByID(id: ID!): Content
    findQuestionsNotCompleted(userID: ID!, contentIDs: [ID!]!): [Question!]!
}

extend type Mutation {
    createContent(index: Int, body: String, videoURL: String, lessonID: Int, questions: [QuestionData]!): Content!
    createCompletedQuestion(questionID: ID!, userID: ID!): CompletedQuestion!
    updateContent(id: ID!, index: Int, body: String, videoURL: String, questions: [QuestionData]!): Content!
    deleteContent(id: ID!): ID!
}


input QuestionData {
    index: Int!
    pointValue: Int!
    body: String!
    answerChoices: [String!]!
    correctAnswer: Int!
}
`

interface createContentData {
    index: number
    body: string
    videoURL: string
    lessonID: number
    questions: [createQuestionData]
}

interface updateContentData {
    id: number
    index: number
    body: string
    videoURL: string
    lessonID: number
    questions: [createQuestionData]
}

interface createQuestionData {
    index: number
    pointValue: number
    body: string
    answerChoices: [string]
    correctAnswer: number
}

interface findMContentByIDArgs {
    id: number
}
interface createCompletedQuestionArgs {
    questionID: number
    userID: number
}

interface findUncompletedQuestionsArgs {
    contentIDs: [number]
    userID: number
}

export const contentResolver = {
    Query: {
        findContentByID:  async (parent: any, args: findMContentByIDArgs, context: GraphQLContext, info: any): Promise<Content | null> => {
            const id = +args.id;
            return await context.prisma.content.findUnique({
                where: {
                    id: id
                },
                include: {
                    questions: {
                        orderBy: {
                            index: "asc"
                        }
                    }
                }
            })
        },
        findQuestionsNotCompleted: async (parent: any, args: findUncompletedQuestionsArgs, context: GraphQLContext, info: any): Promise<[Question] | []> => {
            let stringIDs = "(";
            stringIDs = stringIDs + args.contentIDs.toString() + ")";
            const userID = +args.userID
            return await context.prisma.$queryRawUnsafe(`
            SELECT * FROM  "Question"
            WHERE "contentID" IN ${stringIDs} 
            and "id" not in (
                SELECT "questionID" as id
                FROM "CompletedQuestion"
                WHERE "questionID" IS NOT NULL
                and "userID" = ${userID})
            ORDER BY "index";
           
            `)
            }

    },

    Content: {
        questions: async (parent: Content, args: {}, context: GraphQLContext, info: any): Promise<Question[]> => {
            let content = await context.prisma.content.findFirst({
                where: {
                    id: parent.id
                },
                include: {
                    questions: {
                        orderBy: {
                            index: 'asc'
                        }
                    }
                }
            });

            return content?.questions || [];
        }
    },

    Mutation: {
        createContent: async (parent: any, args: createContentData, context: GraphQLContext, info: any): Promise<Content | null> => {
            return await context.prisma.content.create({
                data: {
                    index: args.index,
                    body: args.body,
                    videoURL: args.videoURL,
                    lessonID: args.lessonID,
                    questions: {
                        createMany: {
                            data: args.questions
                        }
                    }
                },
                include: {
                    questions: {
                        orderBy: {
                            index: "asc"
                        }
                    }
                }
                
            })
        },
        createCompletedQuestion: async (parent: any, args: createCompletedQuestionArgs, context: GraphQLContext, info: any): Promise<CompletedQuestion | null> => {
           return await context.prisma.completedQuestion.create({
                data: {
                    userID: +args.userID,
                    questionID: +args.questionID
                }
            });

        },
        updateContent: async (parent: any, args: updateContentData, context: GraphQLContext, info: any): Promise<Content | null> => {
            const id = +args.id

            await context.prisma.content.update({
                where: {
                    id: id
                },
                data: {
                    questions: {
                        deleteMany: {}
                    },
                },
            })

            return await context.prisma.content.update({
                data: {
                    index: args.index,
                    body: args.body,
                    videoURL: args.videoURL,
                    lessonID: args.lessonID,
                    questions: {
                        createMany: {
                            data: args.questions
                        }
                    }
                },
                where: {
                    id: id
                },
                include: {
                    questions: {
                        orderBy: {
                            index: "asc"
                        }
                    }
                }
                
            })
        },

        deleteContent: async (parent: any, args: number, context: GraphQLContext, info: any): Promise<Content | null> => {
            return await context.prisma.content.update({
                data: {
                    deletedAt: new Date()
                }, 
                where: {
                    id: args
                }
            })
        }
    }
}

