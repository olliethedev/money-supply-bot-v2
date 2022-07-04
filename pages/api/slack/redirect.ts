
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiResponse } from 'next';
import { getSlackInstaller } from '../../../utils';
import { NextApiRequestWithMongoDB } from '../../../types/NextApiRequestWithMongoDB';
import handler from '../../../middlewares';
import { CodedError, Installation, InstallURLOptions, OrgInstallation } from '@slack/oauth';
import { IncomingMessage, ServerResponse } from 'http';

handler.get(async (
    req: NextApiRequestWithMongoDB,
    res: NextApiResponse<any>
) => {
    const data = await getSlackInstaller(req.db).handleCallback(req, res, callbackOptions);
    console.log({ data });
})
const callbackOptions = {
    beforeInstallation: async (options: InstallURLOptions, callbackReq: IncomingMessage, callbackRes: ServerResponse)=>{
        console.log({ options });
        return true;
    },
    success: (installation: Installation | OrgInstallation, options: InstallURLOptions, callbackReq: IncomingMessage, callbackRes: ServerResponse) => {
        console.log({installation, options});
      // Do custom success logic here
      // Tips:
      // - Inspect the metadata with `installOptions.metadata`
      // - Add javascript and css in the htmlResponse using the <script> and <style> tags
      const htmlResponse = `<html><body>Success!</body></html>`
      callbackRes.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      callbackRes.end(htmlResponse);
    },
    failure: (error: CodedError, options: InstallURLOptions, callbackReq: IncomingMessage, callbackRes: ServerResponse) => {
      // Do custom failure logic here
      console.log(error)
      callbackRes.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      callbackRes.end('<html><body><h1>Oops, Something Went Wrong! Please Try Again or Contact the App Owner</h1></body></html>');
    }
  }
export default handler;

