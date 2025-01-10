const path = require('path');
const { bulkUploadQuestions } = require('./questionnaire.service');
const { sendResponse } = require('../../common/helpers/responseHandler');
const {
  successResponseCode,
  badResponseCode,
} = require('../../common/helpers/responseCode');
const questionnaireService = require('./questionnaire.service');
const APIError = require('../../common/helpers/error.class');

module.exports.uploadQuestions = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new APIError('file is required', badResponseCode.BAD_REQUEST);
    }

    const filePath = path.resolve(req.file.path);
    const result = await bulkUploadQuestions(filePath);

    return sendResponse(
      res,
      successResponseCode.OK,
      true,
      null,
      result.message
    );
  } catch (error) {
    next(error);
  }
};

module.exports.getAllQuestionCategories = async (req, res, next) => {
  try {
    const categories = await questionnaireService.getAllCategories();
    return sendResponse(
      res,
      successResponseCode.OK,
      true,
      categories,
      'Categories fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};
module.exports.getQuestionsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { page, limit, skip } = req.pagination;

    const data = await questionnaireService.fetchQuestionsByCategory(
      categoryId,
      page,
      limit,
      skip
    );

    return sendResponse(
      res,
      successResponseCode.OK,
      true,
      data,
      `Questions fetched successfully`
    );
  } catch (error) {
    next(error);
  }
};
module.exports.submitAnswers = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const data = req.validatedBody;
    await questionnaireService.submitAnswers({
      ...data,
      userId,
    });
    return sendResponse(
      res,
      successResponseCode.OK,
      true,
      null,
      `Answer submitted successfully`
    );
  } catch (error) {
    next(error);
  }
};

module.exports.searchAnswers = async (req, res, next) => {
  try {
    const { userId, search } = req.validatedQuery;
    const { timezone } = req.headers;

    const answers = await questionnaireService.searchAnswersByQuestion(
      userId,
      timezone,
      search
    );

    return sendResponse(
      res,
      successResponseCode.OK,
      true,
      answers,
      'Answers fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};
module.exports.getAllCategoriesWithQuestionCount = async (req, res, next) => {
  try {
    const categories =
      await questionnaireService.getCategoriesWithQuestionCount();
    return sendResponse(
      res,
      successResponseCode.OK,
      true,
      categories,
      'Categories fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};
