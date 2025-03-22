#!/bin/sh

# Usage
#   sh scripts/deploy.sh [[flags]]

AWS_S3_FLOWISE=$(dotenv -p AWS_S3_FLOWISE)
if [ -z "$AWS_S3_FLOWISE" ]
then
    echo "AWS_S3_FLOWISE is undefined"
    exit 1
fi

AWS_CLOUDFRONT_FLOWISE=$(dotenv -p AWS_CLOUDFRONT_FLOWISE)
if [ -z "$AWS_CLOUDFRONT_FLOWISE" ]
then
    echo "AWS_CLOUDFRONT_FLOWISE is undefined"
    exit 1
fi

# Convert to absolute path
BUILD_DIR=build
BUILD_PATH=$(cd "$(dirname "$BUILD_DIR")"; pwd)/$(basename "$BUILD_DIR")

aws s3 sync $BUILD_PATH s3://$AWS_S3_FLOWISE --delete --exclude '*.html' --cache-control max-age=31536000,public $@
aws s3 sync $BUILD_PATH s3://$AWS_S3_FLOWISE --delete --exclude '*' --include '*.html' $@
aws cloudfront create-invalidation --distribution-id $AWS_CLOUDFRONT_FLOWISE --paths '/*' $@