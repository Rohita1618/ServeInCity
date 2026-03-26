import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';
import { FaLeaf, FaBookOpen, FaHeartbeat, FaPaw, FaHandsHelping, FaMapMarkerAlt, FaCalendarAlt, FaClock } from 'react-icons/fa';

const Categories = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // We start by showing 'Environment' by default, but users can change it!
  const [selectedCategory, setSelectedCategory] = useState('Environment');

  const userString = localStorage.getItem('user');
  const loggedInUser = userString ? JSON.parse(userString) : null;

  // These are the visual tiles we will display at the top
  const categoryTiles = [
    { name: 'Environment', icon: <FaLeaf size={30} />, color: '#28a745' },
    { name: 'Education', icon: <FaBookOpen size={30} />, color: '#17a2b8' },
    { name: 'Healthcare', icon: <FaHeartbeat size={30} />, color: '#dc3545' },
    { name: 'Animal Welfare', icon: <FaPaw size={30} />, color: '#fd7e14' },
    { name: 'Community Help', icon: <FaHandsHelping size={30} />, color: '#6f42c1' }
  ];

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events');
      const data = await response.json();
      setEvents(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleJoinEvent = async (eventId) => {
    if (!loggedInUser) {
      alert("Please log in to join an event!");
      return window.location.href = '/login';
    }
    if (loggedInUser.role === 'ngo') {
      return alert("NGO accounts cannot join events as volunteers.");
    }

    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: loggedInUser.id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert("🎉 " + data.message);
      fetchEvents(); // Refresh data to update the UI instantly
    } catch (error) {
      alert(error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // 🪄 The Magic Filter: Only grab events that match the currently clicked tile
  const filteredEvents = events.filter(event => event.skill === selectedCategory);

  return (
    <Container className="my-5 main-content">
      <div className="text-center mb-5">
        <h2 className="fw-bold" style={{ color: '#B22222' }}>Browse by Cause</h2>
        <p className="text-muted fs-5">Find the perfect opportunity that matches your passion.</p>
      </div>

      {/* --- THE INTERACTIVE CATEGORY TILES --- */}
      <Row className="justify-content-center mb-5 g-3">
        {categoryTiles.map((cat, index) => (
          <Col xs={6} md={2} key={index}>
            <Card 
              onClick={() => setSelectedCategory(cat.name)}
              className={`text-center h-100 border-0 shadow-sm category-tile ${selectedCategory === cat.name ? 'active-tile' : ''}`}
              style={{ 
                cursor: 'pointer', 
                transition: 'all 0.3s ease',
                backgroundColor: selectedCategory === cat.name ? cat.color : '#fff',
                color: selectedCategory === cat.name ? '#fff' : cat.color,
                borderRadius: '15px',
                border: selectedCategory === cat.name ? 'none' : `2px solid ${cat.color}`
              }}
            >
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-3">
                <div className="mb-2">{cat.icon}</div>
                <span className="fw-bold" style={{ fontSize: '0.9rem' }}>{cat.name}</span>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <hr className="mb-5 text-muted" />

      {/* --- THE FILTERED RESULTS --- */}
      <h4 className="fw-bold mb-4" style={{ color: '#5D4037' }}>
        Opportunities in {selectedCategory}
      </h4>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" style={{ color: '#FF9933' }} />
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="border-0 shadow-sm text-center p-5 bg-light" style={{ borderRadius: '15px' }}>
          <h5 className="text-muted m-0">No active opportunities in this category right now.</h5>
          <p className="text-muted small mt-2">Check back later or explore another cause!</p>
        </Card>
      ) : (
        <Row>
          {filteredEvents.map((event) => {
            const hasJoined = loggedInUser && event.attendees.includes(loggedInUser.id);
            const isFull = event.volunteersNeeded <= 0;

            return (
              <Col md={4} key={event._id} className="mb-4">
                <Card className="event-card h-100 border-0 shadow-sm">
                  <Card.Body className="d-flex flex-column">
                    <Badge className="badge-desi mb-2 align-self-start">{event.skill}</Badge>
                    <Card.Title className="fw-bold fs-5">{event.title}</Card.Title>
                    
                    <div className="mb-3 text-muted small d-flex flex-column gap-2 mt-3">
                      <div>
                        <FaMapMarkerAlt className="me-2" style={{ color: '#B22222' }} />
                        <span className="fw-bold">{event.loc}, {event.city}</span>
                      </div>
                      {event.eventDate && (
                        <div>
                          <FaCalendarAlt className="me-2" style={{ color: '#FF9933' }} />
                          <span className="fw-bold">{formatDate(event.eventDate)}</span>
                          <span className="mx-2 text-muted">|</span>
                          <FaClock className="me-2" style={{ color: '#FF9933' }} />
                          <span className="fw-bold">{event.eventTime}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-muted small mb-3 border-top pt-3 flex-grow-1">{event.description}</p>
                    
                    <Button 
                      onClick={() => handleJoinEvent(event._id)}
                      disabled={hasJoined || isFull || (loggedInUser && loggedInUser.role === 'ngo')}
                      className={`w-100 mt-2 fw-bold shadow-sm ${hasJoined ? 'bg-secondary border-secondary' : 'btn-masala'}`}
                    >
                      {hasJoined 
                        ? '✅ You Joined This' 
                        : isFull 
                          ? 'Volunteer Limit Reached' 
                          : `Join ${event.volunteersNeeded} Volunteers`}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default Categories;