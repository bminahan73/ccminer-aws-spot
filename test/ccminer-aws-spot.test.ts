import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import CcminerAwsSpot = require('../lib/ccminer-aws-spot-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new CcminerAwsSpot.CcminerAwsSpotStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
