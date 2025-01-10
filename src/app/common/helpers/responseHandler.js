const { successResponseCode } = require('./responseCode');

module.exports.sendResponse = (
  res,
  statusCode = successResponseCode.OK,
  success = true,
  data = null,
  msg = null
) => {
  return res.status(statusCode).json({
    success,
    msg,
    result: data,
  });
};
