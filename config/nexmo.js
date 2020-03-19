const Nexmo = require("nexmo");
const nexmo = new Nexmo({
  apiKey: "4a1dcce6",
  apiSecret: "ZnAI64DyUHDSa4fv"
});

nexmo.verify.request(
  {
    number: '962790524873',
    brand: 'fiix code'
  },
  (err, result) => {
    if (err) {
      console.error(err);
    } else {
      const verifyRequestId = result.request_id;
      console.log("request_id", verifyRequestId);
    }
  }
);

module.exports = nexmo;
