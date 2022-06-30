
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSlackInstaller } from '../../../utils';
import nc from 'next-connect';
import database, { NextApiRequestWithMongoDB } from '../../../middlewares/database';

const handler = nc();

handler.use(database);

handler.get(async (
    req: NextApiRequestWithMongoDB,
    res: NextApiResponse<any>
) => {
    getSlackInstaller(req.db).handleCallback(req, res);
})


export default handler;

