import { Construct } from "@aws-cdk/core";
import * as cloudwatch from "@aws-cdk/aws-cloudwatch";
import * as cloudwatch_actions from "@aws-cdk/aws-cloudwatch-actions";
import * as sns from "@aws-cdk/aws-sns";
import * as subs from "@aws-cdk/aws-sns-subscriptions";

import { Duration } from "@aws-cdk/core";
import { ComparisonOperator } from "@aws-cdk/aws-cloudwatch";

export interface BillingAlertProps {
  email: string;
  amount: number;
}

export class BillingAlert extends Construct {
  constructor(scope: Construct, id: string, props: BillingAlertProps) {
    super(scope, id);

    let billingMetric = new cloudwatch.Metric({
      metricName: "EstimatedCharges",
      namespace: "AWS/Billing",
      period: Duration.hours(6),
      statistic: "Maximum",
      dimensions: {
        Currency: "USD",
      },
    });

    const billingAlarm = billingMetric.createAlarm(
      scope,
      `BillingAlarm${props.amount}Dollars`,
      {
        alarmDescription: `Account Billing Alert for $${props.amount}`,
        threshold: props.amount,
        evaluationPeriods: 1,
        comparisonOperator:
          ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      }
    );

    const billingAlarmTopic = new sns.Topic(
      scope,
      `BillingAlert${props.amount}DollarsTopic`
    );

    billingAlarmTopic.addSubscription(new subs.EmailSubscription(props.email));

    billingAlarm.addAlarmAction(
      new cloudwatch_actions.SnsAction(billingAlarmTopic)
    );
  }
}
