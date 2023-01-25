import { gql, useQuery } from "@apollo/client";
import React from "react";
import "./LessonCard.css";

import { AppProvider, Frame, Card, Button, List } from "@shopify/polaris";
// import "@shopify/polaris/build/esm/styles.css";

// const GET_USER = gql`
// 	query {
// 		currentUser {
// 			name
// 			currentPoints
// 		}
// 	}

// `;

type LessonCardProps = {
  lessonNumber: number;
  complete: boolean;
  locked: boolean;
};

export default function LessonCard(props: LessonCardProps) {

  return (
    <div className="lesson-card">
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      />
      <h1 className="lesson-title">{"Lesson " + props.lessonNumber.toString()}</h1>
      {/* <span className="material-icons check">check</span> */}
    </div>
  );
}
