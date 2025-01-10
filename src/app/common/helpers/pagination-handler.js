module.exports = (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    if (
      isNaN(parsedPage) ||
      isNaN(parsedLimit) ||
      parsedPage <= 0 ||
      parsedLimit <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid pagination parameters. Page and limit must be positive integers.',
      });
    }

    req.pagination = {
      page: parsedPage,
      limit: parsedLimit,
      skip: (parsedPage - 1) * parsedLimit,
    };

    next();
  } catch (error) {
    next(error);
  }
};
