import fetch from 'node-fetch';
import { MonetaryData } from '../types/MonetartyDataResponse';

export const getMoneySupply = async (moneySupplyType: 'M1' | 'M2' | 'M3') => {
    const moneyResp = await fetch(`${ process.env.DATA_API }?chartType=interactive&dateSelection=range&format=real&partner=basic_2000&scaleType=linear&splitType=single&zoom=2&redesign=true&maxPoints=689&securities=id%3AI%3AC${ moneySupplyType }${ moneySupplyType === "M3" ? "MS" : "MSSM" }%2Cinclude%3Atrue%2C%2C`, {
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
    return (moneyResp.json() as  Promise<MonetaryData>);
}