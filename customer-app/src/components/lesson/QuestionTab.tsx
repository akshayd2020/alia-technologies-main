import React, { useState } from "react";
import { QuestionData, QuestionStatus } from "./Lesson";
import "./styles/QuestionTab.css";

interface QuestionTabProps {
    question: QuestionData;
    updateStatusCallback: (status: QuestionStatus) => void;
    advanceToNextQuestionCallback: () => void;
}

export default function QuestionTab({
    question,
    updateStatusCallback,
    advanceToNextQuestionCallback,
}: QuestionTabProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(
        question.currentStatus === QuestionStatus.CORRECT
            ? question.correctAnswer
            : null
    );

    // The "submit" button has been clicked
    const clickButton = () => {
        if (question.currentStatus === QuestionStatus.CORRECT) {
            setSelectedIndex(null); // Reset selection
            advanceToNextQuestionCallback();
            return;
        }

        if (selectedIndex === null) return; // Can't submit if they haven't selected anything

        if (selectedIndex === question.correctAnswer) {
            updateStatusCallback(QuestionStatus.CORRECT);
        } else {
            updateStatusCallback(QuestionStatus.INCORRECT);
        }
    };

    const buttonText = (() => {
        switch (question.currentStatus) {
            case QuestionStatus.INCOMPLETE:
                return "Submit";
            case QuestionStatus.CORRECT:
                return "Continue";
            case QuestionStatus.INCORRECT:
                return "Try Again";
            case QuestionStatus.CURRENT: // TODO: what is this supposed to be?
                return "Submit";
        }
    })();

    const displayBottom = () => {
        switch (question.currentStatus) {
            case QuestionStatus.INCOMPLETE:
                return;
            case QuestionStatus.CORRECT:
                return "correctQ";
            case QuestionStatus.INCORRECT:
                return "incorrectQ";
        }
    };

    return (
        <div className={`container ${question.currentStatus === QuestionStatus.CORRECT ? "correct" : question.currentStatus === QuestionStatus.INCORRECT ?  "incorrect" : "incomplete"}`}>
            <div>
                <h2 className="header">Question {question.index + 1}</h2>
                <p className="question">{question.body}</p>
            </div>

            {question.answerChoices.map((choice, index) => {
                if (selectedIndex !== null && index == selectedIndex) {
                    return <p className="selected" key={index}>{choice}</p>;
                } else {
                    return (
                        <p
                            className="choice"
                            key={index}
                            onClick={() => {
                                if (
                                    question.currentStatus !==
                                    QuestionStatus.CORRECT
                                ) {
                                    setSelectedIndex(index);
                                }
                            }}
                        >
                            {choice}
                        </p>
                    );
                }
            })}
            <div className={displayBottom()}>
                <div onClick={clickButton}>
                    <p className="submit">{buttonText}</p>
                </div>
            </div>
        </div>
    );
}
