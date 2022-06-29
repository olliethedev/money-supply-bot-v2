// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { WebClient } from '@slack/web-api'
import { verifySlackToken } from '../../../utils'

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
        //intial verification of the url, required by slack 
        case "url_verification":
            res.status(200).send(verifySlackToken(data.token, data.challenge))
            break;

        case "event_callback":
            const web = new WebClient(process.env.SLACK_AUTH_TOKEN);
            //data.event.text contains message
            // get money supply data
            // const parsed = await getData();
            await web.chat.postMessage({
                text: 'hello',
                channel: data.event.channel,
            });
            res.status(200).send({ data: 'ok' })
            break;
        default:
            res.status(500).send({ error: 'Unknown type' })

    }
}
