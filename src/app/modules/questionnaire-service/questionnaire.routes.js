const express = require('express');
const multer = require('multer');
const controller = require('./questionnaire.controller');
const { verifyToken } = require('../../common/helpers/jwt');
const paginationHandler = require('../../common/helpers/pagination-handler');
const { validatePayload } = require('../../common/helpers/requestValidator');
const {
  answerValidationSchema,
  getSearchSchema,
} = require('./dtos/answer.dto');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router
  .route('/questions/upload')
  .post(verifyToken, upload.single('file'), controller.uploadQuestions);
router
  .route('/questions/categories')
  .get(verifyToken, controller.getAllQuestionCategories);

router
  .route('/questions/category-wise-questions-count')
  .get(verifyToken, controller.getAllCategoriesWithQuestionCount);

router.route('/questions/get-answers').get(
  verifyToken,
  validatePayload({
    query: getSearchSchema,
  }),
  controller.searchAnswers
);

router
  .route('/questions/:categoryId')
  .get(verifyToken, paginationHandler, controller.getQuestionsByCategory);

router.route('/questions/submit-answer').post(
  verifyToken,
  validatePayload({
    body: answerValidationSchema,
  }),
  controller.submitAnswers
);

module.exports = router;
