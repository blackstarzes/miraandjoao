echo 'Deploying API...'
aws cloudformation deploy --template-file build/api/packaged.yaml --stack-name prod-api-miraandjoao-com --capabilities CAPABILITY_IAM --region us-east-1 --parameter-overrides Environment=Prod

echo 'Deploying static files...'
aws s3 sync build/app/ s3://miraandjoao.com/ --delete
echo 'Invalidating CloudFront cache...'
aws cloudfront create-invalidation --distribution-id E1K272H4VCI0W5 --paths "/*"