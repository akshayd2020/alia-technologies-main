import { expect } from "chai";
import { createGraphQLServer } from "./schema";
import { PrismaClient} from "@prisma/client";


// describe('basic user resolver test', async () => {
//     const prisma = new PrismaClient();
//     const testServer = createGraphQLServer(prisma);

//     it('creates a user', async () => {
//         const result = await testServer.executeOperation({
//             query: ` {
//                mutation createUser(email: "hello#email.com")
//             }`,
//         });

//         expect(result.errors).to.be.undefined;
//         expect(result.data?.user.email).to.be.eq("hello#email.com");
//     })

// })