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
      <FooterElement />
    </div>
  );
};

const HeadElement: React.FC = () => {
  return (
    <Head>
      <title>Money Supply Bot V2</title>
      <meta
        name="description"
        content="This Bot tracks the minting and burning of fiat."
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
      <h2 className={styles.subtitle}>Welcome to</h2>
      <h1 className={styles.title}>
        <a href="api/slack/install">MoneySupplyBotV2!</a>
      </h1>
      <p>
        <b>{workspaceCount}</b> workspaces installed this app!
      </p>
    </main>
  );
};

const FooterElement: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <a
        href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
        target="_blank"
        rel="noopener noreferrer"
      >
        Powered by{" "}
        <span className={styles.logo}>
          <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
        </span>
      </a>
    </footer>
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
