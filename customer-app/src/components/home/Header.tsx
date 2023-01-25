import { gql, useQuery } from "@apollo/client";
import React from "react";
import "./Header.css";

const GET_USER = gql`
  query {
    currentUser {
      name
      currentPoints
    }
  }
`;

interface QueryData {
  currentUser: {
    name: string;
    currentPoints: number;
  } | null;
}

export default function Header() {
  const { loading, error, data } = useQuery<QueryData>(GET_USER);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
	<div className="header-container">
		<div className="user-description">
			<h4 className="name">{data?.currentUser?.name}</h4>
			<div className="profile-picture">
			</div>
		</div>
		<div>
			<h2 className="points">{data?.currentUser?.currentPoints} points</h2>
		</div>
	</div>
);
}
