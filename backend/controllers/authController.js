const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Assuming you use bcrypt to hash passwords
const sendEmail = require('../utils/sendEmail'); // Your Nodemailer utility!

// ==========================================
// 1. FORGOT PASSWORD (Generate & Send OTP)
// ==========================================
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "There is no user with that email address." });
        }

        // Generate a random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash the OTP (Optional but highly recommended for Enterprise apps)
        // Or store it plain text if you prefer simplicity for the college project. 
        // We will store it directly for now:
        user.resetPasswordOtp = otp;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

        await user.save({ validateBeforeSave: false });

        // Send the OTP via Email
        const message = `Your ServeInCity password reset code is: ${otp} \n\nThis code is valid for 10 minutes. If you did not request this, please ignore this email.`;

        await sendEmail({
            email: user.email,
            subject: 'ServeInCity - Password Reset OTP',
            message: message
        });

        res.status(200).json({ message: "OTP sent to email!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Email could not be sent", error: error.message });
    }
};

// ==========================================
// 2. RESET PASSWORD (Verify OTP & Save)
// ==========================================
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Find user by email AND check if OTP matches AND check if it hasn't expired
        const user = await User.findOne({ 
            email, 
            resetPasswordOtp: otp,
            resetPasswordExpire: { $gt: Date.now() } // $gt means "Greater Than" current time
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }

        // Hash the new password before saving!
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear the OTP fields so it can't be used again
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: "Password successfully reset! You can now log in." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ==========================================
// 3. CHANGE PASSWORD (Logged-in Users in Settings)
// ==========================================
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // req.user.id comes from your 'protect' middleware
        const user = await User.findById(req.user.id); 

        // Check if the current password they typed matches the database
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect current password." });
        }

        // Hash and save the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: "Password successfully updated!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};