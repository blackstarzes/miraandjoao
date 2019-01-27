echo 'Deploying static files...'
aws s3 sync build/app/ s3://miraandjoao.com/ --delete
echo 'Invalidating CloudFront cache...'
aws cloudfront create-invalidation --distribution-id E1K272H4VCI0W5 --paths "/*"