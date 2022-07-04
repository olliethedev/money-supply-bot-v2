
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiResponse } from 'next';
import { getSlackInstaller } from '../../../utils';
import { NextApiRequestWithMongoDB } from '../../../types/NextApiRequestWithMongoDB';
import handler from '../../../middlewares';

handler.all(async (
    req: NextApiRequestWithMongoDB,
    res: NextApiResponse<any>
) => {
    getSlackInstaller(req.db).handleCallback(req, res);
})

export default handler;

