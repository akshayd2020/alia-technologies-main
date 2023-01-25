import { expect } from "chai";
import { createGraphQLServer } from "./schema";
import { prisma } from "../data/mockDB";

describe("The lesson resolver", async () => {
  const testServer = createGraphQLServer(prisma);

  await prisma.merchant.create({
    data: {
      title: "first merchant",
      url: "url",
    },
  });

  it("creates lessons", async () => {
    const create_result = await testServer.executeOperation({
      query: `mutation createL($data: CreateLessonData!) {
                        createLesson(
                            data: $data
                        ) {
                            id
                            index
                            name
                            body
                            merchantID
                            cooldownDuration
                            enabled
                            contents {
                                id
                                body
                                index
                                videoURL
                            }
                        }
                    }`,
      variables: {
        data: {
          index: 0,
          name: "first lesson",
          body: "this is the first lesson",
          merchantID: 1,
          cooldownDuration: 100,
          enabled: true,
          contents: [
            {
              body: "abc",
              index: 2,
              videoURL: "url",
            },
            {
              body: "abc2",
              index: 1,
              videoURL: "url2",
            },
          ],
        },
      },
    });

    // check lesson attrs
    expect(create_result.errors).to.be.undefined;
    expect(create_result.data?.createLesson.index).to.be.eq(0);
    expect(create_result.data?.createLesson.id).to.be.eq("1");
    expect(create_result.data?.createLesson.name).to.be.eq("first lesson");
    expect(create_result.data?.createLesson.body).to.be.eq(
      "this is the first lesson"
    );
    expect(create_result.data?.createLesson.merchantID).to.be.eq("1");
    expect(create_result.data?.createLesson.enabled).to.be.eq(true);
    expect(create_result.data?.createLesson.cooldownDuration).to.be.eq(100);

    //check content - should be ordered by index
    expect(create_result.data?.createLesson.contents.length).to.be.eq(2);
    expect(create_result.data?.createLesson.contents[0].body).to.be.eq("abc2");
    expect(create_result.data?.createLesson.contents[0].index).to.be.eq(1);
    expect(create_result.data?.createLesson.contents[0].videoURL).to.be.eq(
      "url2"
    );
    expect(create_result.data?.createLesson.contents[1].body).to.be.eq("abc");
    expect(create_result.data?.createLesson.contents[1].index).to.be.eq(2);
    expect(create_result.data?.createLesson.contents[1].videoURL).to.be.eq(
      "url"
    );
  });

  it("updates lessons", async () => {
    const update_result = await testServer.executeOperation({
      query: `mutation createL($data: UpdateLessonData!) {
                        updateLesson(
                            data: $data
                        ) {
                            id
                            index
                            name
                            body
                            merchantID
                            cooldownDuration
                            enabled
                            contents {
                                id
                                body
                                index
                                videoURL
                            }
                        }
                    }`,
      variables: {
        data: {
          id: 1,
          index: 3,
          name: "first lesson - updated",
          body: "this is the first lesson - updated",
          merchantID: 1,
          cooldownDuration: 200,
          enabled: false,
          contents: [
            {
              body: "abc - updated",
              index: 2,
              videoURL: "url - updated",
            },
            {
              body: "abc2 - updated",
              index: 1,
              videoURL: "url2 - updated",
            },
          ],
        },
      },
    });
    // check lesson attrs
    expect(update_result.errors).to.be.undefined;
    expect(update_result.data?.updateLesson.index).to.be.eq(3);
    expect(update_result.data?.updateLesson.id).to.be.eq("1");
    expect(update_result.data?.updateLesson.name).to.be.eq(
      "first lesson - updated"
    );
    expect(update_result.data?.updateLesson.body).to.be.eq(
      "this is the first lesson - updated"
    );
    expect(update_result.data?.updateLesson.merchantID).to.be.eq("1");
    expect(update_result.data?.updateLesson.enabled).to.be.eq(false);
    expect(update_result.data?.updateLesson.cooldownDuration).to.be.eq(200);

    //check content - should be ordered by index
    expect(update_result.data?.updateLesson.contents.length).to.be.eq(2);
    expect(update_result.data?.updateLesson.contents[0].body).to.be.eq(
      "abc2 - updated"
    );
    expect(update_result.data?.updateLesson.contents[0].index).to.be.eq(1);
    expect(update_result.data?.updateLesson.contents[0].videoURL).to.be.eq(
      "url2 - updated"
    );
    expect(update_result.data?.updateLesson.contents[1].body).to.be.eq(
      "abc - updated"
    );
    expect(update_result.data?.updateLesson.contents[1].index).to.be.eq(2);
    expect(update_result.data?.updateLesson.contents[1].videoURL).to.be.eq(
      "url - updated"
    );
  });

  it("queries for lessons", async () => {
    const get_result = await testServer.executeOperation({
      query: `query findLessonByID($id: ID!) {
            findLessonByID(id: $id) {
                id
                name
                body
                merchantID
                cooldownDuration
                enabled
                contents {
                    id
                    body
                    index
                    videoURL
                }
            }
        }
        `,
      variables: { id: 1 },
    });
    // check lesson attrs
    expect(get_result.errors).to.be.undefined;
    expect(get_result.data?.findLessonByID.id).to.be.eq("1");
    expect(get_result.data?.findLessonByID.name).to.be.eq(
      "first lesson - updated"
    );
    expect(get_result.data?.findLessonByID.body).to.be.eq(
      "this is the first lesson - updated"
    );
    expect(get_result.data?.findLessonByID.merchantID).to.be.eq("1");
    expect(get_result.data?.findLessonByID.enabled).to.be.eq(false);
    expect(get_result.data?.findLessonByID.cooldownDuration).to.be.eq(200);

    //check content - should be ordered by index
    expect(get_result.data?.findLessonByID.contents.length).to.be.eq(2);
    expect(get_result.data?.findLessonByID.contents[0].body).to.be.eq(
      "abc2 - updated"
    );
    expect(get_result.data?.findLessonByID.contents[0].index).to.be.eq(1);
    expect(get_result.data?.findLessonByID.contents[0].videoURL).to.be.eq(
      "url2 - updated"
    );
    expect(get_result.data?.findLessonByID.contents[1].body).to.be.eq(
      "abc - updated"
    );
    expect(get_result.data?.findLessonByID.contents[1].index).to.be.eq(2);
    expect(get_result.data?.findLessonByID.contents[1].videoURL).to.be.eq(
      "url - updated"
    );
  });

  it("finds available lessons", async () => {
    // TODO
  });

  it("deletes lessons", async () => {
    const delete_result = await testServer.executeOperation({
      query: `mutation deleteLesson($id: ID!) {
                deleteLesson(id: $id) {
                    id
                    name
                    body
                    merchantID
                    cooldownDuration
                    enabled
                    contents {
                        id
                        body
                        index
                        videoURL
                    }
                }
            }
            `,
      variables: { id: 1 },
    });

    // TODO: needs to check the deletedAt field - everything else should still be present
    // blocker: decide how we want to deal with dates
    // check lesson attrs
    expect(delete_result.errors).to.be.undefined;
    expect(delete_result.data?.deleteLesson.id).to.be.eq("1");
    expect(delete_result.data?.deleteLesson.name).to.be.eq(
      "first lesson - updated"
    );
    expect(delete_result.data?.deleteLesson.body).to.be.eq(
      "this is the first lesson - updated"
    );
    expect(delete_result.data?.deleteLesson.merchantID).to.be.eq("1");
    expect(delete_result.data?.deleteLesson.enabled).to.be.eq(false);
    expect(delete_result.data?.deleteLesson.cooldownDuration).to.be.eq(200);

    //check content - should be ordered by index
    expect(delete_result.data?.deleteLesson.contents.length).to.be.eq(2);
    expect(delete_result.data?.deleteLesson.contents[0].body).to.be.eq(
      "abc2 - updated"
    );
    expect(delete_result.data?.deleteLesson.contents[0].index).to.be.eq(1);
    expect(delete_result.data?.deleteLesson.contents[0].videoURL).to.be.eq(
      "url2 - updated"
    );
    expect(delete_result.data?.deleteLesson.contents[1].body).to.be.eq(
      "abc - updated"
    );
    expect(delete_result.data?.deleteLesson.contents[1].index).to.be.eq(2);
    expect(delete_result.data?.deleteLesson.contents[1].videoURL).to.be.eq(
      "url - updated"
    );
  });
});
