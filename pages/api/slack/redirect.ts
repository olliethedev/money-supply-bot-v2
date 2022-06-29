
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { SlackInstaller } from '../../utils';


export default  function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    SlackInstaller.handleCallback(req, res);
}

