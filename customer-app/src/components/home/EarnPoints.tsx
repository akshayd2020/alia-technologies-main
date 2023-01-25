import { gql, useQuery } from "@apollo/client";
import React from "react";
import "./EarnPoints.css";

import { AppProvider, Frame, Card, Button, List } from "@shopify/polaris";
import LessonCard from "./LessonCard";
import LessonTooltip, { TooltipDirection } from "../common/LessonTooltip";
import Lesson, {LessonData, QuestionData} from "../lesson/Lesson";
// import "@shopify/polaris/build/esm/styles.css";

// const GET_USER = gql`
// 	query {
// 		currentUser {
// 			name
// 			currentPoints
// 		}
// 	}

// `;

interface EarnPointsProps {
  lessons: LessonData[];
}

export default function EarnPoints({lessons} : EarnPointsProps) {
  // const { loading, error, data } = useQuery<QueryData>(GET_USER);

  // if (loading) return <p>Loading...</p>;
  // if (error) return <p>Error: {error}</p>;

  const getNumQuestions = (lesson: LessonData) => {
    let questionCount = 0;
    for (let content of lesson.contents) {
      for (let question of content.questions) {
          questionCount ++;
      }
  }
  return questionCount;
}

const getPoints = (lesson: LessonData) => {
  let questionPoints = 0;
  for (let content of lesson.contents) {
    for (let question of content.questions) {
        questionPoints += question.pointValue;
    }
}
return questionPoints;
}

const getRandomNum = () => {
  return Math.floor(Math.random() * 5);
}

  return (
    <div className="earn-points-card">
      <h1 className="earn-points-label">Earn Points</h1>
      <div className="lessons-container">
      {lessons.map((lesson, index) => {
         return (<LessonTooltip key={index} lessonNumber={index + 1} lessonID = {lesson.id} isCompleted={false} estimatedTime={getRandomNum()} questions={getNumQuestions(lesson)} lessonPoints={getPoints(lesson)} tooltipDirection={TooltipDirection.UP_LEFT}>
          <LessonCard lessonNumber={index + 1} complete={false} locked={false} />
        </LessonTooltip>)
      })}
      </div>
      <h4 className="more-points-footer">Want more points? {"->"}</h4>
    </div>
  );
}
