const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendResetEmail = async (email, resetToken) => {
  const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Password Reset Request',
    html: `
      <p>You requested a password reset</p>
      <p>Click this <a href="${resetUrl}">link</a> to set a new password.</p>
      <p>This link will expire in 1 hour.</p>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };