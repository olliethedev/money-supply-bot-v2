import type { NextApiResponse } from 'next'

import { getSlackClient, getSlackInstaller, verifySlackToken } from '../../../utils'
import { Db } from 'mongodb';
import { SlackData } from '../../../types/SlackData';
import handler from '../../../middlewares';
import { NextApiRequestWithMongoDB } from '../../../types/NextApiRequestWithMongoDB';
import { commandHelper } from '../../../utils/commandHelper';
import { Installation } from '@slack/oauth';
import AIHelper from '../../../utils/AIHelper';

const PAST_EVENTS:string[] = [];

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
    if(PAST_EVENTS.indexOf(data.event.event_ts) !== -1) {
        console.log("Event already handled");
        return;
    }
    PAST_EVENTS.push(data.event.event_ts);
    const installData = await getSlackInstaller(db)
        .installationStore
        .fetchInstallation(
            {
                teamId: team_id,
                enterpriseId: enterprise_id,
                isEnterpriseInstall: is_enterprise_install
            });
    console.log({ installData });
    console.log({ text: data.event.text })

    if (data.event.text.startsWith("cli-mode")) {
        await handleCliFlow(db, data, installData);
    }else{
        await handleChatBotFlow(db, data, installData);
    }
    
}

const handleCliFlow = async (db: Db, data: SlackData, installData:Installation) => {
    const splitText = data.event.text.split("cli-mode ");
    splitText.shift();  // Removes the first element
    const remainingText = splitText.join(" ");  // Join remaining elements back into a string
    const commandInput = remainingText.match(/--?\w+|'[^']+'|\w+/g) || [];
    const command = ["node", "MoneySupplyBotV2", ...commandInput];

    console.log({ command })
    const chatClient = getSlackClient(installData.bot?.token as string).chat;
    await commandHelper(db, command, async (error) => {
        console.log("got error", error);
        await chatClient.postMessage({
            blocks: textBlockWrapper(error),
            channel: data.event.channel,
        });
    }, async (help) => {
        console.log("got help", help);
        await chatClient.postMessage({
            blocks: textBlockWrapper(help),
            channel: data.event.channel,
        });
    }, async (commandData) => {
        console.log("got commandData", commandData);
        return chatClient.postMessage({
            blocks: commandData,
            channel: data.event.channel,
        });
    });
}

const handleChatBotFlow = async (db: Db, data: SlackData, installData:Installation) => {
    const aiHelper = new AIHelper();
    const commandInput = data.event.text.substring(data.event.text.indexOf(" ") + 1)
    const commandData = await aiHelper.getBlockData(db, commandInput);
    const chatClient = getSlackClient(installData.bot?.token as string).chat;
    return chatClient.postMessage({
        blocks: [commandData],
        channel: data.event.channel,
    });
}


const textBlockWrapper = (text?: string) => {
    return [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": text ?? "Ooops"
            }
        }
    ]
}

export default handler;
