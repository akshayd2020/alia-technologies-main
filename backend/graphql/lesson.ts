import {CompletedLesson, Content, Lesson} from "@prisma/client"
import { GraphQLContext } from "./schema";
import { gql } from "apollo-server-core";

export const lessonTypeDefs = gql` 
    type Content {
        id: ID!
        body: String
        index: Int!
        videoURL: String
        createdAt: String!
        deletedAt: String
    }

    type Lesson {
        id: ID!
        index: Int!
        name: String!
        body: String!
        merchantID: ID!
        cooldownDuration: Int!
        enabled: Boolean!
        createdAt: String!
        deletedAt: String
    }
    type CompletedLesson {
        id: ID!
        userID: ID!
        createdAt: String!
        deletedAt: String
}

    extend type Lesson {
        contents: [Content!]
    }

    extend type Query {
        findAvailableLessons(userID: ID!, merchantID: ID!): [Lesson!]!
        
        findLessonByID(id: ID!): Lesson
    }
    
    input CreateLessonData {
        index: Int!
        name: String!
        body: String!
        merchantID: Int!
        cooldownDuration: Int!
        enabled: Boolean!
        contents: [ContentData]!
    }

    input UpdateLessonData {
        lessonID: Int!
        index: Int!
        name: String!
        body: String!
        merchantID: Int!
        cooldownDuration: Int!
        enabled: Boolean!
        contents: [ContentData]!
    }

    input ContentData {
        body: String
        index: Int!
        videoURL: String
    }

    extend type Mutation {
            createLesson(data: CreateLessonData!): Lesson!
            updateLesson(data: UpdateLessonData!): Lesson!
            createCompletedLesson(userID: ID!, lessonID: ID!, cooldownDuration: Int!): CompletedLesson!
            deleteLesson(id: ID!): Lesson
    }
`
// createLesson(data: createLessonData!): Lesson!
//updateLesson(id: ID!, data: updateLessonData!): Lesson!

interface CreateLessonData {
    index: number
    name: string
    body: string 
    merchantID: number
    cooldownDuration: number
    enabled: boolean
    contents: ContentData[]
}

interface createCompletedLessonArgs {
    lessonID: number
    userID: number
    cooldownDuration: number
}
interface UpdateLessonData {
    id: number
    index: number
    name: string
    body: string 
    merchantID: number
    cooldownDuration: number
    enabled: boolean
    contents: ContentData[]
}

interface ContentData {
    body: string
    index: number
    videoURL: string
}

interface deleteLessonIDArgs {
    id: number
}

interface findAvailableLessonsArgs {
    userID: number,
    merchantID: number
}


export const lessonResolver = {
    Query: {
        findLessonByID: async (parent: any, args: { id: number }, context: GraphQLContext, info: any): Promise<Lesson | null> => {
            const id = +args.id;
            return await context.prisma.lesson.findUnique({
                where: {
                    id: id
                },
                include: {
                    contents: {
                        orderBy: {
                            index : 'asc',
                        }
                    }
                }
            })
        },

        findAvailableLessons: async(parent: any, args: findAvailableLessonsArgs, context: GraphQLContext, info: any): Promise<Lesson[]> => {
            const merchant_id = +args.merchantID;
            const user_id = +args.userID;
            return await context.prisma.$queryRawUnsafe(`
            SELECT * FROM "Lesson"
            WHERE "Lesson"."merchantID" = ${merchant_id}
            and "Lesson"."deletedAt" is NULL
            and "Lesson"."id" not in (
                SELECT "lessonID" as id
                FROM "CompletedLesson"
                WHERE "lessonID" IS NOT NULL
                and "userID" = ${user_id}
                and "createdAt" > NOW() - "cooldownDuration" * '1 second'::interval
            );
            `)
        }
    },

    Lesson: {
        contents: async(parent: Lesson, args: {}, context: GraphQLContext, info: any): Promise<Content[]> => {
            let lesson = await context.prisma.lesson.findFirst({
                where: {
                    id: parent.id
                },
                include: {
                    contents: {
                        orderBy: {
                            index: 'asc'
                        }
                    }
                }
            });

            return lesson?.contents || [];
        } 
    },

    Mutation: {
        createLesson: async(parent: any, args: { data: CreateLessonData }, context: GraphQLContext, info: any): Promise<Lesson | null> => {
            return await context.prisma.lesson.create({
                data: {
                    index: args.data.index,
                    name: args.data.name,
                    body: args.data.body, 
                    merchantID: args.data.merchantID, 
                    cooldownDuration: args.data.cooldownDuration, 
                    enabled: args.data.enabled,
                    contents: {
                        createMany: {
                            data: args.data.contents,
                        },
                    }
                },
                include: {
                    contents: {
                        orderBy: {
                            index : 'asc',
                        }
                    }
                }
            })
            
        },
        createCompletedLesson: async (parent: any, args: createCompletedLessonArgs, context: GraphQLContext, info: any): Promise<CompletedLesson | null> => {
            return await context.prisma.completedLesson.create({
                data: {
                    userID: +args.userID,
                    lessonID: +args.lessonID,
                    cooldownDuration: +args.cooldownDuration
                }
            });

        },
        updateLesson: async(parent: any, args: { data: UpdateLessonData }, context: GraphQLContext, info: any): Promise<Lesson | null> => {
            // deletes all related contents belong to this content
            const id = +args.data.id;
            await context.prisma.lesson.update({
                where: {
                    id: id
                },
                data: {
                    contents: {
                        deleteMany: {}
                    },
                },
            })
            // update the lesson with new contents and other fields values
            return await context.prisma.lesson.update({
                data: {
                    index: args.data.index,
                    name: args.data.name,
                    body: args.data.body, 
                    merchantID: args.data.merchantID, 
                    cooldownDuration: args.data.cooldownDuration, 
                    enabled: args.data.enabled,
                    contents: {
                        createMany: {
                            data: args.data.contents
                        },
                    }
                },
                where: {
                    id: id
                },
                include: {
                    contents: {
                        orderBy: {
                            index : 'asc',
                        }
                    }
                }
            })
        },

        // set the deletedAt field of requested lesson to now() and do the same thing for all contents belong to this lesson
        deleteLesson: async(parent: any, args: deleteLessonIDArgs, context: GraphQLContext, info: any): Promise<Lesson | null>  => {
            const id = +args.id
            return await context.prisma.lesson.update({
                where: {
                    id: id
                },
                data: {
                    deletedAt: new Date(),
                    contents: {
                        updateMany: {
                            data: {
                                deletedAt: new Date()
                            },
                            where: {
                                lessonID: id
                            }
                        }
                    }
                },
                include: {
                    contents: {
                        orderBy: {
                            index : 'asc',
                        }
                    }
                }
            });
        }
    }
}

