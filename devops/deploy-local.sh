echo 'Starting API locally...'
(cd src/lambda/api && sam local start-api --port 3001)

echo 'Starting web server locally...'
gulp serve