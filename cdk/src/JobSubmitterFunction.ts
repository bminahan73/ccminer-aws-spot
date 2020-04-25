import { Construct, Duration, Stack, CfnOutput } from "@aws-cdk/core";
import { Function, Runtime, Code } from "@aws-cdk/aws-lambda";
import { join as joinpath } from "path";
import { Rule } from "@aws-cdk/aws-events";
import { LambdaFunction } from "@aws-cdk/aws-events-targets";
import { PolicyStatement } from "@aws-cdk/aws-iam";

type JobSubmitterFunctionProps = {
  jobQueueArn: string;
  jobDefinitionArn: string;
  monthlyThreshold: number;
};

export class JobSubmitterFunction extends Construct {
  constructor(scope: Construct, id: string, props: JobSubmitterFunctionProps) {
    super(scope, id);

    const jobSubmitterFunction = new Function(this, "JobSubmitterFunction", {
      handler: "index.handler",
      runtime: Runtime.NODEJS_12_X,
      code: Code.fromAsset(
        joinpath(__dirname, "../../lambdas/jobSubmitter/dist")
      ),
      environment: {
        MONTHLY_THRESHOLD: String(props.monthlyThreshold),
      },
      timeout: Duration.minutes(5),
    });

    jobSubmitterFunction.addToRolePolicy(
      new PolicyStatement({
        resources: [props.jobQueueArn, props.jobDefinitionArn],
        actions: ["batch:SubmitJob"],
      })
    );

    const stack = Stack.of(this);

    jobSubmitterFunction.addToRolePolicy(
      new PolicyStatement({
        resources: [
          `arn:aws:ce:${stack.region}:${stack.account}:/GetCostForecast`,
        ],
        actions: ["ce:GetCostForecast"],
      })
    );

    new Rule(this, "JobFailureRule", {
      eventPattern: {
        source: ["aws.batch"],
        detailType: ["Batch Job State Change"],
        detail: {
          status: ["FAILED"],
          jobDefinition: [props.jobDefinitionArn],
        },
      },
      targets: [new LambdaFunction(jobSubmitterFunction)],
    });

    new CfnOutput(this, "LambdaLogGroup", {
      value: jobSubmitterFunction.logGroup.logGroupName,
    });
  }
}
