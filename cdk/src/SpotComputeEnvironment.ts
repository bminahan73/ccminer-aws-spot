import { Construct, CfnOutput } from "@aws-cdk/core";
import {
  Vpc,
  AmazonLinuxGeneration,
  InstanceType,
  InstanceClass,
  InstanceSize,
} from "@aws-cdk/aws-ec2";
import { EcsOptimizedAmi, AmiHardwareType } from "@aws-cdk/aws-ecs";
import {
  ComputeEnvironment,
  JobQueue,
  AllocationStrategy,
  ComputeResourceType,
} from "@aws-cdk/aws-batch";
import * as instanceSpecs from "./InstanceSpecs.json";

type InstanceSpec = {
  class: string;
  size: string;
};

export class SpotComputeEnvironment extends Construct {
  jobQueue: JobQueue;
  instanceTypes: InstanceType[] = new Array<InstanceType>();

  constructor(scope: Construct, id: string) {
    super(scope, id);

    instanceSpecs.map((spec: InstanceSpec) => {
      this.instanceTypes.push(
        InstanceType.of(
          (<any>InstanceClass)[spec.class],
          (<any>InstanceSize)[spec.size]
        )
      );
    });

    const computeEnvironment = new ComputeEnvironment(
      this,
      "ComputeEnvironment",
      {
        computeResources: {
          vpc: Vpc.fromLookup(this, "DefaultVpc", { isDefault: true }),
          allocationStrategy: AllocationStrategy.SPOT_CAPACITY_OPTIMIZED,
          bidPercentage: 40,
          desiredvCpus: 0,
          minvCpus: 0,
          maxvCpus: 256,
          instanceTypes: this.instanceTypes,
          type: ComputeResourceType.SPOT,
          image: new EcsOptimizedAmi({
            generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
            hardwareType: AmiHardwareType.GPU,
          }),
        },
      }
    );

    this.jobQueue = new JobQueue(this, "JobQueue", {
      computeEnvironments: [
        {
          order: 1,
          computeEnvironment: computeEnvironment,
        },
      ],
    });

    new CfnOutput(this, "JobQueueArn", {
      value: this.jobQueue.jobQueueArn,
    });
  }
}
