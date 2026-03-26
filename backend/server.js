const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Event = require('./models/Event');
const Message = require('./models/Message');
require('dotenv').config();

// Bypass ISP network blocks
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { family: 4 })
.then(() => console.log('🔥 MongoDB Connected Successfully!'))
.catch((err) => console.log('❌ MongoDB Connection Error: ', err.message));

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
        role: user.role // Sends role to React to trigger specific UI
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error during login" });
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
      organizer: organizerId // Records which NGO created it
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

    // Prevent double-joining
    if (event.attendees.includes(userId)) {
      return res.status(400).json({ message: "You have already joined this event!" });
    }

    // Prevent over-booking
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

// ==========================================
// 📊 USER DASHBOARD API (Profile Page)
// ==========================================
app.get('/api/users/:id/dashboard', async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.query; // React will tell us if they are a volunteer or ngo

    let userEvents = [];

    if (role === 'ngo') {
      // Find all events created by this specific NGO
      userEvents = await Event.find({ organizer: userId }).sort({ createdAt: -1 });
    } else {
      // Find all events where this Volunteer's ID is inside the attendees array
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
    // 1. Find all users who are strictly volunteers
    const volunteers = await User.find({ role: 'volunteer' }).select('-password');

    // 2. Calculate their impact (How many events contain their ID)
    const leaderboardData = await Promise.all(volunteers.map(async (volunteer) => {
      const eventsJoined = await Event.countDocuments({ attendees: volunteer._id });
      return {
        id: volunteer._id,
        name: volunteer.name,
        city: volunteer.city,
        eventsJoined
      };
    }));

    // 3. Sort them from highest impact to lowest (The Algorithm!)
    leaderboardData.sort((a, b) => b.eventsJoined - a.eventsJoined);

    // 4. Return the Top 10 heroes
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
    // Fetch all users with the 'ngo' role, and hide their passwords for security!
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

    // Find messages where the user is EITHER the sender OR the receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
    .populate('sender', 'name role')     // Fetch the sender's actual name
    .populate('receiver', 'name role')   // Fetch the receiver's actual name
    .sort({ createdAt: -1 });            // Newest messages first

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server Error fetching messages" });
  }
});

// 3. Get all available users to message (so we can populate a dropdown)
app.get('/api/users', async (req, res) => {
  try {
    // Fetch all users except passwords
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
    // Find the message by ID and update its isRead status to true
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
    
    // Let's assume each event generates an average of 5 hours of community service
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