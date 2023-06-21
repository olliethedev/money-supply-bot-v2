import { ChatOpenAI } from "langchain/chat_models/openai";
import { DynamicTool } from "langchain/tools";
import * as mongoDB from "mongodb";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { getMoneySupply } from "./apiHelper";
import MoneyHelper, { MoneyTypes } from "./MoneyHelper";
import StockHelper from "./StockHelper";
import HousingHelper from "./HousingHelper";
import moment from "moment";

class AIHelper {
    async getBlockData(db: mongoDB.Db, text: string) {
        const model = new ChatOpenAI({
            modelName: "gpt-3.5-turbo-0613",
            temperature: 0.4,
            verbose: false,
            timeout: 5 * 60 * 1000
        });
    
        // Add all available tools to the array
        const tools = [
            ...getTools(db),
        ];
    
        // Initialize the executor with the tools and model
        const executor = await initializeAgentExecutorWithOptions(tools, model, {
            agentType: "openai-functions",
            maxIterations: 6,
            verbose: false,
        });

        const result = await executor.call({ input: text });

        return result.output;
    }
}

const getTools = (db: mongoDB.Db) => {
    const getMoneySupply = async (input: string): Promise<string> => {
        console.log(`Fetching money supply for ${ input }`);
        try {
    
           const data =  new MoneyHelper().getBlockData(db, input as MoneyTypes);
    
            return JSON.stringify(data);
        } catch (error: any) {
            return `Error: ${ error.message }`;
        }
    };

    const getHousingStats = async (input:string): Promise<string> => {
        console.log(`Fetching housing stats for ${input}`);

        try {
            const parsed = JSON.parse(input);
            const data = await new HousingHelper().getBlockData(db, {...parsed,
                month: parsed.month ? moment(parsed.month).month(moment().month()).format("MMMM") : moment().month(moment().month()).format("MMMM"),
                year: parsed.year ? moment().year(moment(parsed.month).year()) : moment().year(moment().year()),
            });
            return JSON.stringify(data);
        } catch (error: any) {
            return `Error: ${ error.message }`;
        }
    };

    const getMarketPrices = async (input: string): Promise<string> => {
        console.log(`Fetching market prices for symbol ${ input }`);

        try {
            const data = await new StockHelper().getBlockData(db, input);
            return JSON.stringify(data);
        } catch (error: any) {
            return `Error: ${ error.message }`;
        }
    };



    const getMoneySupplyTool = new DynamicTool({
        name: "getMoneySupply",

        description: `Returns Canadas money supply.
        Input should be a single string of M1, M2, or M3. Example input: M1`,
        func: getMoneySupply,
    });

    const getHousingStatsTool = new DynamicTool({
        name: "getHousingStats",
        description: `Returns Grate Toronto Area housing stats.
        input should be a valid json object. Example input: { 
            filter: {
                municipality: "Toronto",
            } 
    
    }`,
        func: getHousingStats,
    });

    const getMarketPricesTool = new DynamicTool({
        name: "getMarketPrices",
        description: `Returns asset prices.
        Input should be a stock ticker or crypto ticker. Example input: AAPL, BTC, BTC-CAD, etc.`,
        func: getMarketPrices,
    });

    return [getMoneySupplyTool, getHousingStatsTool, getMarketPricesTool];
}



export default AIHelper;