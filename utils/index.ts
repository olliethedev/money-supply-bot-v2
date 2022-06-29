import { InstallProvider } from '@slack/oauth';

// initialize the installProvider
export const SlackInstaller = new InstallProvider({
  clientId: process.env.SLACK_CLIENT_ID as string,
  clientSecret: process.env.SLACK_CLIENT_SECRET as string,
  stateSecret: process.env.SLACK_STATE_SECRET,
});

export const verifySlackToken = (token: string, challenge: string) => {
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    return challenge;
  }
  else return "failed";
}