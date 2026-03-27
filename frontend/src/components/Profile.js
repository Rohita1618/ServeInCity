import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaUserCircle, FaMapMarkerAlt, FaEnvelope, FaCalendarAlt, FaHandsHelping, FaAward, FaClock } from 'react-icons/fa';

const Profile = () => {
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get the user data that we saved during login!
  const userString = localStorage.getItem('user');
  const loggedInUser = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (loggedInUser) {
      const fetchDashboard = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${loggedInUser.id}/dashboard?role=${loggedInUser.role}`);
          if (!response.ok) throw new Error("Failed to fetch your events");
          
          const data = await response.json();
          setUserEvents(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [loggedInUser]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // If they somehow get here without logging in
  if (!loggedInUser) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="warning" className="fw-bold">
          Please log in to view your profile dashboard.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5 pb-5">
      <Row>
        {/* ========================================== */}
        {/* LEFT COLUMN: THE USER IDENTITY CARD */}
        {/* ========================================== */}
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm text-center pt-4 pb-3" style={{ borderRadius: '15px' }}>
            <Card.Body>
              {/* Dynamic Profile Photo */}
              {loggedInUser.profilePhoto ? (
                <img 
                  src={loggedInUser.profilePhoto} 
                  alt="Profile" 
                  className="mb-3 shadow-sm rounded-circle" 
                  style={{ width: '120px', height: '120px', objectFit: 'cover', border: '4px solid #fff' }} 
                />
              ) : (
                <FaUserCircle size={120} style={{ color: '#ccc' }} className="mb-3 shadow-sm rounded-circle bg-white" />
              )}
              
              <h3 className="fw-bold mb-1" style={{ color: '#B22222' }}>{loggedInUser.name}</h3>
              
              <Badge bg={loggedInUser.role === 'ngo' ? 'success' : 'warning'} text={loggedInUser.role === 'ngo' ? 'light' : 'dark'} className="mb-3 px-3 py-2 rounded-pill shadow-sm">
                {loggedInUser.role === 'ngo' ? 'Verified NGO' : 'Community Volunteer'}
              </Badge>

              <div className="text-muted small d-flex flex-column gap-2 align-items-center mb-4">
                <span><FaEnvelope className="me-2 text-secondary"/> {loggedInUser.email}</span>
                <span><FaMapMarkerAlt className="me-2 text-secondary"/> {loggedInUser.city}</span>
              </div>

              <hr className="text-muted" />

              {/* Impact Statistics */}
              <h6 className="fw-bold text-secondary mb-3"><FaAward className="me-2 text-warning"/> Impact Summary</h6>
              <Row>
                <Col xs={6} className="border-end">
                  <h4 className="fw-bold text-success mb-0">{userEvents.length}</h4>
                  <span className="text-muted small">Events {loggedInUser.role === 'ngo' ? 'Hosted' : 'Joined'}</span>
                </Col>
                <Col xs={6}>
                  <h4 className="fw-bold text-primary mb-0">{userEvents.length * 5}</h4>
                  <span className="text-muted small">Hours Contributed</span>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* ========================================== */}
        {/* RIGHT COLUMN: THEIR EVENTS LIST */}
        {/* ========================================== */}
        <Col lg={8}>
          <h4 className="fw-bold mb-4" style={{ color: '#6c757d' }}>
            <FaHandsHelping className="me-2 mb-1" /> 
            {loggedInUser.role === 'ngo' ? 'Your Hosted Opportunities' : 'Your Upcoming Volunteer Work'}
          </h4>

          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="danger" />
              <p className="text-muted mt-2 fw-bold">Loading your impact...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : userEvents.length === 0 ? (
            <Card className="border-0 shadow-sm p-5 text-center bg-light">
              <h5 className="text-muted fw-bold">No events found!</h5>
              <p className="text-muted small mb-0">
                {loggedInUser.role === 'ngo' 
                  ? "You haven't created any volunteering events yet. Head over to 'Create Event' to get started!" 
                  : "You haven't joined any events yet. Check out the Home or Search page to find local opportunities!"}
              </p>
            </Card>
          ) : (
            <Row>
              {userEvents.map((event) => (
                <Col md={6} key={event._id} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm event-card" style={{ borderLeft: '5px solid #FF9933' }}>
                    <Card.Body>
                      <Card.Title className="fw-bold fs-5 text-dark">{event.title}</Card.Title>
                      <Badge bg="light" text="dark" className="border border-secondary mb-3">{event.skill}</Badge>
                      
                      <div className="text-muted small d-flex flex-column gap-2">
                        <div>
                          <FaMapMarkerAlt className="me-2 text-danger" />
                          <span className="fw-bold">{event.loc}, {event.city}</span>
                        </div>
                        {event.eventDate && (
                          <div>
                            <FaCalendarAlt className="me-2 text-primary" />
                            <span className="fw-bold">{formatDate(event.eventDate)}</span>
                            <span className="mx-2 text-muted">|</span>
                            <FaClock className="me-2 text-primary" />
                            <span className="fw-bold">{event.eventTime}</span>
                          </div>
                        )}
                      </div>

                      {/* --- NEW: NGO VOLUNTEER LIST --- */}
                      {loggedInUser.role === 'ngo' && (
                        <div className="mt-3 pt-3 border-top">
                          <h6 className="fw-bold text-success small mb-2">
                            Volunteers Joined ({event.attendees ? event.attendees.length : 0} / {event.volunteersNeeded + (event.attendees ? event.attendees.length : 0)})
                          </h6>
                          
                          {event.attendees && event.attendees.length > 0 ? (
                            <ul className="list-unstyled mb-0 bg-light p-2 rounded border">
                              {event.attendees.map(volunteer => (
                                <li key={volunteer._id} className="small text-dark mb-1 d-flex align-items-center">
                                  <span className="fw-bold me-2">• {volunteer.name}</span> 
                                  <a href={`mailto:${volunteer.email}`} className="text-decoration-none text-primary">
                                    ({volunteer.email})
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="small text-muted mb-0 fst-italic">Waiting for volunteers to join...</p>
                          )}
                        </div>
                      )}
                      {/* ------------------------------- */}

                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;