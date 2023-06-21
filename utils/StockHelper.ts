

class StockHelper {

    async getStockData(ticker:string) {
        const extra = "regularMarketChangePercent%2CregularMarketChange%2CregularMarketPrice%2ClongName%2CshortName%2CmarketState%2CpostMarketChangePercent%2CpostMarketChange%2CpostMarketPrice%2CpreMarketChange%2CpreMarketPrice%2CpreMarketChangePercent";
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?formatted=true&symbols=${ticker}&fields=${extra}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log({ data });
        return data.quoteResponse.result[0];
    }

}

export default StockHelper;