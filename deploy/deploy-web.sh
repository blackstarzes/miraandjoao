aws s3 sync build/app/ s3://miraandjoao.com/ --delete
aws cloudfront create-invalidation --distribution-id E1K272H4VCI0W5 --paths "/*"