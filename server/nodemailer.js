const nodemailer = require("nodemailer");
const config = require("./configs");

const transporter = nodemailer.createTransport({
  host: config.host,
  port: parseInt(config.smtp_port),
  auth: {
    user: config.email,
    pass: config.password,
  },
});

const sendEmail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};

module.exports = sendEmail;
