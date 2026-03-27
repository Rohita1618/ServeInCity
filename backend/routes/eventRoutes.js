const express = require('express');
const router = express.Router();
const { createEvent, getEvents, deleteEvent } = require('../controllers/eventController'); // Added deleteEvent
const { protect, isAdmin } = require('../middleware/authMiddleware'); // Imported our new guards!

// GET all events (Public - anyone can see events)
router.get('/', getEvents);

// POST a new event (Protected - must be logged in as NGO)
router.post('/create', protect, createEvent);

// DELETE an event (Protected & Admin Only - the ultimate security)
router.delete('/:id', protect, isAdmin, deleteEvent);

module.exports = router;