import type {  NextApiResponse } from 'next'
import { NextApiRequestWithMongoDB } from '../../../types/NextApiRequestWithMongoDB';
import { getSlackInstaller } from '../../../utils';
import handler from '../../../middlewares';


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