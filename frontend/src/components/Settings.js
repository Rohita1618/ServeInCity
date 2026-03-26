import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUserCog, FaBell, FaLock, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';

const Settings = () => {
  const navigate = useNavigate();
  
  // Grab the current user from memory
  const userString = localStorage.getItem('user');
  const loggedInUser = userString ? JSON.parse(userString) : null;

  // Mock state for our notification toggles (makes the UI feel alive!)
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);

  // 🛑 THE LOGOUT FUNCTION
  const handleLogout = () => {
    // 1. Wipe the security token and user data from the browser
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 2. Alert the user
    alert('You have been securely logged out. See you next time!');
    
    // 3. Kick them back to the login page
    navigate('/login');
    
    // 4. Force a hard reload so the React Navbar updates instantly
    window.location.reload();
  };

  // If someone tries to access settings without logging in, block them
  if (!loggedInUser) {
    return (
      <Container className="my-5 text-center">
        <h3 className="text-muted">Please log in to view your settings.</h3>
        <Button onClick={() => navigate('/login')} className="mt-3 btn-masala">Go to Login</Button>
      </Container>
    );
  }

  return (
    <Container className="my-5 main-content d-flex justify-content-center">
      <div style={{ maxWidth: '800px', width: '100%' }}>
        
        <div className="mb-4">
          <h2 className="fw-bold" style={{ color: '#B22222' }}>
            <FaUserCog className="me-3 mb-1" />
            Account Settings
          </h2>
          <p className="text-muted fs-5">Manage your preferences and security.</p>
        </div>

        <Row className="g-4">
          
          {/* --- PROFILE DETAILS CARD --- */}
          <Col md={12}>
            <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
              <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 px-4">
                <h5 className="fw-bold" style={{ color: '#5D4037' }}><FaShieldAlt className="me-2 text-warning"/> Account Information</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="mb-3">
                  <Col sm={4} className="text-muted fw-bold">Full Name:</Col>
                  <Col sm={8} className="fw-bold">{loggedInUser.name}</Col>
                </Row>
                <Row className="mb-3">
                  <Col sm={4} className="text-muted fw-bold">Email Address:</Col>
                  <Col sm={8}>{loggedInUser.email}</Col>
                </Row>
                <Row className="mb-3">
                  <Col sm={4} className="text-muted fw-bold">Account Type:</Col>
                  <Col sm={8} className="text-capitalize">
                    {loggedInUser.role === 'ngo' ? '🏢 Registered NGO' : '🌟 Volunteer'}
                  </Col>
                </Row>
                <Row>
                  <Col sm={4} className="text-muted fw-bold">City:</Col>
                  <Col sm={8}>{loggedInUser.city}</Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* --- NOTIFICATIONS CARD --- */}
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4" style={{ color: '#5D4037' }}><FaBell className="me-2 text-warning"/> Notifications</h5>
                
                <Form.Check 
                  type="switch"
                  id="email-switch"
                  label="Email Alerts (New Events)"
                  className="mb-3 fw-bold text-secondary"
                  checked={emailNotifs}
                  onChange={() => setEmailNotifs(!emailNotifs)}
                />
                <Form.Check 
                  type="switch"
                  id="sms-switch"
                  label="SMS Reminders"
                  className="fw-bold text-secondary"
                  checked={smsNotifs}
                  onChange={() => setSmsNotifs(!smsNotifs)}
                />
              </Card.Body>
            </Card>
          </Col>

          {/* --- SECURITY CARD --- */}
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
              <Card.Body className="p-4 d-flex flex-column">
                <h5 className="fw-bold mb-4" style={{ color: '#5D4037' }}><FaLock className="me-2 text-warning"/> Security</h5>
                
                <Button variant="outline-secondary" className="mb-3 fw-bold rounded-pill" disabled>
                  Change Password
                </Button>
                
                {/* THE DANGER ZONE */}
                <div className="mt-auto pt-3 border-top">
                  <Button 
                    variant="danger" 
                    className="w-100 fw-bold rounded-pill shadow-sm"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="me-2"/> Secure Logout
                  </Button>
                </div>
                
              </Card.Body>
            </Card>
          </Col>

        </Row>
      </div>
    </Container>
  );
};

export default Settings;