echo 'Building web...'
gulp build

echo 'Building & Testing API...'
(
    cd src/lambda/api/get-rsvp && \
    npm install && \
    npm run build && \
    npm run test
)
echo 'Building SAM API...'
sam build --build-dir build/api --base-dir src/lambda/api --template src/lambda/api/template.yaml
echo 'Packaging SAM API...'
(
    cd build/api &&
    sam package --output-template-file packaged.yaml --s3-bucket miraandjoao.com-build
)