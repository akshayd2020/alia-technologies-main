import { gql, useQuery } from "@apollo/client";
import { isConstValueNode } from "graphql";
import React, { useState } from "react";
import {
    QuestionAnswerChoices,
    Get_active_choice,
} from "./QuestionAnswerChoice";
import "./QuestionItem.css";

const QuestionItem = ({
    question = {
        id: 234,
        index: 1,
        body: "The Origami bodycare gives back all of the following except:",
        answerChoices: ["Energy", "Time", "Water", "Money"],
        correctAnswer: "Money",
    },
}) => {
    const [style, setStyle] = useState("greyBox");
    const [isShownContinue, setIsShownContinue] = useState(false);
    const [isShownRetry, setIsShownRetry] = useState(false);
    const [isShownSkip, setIsShownSkip] = useState(false);
    const [isShownSubmit, setIsShownSubmit] = useState(true);

    const SubmitButton = () => {
        return (
            <div className="submit">
                <button onClick={() => check(question.correctAnswer)}>
                    Submit
                </button>
            </div>
        );
    };

    const ContinueButton = () => {
        return (
            <div className="submit">
                <button> Continue </button>
            </div>
        );
    };

    const RetryButton = () => {
        return (
            <div>
                <button onClick={reset}> Retry</button>
            </div>
        );
    };

    const SkipButton = () => {
        return (
            <div>
                <button> Skip</button>
            </div>
        );
    };
    const reset = () => {
        changeBackground("greyBox");
        setIsShownSubmit((isShownSubmit) => !isShownSubmit);
        setIsShownRetry((isShownRetry) => !isShownRetry);
        setIsShownSkip((isShownSkip) => !isShownSkip);
    };

    const check = (
        correctAnswer: string | React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        const submittedAnswer = Get_active_choice();
        if (!submittedAnswer) {
            changeBackground("greyBox");
        } else if (submittedAnswer !== correctAnswer) {
            changeBackground("yellowBox");
            setIsShownSubmit((isShownSubmit) => !isShownSubmit);
            setIsShownRetry((isShownRetry) => !isShownRetry);
            setIsShownSkip((isShownSkip) => !isShownSkip);
        } else {
            changeBackground("greenBox");
            setIsShownContinue((isShownContinue) => !isShownContinue);
            setIsShownSubmit((isShownSubmit) => !isShownSubmit);
        }
    };
    const changeBackground = (box: string) => {
        setStyle(box);
    };

    return (
        <>
            <div className={style}>
                <div className="question">Question {question.index}</div>

                <div className="body">{question.body}</div>
                {question.answerChoices.map((choice) => (
                    <QuestionAnswerChoices key={choice} answerChoice={choice} />
                ))}
                {isShownSubmit && <SubmitButton />}
                {isShownContinue && <ContinueButton />}
                {isShownRetry && <RetryButton />}
                {isShownSkip && <SkipButton />}
                <div />
            </div>
        </>
    );
};

export default QuestionItem;
