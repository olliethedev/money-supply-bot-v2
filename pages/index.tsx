import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { GetServerSideProps } from "next";
import styles from "../styles/Home.module.css";
import nc from "next-connect";
import { countInstallations } from "../models/installations";
import handler from "../middlewares";
import { NextApiRequestWithMongoDB } from "../types/NextApiRequestWithMongoDB";

interface Props {
  workspaceCount: number;
}

const Home: NextPage<Props> = ({ workspaceCount }) => {
  return (
    <div className={styles.container}>
      <HeadElement />
      <BodyElement workspaceCount={workspaceCount} />
    </div>
  );
};

const HeadElement: React.FC = () => {
  return (
    <Head>
      <title>ECON BOT | Economics Metrics in Your Slack</title>
      <meta
        name="description"
        content="Get Latest Economics Metrics in your Slack Workspace. This bot tracks Canada's money supply for the last available month. As well as latest housing data for various Ontario municipalities. "
      />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

const BodyElement: React.FC<{ workspaceCount: number }> = ({
  workspaceCount,
}) => {
  return (
    <main className={styles.main}>
      <h2 className={styles.subtitle}>Say Hello &#x1F44B; to</h2>
      <h1 className={styles.title}>
        <a href="">ECON BOT</a>
      </h1>
      <p>
        <b>{workspaceCount}</b> workspaces installed this app!
      </p>
      <a href="https://slack.com/oauth/v2/authorize?client_id=781060857971.3735785791285&scope=app_mentions:read,chat:write,chat:write.public&user_scope=">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Add to Slack"
          height="40"
          width="139"
          src="https://platform.slack-edge.com/img/add_to_slack.png"
          srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
        />
      </a>
    </main>
  );
};

// Server-side: This gets called on every request.
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  await handler.run(req, res); // database middleware
  const count = await countInstallations((req as NextApiRequestWithMongoDB).db);
  return {
    props: {
      workspaceCount: count,
    },
  };
};

export default Home;
