WALLET_ADDRESS := 0x1341048E3d37046Ca18A09EFB154Ea9771744f41
WALLET_SECRET := 
TOKEN_ADDRESS := 0x7cf53af478a40ae0F2cBE22118680dB11655feF9
TOKEN_ID := 1
SCHEMA_NAME := ERC1155
IMAGE_BASE64 := 

vendor:
	yarn install

.PHONY: build
build:
	npm run build

build-docker: build
	docker build . -t lambda-opensea:latest

# https://aws.amazon.com/jp/blogs/compute/using-container-image-support-for-aws-lambda-with-aws-sam/
deploy: build
	sam build
	sam deploy \
		--image-repository 326914400610.dkr.ecr.ap-northeast-1.amazonaws.com/lambda-opensea \
		--no-fail-on-empty-changeset \
		--profile me

lambda-sell:
	aws lambda invoke \
		--function-name lambda-opensea-Function-E5REgOxitk1E \
		--payload "{ \
			\"method\": \"sell\", \
			\"walletAddress\": \"$(WALLET_ADDRESS)\", \
			\"walletSecret\": \"$(WALLET_SECRET)\", \
			\"sellPayload\": { \
				\"tokenAddress\": \"$(TOKEN_ADDRESS)\", \
				\"tokenId\": \"$(TOKEN_ID)\", \
				\"schemaName\": \"$(SCHEMA_NAME)\", \
				\"ether\": 0.01, \
				\"quantity\": 1 \
			} \
		}" \
		--cli-binary-format raw-in-base64-out \
		--profile me \
		/dev/null

lambda-buy:
	aws lambda invoke \
		--function-name lambda-opensea-Function-E5REgOxitk1E \
		--payload "{ \
			\"method\": \"buy\", \
			\"walletAddress\": \"$(WALLET_ADDRESS)\", \
			\"walletSecret\": \"$(WALLET_SECRET)\", \
			\"buyPayload\": { \
				\"tokenAddress\": \"$(TOKEN_ADDRESS)\", \
				\"tokenId\": \"$(TOKEN_ID)\" \
			} \
		}" \
		--cli-binary-format raw-in-base64-out \
		--profile me \
		/dev/null

lambda-create-metadata:
	aws lambda invoke \
		--function-name lambda-opensea-Function-E5REgOxitk1E \
		--payload "{ \
			\"method\": \"createMetadata\", \
			\"walletAddress\": \"$(WALLET_ADDRESS)\", \
			\"walletSecret\": \"$(WALLET_SECRET)\", \
			\"createMetadataPayload\": { \
				\"name\": \"metadata test\", \
				\"description\": \"for test\", \
				\"externalUrl\": \"https://opensea.io\", \
				\"imageBase64\": \"$(IMAGE_BASE64)\" \
			} \
		}" \
		--cli-binary-format raw-in-base64-out \
		--profile me \
		/dev/null