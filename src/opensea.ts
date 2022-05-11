import HDWalletProvider from "@truffle/hdwallet-provider";
import { Network, OpenSeaPort } from "opensea-js";
import { OrderSide, WyvernSchemaName } from "opensea-js/lib/types";
import Web3 from "web3";
import { Order } from "wyvern-js/lib/types";

const CHAIN_URL =
  "https://rinkeby.infura.io/v3/8c9463fa803f437d952d646c128ebced";

export class OpenSea {
  private seaport: OpenSeaPort;

  constructor(private walletAddress: string, walletSecret: string) {
    if (!walletAddress || !walletSecret) {
      throw new Error("ウォレット情報が不正です");
    }
    if (!Web3.utils.isAddress(walletAddress)) {
      throw new Error("ウォレットアドレスが不正です");
    }

    const provider = new HDWalletProvider(walletSecret, CHAIN_URL);
    this.seaport = new OpenSeaPort(provider, {
      networkName: Network.Rinkeby,
    });
  }

  getSellOrder = async (
    tokenAddress: string,
    tokenId: string
  ): Promise<Order> => {
    if (!tokenAddress || !tokenId) {
      throw new Error("トークン情報が不正です");
    }
    if (!Web3.utils.isAddress(tokenAddress)) {
      throw new Error("トークンアドレスが不正です");
    }

    const order = await this.seaport.api.getOrder({
      side: OrderSide.Sell,
      asset_contract_address: tokenAddress,
      token_id: tokenId,
    });

    return order;
  };

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
      token_id: tokenId,
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

    await this.seaport.createSellOrder({
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
