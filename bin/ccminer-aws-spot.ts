#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CcminerAwsSpotStack } from '../lib/ccminer-aws-spot-stack';

const app = new cdk.App();
new CcminerAwsSpotStack(app, 'CcminerAwsSpotStack');
