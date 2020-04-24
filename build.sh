#!/usr/bin/env bash
cd lambdas/jobSubmitter && npm run build
cd -
cd cdk && npm run build
cd -