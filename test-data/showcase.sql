-- Create the merchant
WITH
    merchant AS
(INSERT INTO "Merchant"
    (id, title, url)
    VALUES
        (1, 'Alia Learn Test Merchant', 'alia-learn-development-store.myshopify.com')
    RETURNING *
),

-- Create the user
testUser AS
(
    INSERT INTO "User"
        (id, "merchantId", name, "shopifyCustomerID", "currentPoints", "lifetimePoints")
    VALUES
        (1, (select id from merchant), 'John Johnson', 22, 12, 42)
    RETURNING *
),

-- Create two rewards
rewards AS
(
    INSERT INTO "Reward"
        ("merchantId", "pointCost", "rewardVal", "rewardPer", enabled, "userCapacity", "shopifyCode")
    VALUES
        ((select id from merchant), 8, 5, null, true, 3, 'CODE-A'),
        ((select id from merchant), 23, null, 20, true, 4, 'CODE-B')
    RETURNING *
),

-- Create the first lesson
lessonA AS
(
    INSERT INTO "Lesson"
        ("merchantID", index, name, body, "cooldownDuration", enabled)
    VALUES
        ((select id from merchant), 0, 'EmBeba', 'Learn about EmBeba!', 0, true)
    RETURNING *
),

-- Create the contents for the first lesson
contentA1 as
(
    INSERT INTO "Content"
           ("lessonID", index, body)
    VALUES
        ((select id from lessonA), 0, 'Safety & Efficacy. Our ingredients will always be: Safe, Clean, Purposeful, Soothing. Our ingredients will never include: Fillers, Added Fragrances, Phthalates, Parabens.')
    RETURNING *
),
contentA2 as
(
    INSERT INTO "Content"
           ("lessonID",index, body)
    VALUES
        ((select id from lessonA), 1, 'Sustainability & Equality. EmBeba products are made with packaging for the planet. This is done by using less-plastic packaging and reusable packaging! Healthy Skin = Healthy Planet = Healthy Skin. For example, our Diaper Balm turns into a coveted box for crayons or a colorful seed starter.')
    RETURNING *
),
-- Questions for the contents
questionsA as
(
    INSERT INTO "Question"
        ("contentID", index, "answerChoices", "correctAnswer", body, "pointValue")
    VALUES
        ((select id from contentA1), 0, '{Cruelty free,Untested,Not safe}', 0, 'EmBeBa products are',100),
        ((select id from contentA1), 1, '{Whole Foods Certified,Filled with added fragrances}', 1, 'EmBeBa products are not', 50),
        ((select id from contentA2), 0, '{True,False}', 0, 'EmBeBa helps the environment by using less-plastic packaging and reusable packaging', 100)
    RETURNING *
),

-- Create the second lesson
lessonB as
(
    INSERT INTO "Lesson"
        ("merchantID", index, name, body, "cooldownDuration", enabled)
    VALUES
        ((select id from merchant), 1, 'RickA.co', 'Learn about RickA!', 0, true)
    RETURNING *
),
-- Create the contents for the second lesson
contentB1 as
(
    INSERT INTO "Content"
           ("lessonID", index, body, "videoURL")
    VALUES
        ((select id from lessonB), 0, 'RickA is a famous musician who''s music video Never Gonna Give You Up is commonly used to surprise and RickRoll people', 'https://www.youtube.com/embed/dQw4w9WgXcQ')
    RETURNING *
),
contentB2 as
(
    INSERT INTO "Content"
           ("lessonID", index, body)
    VALUES
        ((select id from lessonB), 1, 'As an april fools joke, youtube directed every video on its homepage to the video in 2008')
    RETURNING *
),
-- Creates the questions for the second lesson
questionsB as (
    INSERT INTO "Question"
        ("contentID", index, "answerChoices", "correctAnswer", body, "pointValue")
    VALUES
        ((select id from contentB1), 0, '{YES}',0,'Are you glad to see Rick?',100),
        ((select id from contentB1), 1, '{Rickfall,RickDive,RickJump,RickRoll}', 3, 'What term is used to describe an unexpected appearance of this video?', 50),
        ((select id from contentB2), 0, '{1999,2008,2028,2007}', 1, 'In what year did youtube surprise visitors with this video on their site?', 100)
    RETURNING *
)
SELECT * from testUser;
