import React from "react";
import { useQuery, gql } from "@apollo/client";

const GET_NAME = gql`
	query {
		currentUser {
			name
		}
	}
`;

interface QueryData {
	currentUser: {
		name: string
	} | null,
}

export default function SimpleGraphQLQuery(props: any) {
	const { loading, error, data } = useQuery<QueryData>(GET_NAME);

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

	if (data?.currentUser) {
		return <p>
			My name is {data.currentUser.name}
		</p>
	}

	return <p>I don't have a name :(</p>;
}
