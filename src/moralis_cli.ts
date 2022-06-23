const Moralis = require("moralis/node");

export type CreateMetadataPayload = {
  name: string;
  description: string;
  externalUrl: string;
  imageBase64: string;
};

export type IPFS = {
  hash: string;
  url: string;
};

export class MoralisCli {
  constructor(
    private appId: string,
    private masterKey: string,
    private serverUrl: string
  ) {}

  uploadIpfs = async (payload: CreateMetadataPayload): Promise<IPFS> => {
    Moralis.initialize(this.appId, "", this.masterKey);
    Moralis.serverURL = this.serverUrl;

    const imageFile = new Moralis.File(payload.name, {
      base64: payload.imageBase64,
    });
    await imageFile.saveIPFS({ useMasterKey: true });
    const imageUrl = imageFile.ipfs();

    const metadataFile = new Moralis.File("metadata.json", {
      base64: btoa(
        JSON.stringify({
          name: payload.name,
          description: payload.description,
          external_url: payload.externalUrl,
          image: imageUrl,
        })
      ),
    });
    await metadataFile.saveIPFS({ useMasterKey: true });

    const metadataHash = metadataFile.hash();
    const metadataUrl = metadataFile.ipfs();

    return {
      hash: metadataHash,
      url: metadataUrl,
    };
  };
}
