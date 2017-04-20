#!/bin/bash

S3KEY="AKIAIJHTR7SI45GILFCA"
S3SECRET="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"

function putS3
{
  path=$1
  file=$2
  aws_path=$3
  bucket='mbiz-images'
  date=$(date +"%a, %d %b %Y %T %z")
  acl="x-amz-acl:public-read"
  content_type='application/x-compressed-tar'
  string="PUT\n\n$content_type\n$date\n$acl\n/$bucket$aws_path$file"
  signature=$(echo -en "${string}" | openssl sha1 -hmac "${S3SECRET}" -binary | base64)
  curl -X PUT -T "$path/$file" \
    -H "Host: $bucket.s3.amazonaws.com" \
    -H "Date: $date" \
    -H "Content-Type: $content_type" \
    -H "$acl" \
    -H "Authorization: AWS ${S3KEY}:$signature" \
    "https://$bucket.s3.amazonaws.com$aws_path$file"

  case "$?" in
    0) echo "$aws_path$file"
    ;;
    *) echo "Uh oh. Something went terribly wrong"
    ;;
  esac

}