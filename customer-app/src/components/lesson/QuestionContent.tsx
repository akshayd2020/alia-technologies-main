import { gql, useQuery } from "@apollo/client";
import React, { useState } from "react";

import QuestionItem from "../home/QuestionItem";

const CURRENT_CONTENT_ID = 1;

const FIND_CONTENT_BY_ID = gql`
	query($id: ID!) {
		findContentByID($id) {
			id
            body
            index
            questions {
                id
                index
                body
                answerChoices
                correctAnswer
            }
		}
	}
`;

interface QueryData {
	findContentByID: {
		id: number,
		body: string,
        index: number,
        questions: QuestionData[]
	} | null,
}

interface QuestionData {
    id: number
    index: number,
    body: string,
    answerChoices: string[],
    correctAnswer: string
}


const DisplayContent = () => {
    const { loading, error, data } = useQuery<QueryData, {id: number}>(FIND_CONTENT_BY_ID);

    if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;
    return (
        <div>
        {
            data?.findContentByID?.questions.map(question => <QuestionItem key={question.id} question={question}/>)
        }
        </div>
    )

}

export default DisplayContent;
