import * as mongoDB from "mongodb";
import { CacheStatus } from "../types/CacheStatus";

export const upsertCacheStatus = async (db: mongoDB.Db, cacheStatus: CacheStatus) => {
    return db
        .collection('CacheStatus')
        .updateOne(
            {
                id: cacheStatus.id,
            },
            {
                $set: {
                    ...cacheStatus,
                },
            },
            {
                upsert: true,
            }
        )
        .then(({ acknowledged }) => acknowledged);
}

export const findCacheStatus = async (db: mongoDB.Db, id: number) : Promise<CacheStatus | null> => {
    return db
        .collection('CacheStatus')
        .findOne({
            id: id,
        })
        .then((cacheStatus) => cacheStatus || null) as Promise<CacheStatus | null>;
}