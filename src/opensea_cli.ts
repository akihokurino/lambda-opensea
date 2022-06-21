import HDWalletProvider from "@truffle/hdwallet-provider";
import { Network, OpenSeaPort } from "opensea-js";
import { WyvernSchemaName } from "opensea-js/lib/types";
import Web3 from "web3";

export type BuyPayload = {
  tokenAddress: string;
  tokenId: string;
};

export type SellPayload = {
  tokenAddress: string;
  tokenId: string;
  schemaName: WyvernSchemaName;
  ether: number;
  quantity: number;
};

export type TransferPayload = {
  tokenAddress: string;
  tokenId: string;
  schemaName: WyvernSchemaName;
  transferAddress: string;
  transferAmount: number;
  quantity: number;
};

export class OpenSeaCli {
  private seaport: OpenSeaPort;

  constructor(private walletAddress: string, walletSecret: string) {
    if (!walletAddress || !walletSecret) {
      throw new Error("ウォレット情報が不正です");
    }
    if (!Web3.utils.isAddress(walletAddress)) {
      throw new Error("ウォレットアドレスが不正です");
    }

    const provider = new HDWalletProvider(walletSecret, process.env.CHAIN_URL!);
    this.seaport = new OpenSeaPort(provider, {
      networkName: Network.Rinkeby,
    });
  }

  buy = async (payload: BuyPayload): Promise<string> => {
    if (!payload.tokenAddress || !payload.tokenId) {
      throw new Error("トークン情報が不正です");
    }
    if (!Web3.utils.isAddress(payload.tokenAddress)) {
      throw new Error("トークンアドレスが不正です");
    }

    const order = await this.seaport.api.getOrder({
      protocol: "seaport",
      side: "ask",
      assetContractAddress: payload.tokenAddress,
      tokenIds: [payload.tokenId],
    });

    const txHash = await this.seaport.fulfillOrder({
      order,
      accountAddress: this.walletAddress,
    });

    return txHash;
  };

  sell = async (payload: SellPayload): Promise<string> => {
    if (!payload.tokenId) {
      throw new Error("トークン情報が不正です");
    }
    if (!Web3.utils.isAddress(payload.tokenAddress)) {
      throw new Error("トークンアドレスが不正です");
    }
    if (payload.ether <= 0) {
      throw new Error("Etherは0以上を指定してください");
    }

    const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24 * 7);

    await this.seaport.createSellOrder({
      asset: {
        tokenAddress: payload.tokenAddress,
        tokenId: payload.tokenId,
        schemaName: payload.schemaName,
      },
      accountAddress: this.walletAddress,
      startAmount: payload.ether,
      quantity: Math.max(payload.quantity, 1),
      expirationTime,
    });

    return "";
  };

  transfer = async (payload: TransferPayload): Promise<string> => {
    if (!payload.tokenAddress || !payload.tokenId) {
      throw new Error("トークン情報が不正です");
    }
    if (!Web3.utils.isAddress(payload.tokenAddress)) {
      throw new Error("トークンアドレスが不正です");
    }
    if (!Web3.utils.isAddress(payload.transferAddress)) {
      throw new Error("送付先アドレスが不正です");
    }

    const txHash = await this.seaport.transfer({
      asset: {
        tokenAddress: payload.tokenAddress,
        tokenId: payload.tokenId,
        schemaName: payload.schemaName,
      },
      fromAddress: this.walletAddress,
      toAddress: payload.transferAddress,
      quantity: Math.max(payload.quantity, 1),
    });

    return txHash;
  };
}
