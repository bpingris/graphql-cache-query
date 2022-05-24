import { request, gql } from "graphql-request";

function log(m) {
  if (typeof m === "object") {
    console.log(m);
    return;
  }
  console.log(`[INFO]: ${m}`);
}

const query = gql`
  query ($id: ID!) {
    post(id: $id) {
      id
      title
      body
    }
  }
`;

function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++)
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;

  return h;
}

class GraphQL {
  constructor(url) {
    this.url = url;
    this.cache = {};
    this.headers = undefined;
  }

  query(q, { variables = undefined, ttl = 0 } = {}) {
    const hash = hashCode(q + JSON.stringify(variables));
    const cached = this.cache[hash];
    if (cached) {
      log("data exists in cache, checking its validity");
      if (cached.ttl > Date.now()) {
        return cached.data;
      }
      log("data has expired, removing it and proceed to a new request");
      delete this.cache[hash];
    }
    log("not cached, performing real query");
    return request(this.url, q, variables, this.headers).then((data) => {
      const _ttl = new Date();
      _ttl.setSeconds(_ttl.getSeconds() + ttl);
      this.cache[hash] = {
        data,
        ttl: _ttl.getTime(),
      };
      return this.cache[hash].data;
    });
  }
}

function sleep(n) {
  return new Promise((resolve) => setTimeout(() => resolve(), n));
}

async function main() {
  const client = new GraphQL("https://graphqlzero.almansi.me/api");
  let r = {};

  r = await client.query(query, { variables: { id: 1 }, ttl: 10 });
  log({ r });

  log("waiting 2 seconds");
  await sleep(2000);

  r = await client.query(query, { variables: { id: 3 }, ttl: 10 });
  log({ r });

  log("waiting 2 seconds");
  await sleep(2000);

  r = await client.query(query, { variables: { id: 3 } });
  log({ r });
}

main();
