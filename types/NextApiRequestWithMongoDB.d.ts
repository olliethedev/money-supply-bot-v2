import type { NextApiRequest } from 'next'

export type NextApiRequestWithMongoDB = NextApiRequest & {
    dbClient: mongoDB.MongoClient,
    db: mongoDB.Db,
}