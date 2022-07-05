import moment from 'moment';
import * as mongoDB from "mongodb";
import { DataHelperBase, BlockPartial } from '../types/DataHelperBase';
import { HousingFilter } from '../types/HousingFilter';
import { getHousingFilters, getHousingTrends, HousingTrends } from './apiHelper';
import { getHousingToken } from './cacheHelper';

class HousingHelper implements DataHelperBase<{ filter: HousingFilter, month: string, year: string }> {
    async getBlockData(db: mongoDB.Db, extra: { filter: HousingFilter, month: string, year: string }): Promise<BlockPartial> {
        const token = await getHousingToken(db);
        if (extra.filter.municipality_name) {
            extra.filter.municipality = await this.lookupCode(token, extra.filter.municipality_name);
        }
        console.log({ extra });
        const trends = await getHousingTrends(token, extra.filter);
        console.log({ trendsLength: trends.data.chart.length });
        const { dataFrom, dataTo, dataYearAgo } = this.parseData(trends, extra.month, extra.year);
        console.log({ dataFrom, dataTo, dataYearAgo });
        const parsed = this.formatMessage(
            moment(dataFrom.period).unix() * 1000,
            parseInt(dataFrom.price_sold),
            moment(dataTo.period).unix() * 1000,
            parseInt(dataTo.price_sold),
            moment(dataYearAgo.period).unix() * 1000,
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
    lookupCode = async (token: string, municipalityName: string) => {
        const filters = await getHousingFilters(token);
        const ids = filters.data.municipality_filter?.flatMap(item => item.list).map(item => ({ name: item?.name.toLocaleLowerCase(), id: item?.id })).filter(item => item.name === municipalityName.toLocaleLowerCase()).map(item => item.id);
        return (ids?.[0] ?? 1001).toString();
    }
    parseData = (trends: HousingTrends, month: string, year: string) => {
        const data = trends.data.chart;
        const offset = data.findIndex(t => t.period.includes(`${ year }-${ month }`)) ?? 0;
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
        yearAgoDate: number,
        yearAgoValue: number,
        filter: HousingFilter
    ) => {
        const isUp = fromValue < toValue;
        const changed = isUp
            ? "chart_with_upwards_trend"
            : "chart_with_downwards_trend";
        const percent = (((toValue - fromValue) / fromValue) * 100.0).toFixed(2);
        const yearAgoDateFormatted = moment(yearAgoDate).format("MMMM YYYY");
        const YoYpercent = ((toValue - yearAgoValue) / yearAgoValue * 100.00).toFixed(2);
        return `:flag-ca: *${ this.formatFilter(filter) }*  \n :${ changed }: Monthly change: *${ percent }%* \n Yearly change (${yearAgoDateFormatted}): *${ YoYpercent }%* `;
    }

    formatFilter = (filter: HousingFilter) => {
        return `:round_pushpin: Municipality: ${ filter.municipality }, :house: House Type: ${ filter.house_type }`;
    }
}

export default HousingHelper;
