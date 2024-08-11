import nodemailer from 'nodemailer';
import config from './configs/index.js';
const transporter = nodemailer.createTransport({
  host: config.host,
  port: config.smtp_port, // e.g., 587 for TLS
  secure: true, // true for 465, false for other ports
  auth: {
    user: config.email,
    pass: config.password
  },
  tls: {
    rejectUnauthorized: false
  },
  debug: true, // Enable debug output
  logger: true // Log to console
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