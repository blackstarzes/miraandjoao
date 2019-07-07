echo 'Building web...'
gulp build

echo 'Building & testing libraries...'
(
    cd src/lambda/miraandjoao-lib && \
    npm install && \
    npm run build && \
    npm run test
)

echo 'Building & testing API...'
for dir in src/lambda/api/*/
do
    dir=${dir%*/}
    echo "Building & Testing " + ${dir##*/}
    (
        cd $dir && \
        npm install && \
        npm run import && \
        npm run build && \
        npm run test
    )
done

echo 'Building SAM API...'
sam build --build-dir build/api --base-dir src/lambda/api --template src/lambda/api/template.yaml --profile joao
echo 'Packaging SAM API...'
(
    cd build/api &&
    sam package --output-template-file packaged.yaml --s3-bucket miraandjoao.com-build --profile joao
)