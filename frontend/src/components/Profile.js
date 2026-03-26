import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Row, Col, Button, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaCalendarPlus, FaSearch } from 'react-icons/fa';

const Profile = () => {
  const navigate = useNavigate();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Grab the user's VIP pass and details from memory
  const userString = localStorage.getItem('user');
  const loggedInUser = userString ? JSON.parse(userString) : null;

  // 2. Fetch their personalized dashboard data
  useEffect(() => {
    // If they aren't logged in, kick them to the login page!
    if (!loggedInUser) {
      navigate('/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        // We pass the role in the URL so your Node backend knows exactly what to search for!
        const response = await fetch(`http://localhost:5000/api/users/${loggedInUser.id}/dashboard?role=${loggedInUser.role}`);
        const data = await response.json();
        
        if (response.ok) {
          setMyEvents(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [loggedInUser, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // If the page is still loading or checking credentials, show a spinner
  if (!loggedInUser) return null;

  return (
    <Container className="my-5">
      {/* --- PROFILE HEADER --- */}
      <Card className="border-0 shadow-sm mb-5" style={{ borderRadius: '15px', backgroundColor: '#FFF8E7' }}>
        <Card.Body className="d-flex align-items-center p-4">
          <FaUserCircle size={60} style={{ color: '#B22222' }} className="me-4" />
          <div>
            <h2 className="fw-bold mb-1" style={{ color: '#5D4037' }}>{loggedInUser.name}</h2>
            <p className="text-muted mb-0 fw-bold">
              {loggedInUser.role === 'ngo' ? '🏢 Registered NGO' : '🌟 Community Volunteer'} | {loggedInUser.city}
            </p>
          </div>
        </Card.Body>
      </Card>

      {/* --- DASHBOARD CONTENT --- */}
      <h3 className="fw-bold mb-4" style={{ color: '#B22222' }}>
        {loggedInUser.role === 'ngo' ? 'My Hosted Opportunities' : 'My Upcoming Volunteer Work'}
      </h3>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" style={{ color: '#FF9933' }} />
          <p className="text-muted mt-3 fw-bold">Loading your dashboard...</p>
        </div>
      ) : myEvents.length === 0 ? (
        
        // WHAT TO SHOW IF THEY HAVE NO EVENTS YET
        <Card className="border-0 shadow-sm text-center p-5" style={{ borderRadius: '15px' }}>
          <Card.Body>
            <h5 className="text-muted mb-4">You don't have any events listed yet!</h5>
            {loggedInUser.role === 'ngo' ? (
              <Button as={Link} to="/create-event" className="rounded-pill fw-bold px-4 py-2" style={{ backgroundColor: '#FF9933', border: 'none' }}>
                <FaCalendarPlus className="me-2"/> Create Your First Event
              </Button>
            ) : (
              <Button as={Link} to="/" variant="outline-danger" className="rounded-pill fw-bold px-4 py-2">
                <FaSearch className="me-2"/> Browse Local Events
              </Button>
            )}
          </Card.Body>
        </Card>

      ) : (
        
        // WHAT TO SHOW IF THEY HAVE EVENTS
        <Row>
          {myEvents.map((event) => (
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

                  {/* NGO gets to see how many spots are left, Volunteer gets a simple confirmation */}
                  <div className="mt-auto pt-3 border-top">
                    {loggedInUser.role === 'ngo' ? (
                       <div className="d-flex justify-content-between align-items-center">
                         <span className="fw-bold text-muted small">Spots Remaining:</span>
                         <Badge bg={event.volunteersNeeded > 0 ? "warning" : "danger"} text="dark" className="fs-6">
                           {event.volunteersNeeded}
                         </Badge>
                       </div>
                    ) : (
                       <Button variant="success" disabled className="w-100 fw-bold rounded-pill shadow-sm">
                         ✅ RSVP Confirmed
                       </Button>
                    )}
                  </div>

                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Profile;