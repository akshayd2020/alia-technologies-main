import Header from "../components/home/Header";
import Redeem from "../components/home/Redeem";
import LessonTooltip, {TooltipDirection} from "../components/common/LessonTooltip";
import LessonCard from "../components/home/LessonCard";
import EarnPoints from "../components/home/EarnPoints";
import {gql, useMutation, useQuery} from "@apollo/client";
import {LessonData} from "../components/lesson/Lesson";

const GET_AVAILABLE_LESSONS = gql`
    query findAvailableLessons($userID: ID!, $merchantID: ID!) {
        findAvailableLessons(userID: $userID, merchantID: $merchantID) {
            id
            index
            name
            body
            merchantID
            contents {
                id
                index
                body
                videoURL
                questions {
                    id
                    index
                    pointValue
                    answerChoices
                    correctAnswer
                    contentID
                    body
                }
            }
        }
    }
`;

interface QueryData {
    findAvailableLessons: LessonData[];
}
const HomePage = () => {
    const {loading, error, data} = useQuery<QueryData>(GET_AVAILABLE_LESSONS, {
        variables: {
            userID: 1,
            merchantID: 1,
        },
    });
    if (loading) {
        return <div> "Loading" </div>;
    }
    if (error) {
        throw new Error(error.message);
    }
    if (data?.findAvailableLessons === undefined) {
        throw new Error("Undefined data");
    }

    let lessons = data?.findAvailableLessons;
    return (
        <div className="">
            <Header />
            <Redeem />
            <EarnPoints lessons={lessons}/>
        </div>
    )
}

export default HomePage;
