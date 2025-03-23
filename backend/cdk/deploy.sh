#!/bin/bash
set -e

ARGUMENT="$1"

cdk --version
aws sts get-caller-identity
ENV_FILE=".env"

echo "Loading environment variables from $ENV_FILE"
set -o allexport
source "$ENV_FILE"
set +o allexport

echo "Deploying $STACK_NAME..."
cdk deploy -all --profile default

echo "Deployment Complete"
