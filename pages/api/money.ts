import type { NextApiResponse } from 'next'

import handler from '../../middlewares';
import { MoneyDataItem } from '../../types/MonetaryDataItem';
import { NextApiRequestWithMongoDB } from '../../types/NextApiRequestWithMongoDB';
import { getMonetaryData } from '../../utils/cacheHelper';

interface Error {
    error: string
}

handler.get(async (req: NextApiRequestWithMongoDB,
    res: NextApiResponse<MoneyDataItem[] | Error>) => {
    const query = req.query;
    const { moneyType } = query;
    try {
        if(moneyType === 'M1' || moneyType === 'M2' || moneyType === 'M3') {
            const data = await getMonetaryData(req.db, moneyType);
            res.status(200).send(data);
        }else{
            res.status(500).send({ error: 'Unknown money type: ' + moneyType });
        }
    } catch (error) {
        console.log({ error });
        res.status(500).send({ error: 'Error getting data' });
    }
});

export default handler;
