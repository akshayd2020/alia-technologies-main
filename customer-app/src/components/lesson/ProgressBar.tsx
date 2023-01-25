import "./styles/ProgressBar.css";
import { QuestionData, QuestionStatus} from "./Lesson";

export interface ProgressBarProps {
  questions: QuestionData[];
  nodeOnClick: (question: QuestionData) => void
}

interface QuestionNodeProps {
  question: QuestionData
  lastNode?: boolean
  nodeOnClick: (question: QuestionData) => void
}

const QuestionNode = ({question, lastNode = false, nodeOnClick}: QuestionNodeProps) => {

  const clickNode = () => {
    nodeOnClick(question)
  }

  return (
    <>
      <div className={`dot ${question.currentStatus} ${lastNode ? "last-node" : ""}`} onClick={clickNode}></div>
    </>
  );
};

interface QuestionNodeWithConnectorProps {
  question: QuestionData
  size: number
  nodeOnClick: (question: QuestionData) => void
}

const QuestionNodeWithConnector = ({question, size, nodeOnClick}: QuestionNodeWithConnectorProps) => {
  const clickNode = () => {
    nodeOnClick(question);
  }

  return (
    <div className="node-connector">
      <QuestionNode question={question} nodeOnClick={clickNode}/>
      <div className={`${question.currentStatus} connector`} style={{width: size.toString() + "px", height: "10px"}} />
    </div>
  )
}


   

const ProgressBar = ({ questions, nodeOnClick }: ProgressBarProps) => {
  const questionSize = questions.length;
  const progressConnectorSize = Math.ceil(
    (400 - questionSize * 20) / questionSize - 1
  );

  const clickNode = (question: QuestionData) => {
    nodeOnClick(question);
  }

  const multipleQuestions = () => {

    return (
      <div className="question-wrapper">
          <div className="multi-question">
            {questions.slice(0, questionSize - 1).map((question, index) => {
              return (<QuestionNodeWithConnector key={index} question={question} size={progressConnectorSize} nodeOnClick={nodeOnClick}/>);
            })}
            <QuestionNode question={questions[questionSize - 1]} lastNode={true} nodeOnClick={nodeOnClick}/>
        </div>
      </div>
    );
  };

  return (
    <div className="progress-bar-container">
      {questionSize === 0 && (
        <div className="single-question">
         <QuestionNodeWithConnector question={questions[0]} size={30} nodeOnClick={nodeOnClick}/>
        </div>
      )}
      {questionSize >= 1 && multipleQuestions()}
    </div>
  );
};

export default ProgressBar;
