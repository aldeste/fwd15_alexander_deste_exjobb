import { idFetcher, typeResolver } from "../relayNode";
import schema from "../";
import { graphql } from "graphql";
import { createLoaders } from "../apiHelper";

beforeAll(async () => {
  console.log = jest.fn();
  await require("../../data").initializeDatabase();
});

describe("idFetcher", () => {
  it("should default to null if unresolvable", () => {
    expect(idFetcher("IiI6IiI=")).toBeNull();
  });

  it("should return an object if parameters are valid ", async () => {
    const result = await idFetcher("cGVvcGxlOjQ=");
    expect(result.name).toBeDefined();
    expect(result.token).toBeDefined();
    expect(result.id).toBeDefined();
  });
});

describe("typeResolver", () => {
  it("should default to null if unresolvable", () => {
    expect(typeResolver({})).toBeNull();
  });

  it("should return correct type", () => {
    const obj = {
      GraphQLType: "Person"
    };
    expect(typeResolver(obj).name).toBe("Person");
  });
});

describe("nodeInterface", () => {
  const rootValue = {};
  const context = { loaders: createLoaders() };

  it("should return person with valid person id", async () => {
    const query = `query Test {
      node(id:"cGVvcGxlOjQ=") {
        ... on Person {
          name
        }
      }
    }`;

    const { data } = await graphql(schema, query, rootValue, context);
    expect(data).toMatchSnapshot();
  });

  it("should return planet with valid planet id", async () => {
    const query = `query Test {
      node(id:"cGxhbmV0czo2MA==") {
        ... on Planet {
          name
        }
      }
    }`;

    const { data } = await graphql(schema, query, rootValue, context);
    expect(data).toMatchSnapshot();
  });

  it("should error if no id is suplied", async () => {
    const query = `query Test {
      node {
        ... on Person {
          name
        }
      }
    }`;

    const result = await graphql(schema, query, rootValue, context);

    expect(result.errors).toBeDefined();
  });

  it("should fail if called with false value", async () => {
    const query = `query Test {
      node(id:"e") {
        ... on Person {
          name
        }
      }
    }`;

    const { data } = await graphql(schema, query, rootValue, context);
    expect(data).toMatchSnapshot();
  });
});
