const mongoose = require('mongoose');
const color = require('colors');

const connectDB = async () => {
  try {
    const data = await mongoose.connect(process.env.DB_URI, {
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    console.log(
      color.bold(
        `|-------------------------------------------------------------------------------|`
      )
    );
    console.log(
      `|` +
        color.yellow.bold(
          ` $Connected with database: ${data.connection.host}           `
        ) +
        `                                |`
    );
    console.log(
      color.bold(
        '|_______________________________________________________________________________|'
      )
    );
  } catch (err) {
    console.log('--error--');
    console.error(err.message);
    process.exit(1);
  }
};
module.exports = connectDB;
