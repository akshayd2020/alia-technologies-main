import { expect } from "chai";
import { createMerchant } from "./merchant";
import { prisma } from "./mockDB";
import { findAvailableRewards } from "./reward";
import { createUser } from "./user";

describe("findAvailableRewards", async function () {
  it("filters out rewards that aren't available", async function () {
    const merchant = await createMerchant(prisma, "title", "url");
    const user = await createUser(prisma, 42, merchant.id, "name", 2, 1);
    const rewardA = await prisma.reward.create({
      data: {
        merchantId: merchant.id,
        pointCost: 4,
        enabled: true,
        shopifyCode: "code a",
        userCapacity: 2,
      },
    });
    await prisma.reward.create({
      data: {
        merchantId: merchant.id,
        pointCost: 3,
        enabled: false,
        shopifyCode: "code b",
      },
    });
    const rewardC = await prisma.reward.create({
      data: {
        merchantId: merchant.id,
        pointCost: 5,
        enabled: true,
        shopifyCode: "code c",
      },
    });

    const claimedRewards = await prisma.claimedReward.createMany({
      data: [
        {
          rewardId: rewardA.id,
          userID: user.id,
        },
        {
          rewardId: rewardA.id,
          userID: user.id,
        },
        {
          rewardId: rewardC.id,
          userID: user.id,
        },
      ],
    });

    const availableRewards = await findAvailableRewards(
      user.id,
      merchant.id,
      prisma
    );
    expect(availableRewards).to.have.length(1);
    expect(availableRewards[0].id).to.equal(rewardC.id);
  });
});
