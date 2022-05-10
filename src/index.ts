import HDWalletProvider from "@truffle/hdwallet-provider";
import { Network, OpenSeaPort } from "opensea-js";
import { OrderSide, WyvernSchemaName } from "opensea-js/lib/types";
import Web3 from "web3";

const CHAIN_URL =
  "https://rinkeby.infura.io/v3/8c9463fa803f437d952d646c128ebced";

type Payload = {
  task: Task;
  tokenAddress: string;
  tokenId: string;
  schemaName: WyvernSchemaName;
  walletAddress: string;
  walletSecret: string;
  sellEther: number;
  transferAddress: string;
  transferAmount: number;
};

type Response = {
  message: string;
  result: number;
};

type Task = "buy" | "sell" | "transfer";

exports.handler = async (payload: Payload): Promise<Response> => {
  if (!payload.walletAddress || !payload.walletSecret) {
    return {
      message: "ウォレット情報が不正です",
      result: 1,
    };
  }
  if (!Web3.utils.isAddress(payload.walletAddress)) {
    return {
      message: "ウォレットアドレスが不正です",
      result: 1,
    };
  }

  const cli = new Cli(payload.walletAddress, payload.walletSecret);

  try {
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

    return {
      message: "",
      result: 0,
    };
  } catch (e: any) {
    return {
      message: e.message,
      result: 1,
    };
  }
};

class Cli {
  private seaport: OpenSeaPort;

  constructor(private walletAddress: string, walletSecret: string) {
    const provider = new HDWalletProvider(walletSecret, CHAIN_URL);
    this.seaport = new OpenSeaPort(provider, {
      networkName: Network.Rinkeby,
      apiKey: undefined,
    });
  }

  buy = async (tokenAddress: string, tokenId: string): Promise<string> => {
    if (!tokenAddress || !tokenId) {
      throw new Error("トークン情報が不正です");
    }
    if (!Web3.utils.isAddress(tokenAddress)) {
      throw new Error("トークンアドレスが不正です");
    }

    const order = await this.seaport.api.getOrder({
      side: OrderSide.Sell,
      asset_contract_address: tokenAddress,
      token_ids: [tokenId],
    });

    const txHash = await this.seaport.fulfillOrder({
      order,
      accountAddress: this.walletAddress,
    });

    return txHash;
  };

  sell = async (
    tokenAddress: string,
    tokenId: string,
    ether: number
  ): Promise<string> => {
    if (!tokenAddress || !tokenId) {
      throw new Error("トークン情報が不正です");
    }
    if (!Web3.utils.isAddress(tokenAddress)) {
      throw new Error("トークンアドレスが不正です");
    }
    if (ether <= 0) {
      throw new Error("Etherは0以上を指定してください");
    }

    const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24 * 7);
    const listing = await this.seaport.createSellOrder({
      asset: {
        tokenAddress,
        tokenId,
      },
      accountAddress: this.walletAddress,
      startAmount: ether,
      expirationTime,
    });

    return "";
  };

  transfer = async (
    tokenAddress: string,
    tokenId: string,
    schemaName: WyvernSchemaName,
    to: string,
    quantity: number
  ): Promise<string> => {
    if (!tokenAddress || !tokenId) {
      throw new Error("トークン情報が不正です");
    }
    if (!Web3.utils.isAddress(tokenAddress)) {
      throw new Error("トークンアドレスが不正です");
    }
    if (!Web3.utils.isAddress(to)) {
      throw new Error("送付先アドレスが不正です");
    }

    const txHash = await this.seaport.transfer({
      asset: {
        tokenAddress,
        tokenId,
        schemaName,
      },
      fromAddress: this.walletAddress,
      toAddress: to,
      quantity: Math.max(quantity, 1),
    });

    return txHash;
  };
}
