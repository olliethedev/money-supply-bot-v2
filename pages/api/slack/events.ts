// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { NextApiRequestWithMongoDB } from '../../../middlewares/database'
import { getSlackClient, getSlackInstaller, verifySlackToken } from '../../../utils'
import { getData } from '../../../utils/dataHelper'

interface Data {
    data: string
}

interface Error {
    error: string
}

export default async function handler(
    req: NextApiRequestWithMongoDB,
    res: NextApiResponse<string | Data | Error>
) {
    if (req.method !== 'POST') {
        res.status(500).send({ error: 'Only POST requests allowed' })
        return;
    }
    const data = req.body;

    console.log({ method: req.method, body: JSON.stringify(data) });
    try {
        switch (data.type) {
            case "url_verification":
                res.status(200).send(verifySlackToken(data.token, data.challenge))
                break;
            case "event_callback":
                const { enterprise_id, team_id, is_enterprise_install } = data.authorizations[0];
                console.log({ enterprise_id, team_id, is_enterprise_install });
                const installData = await getSlackInstaller(req.db)
                    .installationStore
                    .fetchInstallation(
                        {
                            teamId: team_id,
                            enterpriseId: enterprise_id,
                            isEnterpriseInstall: is_enterprise_install
                        });
                console.log({ installData });
                const parsed = await getData();
                await getSlackClient(installData.bot?.token as string).chat.postMessage({
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
