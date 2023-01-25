import {PrismaClient, Reward} from "@prisma/client"
import Shopify from "@shopify/shopify-api";

import {Session} from "@shopify/shopify-api/dist/auth/session";
import {findUserByID} from "./user";
import {User} from "@prisma/client";


export async function findAvailableRewards(
    userID: number,
    merchantID: number,
    prisma: PrismaClient
): Promise<Reward[]> {
    return await prisma.$queryRaw`
    select "Reward".*
    from "Reward"
    left outer join "ClaimedReward" on "Reward".id = "ClaimedReward"."rewardId"
    where "Reward"."merchantId" = ${merchantID} and "Reward".enabled = true
    group by "Reward".id 
    having count("ClaimedReward".id)::float < coalesce("Reward"."userCapacity"::float, 'inf')
  `;
}


const getDiscountCodeID = async function (session: Session | null, shopifyCode: string)  {
    const getID = `
    query codeDiscountNodeByCode($code: String!) {
  codeDiscountNodeByCode(code: $code) {
    codeDiscount {
      __typename
      ... on DiscountCodeBasic {
        codeCount
        shortSummary
      }
    }
    id
  }
}`;
    const client = new Shopify.Clients.Graphql(
        // @ts-ignore
        session.shop,
        // @ts-ignore
        session.accessToken
    );
    const inputVariables = {
        "code" : `${shopifyCode}`
    }
    const discountNode = await client.query({
        data: {
            query: getID,
            variables: inputVariables
        }}
    );
    let text = JSON.stringify(discountNode);
    let ID = text.split('"');
    let textID = "";
    for (let str of ID) {
        if (str.includes("gid")) {
            textID = str;
            break;
        }
    }
    return textID;

}

/**
 *
 * @param session The current session to get the shop and access code.
 * @param inputVariables The input for discountCodeBasicCreate.
 */

export const createDiscount = async function (session: Session | undefined, inputVariables: any){
    const CREATE_CODE_MUTATION = `
    mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
  discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
    codeDiscountNode {
      codeDiscount {
        ... on DiscountCodeBasic {
          title
          startsAt
          endsAt
          customerSelection {
            ... on DiscountCustomerAll {
              allCustomers
            }
          }
          customerGets {
            value {
              ... on DiscountPercentage {
                percentage
              }
            }
            items {
              ... on AllDiscountItems {
                allItems
              }
            }
          }
          appliesOncePerCustomer
        }
      }
    }
    userErrors {
      field
      code
      message
    }
  }
}`;
    const client = new Shopify.Clients.Graphql(
        // @ts-ignore
        session.shop,
        // @ts-ignore
        session.accessToken
    );
    return await client.query({
        data: {
            query: CREATE_CODE_MUTATION,
            variables: inputVariables
        }}
    );
}


export const updateDiscount = async function (session: Session | null, inputVariables: any) {
    const UPDATE_CODE_MUTATION = `
   mutation discountCodeBasicUpdate($id: ID!, $basicCodeDiscount: DiscountCodeBasicInput!) {
  discountCodeBasicUpdate(id: $id, basicCodeDiscount: $basicCodeDiscount) {
    codeDiscountNode {
      codeDiscount {
        ... on DiscountCodeBasic {
          title
          startsAt
          endsAt
          customerSelection {
              ... on DiscountCustomerAll {
              allCustomers
              }
          },
          customerGets {
            value {
              ... on DiscountPercentage {
                percentage
              }
            }
            items {
              ... on AllDiscountItems {
                allItems
              }
            }
          }
          appliesOncePerCustomer
        }
      }
    }
    userErrors {
      field
      code
      message
    }
  }
}`;
    const client = new Shopify.Clients.Graphql(
        // @ts-ignore
        session.shop,
        // @ts-ignore
        session.accessToken
    );

        return await client.query({
                data: {
                    query: UPDATE_CODE_MUTATION,
                    variables: inputVariables
                }
            },
        );
}

export const addCustomerToDiscount = async function (prisma: PrismaClient, session: Session | null, shopifyCode: string, userID : number) {
    const user = await findUserByID(prisma, userID);
    if (user != null) {
        const discountID = await getDiscountCodeID(session, shopifyCode);
        const customerID = user.shopifyCustomerID.toString();
        const inputVariables = {
            "id": `${discountID}`,
            "basicCodeDiscount": {
                "customerSelection": {
                    "all": false,
                    "customers": {
                        "add": [
                            `gid://shopify/Customer/${customerID}`
                        ]
                    }
                }
            }
        }
        await updateDiscount(session, inputVariables);
    }
    else {
            throw new Error("No user found");
        }
}




