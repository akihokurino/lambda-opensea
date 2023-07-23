import * as AWS from "aws-sdk";
import { ethers } from "ethers";
import { Chain, OpenSeaSDK } from "opensea-js";
import { TokenStandard } from "opensea-js/lib/types";

type Request = {
  method: Method;
  infoRequest?: InfoRequest;
  sellRequest?: SellRequest;
};

type InfoRequest = {
  tokenAddress: string;
  tokenId: string;
};

type SellRequest = {
  tokenAddress: string;
  tokenId: string;
  ether: number;
  quantity: number;
  schema: Schema;
};

type Response = {
  result: number;
  errorMessage?: string;
  infoResponse?: InfoResponse;
  sellResponse?: SellResponse;
};

type InfoResponse = {
  sellPrice: string;
};

type SellResponse = {
  sellPrice: string;
};

type Method = "sell" | "info";
type Schema = "ERC721" | "ERC1155";

exports.handler = async (req: Request): Promise<Response> => {
  await readSSM();

  const provider = new ethers.providers.JsonRpcProvider(
    process.env.ETHEREUM_URL!
  );
  const wallet = new ethers.Wallet(process.env.WALLET_SECRET!, provider);

  const openseaSDK = new OpenSeaSDK(
    provider,
    {
      chain: Chain.Fuji,
      apiKey: undefined,
    },
    undefined,
    wallet
  );

  try {
    switch (req.method) {
      case "info":
        const infoData = req.infoRequest;
        if (!infoData) {
          return {
            result: 1,
            errorMessage: "リクエストが不正です",
          };
        }

        try {
          const order = await openseaSDK.api.getOrder({
            assetContractAddress: infoData.tokenAddress,
            tokenId: infoData.tokenId,
            side: "ask",
          });
          console.log(order);

          return {
            result: 0,
            infoResponse: {
              sellPrice: ethers.utils.formatEther(order.currentPrice),
            },
          };
        } catch (e: any) {
          if (e.message.includes("Not found")) {
            return {
              result: 0,
              infoResponse: {
                sellPrice: "0",
              },
            };
          } else {
            return {
              result: 1,
              errorMessage: e.message,
            };
          }
        }

      case "sell":
        const sellData = req.sellRequest;
        if (!sellData) {
          return {
            result: 1,
            errorMessage: "リクエストが不正です",
          };
        }

        let tokenStandard: TokenStandard = TokenStandard.ERC721;
        if (sellData.schema === "ERC1155") {
          tokenStandard = TokenStandard.ERC1155;
        }

        const listing = await openseaSDK.createSellOrder({
          asset: {
            tokenId: sellData.tokenId,
            tokenAddress: sellData.tokenAddress,
            tokenStandard,
          },
          accountAddress: process.env.WALLET_ADDRESS!,
          startAmount: sellData.ether,
          endAmount: sellData.ether,
          quantity: sellData.quantity,
          expirationTime: Math.round(Date.now() / 1000 + 60 * 60 * 24 * 7),
        });
        console.log(listing);

        return {
          result: 0,
          sellResponse: {
            sellPrice: ethers.utils.formatEther(listing.currentPrice),
          },
        };
      default:
        throw new Error("サポートしていないメソッドです");
    }
  } catch (e: any) {
    console.log(`エラー: ${e}`);
    return {
      result: 1,
      errorMessage: e.message,
    };
  }
};

const readSSM = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const ssm = new AWS.SSM();
    const params = {
      Name: process.env.SSM_PARAMETER!,
      WithDecryption: true,
    };

    ssm.getParameter(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        const value = data.Parameter!.Value!;
        const lines = value.split("\n");
        lines
          .filter((line) => line !== "")
          .map((line) => line.split("="))
          .filter((keyval) => keyval.length === 2)
          .forEach((keyval) => {
            process.env[keyval[0]] = keyval[1];
          });
        resolve();
      }
    });
  });
};
