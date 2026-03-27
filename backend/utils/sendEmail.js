const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        // 1. Create the "Transporter" (The mail carrier)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Your Gmail address
                pass: process.env.EMAIL_PASS  // Your Gmail App Password
            }
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