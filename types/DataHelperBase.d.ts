import * as mongoDB from "mongodb";

export interface DataHelperBase<T> {
    getBlockData: (db:mongoDB.Db, extra: T) => Promise<BlockPartial>;
}
export interface BlockPartial {
    type: string;
    text:{
        type: string;
        text: string;
    }
}