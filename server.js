const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const Queue = require("bull");

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const logUsageQueue = new Queue("logUsuageQueue", REDIS_URL);

const typeDefs = `
  type Query {
    products: [Product]
  }

  type Product {
    id: ID!
    name: String!
    price: Int!
  }
`;

const resolvers = {
  Query: {
    products: () => [{ id: "abc", name: "GraphQL Stickers", price: 1000 }],
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();

const apiKeys = {
  // this would be stored in your database/user table
  user1: "si_Ki44PrgdKmJ19S",
};

app.use(async (req, res, next) => {
  const { authorization } = req?.headers;

  const subscriptionItemId = apiKeys[authorization];

  await logUsageQueue.add({ subscriptionItemId });

  next();
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: {
      headerEditorEnabled: true,
    },
  })
);

app.listen(4000, () => {
  console.log(`Server listening on http://localhost:4000`);
});
