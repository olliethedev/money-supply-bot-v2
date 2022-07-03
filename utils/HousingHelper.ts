import moment from 'moment';
import * as mongoDB from "mongodb";
import { DataHelperBase, BlockPartial } from '../types/DataHelperBase';
import { HousingFilter } from '../types/HousingFilter';
import { getHousingTrends, HousingTrends } from './apiHelper';

class HousingHelper implements DataHelperBase<{filter:HousingFilter, month:string, year:string}> {
    async getBlockData(db: mongoDB.Db, extra: {filter:HousingFilter, month:string, year:string}): Promise<BlockPartial> {
        //todo: refactor to use caching
        console.log({extra});
        const trends = await getHousingTrends(extra.filter);
        console.log({ trendsLength: trends.data.chart.length });
        const { dataFrom, dataTo, dataYearAgo } = this.parseData(trends, extra.month, extra.year);
        console.log({ dataFrom, dataTo, dataYearAgo });
        const parsed = this.formatMessage(
            moment(dataFrom.period).unix()*1000,
            parseInt(dataFrom.price_sold),
            moment(dataTo.period).unix()*1000,
            parseInt(dataTo.price_sold),
            parseInt(dataYearAgo.price_sold),
            extra.filter
        );
        return {
            type: "section",
            text: {
                type: "mrkdwn",
                text: parsed,
            },
        };
    }
    parseData = (trends: HousingTrends, month:string, year:string) => {
        
        const data = trends.data.chart;
        const offset = data.findIndex(t => t.period.includes(`${year}-${month}`)) ?? 0;
        const offsetFromEnd = data.length - offset - 1;
        const dataFrom = data[data.length - offsetFromEnd - 2];
        const dataTo = data[data.length - offsetFromEnd - 1];
        const yearSafeOffset = Math.min(data.length - 1, data.length - offsetFromEnd - 13);
        const dataYearAgo = data[yearSafeOffset];
        return { dataFrom, dataTo, dataYearAgo };
    }
    
    formatMessage = (
        fromTime: number,
        fromValue: number,
        toTime: number,
        toValue: number,
        yearAgoValue: number,
        filter: HousingFilter
    ) => {
        const isUp = fromValue < toValue;
        const changed = isUp
            ? "chart_with_upwards_trend"
            : "chart_with_downwards_trend";
        const percent = (((toValue - fromValue) / fromValue) * 100.0).toFixed(2);
        // const fromValueClean = (fromValue / 1000000).toFixed(2);
        // const toValueClean = (toValue / 1000000).toFixed(2);
        // const fromTimeMonth = moment(fromTime).format("MMMM");
        // const toTimeMonth = moment(toTime).format("MMMM");
        const YoYpercent = ((toValue - yearAgoValue) / yearAgoValue * 100.00).toFixed(2);
        return `:flag-ca: *${ this.formatFilter(filter) }*  \n :${ changed }: Monthly change: *${ percent }%* \n Yearly change: *${ YoYpercent }%* `;
        // return ` Canada's ${moneySupplyType} ${changed} from $${fromValueClean}T in ${fromTimeMonth} to $${toValueClean}T in ${toTimeMonth}, a change of ${percent}% from last month.`;
    }

    formatFilter = (filter: HousingFilter) => {
        return `:round_pushpin: Municipality: ${filter.municipality}, :people_hugging: Community: ${filter.community}, :house: House Type: ${filter.house_type}`;
    }
}

export default HousingHelper;
