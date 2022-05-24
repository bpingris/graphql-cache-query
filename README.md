# graphql-cache-query

```js
import { gql } from "graphql-request";

const client = new GraphQL("https://graphqlzero.almansi.me/api");

const query = gql`
  query ($id: ID!) {
    post(id: $id) {
      id
      title
      body
    }
  }
`;

// real request is made, result is stored for this request with this payload and is valid for 10 seconds
const foo = await client.query(query, { variables: { id: 1 }, ttl: 10 });
console.log(foo)

// real request is made, result is stored for this request with this payload and is valid for 10 seconds
const bar = await client.query(query, { variables: { id: 3 }, ttl: 10 });
console.log(bar)

// request is not made, result exists in cache and is returned
const qux = await client.query(query, { variables: { id: 3 }});
console.log(qux)
```
