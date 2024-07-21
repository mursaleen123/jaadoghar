import nodemailer from 'nodemailer';
import config from './configs/index.js';

const transporter = nodemailer.createTransport({
  host: config.host,
  port: parseInt(config.smtp_port, 10),
  auth: {
    user: config.email,
    pass: config.password,
  },
});

export const sendEmail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};
