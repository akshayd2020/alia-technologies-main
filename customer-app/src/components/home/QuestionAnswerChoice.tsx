import React, { useState } from "react";
import "./QuestionItem.css";

export const QuestionAnswerChoices = ({ answerChoice = "Water" }) => {
    const [style, setStyle] = useState("choice");
    const set_active_choice = (answerChoice: string) => {
        if (style === "choice") {
            active_choice = answerChoice;
        } else {
            active_choice = null;
        }
        addBorder();
    };
    const addBorder = () => {
        if (style === "choice") {
            setStyle("choiceChosen");
        } else {
            setStyle("choice");
        }
    };
    return (
        <div className={style} onClick={() => set_active_choice(answerChoice)}>
            {answerChoice}
        </div>
    );
};

let active_choice: string | null = null;

export const Get_active_choice = () => {
    return active_choice;
};
