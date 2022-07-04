import * as mongoDB from "mongodb";

const TOKEN_LOGIN_ID = 1;

export async function findLoginToken(db: mongoDB.Db) {
    return db.collection("Tokens").findOne({
        id: TOKEN_LOGIN_ID,
    }).then((token) => token?.token || null);
  }

  export async function upsertLoginToken(db: mongoDB.Db, token: string) {
    return db.collection("Tokens").updateOne(
        {
            id: TOKEN_LOGIN_ID,
        },
        {
            $set: {
                token,
            },
        },
        {
            upsert: true,
        }   
    ).then(({ acknowledged }) => acknowledged);
  }