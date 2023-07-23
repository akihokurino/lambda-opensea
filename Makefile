TOKEN_ADDRESS := 0xd4b9934697c4C27389C87Bb9f4abFBCF2B7Ec6Be
TOKEN_ID := 2
SCHEMA := ERC721

vendor:
	yarn install

.PHONY: build
build:
	npm run build

# https://aws.amazon.com/jp/blogs/compute/using-container-image-support-for-aws-lambda-with-aws-sam/
deploy: build
	sam build
	sam deploy \
		--image-repository 326914400610.dkr.ecr.ap-northeast-1.amazonaws.com/lambda-opensea \
		--no-fail-on-empty-changeset \
		--profile me

lambda-info:
	rm output.json
	aws lambda invoke \
    --function-name lambda-opensea-Function-E5REgOxitk1E \
		--cli-binary-format raw-in-base64-out \
    --payload "{ \
        \"method\": \"info\", \
        \"infoRequest\": { \
            \"tokenAddress\": \"$(TOKEN_ADDRESS)\", \
            \"tokenId\": \"$(TOKEN_ID)\" \
        } \
    }" \
    --profile me \
    output.json

lambda-sell:
	rm output.json
	aws lambda invoke \
		--function-name lambda-opensea-Function-E5REgOxitk1E \
		--cli-binary-format raw-in-base64-out \
		--payload "{ \
			\"method\": \"sell\", \
			\"sellRequest\": { \
				\"tokenAddress\": \"$(TOKEN_ADDRESS)\", \
				\"tokenId\": \"$(TOKEN_ID)\", \
				\"schema\": \"$(SCHEMA)\", \
				\"ether\": 2.0, \
				\"quantity\": 1 \
			} \
		}" \
		--profile me \
		output.json