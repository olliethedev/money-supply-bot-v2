import React from "react";
import { GetServerSideProps } from "next";
import { NextRouter, withRouter } from "next/router";
import dynamic from "next/dynamic";
import styles from "../../../styles/Charts.module.css";
import handler from "../../../middlewares";
import { MoneyDataItem } from "../../../types/MonetaryDataItem";
import { getMonetaryData } from "../../../utils/cacheHelper";
import { NextApiRequestWithMongoDB } from "../../../types/NextApiRequestWithMongoDB";
import moment from "moment";

const MyLineChart = dynamic(() => import("../../../components/LineChart"), {
  ssr: false,
});

interface Props {
  router: NextRouter;
  data: MoneyDataItem[];
}

const COLOR_MAP = {'M1': "hsl(226, 70%, 50%)", 'M2': "hsl(284, 70%, 50%)", 'M3': "hsl(150, 70%, 50%)"};

const MoneyChart: React.FC<Props> = ({ router, data }) => {
  const { id } = router.query;
  let idValue = "M1";
  if (id) {
  }
  return (
    <div className={styles.container}>
      <div style={{ height: "100vh" }}>
        <MyLineChart data={[
          {
            id: id as string,
            color: COLOR_MAP[id as "M1" | "M2" | "M3"],
            data: data.map((item) => ({
              x: moment(item.date).format("MMM YYYY"),
              y: item.value,
            })),
            }
        ]}/>
      </div>
      MoneyChart:{id}
    </div>
  );
};

// Server-side: This gets called on every request.
export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  await handler.run(req, res); // database middleware
  const { id } = params as { id: string | undefined };
  let idValue: "M1" | "M2" | "M3" = "M1";
  if (!id || (id !== "M1" && id !== "M2" && id !== "M3")) {
    idValue = "M1";
  }

  const data = await getMonetaryData(
    (req as NextApiRequestWithMongoDB).db,
    idValue
  );
  return {
    props: {
      data: data.map((item) => ({
        date: item.date,
        value: item.value,
      })),
    },
  };
};

export default withRouter(MoneyChart);
