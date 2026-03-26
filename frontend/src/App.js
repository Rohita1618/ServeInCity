import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Container, Button, Modal, Badge, Row, Col, Card } from 'react-bootstrap';
import { FaHome, FaSearch, FaList, FaUserAlt, FaBars, FaTrophy, FaHandsHelping, FaInfoCircle, FaCog, FaMapMarkerAlt, FaChevronDown, FaEnvelope, FaCalendarAlt, FaClock } from 'react-icons/fa';
import './App.css';

// --- COMPONENTS ---
import Login from './components/Login';
import Register from './components/Register';
import CreateEvent from './components/CreateEvent';
import Profile from './components/Profile';
import Search from './components/Search';
import Leaderboard from './components/Leaderboard';
import Categories from './components/Categories';
import NgoDirectory from './components/NgoDirectory';
import AboutUs from './components/AboutUs';
import Settings from './components/Settings';
import Messages from './components/Messages';

// ==========================================
// 🏠 HOMEPAGE COMPONENT (Dynamic Stats & Events)
// ==========================================
const Home = () => {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ volunteers: 0, ngos: 0, hours: 0 });
  const [loading, setLoading] = useState(true);

  const userString = localStorage.getItem('user');
  const loggedInUser = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/events');
        const data = await response.json();
        setEvents(data);
      } catch (error) { console.error(error); }
    };

    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) { console.error(error); }
    };

    Promise.all([fetchEvents(), fetchStats()]).then(() => setLoading(false));
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleJoinEvent = async (eventId) => {
    if (!loggedInUser) {
      alert("Please log in to join an event!");
      return window.location.href = '/login';
    }
    if (loggedInUser.role === 'ngo') return alert("NGO accounts cannot join events as volunteers.");
    
    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: loggedInUser.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      alert("🎉 " + data.message);
      const updatedEvents = await fetch('http://localhost:5000/api/events');
      setEvents(await updatedEvents.json());
    } catch (error) { alert(error.message); }
  };

  return (
    <div className="main-content">
      <div className="hero-section text-center shadow">
        <Container>
          <h1 className="display-4 fw-bold">Bharat ka Volunteering Hub.</h1>
          <p className="fs-5 mb-4">Connecting local heroes with NGOs across the city.</p>
          {!loggedInUser && (
            <Button as={Link} to="/register" variant="light" className="rounded-pill px-5 fw-bold" style={{ color: '#B22222' }}>
              Start Your Journey
            </Button>
          )}
        </Container>
      </div>

      <Container className="my-5 text-center">
        <Row>
          <Col xs={4}>
            <h2 className="fw-bold" style={{ color: '#FF9933' }}>{stats.volunteers}</h2>
            <p className="text-muted fw-bold" style={{ fontSize: '0.8rem' }}>Volunteers</p>
          </Col>
          <Col xs={4}>
            <h2 className="fw-bold" style={{ color: '#FF9933' }}>{stats.ngos}</h2>
            <p className="text-muted fw-bold" style={{ fontSize: '0.8rem' }}>Active NGOs</p>
          </Col>
          <Col xs={4}>
            <h2 className="fw-bold" style={{ color: '#FF9933' }}>{stats.hours}+</h2>
            <p className="text-muted fw-bold" style={{ fontSize: '0.8rem' }}>Impact Hours</p>
          </Col>
        </Row>
      </Container>

      <Container className="my-5">
        <h3 className="mb-4 text-center fw-bold" style={{ color: '#B22222' }}>Featured Opportunities</h3>
        {loading ? (
          <p className="text-center text-muted fw-bold">Loading local opportunities...</p>
        ) : events.length === 0 ? (
          <p className="text-center text-muted">No events found in your city yet.</p>
        ) : (
          <Row>
            {events.slice(0, 3).map((event) => {
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
                        {hasJoined ? '✅ You Joined This' : isFull ? 'Volunteer Limit Reached' : `Join ${event.volunteersNeeded} Volunteers`}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
    </div>
  );
};

// ==========================================
// 🚀 MAIN APP COMPONENT (Routing & Navbar)
// ==========================================
function App() {
  const [showCityModal, setShowCityModal] = useState(false);
  const [city, setCity] = useState('Jabalpur');
  const [messageCount, setMessageCount] = useState(0);

  const userString = localStorage.getItem('user');
  const loggedInUser = userString ? JSON.parse(userString) : null;

  // Fetch Unread Messages for the dynamic badge
  useEffect(() => {
    if (loggedInUser) {
      const fetchMessageCount = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/messages/${loggedInUser.id}`);
          const data = await response.json();
          // Count only messages where this user is the receiver!
          const unreadMessages = data.filter(msg => 
            msg.receiver._id === loggedInUser.id && msg.isRead === false
          );
          
          setMessageCount(unreadMessages.length);
        } catch (error) { console.error("Error fetching message count:", error); }
      };
      fetchMessageCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Router>
      <div className="App bg-light min-vh-100 d-flex flex-column">
        
        {/* TOP NAVBAR */}
        {/* TOP NAVBAR */}
        <Navbar expand="lg" variant="dark" className="shadow-sm sticky-top px-3 d-flex justify-content-between" style={{ backgroundColor: '#B22222' }}>
          
          {/* --- LEFT SIDE: Brand & Create Event --- */}
          <div className="d-flex align-items-center gap-3">
            <Navbar.Brand as={Link} to="/" className="text-white fw-bold fs-3 d-flex align-items-center m-0">
              <FaHandsHelping className="me-2" style={{ color: '#FFD700' }} />
              <span className="d-none d-sm-inline">ServeInCity</span>
              <span className="d-inline d-sm-none">SIC</span> {/* Shorter name for mobile screens! */}
            </Navbar.Brand>
            
           {/* THE THEME-MATCHED CREATE BUTTON */}
            {loggedInUser && loggedInUser.role === 'ngo' && (
              <Link to="/create-event" 
                className="d-flex align-items-center gap-2 px-3 py-1 text-decoration-none shadow-sm" 
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.15)', // Subtle transparent white
                  border: '1px solid rgba(255, 255, 255, 0.3)', // Soft border
                  borderRadius: '20px', 
                  color: '#FFF8E7',
                  height: '36px',
                  transition: '0.3s'
                }}
              >
                <span className="fw-bold fs-5" style={{ marginTop: '-2px' }}>+</span>
                <span className="fw-bold d-none d-lg-inline" style={{ fontSize: '0.85rem' }}>Create Event</span>
              </Link>
            )}
          </div>
          
          {/* --- RIGHT SIDE: Messages & City Selector --- */}
          <div className="d-flex align-items-center gap-3">
            {loggedInUser && (
              <Link to="/messages" className="text-white position-relative mt-1">
                <FaEnvelope size={22} style={{ color: '#FFF8E7' }} />
                {messageCount > 0 && (
                  <Badge bg="warning" text="dark" pill className="position-absolute top-0 start-100 translate-middle shadow-sm" style={{ fontSize: '0.6rem' }}>
                    {messageCount}
                  </Badge>
                )}
              </Link>
            )}

            <div className="text-white d-flex align-items-center shadow-sm" style={{ cursor: 'pointer', backgroundColor: 'rgba(0,0,0,0.15)', padding: '5px 12px', borderRadius: '20px' }} onClick={() => setShowCityModal(true)}>
              <FaMapMarkerAlt className="me-1" style={{ color: '#FFC300' }} />
              <span className="fw-bold fs-6">{city}</span>
              <FaChevronDown className="ms-2" style={{ fontSize: '0.7rem' }} />
            </div>
          </div>

        </Navbar>
        {/* CITY SELECTOR MODAL */}
        <Modal show={showCityModal} onHide={() => setShowCityModal(false)} centered>
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-bold" style={{ color: '#B22222' }}>Choose Your City</Modal.Title>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column gap-2 px-4 pb-4">
            {['Jabalpur', 'Indore', 'Bhopal'].map(c => (
              <Button key={c} variant={city === c ? "warning" : "outline-secondary"} className="fw-bold py-2 shadow-sm" onClick={() => { setCity(c); setShowCityModal(false); }}>
                {c}
              </Button>
            ))}
          </Modal.Body>
        </Modal>

        {/* APP ROUTER */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/directory" element={<NgoDirectory />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/messages" element={<Messages />} />
        </Routes>

        {/* BOTTOM NAVIGATION (Mobile Friendly) */}
        {loggedInUser && (
          <div className="bottom-nav shadow-lg d-flex justify-content-around py-2 px-3 bg-white fixed-bottom">
            <Link to="/" className="text-center text-decoration-none text-muted nav-icon">
              <FaHome size={24} className="mb-1 d-block mx-auto" />
              <span className="small fw-bold">Home</span>
            </Link>
            <Link to="/search" className="text-center text-decoration-none text-muted nav-icon">
              <FaSearch size={24} className="mb-1 d-block mx-auto" />
              <span className="small fw-bold">Search</span>
            </Link>
            <Link to="/profile" className="text-center text-decoration-none text-muted nav-icon">
              <FaUserAlt size={24} className="mb-1 d-block mx-auto" />
              <span className="small fw-bold">Profile</span>
            </Link>
            
            <div className="nav-item dropup">
              <div className="text-center text-muted nav-icon" data-bs-toggle="dropdown" style={{ cursor: 'pointer' }}>
                <FaBars size={24} className="mb-1 d-block mx-auto" />
                <span className="small fw-bold">Menu</span>
              </div>
              <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mb-2" style={{ borderRadius: '15px' }}>
                <li><Link className="dropdown-item fw-bold py-2 text-secondary" to="/categories"><FaList className="me-2" style={{ color: '#FF9933' }}/> Browse Categories</Link></li>
                <li><Link className="dropdown-item fw-bold py-2 text-secondary" to="/leaderboard"><FaTrophy className="me-2" style={{ color: '#FFD700' }}/> Leaderboard</Link></li>
                <li><Link className="dropdown-item fw-bold py-2 text-secondary" to="/directory"><FaInfoCircle className="me-2" style={{ color: '#28a745' }}/> NGO Directory</Link></li>
                <li><Link className="dropdown-item fw-bold py-2 text-secondary" to="/about"><FaHandsHelping className="me-2" style={{ color: '#17a2b8' }}/> About Us</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><Link className="dropdown-item fw-bold py-2 text-secondary" to="/settings"><FaCog className="me-2" style={{ color: '#6c757d' }}/> Settings</Link></li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;