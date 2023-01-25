import { gql, useQuery } from "@apollo/client";
import "./Reward.css";
import React, {useState} from "react";
import { Icon, ProgressBar } from "@shopify/polaris";

const FindRewards = gql`
	query {
		currentUser {
            currentPoints
            availableRewards {
                id
                merchantId
                pointCost
                rewardVal
                rewardPer
                enabled
                userCapacity
            }
            claimedRewards {
                reward {
                    id
                    merchantId
                    pointCost
                    rewardVal
                    rewardPer
                    enabled
                    userCapacity
                }
            }
		}
	}
`;


interface QueryData {
	currentUser: {
        availableRewards: {
            id: number,
            merchantId: number,
            pointCost: number,
            rewardVal: number,
            rewardPer: number,
            enabled: boolean,
            userCapacity: number
        }[],
        claimedRewards: {
            reward: {
                id: number,
                merchantId: number,
                pointCost: number,
                rewardVal: number,
                rewardPer: number,
                enabled: boolean,
                userCapacity: number
            }
        }[],
        currentPoints: number
    }
}
interface rewardData {
    id: number,
    merchantId: number,
    pointCost: number,
    rewardVal: number,
    rewardPer: number,
    enabled: boolean,
    userCapacity: number
}

const RewardItem = (
    {   
        reward = {
            "id": 234,
            "merchantId": 1,
            "pointCost": 1,
            "rewardVal": 10,
            "rewardPer": 50,
            "enabled": true,
            "userCapacity": 3
        },
        currentPoints = 1
    }
) => {
    return (
    <div className="EachReward row">
        <div className="col-9">
           ${reward.rewardVal} off purchase of ${reward.rewardPer} or more
        </div>
        <div className="col-3">
        <div style={{ width: 100 }}>
            <ProgressBar progress={(currentPoints / reward.pointCost) * 100} />
        </div>
        </div>
    </div>
    )
}



export const DisplayRewards = () => {
    const [isShownAvailReward, setIsShownAvailReward] = useState(true);
    const [isShownEarnedReward, setIsShownEarnedReward] = useState(false);
    const { loading, error, data } = useQuery<QueryData, {}>(FindRewards);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    
    const earnedRewards = () => {
        return (
            <div>
                <h1> Earned Rewards </h1>
                    {
                        data?.currentUser?.claimedRewards?.map(claimed_reward => <RewardItem key={claimed_reward.reward.id} reward={claimed_reward.reward}  
                                                                                                currentPoints={data?.currentUser?.currentPoints}/>)
                    }
            </div>
        )
    }
    const availRewards = () => {
        return (
            <div>
                <h1> Available Rewards </h1>
                    {
                        data?.currentUser?.availableRewards?.map(avail_reward => <RewardItem key={avail_reward.id} reward={avail_reward} 
                                                                                                currentPoints={data?.currentUser?.currentPoints}/>)
                    }
            </div>
        )
    }
    return (
        <div className="mainContainer">
            <div className="nav">
                <ul>
                    <div onClick={() => {
                        setIsShownAvailReward(true)
                        setIsShownEarnedReward(false)}}>
                        available
                    </div>
                    <div onClick={() => {
                        setIsShownEarnedReward(true)
                        setIsShownAvailReward(false)}}>
                        earned
                    </div>
                </ul> 
            </div>
            <div className="AvaibleRewardsContainer">
                {isShownAvailReward && availRewards()}
                {isShownEarnedReward && earnedRewards()}
            </div>
        </div>
    )
}

