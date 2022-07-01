import moment from 'moment';
import * as mongoDB from "mongodb";
import { MoneyDataItem } from '../types/MonetaryDataItem';
import { getMonetaryData } from './cacheHelper';

export const getBlockData = async (db:mongoDB.Db ,moneyType: "M1" | "M2" | "M3") => {
    const moneyRespJson = await getMonetaryData(db, moneyType);
    const { moneyDataFrom, moneyDataTo, moneyDataYearAgo } =
        parseData(moneyRespJson);
    const parsed = formatMessage(
        moneyDataFrom.date,
        moneyDataFrom.value,
        moneyDataTo.date,
        moneyDataTo.value,
        moneyDataYearAgo.value,
        moneyType
    );
    return {
        type: "section",
        text: {
            type: "mrkdwn",
            text: parsed,
        },
    };
};

const parseData = (moneyData: MoneyDataItem[]) => {
    const moneyDataFrom = moneyData[moneyData.length - 2];
    const moneyDataTo = moneyData[moneyData.length - 1];
    const yearSafeOffset= Math.min(moneyData.length-1, moneyData.length - 13);
    const moneyDataYearAgo = moneyData[yearSafeOffset];
    return { moneyDataFrom, moneyDataTo, moneyDataYearAgo };
}

const formatMessage = (
    fromTime: number,
    fromValue: number,
    toTime: number,
    toValue: number,
    yearAgoValue: number,
    moneySupplyType: "M1" | "M2" | "M3"
) => {
    const isUp = fromValue < toValue;
    const changed = isUp
        ? "chart_with_upwards_trend"
        : "chart_with_downwards_trend";
    const percent = (((toValue - fromValue) / fromValue) * 100.0).toFixed(2);
    // const fromValueClean = (fromValue / 1000000).toFixed(2);
    // const toValueClean = (toValue / 1000000).toFixed(2);
    // const fromTimeMonth = moment(fromTime).format("MMMM");
    const toTimeMonth = moment(toTime).format("MMMM");
    const YoYpercent = ((toValue - yearAgoValue) / yearAgoValue * 100.00).toFixed(2);
    return `:flag-ca: *${ moneySupplyType }*  \n :${ changed }: ${ toTimeMonth } change: *${ percent }%* \n Yearly change: *${ YoYpercent }%* `;
    // return ` Canada's ${moneySupplyType} ${changed} from $${fromValueClean}T in ${fromTimeMonth} to $${toValueClean}T in ${toTimeMonth}, a change of ${percent}% from last month.`;
}