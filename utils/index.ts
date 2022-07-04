import { Installation, InstallProvider } from '@slack/oauth';
import { WebClient } from '@slack/web-api';
import * as mongoDB from 'mongodb';
import { deleteInstallation, findInstallationById, insertInstallation } from '../models/installations';

export const getSlackClient = (authToken: string) => {
  return new WebClient(authToken);
}

export const getSlackInstaller = (db: mongoDB.Db) => {
  return new InstallProvider({
    clientId: process.env.SLACK_CLIENT_ID as string,
    clientSecret: process.env.SLACK_CLIENT_SECRET as string,
    stateSecret: process.env.SLACK_STATE_SECRET,
    stateVerification: false,
    legacyStateVerification: false,
    installationStore: {
      storeInstallation: async (installation) => {
        console.log({ installation });
        console.log(JSON.stringify(installation));
        if (installation.isEnterpriseInstall && installation.enterprise) {
          await insertInstallation(db, installation.enterprise.id, installation);
          return;
        } else if (installation.team) {
          await insertInstallation(db, installation.team.id, installation);
          return;
        }
        throw new Error('Failed saving installation data to installationStore');
      },
      fetchInstallation: async (installQuery) => {
        console.log({ installQuery });
        if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
          return (await findInstallationById(db, installQuery.enterpriseId)) as unknown as Installation;
        }
        if (installQuery.teamId !== undefined) {
          return (await findInstallationById(db, installQuery.teamId)) as unknown as Installation;
        }
        throw new Error('Failed fetching installation');
      },
      deleteInstallation: async (installQuery) => {
        console.log({ installQuery });
        if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
          await await deleteInstallation(db, installQuery.enterpriseId);
          return;
        }
        if (installQuery.teamId !== undefined) {
          await await deleteInstallation(db, installQuery.teamId);
          return;
        }
        throw new Error('Failed to delete installation');
      },
    },
  });
}

export const verifySlackToken = (token: string, challenge: string) => {
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    return challenge;
  }
  else return "failed";
}


