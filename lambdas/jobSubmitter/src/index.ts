import { Batch, CostExplorer } from "aws-sdk";
import { v1 as uuidv1 } from "uuid";

type BatchJobStatusChangeEvent = {
  detail: {
    jobQueue: string;
    jobDefinition: string;
  };
};

export const submitJobFromEvent = (
  event: BatchJobStatusChangeEvent,
  client: Batch
) => {
  client.submitJob(
    {
      jobName: `Miner-${uuidv1()}`,
      jobQueue: event.detail.jobQueue,
      jobDefinition: event.detail.jobDefinition,
    },
    (err, data) => {
      if (err) console.log(err, err.stack);
      else console.log(data);
    }
  );
};

type FirstAndLastDay = {
  firstDay: string;
  lastDay: string;
};

export const getFirstAndLastDayOfMonthFromDate = (
  day: Date
): FirstAndLastDay => {
  const firstDayOfMonth = new Date(day.getFullYear(), day.getMonth(), 1);
  const lastDayOfMonth = new Date(day.getFullYear(), day.getMonth() + 1, 0);
  const format = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [
    { value: mo },
    ,
    { value: fda },
    ,
    { value: ye },
  ] = format.formatToParts(firstDayOfMonth);
  const [, , { value: lda }, ,] = format.formatToParts(lastDayOfMonth);
  return {
    firstDay: `${ye}-${mo}-${fda}`,
    lastDay: `${ye}-${mo}-${lda}`,
  };
};

export const stillMoneyLeft = async (
  monthlyThreshold: number,
  client: CostExplorer
): Promise<boolean> => {
  const days = getFirstAndLastDayOfMonthFromDate(new Date());
  let response = null;
  try {
    response = await client
      .getCostForecast({
        TimePeriod: {
          Start: days.firstDay,
          End: days.lastDay,
        },
        Metric: "BLENDED_COST",
        Granularity: "MONTHLY",
      })
      .promise();
  } catch (error) {
    console.error(error);
    return false;
  }
  if (parseFloat(response.Total?.Amount || "0.00") < monthlyThreshold) {
    return true;
  }
  return false;
};

type LambdaResponse = {
  statusCode: number;
  message: string;
};

export const handler = async (
  event: BatchJobStatusChangeEvent
): Promise<LambdaResponse> => {
  console.info(`event received: ${JSON.stringify(event)}`);
  const monthlyThreshold = parseInt(process.env.MONTHLY_THRESHOLD || "5");
  if (await stillMoneyLeft(monthlyThreshold, new CostExplorer())) {
    console.info(
      `have not hit \$${monthlyThreshold} yet, so submitting job...`
    );
    submitJobFromEvent(event, new Batch());
    return {
      statusCode: 200,
      message: "OK",
    };
  }
  return {
    statusCode: 202,
    message: "monthly threshold reached, will not start the job",
  };
};
