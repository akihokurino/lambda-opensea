import { OpenSea } from "opensea";
import { WyvernSchemaName } from "opensea-js/lib/types";

type Payload = {
  task: Task;
  walletAddress: string;
  walletSecret: string;
  tokenAddress: string;
  tokenId: string;
  sellEther: number;
  schemaName: WyvernSchemaName;
  transferAddress: string;
  transferAmount: number;
};

type Response = {
  message: string;
  result: number;
};

type Task = "buy" | "sell" | "transfer";

exports.handler = async (payload: Payload): Promise<Response> => {
  try {
    const cli = new OpenSea(payload.walletAddress, payload.walletSecret);

    switch (payload.task) {
      case "buy":
        await cli.buy(payload.tokenAddress, payload.tokenId);
        break;
      case "sell":
        await cli.sell(
          payload.tokenAddress,
          payload.tokenId,
          payload.sellEther
        );
        break;
      case "transfer":
        await cli.transfer(
          payload.tokenAddress,
          payload.tokenId,
          payload.schemaName,
          payload.transferAddress,
          payload.transferAmount
        );
        break;
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
