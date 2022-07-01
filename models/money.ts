import * as mongoDB from "mongodb";

export async function findMoneyByDate(db: mongoDB.Db, date: number, moneyType: 'M1' | 'M2' | 'M3') {
    return db.collection(moneyType).find({
        date: {$lt: date},
    }).toArray();
  }

  export async function upsertMoney(db: mongoDB.Db, data: {date:number, value:number}, moneyType: 'M1' | 'M2' | 'M3') {
    return db.collection(moneyType).updateOne(
        {
            date: data.date,
        },
        {
            $set: {
                ...data,
            },
        },
        {
            upsert: true,
        }   
    ).then(({ acknowledged }) => acknowledged);
  }