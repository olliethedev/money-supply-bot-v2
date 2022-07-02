import type { NextApiResponse } from 'next'

import { getSlackClient, getSlackInstaller, verifySlackToken, getMonetaryData } from '../../../utils'
import { Db } from 'mongodb';
import { SlackData } from '../../../types/SlackData';
import handler from '../../../middlewares';
import { NextApiRequestWithMongoDB } from '../../../types/NextApiRequestWithMongoDB';
import { commandHelper } from '../../../utils/commandHelper';

interface Data {
    data: string
}

interface Error {
    error: string
}

handler.post(async (req: NextApiRequestWithMongoDB,
    res: NextApiResponse<string | Data | Error>) => {
    const data = req.body;

    console.log({ method: req.method, body: JSON.stringify(data) });
    try {
        switch (data.type) {
            case "url_verification":
                const challenge = verifySlackToken(data.token, data.challenge);
                res.status(200).send(challenge);
                break;
            case "event_callback":
                await handleEvent(req.db, data);
                res.status(200).send({ data: 'ok' });
                break;
            default:
                res.status(500).send({ error: 'Unknown type' });
        }
    } catch (error) {
        console.log({ error });
        res.status(500).send({ error: 'Error processing event' });
    }
});

const handleEvent = async (db: Db, data: SlackData) => {
    const { enterprise_id, team_id, is_enterprise_install } = data.authorizations[0];
    console.log({ enterprise_id, team_id, is_enterprise_install });
    const installData = await getSlackInstaller(db)
        .installationStore
        .fetchInstallation(
            {
                teamId: team_id,
                enterpriseId: enterprise_id,
                isEnterpriseInstall: is_enterprise_install
            });
    console.log({ installData });
    console.log({text:data.event.text})
    const command = ["node", "commandHelper.ts", ...data.event.text.substring(data.event.text.indexOf(" ")+1).split(" ")];
    console.log({command})
    await commandHelper(db, command, (error) => {
        getSlackClient(installData.bot?.token as string).chat.postMessage({
            blocks: textBlockWrapper(error),
            channel: data.event.channel,
        });
    }, (help) => {
        getSlackClient(installData.bot?.token as string).chat.postMessage({
            blocks: textBlockWrapper(help),
            channel: data.event.channel,
        });
    }, async (data) => {
        return getSlackClient(installData.bot?.token as string).chat.postMessage({
            blocks: data,
            channel: data.event.channel,
        });
    })//await getMonetaryData(db);


}

const textBlockWrapper = (text: string) => {
    return [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": text??"Ooops"
            }
        }
    ]
}

export default handler;
