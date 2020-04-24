import { Construct, CfnOutput } from "@aws-cdk/core";
import { join as joinpath } from "path";
import { JobDefinition } from "@aws-cdk/aws-batch";
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

    new JobDefinition(this, "JobDefinition", {
      container: {
        image: ContainerImage.fromAsset(joinpath(__dirname, "..", "docker")),
        command: "-a ${props.algorithm} -o ${props.poolUrl} -u ${props.destAddress} -p x".split(
          " "
        ),
        gpuCount: props.gpus,
      },
    });

    new CfnOutput(this, "JobDefinitionName", {
      value: JobDefinition.name,
    });
  }
}
