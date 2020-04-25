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
export class SpotComputeEnvironment extends Construct {
  jobQueue: JobQueue;

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
          // supported GPU instanceTypes for AWS Batch at time of writing: https://docs.aws.amazon.com/batch/latest/userguide/gpu-jobs.html
          instanceTypes: [
            // missing g3s.xlarge
            InstanceType.of(InstanceClass.GRAPHICS3, InstanceSize.XLARGE4),
            InstanceType.of(InstanceClass.GRAPHICS3, InstanceSize.XLARGE8),
            InstanceType.of(InstanceClass.GRAPHICS3, InstanceSize.XLARGE16),
            InstanceType.of(
              InstanceClass.GRAPHICS4_NVME_DRIVE_HIGH_PERFORMANCE,
              InstanceSize.XLARGE
            ),
            InstanceType.of(
              InstanceClass.GRAPHICS4_NVME_DRIVE_HIGH_PERFORMANCE,
              InstanceSize.XLARGE2
            ),
            InstanceType.of(
              InstanceClass.GRAPHICS4_NVME_DRIVE_HIGH_PERFORMANCE,
              InstanceSize.XLARGE4
            ),
            InstanceType.of(
              InstanceClass.GRAPHICS4_NVME_DRIVE_HIGH_PERFORMANCE,
              InstanceSize.XLARGE8
            ),
            InstanceType.of(
              InstanceClass.GRAPHICS4_NVME_DRIVE_HIGH_PERFORMANCE,
              InstanceSize.XLARGE12
            ),
            InstanceType.of(
              InstanceClass.GRAPHICS4_NVME_DRIVE_HIGH_PERFORMANCE,
              InstanceSize.XLARGE16
            ),
            InstanceType.of(InstanceClass.PARALLEL2, InstanceSize.XLARGE),
            InstanceType.of(InstanceClass.PARALLEL2, InstanceSize.XLARGE8),
            InstanceType.of(InstanceClass.PARALLEL2, InstanceSize.XLARGE16),
            InstanceType.of(InstanceClass.PARALLEL3, InstanceSize.XLARGE2),
            InstanceType.of(InstanceClass.PARALLEL3, InstanceSize.XLARGE8),
            InstanceType.of(InstanceClass.PARALLEL3, InstanceSize.XLARGE16),
            // missing p3dn.24xlarge
          ],
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
