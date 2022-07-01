import type { NextApiResponse } from 'next'

import handler from '../../middlewares';
import { MoneyDataItem } from '../../types/MonetaryDataItem';
import { NextApiRequestWithMongoDB } from '../../types/NextApiRequestWithMongoDB';
import { getMonetaryData } from '../../utils/cacheHelper';

interface Error {
    error: string
}

handler.get(async (req: NextApiRequestWithMongoDB,
    res: NextApiResponse< MoneyDataItem[] | Error>) => {

    try {
        const data = await getMonetaryData(req.db, 'M1');
        res.status(200).send(data);
    } catch (error) {
        console.log({ error });
        res.status(500).send({ error: 'Error getting data' });
    }
});

export default handler;
