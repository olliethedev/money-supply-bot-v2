import * as mongoDB from "mongodb";

export {};

declare global {
    type GlobalMongo =  {
    mongo: mongoDB.MongoClient ;
  } & typeof globalThis;
}