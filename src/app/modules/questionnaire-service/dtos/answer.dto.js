const Joi = require('joi');

exports.answerValidationSchema = Joi.object({
  questionId: Joi.string().required(),
  answer: Joi.string().required(),
});

exports.getAnswerSchema = Joi.object({
  questionId: Joi.string().required(),
  userId: Joi.string().required(),
});

exports.getSearchSchema = Joi.object({
  search: Joi.string().optional(),
  userId: Joi.string().required(),
});
