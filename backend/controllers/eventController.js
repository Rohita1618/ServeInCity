const Event = require('../models/Event');
const sendEmail = require('../utils/sendEmail'); // Import our new utility!

exports.createEvent = async (req, res) => {
    try {
        // 1. Get all the data sent from the React frontend
        const { title, skill, loc, city, description, volunteersNeeded, eventDate, eventTime, organizerId, ngoEmail } = req.body;

        // 2. Save it to the Database
        const newEvent = new Event({
            title,
            skill,
            loc,
            city,
            description,
            volunteersNeeded,
            eventDate,
            eventTime,
            organizer: organizerId // Adjust this if your schema uses a different name like 'ngo'
        });

        const savedEvent = await newEvent.save();

        // 3. SEND THE EMAIL (Background Task)
        if (ngoEmail) {
            const emailMessage = `
Hello!

Your new volunteering opportunity "${title}" has been successfully published on ServeInCity!

Details:
- Date: ${eventDate}
- Time: ${eventTime}
- Location: ${loc}, ${city}
- Volunteers Needed: ${volunteersNeeded}

Volunteers in your city can now see this and start joining. 

Thank you for making a difference!
- The ServeInCity Team
            `;

            await sendEmail({
                email: ngoEmail,
                subject: `🎉 Event Published: ${title}`,
                message: emailMessage
            });
        }

        // 4. Respond back to React
        res.status(201).json(savedEvent);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
// @desc    Delete an event (ADMIN ONLY)
// @route   DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
    try {
        // Find the event by the ID passed in the URL
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Delete it from the database
        await Event.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Event securely deleted by Admin" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};