echo 'Building web...'
gulp build

echo 'Building API...'
sam build --build-dir build/api --base-dir src/lambda/api --template src/lambda/api/template.yaml