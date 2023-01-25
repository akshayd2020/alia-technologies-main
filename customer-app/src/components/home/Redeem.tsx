import { gql, useQuery } from "@apollo/client";
import React, { useState } from "react";
import "./Redeem.css";
import { Icon, ProgressBar } from "@shopify/polaris";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from "react-router-dom";

const GET_USER = gql`
  query {
    currentUser {
      currentPoints
      availableRewards {
        rewardPer
        rewardVal
        pointCost
      }
    }
  }
`;

interface QueryData {
  currentUser: {
    currentPoints: number;
    availableRewards: {
      rewardPer: number | null;
      rewardVal: number | null;
      pointCost: number;
    }[];
  } | null;
}

const ProgressBarE = (progress: any, total: any) => {
  return (
    <div style={{ width: 225 }}>
      <ProgressBar progress={(progress / total) * 100} />
    </div>
  );
};

export default function Redeem(callback: any) {
  const { loading, error, data } = useQuery<QueryData>(GET_USER);
  const navigate = useNavigate();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  console.log(data);

  if (data?.currentUser?.availableRewards.length === 0) {
    return (
      <div className="box">
        <h1 className="redeem">
          Redeem Points
          <span className="material-icons md-48 arrow">forward</span>
        </h1>
        <p className="nextLabel">
          You already have all of the available rewards!
        </p>
      </div>
    );
  }

  const reward = data?.currentUser?.availableRewards[0]!;

  let displayText = reward.rewardPer ? ((reward.rewardPer * 100).toString() + "% percent off code!") : ("$" + reward.rewardVal?.toString() + " off code!");

  return (
    <div onClick={() => navigate("/reward")}>
      <div className="box">
        <h1 className="redeem">
          Redeem Points
          <span className="material-icons md-48 arrow">forward</span>
        </h1>
        <p className="nextLabel">Next Reward</p>
        <p className="nextReward">{displayText}</p>
        <div className="progress">
          {ProgressBarE(
            data?.currentUser?.currentPoints,
            reward.pointCost
          )}
        </div>
      </div>
    </div>
  );
}
