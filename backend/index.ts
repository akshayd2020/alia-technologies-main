// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import cookieParser from "cookie-parser";
import { Shopify, LATEST_API_VERSION } from "@shopify/shopify-api";

import applyAuthMiddleware from "./middleware/auth.js";
import verifyRequest from "./middleware/verify-request.js";
import { setupGDPRWebHooks } from "./gdpr";
import productCreator from "./helpers/product-creator.js";
import redirectToAuth from "./helpers/redirect-to-auth.js";
import { AppInstallations } from "./app_installations";

import { createGraphQLServer } from "./graphql/schema";
import { PrismaClient } from "@prisma/client";

const USE_ONLINE_TOKENS = false;

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || "", 10);
console.log(`Backend running on port: ${PORT}`);

const DB_URL = process.env.DATABASE_URL;
if (DB_URL === undefined) {
    console.error("DATABASE_URL is undefined");
    process.exit(1);
}

// TODO: These should be provided by env vars
const DEV_MERCHANT_INDEX_PATH = "../merchant-app/";
const PROD_MERCHANT_INDEX_PATH = "../merchant-app/";
// const DEV_CUSTOMER_INDEX_PATH = "/customer-app/";
// const PROD_CUSTOMER_INDEX_PATH = "/customer-app/";

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY || "",
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET || "",
  SCOPES: (process.env.SCOPES || "").split(","),
  HOST_NAME: (process.env.HOST || "").replace(/https?:\/\//, ""),
  HOST_SCHEME: (process.env.HOST || "").split("://")[0],
  API_VERSION: LATEST_API_VERSION,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: new Shopify.Session.PostgreSQLSessionStorage(new URL(DB_URL)),
});

Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
  path: "/api/webhooks",
  webhookHandler: async (_topic, shop, _body) => {
    await AppInstallations.delete(shop);
  },
});

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const BILLING_SETTINGS = {
  required: false,
  // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
  // chargeName: "My Shopify One-Time Charge",
  // amount: 5.0,
  // currencyCode: "USD",
  // interval: BillingInterval.OneTime,
};

// This sets up the mandatory GDPR webhooks. You’ll need to fill in the endpoint
// in the “GDPR mandatory webhooks” section in the “App setup” tab, and customize
// the code when you store customer data.
//
// More details can be found on shopify.dev:
// https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks
setupGDPRWebHooks("/api/webhooks");

// export for test use only
export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production",
  billingSettings = BILLING_SETTINGS
) {
  const app = express();

  app.set("use-online-tokens", USE_ONLINE_TOKENS);
  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

  applyAuthMiddleware(app, {
    billing: billingSettings,
  });

  // Do not call app.use(express.json()) before processing webhooks with
  // Shopify.Webhooks.Registry.process().
  // See https://github.com/Shopify/shopify-api-node/blob/main/docs/usage/webhooks.md#note-regarding-use-of-body-parsers
  // for more details.
  app.post("/api/webhooks", async (req, res) => {
    try {
      await Shopify.Webhooks.Registry.process(req, res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (e: any) {
      console.log(`Failed to process webhook: ${e.message}`);
      if (!res.headersSent) {
        res.status(500).send(e.message);
      }
    }
  });

  // All endpoints after this point will require an active session
  app.use(
    "/api/*",
    verifyRequest(app, {
      billing: billingSettings,
    })
  );

  app.get("/api/products/count", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    const { Product } = await import(
      `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
    );

    const countData = await Product.count({ session });
    res.status(200).send(countData);
  });

  app.get("/api/products/create", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    let status = 200;
    let error = null;

    try {
      await productCreator(session);
    } catch (e: any) {
      console.log(`Failed to process products/create: ${e.message}`);
      status = 500;
      error = e.message;
    }
    res.status(status).send({ success: status === 200, error });
  });

  // All endpoints after this point will have access to a request.body
  // attribute, as a result of the express.json() middleware
  app.use(express.json());

  app.use((req, res, next) => {
    const shop = Shopify.Utils.sanitizeShop(req.query.shop as string);
    if (Shopify.Context.IS_EMBEDDED_APP && shop) {
      res.setHeader(
        "Content-Security-Policy",
        `frame-ancestors https://${encodeURIComponent(
          shop
        )} https://admin.shopify.com;`
      );
    } else {
      res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
    }
    next();
  });

  // Sets up the GraphQL server at /graphql
  let prisma = new PrismaClient();
  const graphqlServer = createGraphQLServer(prisma);
  await graphqlServer.start();
  graphqlServer.applyMiddleware({ app, path: "/graphql" });

  // Middleware that creates the user in our DB if it doesn't already exist
  // TODO: this is very temporary
  // app.use(async (req, res, next) => {
  //   if (req.query["shop"] !== undefined && req.query["logged_in_customer_id"] !== undefined) {
  //     let customerID = parseInt(String(req.query["logged_in_customer_id"]));
  //     let session = await Shopify.Utils.loadOfflineSession(String(req.query["shop"]));
      
  //     let shop = await findMerchantByURL(prisma, String(req.query["shop"]));

  //     if (session && shop) {
  //       let currentUser = await findUserByCustomerID(prisma, customerID);

  //       if (!currentUser) {
  //         // No user exists, create it now

  //         await createUser(prisma, customerID, shop.id, "Test name", 0, 0, null);
  //       }
  //     }
  //   }

  //   next();
  // });

  if (isProd) {
    const compression = await import("compression").then(
      ({ default: fn }) => fn
    );
    const serveStatic = await import("serve-static").then(
      ({ default: fn }) => fn
    );
    app.use(compression());
    app.use(serveStatic(PROD_MERCHANT_INDEX_PATH, { index: false }));
  }

  // Serve the customer app
  // app.use("/customer", async (req, res, next) => {
  //   const customerHtmlFile = join(
  //     isProd ? PROD_CUSTOMER_INDEX_PATH : DEV_CUSTOMER_INDEX_PATH,
  //     "index.html"
  //   );

  //   return res
  //     .status(200)
  //     .set("Content-Type", "text/html")
  //     .send(readFileSync(customerHtmlFile));
  // })

  // Serve the merchant app
  app.use("/*", async (req, res, next) => {
    if (typeof req.query.shop !== "string") {
      res.status(500);
      return res.send("No shop provided");
    }

    const shop = Shopify.Utils.sanitizeShop(req.query.shop)!;
    const appInstalled = await AppInstallations.includes(shop);

    if (!appInstalled) {
      return redirectToAuth(req, res, app);
    }

    if (Shopify.Context.IS_EMBEDDED_APP && req.query.embedded !== "1") {
      const embeddedUrl = Shopify.Utils.getEmbeddedAppUrl(req);

      return res.redirect(embeddedUrl + req.path);
    }

    const merchantHtmlFile = join(
      isProd ? PROD_MERCHANT_INDEX_PATH : DEV_MERCHANT_INDEX_PATH,
      "index.html"
    );

    return res
      .status(200)
      .set("Content-Type", "text/html")
      .send(readFileSync(merchantHtmlFile));

    return res.redirect("");
  });

  return { app };
}

createServer().then(({ app }) => app.listen(PORT));
