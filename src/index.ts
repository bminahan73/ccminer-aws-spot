import "source-map-support/register";
import { App, Stack, Construct, StackProps, CfnOutput } from "@aws-cdk/core";
import { SpotComputeEnvironment } from "./SpotComputeEnvironment";
import { MiningJob } from "./MiningJob";

export class CCMinerAWSBatch extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const algorithm = this.node.tryGetContext("ccminer.algrorithm");
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
new CCMinerAWSBatch(app, "CcminerAwsSpotStack", {
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1",
  },
});
