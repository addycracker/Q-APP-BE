const nodemailer = require('nodemailer');

function sendEmail(to, otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: 'OTP verification initiated',
    text: `Your OTP is: ${otp}`,
    html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return { status: false, message: 'Email failed to send', error };
    } else {
      console.log('Email sent:', info.response);
      return { status: true, message: 'Email sent successfully' };
    }
  });
}

module.exports = { sendEmail };
