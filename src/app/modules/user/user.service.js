const User = require('./user.model');
const APIError = require('../../common/helpers/error.class');
const jwt2 = require('../../common/helpers/jwt');
const {
  addCache,
  getCacheByKey,
  invalidateCacheByKey,
} = require('../../common/utils/redis');
const { sendEmail } = require('../../common/helpers/email');
const { badResponseCode } = require('../../common/helpers/responseCode');
const { generateOtp } = require('../../common/helpers/utility');
const { verifyHash } = require('../../common/helpers/password-handler');

const signUpUserService = async (data) => {
  try {
    const user = await User.findOne({ email: data.email });
    if (user) {
      throw new APIError(
        `User already registered ${
          !user.isVerified ? 'and Verification Pending' : ''
        }`,
        badResponseCode.CONFLICT
      );
    }
    await User.create(data);
    const otp = generateOtp();
    await Promise.all([
      addCache(data.email, { otp }, 300),
      sendEmail(data.email, otp),
    ]);
    return null;
  } catch (error) {
    throw error;
  }
};

const emailVerificationService = async (data) => {
  try {
    const user = await User.findOne({ email: data.email });
    if (!user) {
      throw new APIError(`User not present`, badResponseCode.NOT_FOUND);
    }
    if (user.isVerified) {
      throw new APIError(`User already verified`, badResponseCode.CONFLICT);
    }
    let getOtpCache = await getCacheByKey(data.email);
    if (!getOtpCache) {
      throw new APIError(`Otp Expired`, badResponseCode.UNAUTHORIZED);
    }
    getOtpCache = JSON.parse(getOtpCache);
    if (data.otp !== getOtpCache.otp) {
      throw new APIError(`Invalid Otp`, badResponseCode.UNAUTHORIZED);
    }
    invalidateCacheByKey(data.email);
    user.isVerified = true;
    await user.save();
    const token = await jwt2.generateToken(user._id);
    return { token };
  } catch (error) {
    throw error;
  }
};

const signInUser = async (data) => {
  try {
    const { email, password } = data;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new APIError(`User not present`, badResponseCode.NOT_FOUND);
    }

    if (!user.isVerified) {
      throw new APIError('User not verified', badResponseCode.UNAUTHORIZED);
    }

    const passwordMatched = await verifyHash(password, user.password);
    if (!passwordMatched) {
      throw new APIError('Incorrect password', badResponseCode.UNAUTHORIZED);
    }
    const token = await jwt2.generateToken(user._id);
    return { token };
  } catch (error) {
    throw error;
  }
};

const updateMyProfile = async (userId, updateData) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      throw new APIError('User not found', badResponseCode.NOT_FOUND);
    }

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  signUpUserService,
  emailVerificationService,
  signInUser,
  updateMyProfile,
};
