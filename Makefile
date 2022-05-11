WALLET_ADDRESS := 0x1341048E3d37046Ca18A09EFB154Ea9771744f41
WALLET_SECRET := 
TOKEN_ADDRESS := 0xc35e34af505b79132857e117ad7031297cc2cd35
TOKEN_ID := 13

vendor:
	npm install

build:
	npm run build

deploy: build
	zip -r lambda.zip .
	sam deploy --profile me
	rm lambda.zip

run-local:
	node_modules/.bin/ts-node local.ts

lambda-transfer:
	aws lambda invoke \
		--function-name lambda-opensea-Function-tddkoUUKqXu9 \
		--payload '{"task": "transfer", "tokenAddress": "$(TOKEN_ADDRESS)", "tokenId": "$(TOKEN_ID)", "walletAddress": "$(WALLET_ADDRESS)", "walletSecret": "$(WALLET_SECRET)", "transferAddress": "0x0E91D6613a84d7C8b72a289D8b275AF7717C3d2E", "transferAmount": 1, "schemaName": "ERC721"}' \
		--cli-binary-format raw-in-base64-out \
		--profile me \
		/dev/null