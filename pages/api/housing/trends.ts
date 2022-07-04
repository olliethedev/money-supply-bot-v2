import type { NextApiResponse } from 'next'

import handler from '../../../middlewares';
import { NextApiRequestWithMongoDB } from '../../../types/NextApiRequestWithMongoDB';
import { getHousingTrends, HousingTrends } from '../../../utils/apiHelper';
import { getHousingToken } from '../../../utils/cacheHelper';

interface Data {
    trends: HousingTrends;
}

interface Error {
    error: string
}

handler.post(async (req: NextApiRequestWithMongoDB,
    res: NextApiResponse<Data | Error>) => {

    try {
        const body = req.body;
        const { municipality, community, house_type, province, period_num } = body;
        console.log({ municipality, community, house_type, province, period_num });
        const token = await getHousingToken(req.db);
        const trends = await getHousingTrends(token, { municipality, community, house_type, province, period_num });
        res.status(200).send({ trends });
    } catch (error) {
        console.log({ error });
        res.status(500).send({ error: 'Error getting data' });
    }
});

export default handler;



