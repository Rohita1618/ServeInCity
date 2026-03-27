const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // NEW: Required for OTP Emails
const User = require('./models/User');
const Event = require('./models/Event');
const Message = require('./models/Message');
require('dotenv').config();

// Bypass ISP network blocks
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { family: 4 })
.then(() => console.log('🔥 MongoDB Connected Successfully!'))
.catch((err) => console.log('❌ MongoDB Connection Error: ', err.message));

// ==========================================
// 🛡️ SECURITY MIDDLEWARE
// ==========================================
// 1. Check if user is logged in
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      // Note: Using the exact secret key you used in your login route!
      const decoded = jwt.verify(token, 'ServeInCitySecretKey123'); 
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// 2. Check if user is an Admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Administrator clearance required.' });
  }
};


// ==========================================
// 🚀 REGISTRATION API ENDPOINT
// ==========================================
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, city, role, ngoRegistrationNumber } = req.body;

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      city,
      role: role || 'volunteer',
      ngoRegistrationNumber: role === 'ngo' ? ngoRegistrationNumber : undefined
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error during registration" });
  }
});

// ==========================================
// 🔐 LOGIN API ENDPOINT
// ==========================================
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate VIP Pass (JWT)
    const token = jwt.sign({ id: user._id }, 'ServeInCitySecretKey123', { expiresIn: '1h' });

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        city: user.city,
        role: user.role,
        profilePhoto: user.profilePhoto // Sends role to React to trigger specific UI
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error during login" });
  }
});

// ==========================================
// 🔑 MULTI-FACTOR AUTHENTICATION (OTP)
// ==========================================

// 1. Generate & Send OTP (Forgot Password)
app.post('/api/users/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No user found with that email address." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send the email using variables from your .env file
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'ServeInCity - Password Reset OTP',
      text: `Your ServeInCity password reset code is: ${otp} \n\nThis code is valid for 10 minutes.`
    });

    res.status(200).json({ message: "OTP sent to email!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Email could not be sent", error: error.message });
  }
});

// 2. Verify OTP & Set New Password
app.post('/api/users/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ 
      email, 
      resetPasswordOtp: otp,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired OTP." });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 3. Change Password Inside Settings (Requires Login)
app.put('/api/users/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password." });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password successfully updated!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 4. Update Profile Information
app.put('/api/users/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user) {
      // Update fields if they were provided in the request
      user.name = req.body.name || user.name;
      user.city = req.body.city || user.city;
      user.profilePhoto = req.body.profilePhoto || user.profilePhoto;
      
      const updatedUser = await user.save();
      
      res.status(200).json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        city: updatedUser.city,
        role: updatedUser.role,
        profilePhoto: updatedUser.profilePhoto
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ==========================================
// 🌍 EVENTS API ENDPOINTS
// ==========================================

// 1. GET ALL EVENTS (For Homepage)
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server Error while fetching events" });
  }
});

// 2. CREATE A NEW EVENT (NGO Only)
app.post('/api/events', async (req, res) => {
  try {
    const { title, skill, loc, city, description, volunteersNeeded, eventDate, eventTime, organizerId } = req.body;

    const newEvent = new Event({
      title,
      skill,
      loc,
      city,
      description,
      volunteersNeeded,
      eventDate,
      eventTime,
      organizer: organizerId 
    });

    await newEvent.save();
    res.status(201).json({ message: "Event created successfully!", event: newEvent });

  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server Error while creating event" });
  }
});

// 3. JOIN AN EVENT (Volunteer Only)
app.post('/api/events/:id/join', async (req, res) => {
  try {
    const eventId = req.params.id;
    const { userId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.attendees.includes(userId)) {
      return res.status(400).json({ message: "You have already joined this event!" });
    }

    if (event.volunteersNeeded <= 0) {
      return res.status(400).json({ message: "This event is already full!" });
    }

    event.attendees.push(userId);
    event.volunteersNeeded -= 1;
    await event.save();

    res.status(200).json({ message: "Successfully joined the event!", event });

  } catch (error) {
    console.error("Error joining event:", error);
    res.status(500).json({ message: "Server Error while joining event" });
  }
});

// 4. DELETE AN EVENT (Admin Only) - For the Dashboard!
app.delete('/api/events/:id', protect, isAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Event securely deleted by Admin" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ==========================================
// 📊 USER DASHBOARD API (Profile Page)
// ==========================================
app.get('/api/users/:id/dashboard', async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.query; 

    let userEvents = [];

    if (role === 'ngo') {
      userEvents = await Event.find({ organizer: userId })
      .populate('attendees', 'name email')
      .sort({ createdAt: -1 });
    } else {
      userEvents = await Event.find({ attendees: userId }).sort({ createdAt: -1 });
    }

    res.status(200).json(userEvents);

  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).json({ message: "Server Error fetching dashboard" });
  }
});

// ==========================================
// 🏆 LEADERBOARD API ENDPOINT
// ==========================================
app.get('/api/leaderboard', async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' }).select('-password');

    const leaderboardData = await Promise.all(volunteers.map(async (volunteer) => {
      const eventsJoined = await Event.countDocuments({ attendees: volunteer._id });
      return {
        id: volunteer._id,
        name: volunteer.name,
        city: volunteer.city,
        eventsJoined
      };
    }));

    leaderboardData.sort((a, b) => b.eventsJoined - a.eventsJoined);
    res.status(200).json(leaderboardData.slice(0, 10));

  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Server Error fetching leaderboard" });
  }
});

// ==========================================
// 🏢 NGO DIRECTORY API ENDPOINT
// ==========================================
app.get('/api/ngos', async (req, res) => {
  try {
    const ngos = await User.find({ role: 'ngo' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json(ngos);
  } catch (error) {
    console.error("Error fetching NGOs:", error);
    res.status(500).json({ message: "Server Error fetching NGO Directory" });
  }
});

// ==========================================
// ✉️ MESSAGING API ENDPOINTS
// ==========================================

// 1. Send a new message
app.post('/api/messages', async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content
    });

    await newMessage.save();
    res.status(201).json({ message: "Message sent successfully!", data: newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server Error while sending message" });
  }
});

// 2. Get all messages for a specific user (Inbox & Outbox)
app.get('/api/messages/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
    .populate('sender', 'name role')     
    .populate('receiver', 'name role')   
    .sort({ createdAt: -1 });            

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server Error fetching messages" });
  }
});

// 3. Get all available users to message
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error fetching users" });
  }
});

// 4. Mark a message as read
app.put('/api/messages/:id/read', async (req, res) => {
  try {
    const messageId = req.params.id;
    await Message.findByIdAndUpdate(messageId, { isRead: true });
    
    res.status(200).json({ message: "Message marked as read" });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ message: "Server Error marking message as read" });
  }
});

// ==========================================
// 📈 PLATFORM STATISTICS API ENDPOINT
// ==========================================
app.get('/api/stats', async (req, res) => {
  try {
    const volunteers = await User.countDocuments({ role: 'volunteer' });
    const ngos = await User.countDocuments({ role: 'ngo' });
    const events = await Event.countDocuments();
    
    const hours = events * 5; 

    res.status(200).json({ volunteers, ngos, hours });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Server Error fetching stats" });
  }
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});