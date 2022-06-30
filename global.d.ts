export {};

declare global {
    type GlobalMongo = globalThis & {
    mongo: mongoDB.MongoClient;
  };
}