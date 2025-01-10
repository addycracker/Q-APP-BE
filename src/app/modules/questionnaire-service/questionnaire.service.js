const fs = require('fs');
const csvParser = require('csv-parser');
const Question = require('./questionnaire.model');
const Category = require('./category.model');
const APIError = require('../../common/helpers/error.class');
const mongoose = require('mongoose');
const { badResponseCode } = require('../../common/helpers/responseCode');
const Answer = require('./answer.model');

const bulkUploadQuestions = async (filePath) => {
  try {
    const questions = [];

    const stream = fs
      .createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        const options = JSON.parse(row.options);
        const categories = row.categories.split(',').map((cat) => cat.trim());
        questions.push({ questionText: row.questionText, options, categories });
      });

    await new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    for (const question of questions) {
      const categoryIds = await Promise.all(
        question.categories.map(async (categoryName) => {
          let category = await Category.findOne({ name: categoryName });
          if (!category) {
            category = await Category.create({ name: categoryName });
          }
          return category._id;
        })
      );

      await Question.create({
        questionText: question.questionText,
        options: question.options,
        categories: categoryIds,
      });
    }

    return {
      success: true,
      message: `${questions.length} questions uploaded successfully`,
    };
  } catch (error) {
    throw error;
  }
};

const getAllCategories = async () => {
  try {
    return await Category.aggregate([
      {
        $project: {
          _id: 1,
          name: 1,
        },
      },
    ]);
  } catch (error) {
    throw error;
  }
};

const fetchQuestionsByCategory = async (categoryId, page, limit, skip) => {
  try {
    const [questions, totalQuestions] = await Promise.all([
      Question.aggregate([
        {
          $match: {
            categories: { $in: [mongoose.Types.ObjectId(categoryId)] },
          },
        },

        {
          $project: {
            _id: 1,
            questionText: 1,
            options: 1,
          },
        },
        { $skip: skip },
        { $limit: limit },
      ]),

      Question.countDocuments({
        categories: { $in: [categoryId] },
      }),
    ]);

    return {
      questions,
      currentPage: page,
      totalPages: Math.ceil(totalQuestions / limit),
      totalQuestions,
    };
  } catch (error) {
    throw error;
  }
};

const submitAnswers = async (data) => {
  try {
    const [question, submittedAnswer] = await Promise.all([
      Question.findById(data.questionId),
      Answer.findOne({
        questionId: mongoose.Types.ObjectId(data.questionId),
        userId: mongoose.Types.ObjectId(data.userId),
      }),
    ]);
    if (!question) {
      throw new APIError('Invalid question', badResponseCode.NOT_FOUND);
    }
    if (submittedAnswer) {
      throw new APIError(
        'Answer was already submitted',
        badResponseCode.CONFLICT
      );
    }

    await Answer.create(data);
  } catch (error) {
    throw error;
  }
};

const searchAnswersByQuestion = async (userId, timezone, searchQuery) => {
  const pipeline = [
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: 'questions',
        localField: 'questionId',
        foreignField: '_id',
        as: 'question',
      },
    },
    { $unwind: '$question' },
    {
      $addFields: {
        localCreatedAt: {
          $dateToString: {
            format: '%Y-%m-%d %H:%M:%S',
            date: '$createdAt',
            timezone: timezone || 'UTC',
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        userId: 1,
        questionId: 1,
        questionText: '$question.questionText',
        options: '$question.options',
        answer: 1,
        createdAt: '$localCreatedAt',
      },
    },
  ];

  if (searchQuery) {
    pipeline.splice(3, 0, {
      $match: {
        'question.questionText': {
          $regex: searchQuery,
          $options: 'i',
        },
      },
    });
  }

  return Answer.aggregate(pipeline);
};

const getCategoriesWithQuestionCount = async () => {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'questions',
          localField: '_id',
          foreignField: 'categories',
          as: 'questions',
        },
      },
      {
        $addFields: {
          questionCount: { $size: '$questions' },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          questionCount: 1,
        },
      },
    ]);

    return categories;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  bulkUploadQuestions,
  getAllCategories,
  fetchQuestionsByCategory,
  submitAnswers,
  searchAnswersByQuestion,
  getCategoriesWithQuestionCount,
};
