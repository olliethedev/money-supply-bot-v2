import * as mongoDB from "mongodb";
import type { NextApiRequest, NextApiResponse } from 'next'

export type NextApiRequestWithMongoDB = NextApiRequest & {
    dbClient: mongoDB.MongoClient,
    db: mongoDB.Db,
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentiatlly
 * during API Route usage.
 * https://github.com/vercel/next.js/pull/17666
 */

 let globalWithMongo = global as GlobalMongo;

let indexesCreated = false;
export async function createIndexes(db:mongoDB.Db) {
  await Promise.all([
    db.collection('Installations').createIndex({ installation: 1 }, { unique: true }),
  ]);
  indexesCreated = true;
}

export default async function database(req: NextApiRequestWithMongoDB, res: NextApiResponse, next:()=>void) {
  if (!globalWithMongo.mongo) {
    globalWithMongo.mongo = new mongoDB.MongoClient(process.env.MONGODB_URI as string, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    });
    await globalWithMongo.mongo.connect();
  }
  req.dbClient = globalWithMongo.mongo;
  req.db = globalWithMongo.mongo.db(process.env.DB_NAME);
  if (!indexesCreated) await createIndexes(req.db);
  return next();
}