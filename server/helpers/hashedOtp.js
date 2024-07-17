const crypto = require('crypto');

exports.generateHashedOTP = (otp) => {
  const hash = crypto .createHash('sha256');
  hash.update(otp.toString());
  return hash.digest("hex");
};
