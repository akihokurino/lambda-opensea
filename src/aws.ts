import * as AWS from "aws-sdk";

export const readSSM = async (): Promise<void> => {
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
