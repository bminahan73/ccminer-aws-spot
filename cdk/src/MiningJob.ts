import { Construct, CfnOutput } from "@aws-cdk/core";
import { join as joinpath } from "path";
import { JobDefinition, CfnJobDefinition } from "@aws-cdk/aws-batch";
import { ContainerImage } from "@aws-cdk/aws-ecs";

interface MiningJobProps {
  algorithm: string;
  poolUrl: string;
  destAddress: string;
  gpus: number;
}

export class MiningJob extends Construct {
  constructor(scope: Construct, id: string, props: MiningJobProps) {
    super(scope, id);

    const miningJob = new JobDefinition(this, "JobDefinition", {
      container: {
        image: ContainerImage.fromAsset(joinpath(__dirname, "..", "..", "docker")),
        command: `-a ${props.algorithm} -o ${props.poolUrl} -u ${props.destAddress} -p x`.split(
          " "
        ),
        memoryLimitMiB: 1024,
        // this does not work because of a bug in the CDK: https://github.com/aws/aws-cdk/issues/7586
        // when this is fixed, we can do this which is much cleaner than the workaround:
        // gpuCount: props.gpus,
      },
    });

    // this is necessary because of a bug in the CDK: https://github.com/aws/aws-cdk/issues/7586
    // when this is fixed, we can get rid of the following code:
    const cfnJobDefinition = miningJob.node.defaultChild as CfnJobDefinition;
    cfnJobDefinition.addPropertyOverride('ContainerProperties.ResourceRequirements', [{ Type: 'GPU', Value: props.gpus}]);

    new CfnOutput(this, "JobDefinitionArn", {
      value: miningJob.jobDefinitionArn,
    });
  }
}
