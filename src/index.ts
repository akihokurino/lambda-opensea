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
        break;
      case "sell":
        await openseaCli.sell(req.sellPayload!);
        break;
      case "transfer":
        await openseaCli.transfer(req.transferPayload!);
        break;
      case "createMetadata":
        await moralisCli.uploadIpfs(req.createMetadataPayload!);
        break;
      default:
        throw new Error("サポートしていないメソッドです");
    }

    console.log("成功");
    return {
      message: "",
      result: 0,
    };
  } catch (e: any) {
    console.log("失敗");
    console.log(e);
    return {
      message: e.message,
      result: 1,
    };
  }
};
