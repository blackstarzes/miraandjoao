echo 'Deploying API...'
aws cloudformation deploy --template-file build/api/packaged.yaml --stack-name prod-api-miraandjoao-com --capabilities CAPABILITY_IAM --region us-east-1 --parameter-overrides Environment=Prod --profile joao

echo 'Deploying static files...'
aws s3 sync build/app/ s3://miraandjoao.com/ --delete --profile joao
echo 'Invalidating CloudFront cache...'
aws cloudfront create-invalidation --distribution-id E1K272H4VCI0W5 --paths "/*" --profile joao

echo 'Deploying email templates...'
for template in $(find build/email -name *-template.json)
do
    echo 'Updating ' $template
    # aws ses create-template --cli-input-json file://$template --profile joao
    aws ses update-template --cli-input-json file://$template --profile joao
done
