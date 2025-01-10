const APIError = require('../../common/helpers/error.class');
const { uploadToCloudinary } = require('../../common/helpers/file-uploader');
const { generateHash } = require('../../common/helpers/password-handler');
const {
  badResponseCode,
  successResponseCode,
} = require('../../common/helpers/responseCode');
const { sendResponse } = require('../../common/helpers/responseHandler');
const userService = require('../user/user.service');
const { updateUserProfile } = require('./dtos/user.dto');

module.exports.signUpUser = async (req, res, next) => {
  const userPayload = req.validatedBody;
  try {
    userPayload.password = await generateHash(userPayload.password);
    await userService.signUpUserService(userPayload);
    return sendResponse(
      res,
      successResponseCode.OK,
      true,
      null,
      `check email for verification`
    );
  } catch (error) {
    next(error);
  }
};

module.exports.verifyUserEmail = async (req, res, next) => {
  const userPayload = req.validatedBody;
  try {
    const data = await userService.emailVerificationService(userPayload);
    return sendResponse(
      res,
      successResponseCode.OK,
      true,
      data,
      `Email Verified`
    );
  } catch (error) {
    next(error);
  }
};

module.exports.loginUser = async (req, res, next) => {
  const userPayload = req.validatedBody;
  try {
    const data = await userService.signInUser(userPayload);
    return sendResponse(
      res,
      successResponseCode.OK,
      true,
      data,
      `User logged in successfully`
    );
  } catch (error) {
    next(error);
  }
};
module.exports.viewProfile = async (req, res, next) => {
  try {
    return sendResponse(
      res,
      successResponseCode.OK,
      true,
      req.user,
      `Profile fetched successfully`
    );
  } catch (error) {
    next(error);
  }
};
module.exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let profilePictureUrl = null;

    if (req.file) {
      const cloudinaryResult = await uploadToCloudinary(req.file.path, {
        folder: 'user_profiles',
        public_id: `profile_${userId}`,
        overwrite: true,
      });
      profilePictureUrl = cloudinaryResult.secure_url;
      req.validatedBody.profilePicture = profilePictureUrl;
    }

    const updatedUser = await userService.updateMyProfile(
      userId,
      req.validatedBody
    );

    return sendResponse(
      res,
      successResponseCode.OK,
      true,
      updatedUser,
      'Profile updated successfully'
    );
  } catch (error) {
    next(error);
  }
};
