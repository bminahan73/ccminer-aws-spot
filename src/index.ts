import "source-map-support/register";
import { App, Stack, Construct, StackProps, CfnOutput } from "@aws-cdk/core";
import { SpotComputeEnvironment } from "./SpotComputeEnvironment";
import { MiningJob } from "./MiningJob";

export class CCMinerAWSBatch extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const algorithm = this.node.tryGetContext("ccminer.algrorithm") || "x11";
    const poolUrl = this.node.tryGetContext("ccminer.poolUrl");
    const destAddress = this.node.tryGetContext("ccminer.destAddress");
    const gpus = parseInt(this.node.tryGetContext("ccminer.gpus")) || 1;

    new SpotComputeEnvironment(this, "SpotComputeEnvironment");
    new MiningJob(this, "MiningJob", {
      algorithm: algorithm,
      poolUrl: poolUrl,
      destAddress: destAddress,
      gpus: gpus,
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
