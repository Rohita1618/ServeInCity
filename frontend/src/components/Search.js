import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card, Badge, Button, InputGroup, Spinner } from 'react-bootstrap';
//import { Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaCalendarAlt, FaClock } from 'react-icons/fa';

const Search = () => {
  // 1. State for our raw data and our filtered data
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. State for our active filters
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [city, setCity] = useState('All');

  // Grab the logged-in user to handle the "Join" button logic
  const userString = localStorage.getItem('user');
  const loggedInUser = userString ? JSON.parse(userString) : null;

  // 3. Fetch all events exactly once when the page loads
  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events');
      const data = await response.json();
      setAllEvents(data);
      setFilteredEvents(data); // Initially, show everything!
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 4. The Magic Filter Function! Runs every time a user types or clicks a dropdown.
  useEffect(() => {
    let results = allEvents;

    // Filter by Keyword (checks both Title and Description)
    if (searchQuery) {
      results = results.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by Category
    if (category !== 'All') {
      results = results.filter(event => event.skill === category);
    }

    // Filter by City
    if (city !== 'All') {
      results = results.filter(event => event.city === city);
    }

    setFilteredEvents(results);
  }, [searchQuery, category, city, allEvents]);

  // Handle the Join action right from the search page
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
      fetchEvents(); // Refresh data to update the spots remaining

    } catch (error) {
      alert(error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <Container className="my-5 main-content">
      
      {/* --- SEARCH & FILTER CONTROLS --- */}
      <Card className="border-0 shadow-sm mb-5" style={{ borderRadius: '15px', backgroundColor: '#FFF8E7' }}>
        <Card.Body className="p-4">
          <h3 className="fw-bold mb-4" style={{ color: '#B22222' }}>Explore Opportunities</h3>
          
          <Row className="g-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0 text-muted">
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control 
                  type="text" 
                  placeholder="Search by keyword, task, or title..." 
                  className="border-start-0 shadow-none bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ borderRadius: '0 10px 10px 0' }}
                />
              </InputGroup>
            </Col>
            
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0 text-muted">
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select 
                  className="border-start-0 shadow-none fw-bold text-secondary"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ borderRadius: '0 10px 10px 0' }}
                >
                  <option value="All">All Categories</option>
                  <option value="Environment">Environment & Nature</option>
                  <option value="Education">Education & Mentoring</option>
                  <option value="Healthcare">Healthcare & Medical</option>
                  <option value="Animal Welfare">Animal Welfare</option>
                  <option value="Community Help">Community Help</option>
                </Form.Select>
              </InputGroup>
            </Col>

            <Col md={3}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0 text-muted">
                  <FaMapMarkerAlt />
                </InputGroup.Text>
                <Form.Select 
                  className="border-start-0 shadow-none fw-bold text-secondary"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ borderRadius: '0 10px 10px 0' }}
                >
                  <option value="All">All Cities</option>
                  <option value="Jabalpur">Jabalpur</option>
                  <option value="Indore">Indore</option>
                  <option value="Bhopal">Bhopal</option>
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      {/* -------------------------------- */}

      {/* --- RESULTS GRID --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold text-muted m-0">Showing {filteredEvents.length} result(s)</h5>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" style={{ color: '#FF9933' }} />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center my-5 py-5 text-muted">
          <FaSearch size={50} className="mb-3 opacity-50" />
          <h5>No opportunities match your search.</h5>
          <p>Try adjusting your filters or searching in a different city.</p>
          <Button variant="outline-danger" className="rounded-pill mt-2 fw-bold" onClick={() => { setSearchQuery(''); setCategory('All'); setCity('All'); }}>
            Clear Filters
          </Button>
        </div>
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

export default Search;