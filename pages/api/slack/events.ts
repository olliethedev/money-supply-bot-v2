// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSlackClient, verifySlackToken } from '../../../utils'
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
    if (req.method !== 'POST') {
        res.status(500).send({ error: 'Only POST requests allowed' })
        return;
    }
    const data = req.body;

    console.log({ method: req.method, body: data  });
    try {
        switch (data.type) {
            case "url_verification":
                res.status(200).send(verifySlackToken(data.token, data.challenge))
                break;
            case "event_callback":
                const parsed = await getData();
                await getSlackClient(process.env.SLACK_AUTH_TOKEN as string).chat.postMessage({
                    blocks: parsed,
                    channel: data.event.channel,
                });
                res.status(200).send({ data: 'ok' });
                break;
            default:
                res.status(500).send({ error: 'Unknown type' });
        }
    } catch (error) {
        console.log({ error });
        res.status(500).send({ error: 'Error processing event' });
    }

}
