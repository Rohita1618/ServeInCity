const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        // 1. Create the "Transporter" (The mail carrier)
        const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in', // Using .in because your MX records were in the Indian data center!
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
        // 2. Define the email content
        const mailOptions = {
            from: 'ServeInCity <noreply@serveincity.com>',
            to: options.email,
            subject: options.subject,
            text: options.message
        };

        // 3. Send the email
        await transporter.sendMail(mailOptions);
        console.log(`Email successfully sent to ${options.email}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = sendEmail;