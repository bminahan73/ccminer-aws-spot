import { Stack, Construct, StackProps, CfnOutput } from "@aws-cdk/core";
import { Vpc, AmazonLinuxGeneration } from "@aws-cdk/aws-ec2";
import { EcsOptimizedAmi, AmiHardwareType } from "@aws-cdk/aws-ecs";
import {
  ComputeEnvironment,
  JobQueue,
  AllocationStrategy,
  ComputeResourceType,
} from "@aws-cdk/aws-batch";
export class SpotComputeEnvironment extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

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
          type: ComputeResourceType.SPOT,
          image: new EcsOptimizedAmi({
            generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
            hardwareType: AmiHardwareType.GPU,
          }),
        },
      }
    );

    new JobQueue(this, "JobQueue", {
      computeEnvironments: [
        {
          order: 1,
          computeEnvironment: computeEnvironment,
        },
      ],
    });

    new CfnOutput(this, "JobQueueName", {
      value: JobQueue.name,
    });
  }
}
