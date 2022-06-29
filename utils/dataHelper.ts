import { formatMessage, getMoneySupply } from ".";


const MONEY_TYPES = ["M1", "M2", "M3"];

export const getData = async () => {
    const blocks = [];
    for (let i = 0; i < MONEY_TYPES.length; i++) {
        const moneyType = MONEY_TYPES[i];
        try {
            const blockData = await getBlockFromJson(moneyType);
            blocks.push(blockData);
            if (i < MONEY_TYPES.length - 1) {
                blocks.push({
                    type: "divider",
                });
            }
        } catch (ex) {
            blocks.push({
                type: "section",
                text: {
                    type: "plain_text",
                    text: ":warning: Error loading: " + moneyType,
                    emoji: true,
                },
            });
        }
    }
    return blocks;
};

const getBlockFromJson = async (moneyType: string) => {
    const moneyResp = await getMoneySupply(moneyType);
    const moneyRespJson = await moneyResp.json();
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

const parseResponse = (respJson: any) => {
    const moneyData = respJson.chart_data[0][0].raw_data;
    const moneyDataFrom = moneyData[moneyData.length - 2];
    const moneyDataTo = moneyData[moneyData.length - 1];
    const moneyDataYearAgo = moneyData[moneyData.length - 12];
    return { moneyDataFrom, moneyDataTo, moneyDataYearAgo };
}