import type { NextApiResponse } from 'next'
import handler from '../../../middlewares';
import { NextApiRequestWithMongoDB } from '../../../types/NextApiRequestWithMongoDB';
import { getHousingFilters, HousingFilters } from '../../../utils/apiHelper';
import { getHousingToken } from '../../../utils/cacheHelper';

interface Data {
    filters: HousingFilters;
}

interface Error {
    error: string
}

handler.get(async (req: NextApiRequestWithMongoDB,
    res: NextApiResponse<Data | Error>) => {
    try {
        const token = await getHousingToken(req.db);
        const filters = await getHousingFilters(token);
        delete filters.data.current;
        delete filters.data.filter_active;
        res.status(200).send({ filters });
    } catch (error) {
        console.log({ error });
        res.status(500).send({ error: 'Error getting data' });
    }
});

export default handler;


