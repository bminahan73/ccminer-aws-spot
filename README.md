# ccminer in AWS Batch (SPOT compute)

this repository contains an AWS CDK project that will deploy a ccminer running in docker on AWS spot compute, via an AWS Batch job.

## Prerequisites

- an AWS account
- an IAM user with permissions to create all the resources + Cloudformation permissions
- the IAM user set us in a [named profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html)
- [NodeJS](https://nodejs.org/en/download/)
- [AWS CDK](https://aws.amazon.com/cdk/) (or just globally install it via `npm install -g aws-cdk`)
- bootstrap the CDK ToolKit in your desired AWS account and region via the command `cdk bootstrap`
- **IMPORTANT** You will also need to request service limit increases in your AWS account for the following: "Running On-Demand All G instances", "Running On-Demand All P instances" to an acceptable level greater than 0 (default is 0, I think they do that to prevent malicious actors from mining)
- **IMPORTANT** you will need to enable Cost Explorer under "Billing". Cost Explorer API is needed by the lambda function to track your spending thus far.

## Configuration

you can send the following configuration in as context to the cdk. This is how you can configure your deployment to meet your needs. See "Deploy to AWS" section for how to do this.

| Key         | Description                                   | Required | Default                                          |
| :---------- | :-------------------------------------------- | :------- | :----------------------------------------------- |
| poolUrl     | pool URL to join and start mining             | **Y**    | N/A                                              |
| destAddress | address to send profits to                    | **Y**    | N/A                                              |
| alarmEmail  | email address you want billing alert to go to | **Y**    | N/A                                              |
| alarmAmount | amount of \$ per month in USD to alert on     | N        | 5                                                |
| account     | the AWS account number to deploy to           | N        | account in your supplied credentials via profile |
| region      | the AWS region to deploy to                   | N        | us-east-1                                        |
| algorithm   | the algorithm to use to mine                  | N        | x11                                              |
| gpus        | number of GPUs to use                         | N        | 1                                                |

## Building

1. install the dependencies via `./install.sh`
2. build all the projects via `./build.sh`

## Deploy to AWS

to build then deploy to AWS in one script, take the `deploy.sh.example` file, modify it with your context values, and rename it to `deploy.sh`. Then, just run `./deploy.sh` to install, build, and finally deploy the resources into your AWS account.

### Important Note

during deployment you will receive an email to SNS. You **must** click the link in the email or else you **will not** ereceive alerts when the configured dollar amount has been exceeded.
