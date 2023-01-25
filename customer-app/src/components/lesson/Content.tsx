import "./styles/Content.css";
import QuestionContent from "./QuestionContent";
import { useState } from "react";
import QuestionTab from "./QuestionTab";
import { QuestionData, QuestionStatus } from "./Lesson";
import { Icon } from "@shopify/polaris";
import { ArrowDownMinor, ArrowUpMinor } from "@shopify/polaris-icons";

export interface ContentProps {
    question: QuestionData;
    contentTitle: String;
    contentBody?: String;
    videoURL?: string;
    updateStatusCallback: (status: QuestionStatus) => void;
    advanceToNextQuestionCallback: () => void;
}

const Content = ({
    question,
    contentTitle,
    contentBody,
    videoURL,
    updateStatusCallback,
    advanceToNextQuestionCallback,
}: ContentProps) => {
    const [showQuestionTab, setShown] = useState(false);

    if (showQuestionTab) {
        return (
            <div className="container content-container">
                <h1 className="question-number" onClick={() => setShown(false)}>
                    Question {question.index + 1}
                    <Icon source={ArrowDownMinor} />
                </h1>
                <p className="content-body">{contentBody}</p>
                {videoURL && (
                    <iframe
                        title="video"
                        width="320"
                        height="200"
                        src={videoURL}
                        allow="autoplay"
                    ></iframe>
                )}
                <QuestionTab question={question} updateStatusCallback={updateStatusCallback} advanceToNextQuestionCallback={advanceToNextQuestionCallback} />
            </div>
        );
    } else {
        return (
            <div className="container">
                <h1 className="question-number" onClick={() => setShown(true)}>
                    Question {question.index + 1}
                    <Icon source={ArrowUpMinor} />
                </h1>
                <p className="content-body">{contentBody}</p>
                {videoURL && (
                    <iframe
                        title="video"
                        width="350"
                        height="200"
                        src={videoURL}
                        allow="autoplay"
                    ></iframe>
                )}
            </div>
        );
    }
};

export default Content;
