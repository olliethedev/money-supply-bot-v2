// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { SlackInstaller } from '../../../utils';


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    await SlackInstaller.handleInstallPath(req, res, undefined, {
        scopes: ['chat:write', 'chat:write.public', 'app_mentions:read'],
        userScopes: ['chat:write', 'channels:write'],
        metadata: 'some_metadata',
        redirectUri: process.env.SLACK_OAUTH_REDIRECT as string
    });
}
