import {Content, PrismaClient, prisma } from "@prisma/client"

// These functions are mostly just examples so you see how to implement database functions that
// interface with Prisma, as well as how to test them

// The database functions we end up created will generally be much more complicated, and will involve
// creating child rows also (ie creating a Content involves creating it's question)

interface CreateContentData {
    lessonID: number,
    orderVal: number,
    body: string | null,
    videoURL: string | null,
    index: number
}

interface CreateQuestionData {
    pointValue: number,
    answerChoices: string[],
    correctAnswer: number // corresponds to the index from choices
}

/**
 * Creates a new content with the given `content` and `questions`.
 * @param prisma the Prisma database object
 * @param content 
 * @param questions 
 * @returns the value of the merchant row created in the database
*/

export const createContent = async function (prisma: PrismaClient, content: CreateContentData, questions: CreateQuestionData[]): Promise<Content> {

    return await prisma.content.create({
		data: {
			lessonID: content.lessonID,
            body: content.body,
            videoURL: content.videoURL,
            index: content.index,
            questions: {
                create: questions
            }
		},
	});
}


/**
 * Attempts to find the content with the given `id`.
 * @param prisma the Prisma database object
 * @param id the content's id
 * @returns either the corresponding merchant row if it exists, or null
 */
 export const findMContentByID = async function(prisma: PrismaClient, id: number): Promise<Content | null> {
	return await prisma.content.findFirst({
		where: {
			id: id,
		},
	});
}
