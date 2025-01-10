const express = require('express');
const { verifyToken } = require('../../common/helpers/jwt');
const controller = require('./user.controller');
const { validatePayload } = require('../../common/helpers/requestValidator');
const {
  userSignUpSchema,
  emailVerificationSchema,
  loginSchema,
  updateUserProfile,
  getUserByUserId,
} = require('./dtos/user.dto');
const { upload } = require('../../common/helpers/file-uploader');
const router = express.Router();

router.route('/user/sign-up').post(
  validatePayload({
    body: userSignUpSchema,
  }),
  controller.signUpUser
);

router.route('/user/sign-up-verification').post(
  validatePayload({
    body: emailVerificationSchema,
  }),
  controller.verifyUserEmail
);

router.route('/user/login').post(
  validatePayload({
    body: loginSchema,
  }),
  controller.loginUser
);

router.route('/user/my').get(verifyToken, controller.viewProfile);

router.route('/user/profile').put(
  verifyToken,
  upload.single('profilePicture'),
  validatePayload({
    body: updateUserProfile,
  }),
  controller.updateProfile
);

module.exports = router;
