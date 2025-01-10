const APIError = require('./error.class');
const { badResponseCode } = require('./responseCode');
const { sanitisePayload } = require('./utility');

module.exports.validatePayload = ({
  body = null,
  query = null,
  params = null,
}) => {
  return async (req, res, next) => {
    try {
      if (body) {
        const { error, value } = body.validate(req.body);

        if (error) {
          throw new APIError(
            error.message.replace(/\"/g, ''),
            badResponseCode.PRECONDITION_FAILED
          );
        }

        req.validatedBody = value;
      }

      if (params) {
        const { error, value } = params.validate(req.params);
        if (error) {
          throw new APIError(
            error.message.replace(/\"/g, ''),
            badResponseCode.PRECONDITION_FAILED
          );
        }

        req.validatedParams = value;
      }
      if (query) {
        const { error, value } = query.validate(sanitisePayload(req.query));
        if (error) {
          throw new APIError(
            error.message.replace(/\"/g, ''),
            badResponseCode.PRECONDITION_FAILED
          );
        }

        req.validatedQuery = value;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
