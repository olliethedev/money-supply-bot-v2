import { Installation, InstallProvider } from '@slack/oauth';
import { WebClient } from '@slack/web-api'
import moment from 'moment';
import * as mongoDB from 'mongodb';
import fetch from 'node-fetch';
import { deleteInstallation, findInstallationById, insertInstallation } from '../models/installations';

export const getSlackClient = (authToken: string) => {
  return new WebClient(authToken);
}

export const getSlackInstaller = (db: mongoDB.Db) => {
  return new InstallProvider({
    clientId: process.env.SLACK_CLIENT_ID as string,
    clientSecret: process.env.SLACK_CLIENT_SECRET as string,
    stateSecret: process.env.SLACK_STATE_SECRET,
    installationStore: {
      storeInstallation: async (installation) => {
        console.log({installation});
        console.log(JSON.stringify(installation));
        if (installation.isEnterpriseInstall && installation.enterprise) {
          await insertInstallation(db, installation.enterprise.id, installation);
          return ;
        } else if(installation.team) {
          await insertInstallation(db, installation.team.id, installation);
          return ;
        }
        throw new Error('Failed saving installation data to installationStore');
      },
      fetchInstallation: async (installQuery) => {
        console.log({installQuery});
        if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
          return (await findInstallationById(db, installQuery.enterpriseId)) as unknown as Installation;
        }
        if (installQuery.teamId !== undefined) {
          return (await findInstallationById(db, installQuery.teamId))as unknown as Installation;
        }
        throw new Error('Failed fetching installation');
      },
      deleteInstallation: async (installQuery) => {
        console.log({installQuery});
        if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
          await await deleteInstallation(db, installQuery.enterpriseId);
          return ;
        }
        if (installQuery.teamId !== undefined) {
          await await deleteInstallation(db, installQuery.teamId);
          return ;
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

export const formatMessage = (
  fromTime: string,
  fromValue: number,
  toTime: string,
  toValue: number,
  yearAgoValue: number,
  moneySupplyType: "M1" | "M2" | "M3"
) => {
  const isUp = fromValue < toValue;
  const changed = isUp
    ? "chart_with_upwards_trend"
    : "chart_with_downwards_trend";
  const percent = (((toValue - fromValue) / fromValue) * 100.0).toFixed(2);
  // const fromValueClean = (fromValue / 1000000).toFixed(2);
  // const toValueClean = (toValue / 1000000).toFixed(2);
  // const fromTimeMonth = moment(fromTime).format("MMMM");
  const toTimeMonth = moment(toTime).format("MMMM");
  const YoYpercent = ((toValue - yearAgoValue)/ yearAgoValue * 100.00).toFixed(2);
  return `:flag-ca: *${moneySupplyType}*  \n :${changed}: ${toTimeMonth} change: *${percent}%* \n Yearly change: *${YoYpercent}%* `;
  // return ` Canada's ${moneySupplyType} ${changed} from $${fromValueClean}T in ${fromTimeMonth} to $${toValueClean}T in ${toTimeMonth}, a change of ${percent}% from last month.`;
}

export const getMoneySupply = async (moneySupplyType = 'M1') => {
  return fetch(`${process.env.DATA_API}?annotations=&annualizedReturns=false&calcs=&chartType=interactive&chartView=&correlations=&dateSelection=range&displayDateRange=false&displayTicker=false&endDate=&format=real&legendOnChart=false&note=&partner=basic_2000&quoteLegend=false&recessions=false&scaleType=linear&securities=id%3AI%3AC${ moneySupplyType }${ moneySupplyType === "M3" ? "MS" : "MSSM" }%2Cinclude%3Atrue%2C%2C&securityGroup=&securitylistName=&securitylistSecurityId=&source=false&splitType=single&startDate=&title=&units=false&useCustomColors=false&useEstimates=false&zoom=3&redesign=true&maxPoints=700`, {
    "headers": {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "max-age=0",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "sec-gpc": "1",
      "upgrade-insecure-requests": "1",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
    },
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
  });
}

