import { Db } from "mongodb"
import { findCacheStatus, upsertCacheStatus } from "../models/cache";
import { findMoneyByDate, upsertMoney } from "../models/money"
import { MoneyDataItem } from "../types/MonetaryDataItem";
import { getMoneySupply } from "./apiHelper";

const M1_CACHE_ID = 1;
const M2_CACHE_ID = 2;
const M3_CACHE_ID = 3;

const CACHE_MAP = {'M1': M1_CACHE_ID, 'M2': M2_CACHE_ID, 'M3': M3_CACHE_ID};

const CACHE_INVALID_PERIOD = 1000 * 60 * 60 * 24 * 1; // 1 day



export const getMonetaryData = async (db: Db, moneyType: 'M1' | 'M2' | 'M3') => {
    const cacheData = await findCacheStatus(db, CACHE_MAP[moneyType]);
    let moneyData = (await findMoneyByDate(db, new Date().getTime(), moneyType)) as unknown as MoneyDataItem[];
    const cacheNeedsUpdate = (cacheData?.updatedAt ?? 0) < new Date().getTime() - CACHE_INVALID_PERIOD;
    if (moneyData.length === 0 || cacheNeedsUpdate) {
        console.log("Updating cached data");
        const apiData = await getMoneySupply(moneyType);
        moneyData = await addDataToDB(db, apiData.chart_data[0][0].raw_data, moneyType) as MoneyDataItem[];
        await upsertCacheStatus(db, { id: CACHE_MAP[moneyType], updatedAt: new Date().getTime() });
    }
    return moneyData;
}

const addDataToDB = async (db: Db, raw_data: number[][], moneyType: 'M1' | 'M2' | 'M3' ) => {
    const data:MoneyDataItem[]= [];
    for (let i = 0; i < raw_data.length; i++) {
        console.log("Saving: " + raw_data[i]);
        const dataToSave = { date: raw_data[i][0], value: raw_data[i][1] };
        const status = await upsertMoney(db, dataToSave, moneyType);
        data.push(dataToSave);
        console.log("Saved: " + status);
    }
    return data;
}
