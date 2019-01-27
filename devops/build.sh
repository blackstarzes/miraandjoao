echo 'Building web...'
gulp build

echo 'Unit Testing API...'
(
    cd src/lambda/api/get-rsvp && \
    npm install && \
    npm run test
)
echo 'Building API...'
sam build --build-dir build/api --base-dir src/lambda/api --template src/lambda/api/template.yaml
echo 'Packaging API...'
(
    cd build/api &&
    sam package --output-template-file packaged.yaml --s3-bucket miraandjoao.com-build
)