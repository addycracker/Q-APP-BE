const jwt = require('jsonwebtoken');
const APIError = require('./error.class');
const { v4: uuidv4 } = require('uuid');
const userModel = require('../../modules/user/user.model');
const mongoose = require('mongoose');

const verifyToken = async (req, res, next) => {
  try {
    const { headers } = req;
    if (!headers || !headers.authorization) {
      return res.status(401).json({
        success: false,
        message: 'token is required for authentication',
      });
    }

    const token = headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
      if (err) {
        return res.status(401).json({
          status: false,
          message: 'invalid token',
        });
      } else {
        if (!data.user) {
          return res.status(401).json({
            status: false,
            message: 'unauthorized',
          });
        }
        const user = await userModel.aggregate([
          {
            $match: {
              _id: mongoose.Types.ObjectId(data.user),
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              createdAt: 1,
            },
          },
        ]);

        if (!user) {
          return res.status(401).json({
            status: false,
            message: 'Token is Expired',
          });
        }
        req.user = user[0];
        return next();
      }
    });
  } catch (err) {
    return { err: 'Unauthorized user' };
  }
};

const generateToken = async (user) => {
  const token = jwt.sign({ user }, process.env.JWT_SECRET, {
    expiresIn: 3200,
  });
  return token;
};

module.exports = {
  verifyToken,
  generateToken,
};
