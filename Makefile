vendor:
	npm install

build:
	npm run build

deploy: build
	zip -r lambda.zip .
	sam deploy --profile me

run-local: build
	docker run --rm \
	-v $(PWD):/var/task \
  lambci/lambda:nodejs12.x \
  index.handler '{}'

run-lambda:
	aws lambda invoke \
		--function-name lambda-opensea-Function-tddkoUUKqXu9 \
		--payload '{}' \
		--cli-binary-format raw-in-base64-out \
		--profile me \
		/dev/null