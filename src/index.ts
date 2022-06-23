import { readSSM } from "aws";
import { CreateMetadataPayload, MoralisCli } from "moralis_cli";
import {
  BuyPayload,
  OpenSeaCli,
  SellPayload,
  TransferPayload,
} from "opensea_cli";

// var credentials = new AWS.SharedIniFileCredentials();
// AWS.config.credentials = credentials;
// AWS.config.update({ region: "ap-northeast-1" });

type Request = {
  method: Method;
  walletAddress: string;
  walletSecret: string;

  buyPayload?: BuyPayload;
  sellPayload?: SellPayload;
  transferPayload?: TransferPayload;
  createMetadataPayload?: CreateMetadataPayload;
};

type Response = {
  message: string;
  result: number;
  ipfsResponse?: IPFSResponse;
};

type IPFSResponse = {
  hash: string;
  url: string;
};

type Method = "buy" | "sell" | "transfer" | "createMetadata";

exports.handler = async (req: Request): Promise<Response> => {
  await readSSM();

  try {
    const openseaCli = new OpenSeaCli(req.walletAddress, req.walletSecret);
    const moralisCli = new MoralisCli(
      process.env.MORALIS_APP_ID!,
      process.env.MORALIS_MASTER_KEY!,
      process.env.MORALIS_SERVER_URL!
    );

    console.log(req);

    switch (req.method) {
      case "buy":
        await openseaCli.buy(req.buyPayload!);
        return {
          message: "",
          result: 0,
        };
      case "sell":
        await openseaCli.sell(req.sellPayload!);
        return {
          message: "",
          result: 0,
        };
      case "transfer":
        await openseaCli.transfer(req.transferPayload!);
        return {
          message: "",
          result: 0,
        };
      case "createMetadata":
        const data = await moralisCli.uploadIpfs(req.createMetadataPayload!);
        console.log(`IPFS hash: ${data.hash}`);
        console.log(`IPFS url: ${data.url}`);
        return {
          message: "",
          result: 0,
          ipfsResponse: {
            hash: data.hash,
            url: data.url,
          },
        };
      default:
        throw new Error("サポートしていないメソッドです");
    }
  } catch (e: any) {
    console.log(`エラー: ${e}`);
    return {
      message: e.message,
      result: 1,
    };
  }
};
