import "source-map-support/register";
import { App, Stack, Construct, StackProps, CfnOutput } from "@aws-cdk/core";
import { SpotComputeEnvironment } from "./SpotComputeEnvironment";
import { MiningJob } from "./MiningJob";
import { BillingAlert } from "./BillingAlert";

export class CCMinerAWSBatch extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new SpotComputeEnvironment(this, "SpotComputeEnvironment");

    const algorithm = this.node.tryGetContext("algrorithm") || "x11";
    const poolUrl = this.node.tryGetContext("poolUrl");
    const destAddress = this.node.tryGetContext("destAddress");
    const gpus = parseInt(this.node.tryGetContext("gpus")) || 1;

    new MiningJob(this, "MiningJob", {
      algorithm: algorithm,
      poolUrl: poolUrl,
      destAddress: destAddress,
      gpus: gpus,
    });

    const alarmEmail = this.node.tryGetContext("alarmEmail");
    const alarmAmount = parseInt(this.node.tryGetContext("alarmAmount")) || 5;

    new BillingAlert(this, "BillingAlert", {
      email: alarmEmail,
      amount: alarmAmount,
    });
  }
}

const app = new App();

const account =
  app.node.tryGetContext("account") ||
  process.env.CDK_DEPLOY_ACCOUNT ||
  process.env.CDK_DEFAULT_ACCOUNT;
const region = app.node.tryGetContext("region") || "us-east-1";

new CCMinerAWSBatch(app, "CcminerAwsSpotStack", {
  env: {
    account: account,
    region: region,
  },
});
