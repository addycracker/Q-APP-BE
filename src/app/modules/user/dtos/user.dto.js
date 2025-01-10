const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { generateHash } = require('../../../common/helpers/password-handler');

exports.userSignUpSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(12).required(),
}).options({ allowUnknown: false });

exports.emailVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().min(6).max(6).required(),
}).options({ allowUnknown: false });

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(12).required(),
}).options({ abortEarly: false });

exports.getUserByUserId = Joi.object({
  userId: Joi.string(),
});

exports.updateUserProfile = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
});
