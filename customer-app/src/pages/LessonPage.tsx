import { useNavigate, useParams, useLocation } from "react-router-dom";
import Lesson, {
    LessonData,
    QuestionData,
    QuestionStatus,
} from "../components/lesson/Lesson";
import { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { match } from "assert";

const FIND_LESSON_BY_ID = gql`
     query findLessonByID($id:ID!) {
    findLessonByID(id :$id ){
    id
     index
     name
     body
     merchantID
     contents {
         id
         index
         body
         videoURL
         questions {
             id
             index
             pointValue
             answerChoices
             correctAnswer
             contentID
             body
         }
     }
 }
 }
`;

interface QueryData {
    findLessonByID: LessonData;
}
type lessonPageParams = {
    lessonID: string;
};

const LessonPage = () => {
    const { lessonID } = useParams<lessonPageParams>();
    const navigate = useNavigate();
    const [currentLesson, setCurrentLesson] = useState<LessonData>();
    const {
        loading: loadingL,
        error: errorL,
        data: dataL,
    } = useQuery<QueryData>(FIND_LESSON_BY_ID, {
        variables: {
            id: lessonID,
        },
    });

    if (loadingL) {
        return <div> "Loading" </div>;
    }
    if (errorL) {
        throw new Error(errorL.message);
    }
    if (dataL?.findLessonByID === undefined) {
        throw new Error("Undefined data");
    }

    let lessonData = dataL?.findLessonByID;


    let contentIndex = 0;
    let questionIndex = 0;
    let questionArray = [];
    for (let content of lessonData.contents) {
        for (let question of content.questions) {
            const questionData = {
                id: question.id,
                contentID: question.contentID,
                index: questionIndex,
                pointValue: question.pointValue,
                contentIndex: contentIndex,
                body: question.body,
                answerChoices: question.answerChoices,
                correctAnswer: question.correctAnswer,
                currentStatus: QuestionStatus.INCOMPLETE,
            };
            questionIndex += 1;
            questionArray.push(questionData);
        }
        contentIndex += 1;
    }

    return (
        <>
            <Lesson lesson={lessonData} questions={questionArray} />
        </>
    );
};

export default LessonPage;
