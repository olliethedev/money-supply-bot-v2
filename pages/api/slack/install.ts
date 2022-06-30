// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSlackInstaller } from '../../../utils';
import nc from 'next-connect';
import database, { NextApiRequestWithMongoDB } from '../../../middlewares/database';

const handler = nc();

handler.use(database);

handler.get(async (
    req: NextApiRequestWithMongoDB,
    res: NextApiResponse<any>
)=> {
    await  getSlackInstaller(req.db).handleInstallPath(req, res, undefined, {
        scopes: ['chat:write', 'chat:write.public', 'app_mentions:read'],
        metadata: 'some_metadata',
        redirectUri: process.env.SLACK_OAUTH_REDIRECT as string
    });
})
export default handler;