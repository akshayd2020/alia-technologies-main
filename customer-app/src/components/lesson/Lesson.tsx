import "./styles/Lesson.css";
import Content from "./Content";
import ProgressBar from "./ProgressBar";
import { Button } from "@shopify/polaris";
import { CancelSmallMinor } from "@shopify/polaris-icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { gql, useMutation, useQuery } from "@apollo/client";

export enum QuestionStatus {
    INCOMPLETE = "incomplete",
    INCORRECT = "incorrect",
    CORRECT = "correct",
    CURRENT = "current",
}

const FIND_QUESTIONS_NOT_COMPLETED = gql`
    query findQuestionsNotCompleted($userID: ID!, $contentIDs: [ID!]!) {
        findQuestionsNotCompleted(userID: $userID, contentIDs: $contentIDs) {
            id
            body
            index
            contentID
        }
    }
`;
const COMPLETE_LESSON = gql`
    mutation createCompletedLesson(
        $userID: ID!
        $lessonID: ID!
        $cooldownDuration: Int!
    ) {
        createCompletedLesson(
            userID: $userID
            lessonID: $lessonID
            cooldownDuration: $cooldownDuration
        ) {
            id
        }
    }
`;
const COMPLETE_QUESTION = gql`
mutation createCompletedQuestion($questionID: ID!, $userID: ID!){
    createCompletedQuestion(userID: $userID, questionID: $questionID){
        id
    }
    
}`
interface completeLessonData {
    id: number;
}
interface completeQuestionData {
    id: number;
}
export interface LessonProps {
    lesson: LessonData;
    questions: QuestionData[];
}
interface QuestionQueryData {
    findQuestionsNotCompleted: QuestionData[];
}
export interface QuestionData {
    id: number;
    contentID: number;
    body: string;
    index: number;
    pointValue: number;
    contentIndex: number;
    answerChoices: string[];
    correctAnswer: number;
    currentStatus?: QuestionStatus;
}
export interface ContentData {
    id: number;
    index: number;
    body: string;
    videoURL: string;
    questions: QuestionData[];
}
export interface LessonData {
    id: number;
    index: number;
    name: string;
    body: string;
    merchantID: number;
    contents: ContentData[];
}

const Lesson = ({ lesson, questions }: LessonProps) => {
    const navigate = useNavigate();

    const [questionsState, setQuestionsState] = useState(questions);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const [currentContent, setCurrentContent] = useState(lesson.contents[0]);
    const [completeQuestion, {data, loading, error}] = useMutation<completeQuestionData>(COMPLETE_QUESTION);
    const [completeLesson, { data: dataL, loading: loadingL, error: errorL }] =
        useMutation<completeLessonData>(COMPLETE_LESSON);

    const {
        loading: loadingQ,
        error: errorQ,
        data: dataQ,
    } = useQuery<QuestionQueryData>(FIND_QUESTIONS_NOT_COMPLETED, {
        variables: {
            userID: 1,
            contentIDs: lesson.contents.map((content) => content.id),
        },
        skip: lesson.contents.length === 0,
    });
    if (errorQ) {
        throw new Error(errorQ.message);
    }
    if (loadingQ) {
        return <div> "Loading" </div>;
    }
    if (dataQ?.findQuestionsNotCompleted == undefined) {
        throw new Error("Undefined data");
    }
    let qCompleted = [];
    for (let question of questions) {
        let qstatus = QuestionStatus.CORRECT;
        for (let question2 of dataQ.findQuestionsNotCompleted) {
            if (question.id == question2.id) {
                qstatus = QuestionStatus.INCOMPLETE;
            }
        }
        question.currentStatus = qstatus;
        if (qstatus == QuestionStatus.CORRECT) {
            qCompleted.push(question);
        }
    }
    const nodeOnClick = (question: QuestionData) => {
        setCurrentQuestionIndex(question.index);
        setCurrentContent(lesson.contents[question.contentIndex]);
    };

    const navigateToHome = () => {
        navigate("/");
    };

    const advanceToNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((oldIndex) => oldIndex + 1);
            setCurrentContent(
                lesson.contents[
                    questionsState[currentQuestionIndex+1].contentIndex
                ]
            );
        }
    };

    const updateQuestionStatus = (status: QuestionStatus) => {
        setQuestionsState((oldQuestionsState) =>
            oldQuestionsState.map((oldQuestion, i) => {
                let newQuestion = {
                    ...oldQuestion,
                };

                if (i === currentQuestionIndex) {
                    newQuestion.currentStatus = status;
                }

                return newQuestion;
            })
        );

        if (status === QuestionStatus.CORRECT) {
            completeQuestion({
                 variables: {
                     userID: 1,
                    questionID: questions[currentQuestionIndex].id
                 }
             });

            // This was the last question for the current content
            if (
                questions[currentQuestionIndex].index ===
                questions.length - 1
            ) {
                // This was the last question for this lesson
                // TODO: not sure if we need to call completeLesson or if that automatically gets handled by completeQuestion
            }
        }
    };

    return (
        <div>
            <span className="cancel-button">
                <Button
                    outline={false}
                    plain={true}
                    icon={CancelSmallMinor}
                    onClick={navigateToHome}
                ></Button>
            </span>
            <ProgressBar questions={questionsState} nodeOnClick={nodeOnClick} />
            <Content
                question={questionsState[currentQuestionIndex]}
                contentTitle={lesson.name}
                contentBody={currentContent.body}
                videoURL={currentContent.videoURL}
                updateStatusCallback={updateQuestionStatus}
                advanceToNextQuestionCallback={advanceToNextQuestion}
            />
        </div>
    );
};

export default Lesson;
