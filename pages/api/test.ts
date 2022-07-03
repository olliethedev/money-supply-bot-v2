import type { NextApiResponse } from 'next'

import handler from '../../middlewares';
import { MoneyDataItem } from '../../types/MonetaryDataItem';
import { NextApiRequestWithMongoDB } from '../../types/NextApiRequestWithMongoDB';
import { getMonetaryData } from '../../utils/cacheHelper';
import { commandHelper } from '../../utils/commandHelper';

interface Error {
    error: string
}
interface Data {
    data: any
}

handler.get(async (req: NextApiRequestWithMongoDB,
    res: NextApiResponse<Data | string | Error>) => {
    try {
        //["node", "commandHelper.ts", "split", "-s", "/", "a/b/c"]
        //["node", "commandHelper.ts", "--help"]
        await commandHelper(req.db, ["node", "MoneySupplyBotV2", "money", "-t", "M1"],
            (error) => {
                res.status(500).send({ error: error });
            }, (help) => {
                res.status(200).send({ data: help });
            }, async (data) => {
                res.status(200).send({ data });
            })

    } catch (error) {
        console.log({ error });
        res.status(500).send({ error: 'Error getting data' });
    }
});

export default handler;
