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

## Configuration

you can set the following configuration in the as context arguments to `cdk deploy`. This is how you configure your deployment.

Example:

```shell
cd cdk
cdk deploy \
  --context 'poolUrl=stratum+tcp://miningpool:8000' \
  --context 'destAddress=miningaddress12345' \
  --context 'alarmemail=me@example.com'
```

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

## building

1. install the dependencies via `./install.sh`
2. build all the projects via `./build.sh`

## deploy to AWS

```shell
cd cdk
cdk deploy \
  --context key1=value1 \
  ...
```

Example:

```shell
cd cdk
cdk deploy \
  --context 'poolUrl=stratum+tcp://miningpool:8000' \
  --context 'destAddress=miningaddress12345' \
  --context 'alarmemail=me@example.com'
```

you will also receive an email to SNS. You **must** click the link in the email or else you **will not** ereceive alerts when the configured dollar amount has been exceeded.