type Payload = {};

exports.handler = async (event: Payload) => {
  return {
    body: "hello world",
  };
};
