import { BlockPartial } from "../types/DataHelperBase";

import * as mongoDB from "mongodb";

const YAHOO_FINANCE_URL = "https://query1.finance.yahoo.com/v7/finance/quote?formatted=true&symbols={0}&fields={1}";
const FIELDS = "regularMarketChangePercent%2CregularMarketChange%2CregularMarketPrice%2ClongName%2CshortName%2CmarketState%2CpostMarketChangePercent%2CpostMarketChange%2CpostMarketPrice%2CpreMarketChange%2CpreMarketPrice%2CpreMarketChangePercent";
const MARKET_STATE_REG = "REGULAR";
const MARKET_STATE_PRE = "PRE";
const MARKET_STATE_POST = "POST";
const MARKET_STATE_NIGHT = "POSTPOST";
const MARKET_STATE_CLOSED = "CLOSED";
const QUOTE_TYPE_ETF = "ETF";
const QUOTE_TYPE_CRYPTO = "CRYPTOCURRENCY";
const QUOTE_TYPE_INDEX = "INDEX";

class StockHelper {
    async getBlockData(db: mongoDB.Db, symbol: string): Promise<any> {
        const url = YAHOO_FINANCE_URL.replace("{0}", symbol).replace("{1}", FIELDS);
        const response = await fetch(url,{
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36"
            }
        });
        const data = await response.json();
        console.log(JSON.stringify(data));
        const result = data.result[0];
        const name = this.getSymbolName(result);
        const state = result.marketState;
        const quoteType = result.quoteType;
        const price = this.getPriceForMarketStateByQuoteType(quoteType, state, result);

        return formatMessage({name, price, state, quoteType, symbol});
    }

    getSymbolName(result: any) {
        if (result.longName) {
            return result.longName;
        } else if (result.shortName) {
            return result.shortName;
        } else {
            return result.symbol;
        }
    }

    getPriceForMarketStateByQuoteType(quoteType: string, state: string, result: any) {
        if (quoteType === QUOTE_TYPE_INDEX || quoteType === QUOTE_TYPE_ETF) {
            return this.getPriceForMarketStateless(result);
        } else if (quoteType === QUOTE_TYPE_CRYPTO) {
            return this.getPriceForMarketStateCrypto(result);
        } else {
            return this.getPriceForMarketStateEquity(state, result);
        }
    }

    getPriceForMarketStateless(result: any) {
        return {
            current: result.regularMarketPrice.fmt,
            previous: result.regularMarketPreviousClose.fmt,
            change: result.regularMarketChange.fmt,
            percent: result.regularMarketChangePercent.fmt
        };
    }

    getPriceForMarketStateCrypto(result: any) {
        return {
            current: result.regularMarketPrice.fmt,
            previous: result.regularMarketPreviousClose.fmt,
            change: result.regularMarketChange.fmt,
            percent: result.regularMarketChangePercent.fmt
        };
    }

    getPriceForMarketStateEquity(state: string, result: any) {
        if (state === MARKET_STATE_PRE) {
            return {
                current: result.preMarketPrice.fmt,
                previous: result.regularMarketPrice.fmt,
                change: result.preMarketChange.fmt,
                percent: result.preMarketChangePercent.fmt
            };
        } else if (state === MARKET_STATE_POST || state === MARKET_STATE_NIGHT || state === MARKET_STATE_CLOSED) {
            return {
                current: result.postMarketPrice.fmt,
                previous: result.regularMarketPrice.fmt,
                change: result.postMarketChange.fmt,
                percent: result.postMarketChangePercent.fmt
            };
        } else {
            return {
                current: result.regularMarketPrice.fmt,
                previous: result.regularMarketPreviousClose.fmt,
                change: result.regularMarketChange.fmt,
                percent: result.regularMarketChangePercent.fmt
            };
        }
    }

}

const formatMessage = (details: {
    price: {
        change: string;
        current: string;
        previous: string;
        percent: string;
    };
    state: string;
    quoteType: string;
    name: string;
    symbol: string;

    
}) => {
    let format: any = {};
    if (details.price.change.startsWith('-')) {
        format.trend = ":chart_with_downwards_trend:";
        format.indicator = ":red_circle:";
        format.color = "#FF0000";
        details.price.change = details.price.change.replace("-", "-$");
    } else {
        format.trend = ":chart_with_upwards_trend:";
        format.indicator = ":large_green_circle:";
        format.color = "#00FF00";
        details.price.change = "+$" + details.price.change;
    }

    formatMessageAlt(format, details.state, details.quoteType);

    return [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": `${details.name} (${details.symbol.toUpperCase()})  ${format.indicator}`,
                "emoji": true
            }
        },
        {
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": `*${format.current_text}:*`
                },
                {
                    "type": "plain_text",
                    "text": `$${details.price.current}`
                },
                {
                    "type": "mrkdwn",
                    "text": `*${format.previous_text}:*`
                },
                {
                    "type": "plain_text",
                    "text": `$${details.price.previous}`
                },
                {
                    "type": "mrkdwn",
                    "text": "*Change:*"
                },
                {
                    "type": "plain_text",
                    "text": `${details.price.change} (${details.price.percent}) ${format.trend}`
                }
            ]
        },
        {
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": `More information <https://finance.yahoo.com/quote/${details.symbol}|here>`
                }
            ]
        }
    ]
}

function formatMessageAlt(format: any, state: string, quoteType: string): void {
    // Override color, emojis and some text if we are in pre/post market
    if (quoteType == QUOTE_TYPE_ETF || quoteType == QUOTE_TYPE_INDEX || quoteType == QUOTE_TYPE_CRYPTO) {
        format['current_text'] = "Market price";
        format['previous_text'] = "Previous close price";
        if (state != MARKET_STATE_REG) {
            format['color'] = "#777777";
            format['indicator'] = ":sleeping:";
        }
    } else {
        if (state == MARKET_STATE_PRE) {
            format['color'] = "#FFFF00";
            format['indicator'] = ":hatching_chick:";
            format['current_text'] = "Pre-Market price";
            format['previous_text'] = "Market close price";
        } else if (state == MARKET_STATE_POST) {
            format['color'] = "#777777";
            format['indicator'] = ":new_moon_with_face:";
            format['current_text'] = "After Hours price";
            format['previous_text'] = "Market close price";
        } else if (state == MARKET_STATE_NIGHT || state == MARKET_STATE_CLOSED) {
            format['color'] = "#777777";
            format['indicator'] = ":sleeping:";
            format['current_text'] = "After Hours close price";
            format['previous_text'] = "Market close price";
        } else {
            format['current_text'] = "Market price";
            format['previous_text'] = "Previous close price";
        }
    }
}

export default StockHelper;