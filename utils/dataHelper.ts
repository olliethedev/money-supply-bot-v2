import fetch from 'node-fetch';
import moment from 'moment';
import { MonetaryData } from '../types/MonetartyDataResponse';

export const getBlockData = async (moneyType: string) => {
    const moneyResp = await getMoneySupply(moneyType);
    const moneyRespJson = (await moneyResp.json()) as MonetaryData;
    const { moneyDataFrom, moneyDataTo, moneyDataYearAgo } =
        parseResponse(moneyRespJson);
    const parsed = formatMessage(
        moneyDataFrom[0],
        moneyDataFrom[1],
        moneyDataTo[0],
        moneyDataTo[1],
        moneyDataYearAgo[1],
        moneyType as "M1" | "M2" | "M3"
    );
    return {
        type: "section",
        text: {
            type: "mrkdwn",
            text: parsed,
        },
    };
};

const parseResponse = (respJson: MonetaryData) => {
    const moneyData = respJson.chart_data[0][0].raw_data;
    const moneyDataFrom = moneyData[moneyData.length - 2];
    const moneyDataTo = moneyData[moneyData.length - 1];
    const yearSafeOffset= Math.min(moneyData.length-1, moneyData.length - 13);
    const moneyDataYearAgo = moneyData[yearSafeOffset];
    return { moneyDataFrom, moneyDataTo, moneyDataYearAgo };
}

const getMoneySupply = async (moneySupplyType = 'M1') => {
    return fetch(`${ process.env.DATA_API }?chartType=interactive&dateSelection=range&format=real&partner=basic_2000&scaleType=linear&splitType=single&zoom=2&redesign=true&maxPoints=689&securities=id%3AI%3AC${ moneySupplyType }${ moneySupplyType === "M3" ? "MS" : "MSSM" }%2Cinclude%3Atrue%2C%2C`, {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "max-age=0",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "sec-gpc": "1",
            "upgrade-insecure-requests": "1",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
    });
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