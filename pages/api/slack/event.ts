// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
// import { WebClient } from '@slack/web-api'
import { verifySlackToken } from '../../../utils'

type Error = {
    error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string|Error>
) {
  if (req.method !== 'POST') {
    res.status(405).send({ error: 'Only POST requests allowed' })
    return
  }
  const data = req.body;
  console.log({data});

  switch (data.type) {
    //intial verification of the url, required by slack 
    case "url_verification":{
        res.status(200).send(verifySlackToken(data.token, data.challenge))
    }
    //this type will contain mention event data
    // case "event_callback":{
    //     const web = new WebClient(process.env.SLACK_TOKEN);
    //     //data.event.text contains message
    //     // get money supply data
    //     const parsed = await getData();
    //     await web.chat.postMessage({
    //         blocks:parsed,
    //         channel: data.event.channel,
    //     });
    //     return {
    //         statusCode: 200,
    //         body: JSON.stringify({data:"ok"})
    //     };
    // }
    default: {
        res.status(500).send({ error: 'Unknown type' })
    }
}
}
