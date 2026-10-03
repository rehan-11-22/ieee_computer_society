import "server-only";

import { MongoClient } from "mongodb";

const databaseName = process.env.MONGODB_DB || "ieee_certificate_portal";

declare global {
  var mongodbClientPromise: Promise<MongoClient> | undefined;
}

let productionClientPromise: Promise<MongoClient> | undefined;

function createClientPromise() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  return new MongoClient(uri, { maxPoolSize: 10 }).connect();
}

export function getMongoClient() {
  if (process.env.NODE_ENV === "development") {
    global.mongodbClientPromise ??= createClientPromise();
    return global.mongodbClientPromise;
  }

  productionClientPromise ??= createClientPromise();
  return productionClientPromise;
}

export async function getDatabase() {
  const client = await getMongoClient();
  return client.db(databaseName);
}
