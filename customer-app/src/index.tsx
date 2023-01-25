import React from "react";
import * as ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import {
  ApolloClient,
  ApolloProvider,
  gql,
  InMemoryCache,
} from "@apollo/client";
// Remember to change the port here and put in whatever query params you want
const shopifyCustomerID = 22;
const shopURL = "alia-learn-development-store.myshopify.com";

const client = new ApolloClient({
  uri: `http://localhost:38299/graphql?logged_in_customer_id=${shopifyCustomerID}&shop=${shopURL}`,
  cache: new InMemoryCache(),
});

const rootNode = document.getElementById("root") as HTMLElement;
ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  rootNode
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
