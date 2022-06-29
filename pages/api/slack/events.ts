// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { WebClient } from '@slack/web-api'
import { verifySlackToken } from '../../../utils'
import { getData } from '../../../utils/dataHelper'

interface Data {
    data: string
}

interface Error {
    error: string
}



export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<string | Data | Error>
) {
    console.log({ method: req.method })
    if (req.method !== 'POST') {
        res.status(500).send({ error: 'Only POST requests allowed' })
        return
    }
    const data = req.body;
    console.log({ data });

    switch (data.type) {
        case "url_verification":
            res.status(200).send(verifySlackToken(data.token, data.challenge))
            break;
        case "event_callback":
            const web = new WebClient(process.env.SLACK_AUTH_TOKEN);
            const parsed = await getData();
            await web.chat.postMessage({
                blocks: parsed,
                channel: data.event.channel,
            });
            res.status(200).send({ data: 'ok' });
            break;
        default:
            res.status(500).send({ error: 'Unknown type' });

    }
}
