import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { FaEnvelope, FaPaperPlane, FaUserCircle, FaCheckDouble } from 'react-icons/fa';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [receiverId, setReceiverId] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  // Grab logged in user
  const userString = localStorage.getItem('user');
  const loggedInUser = userString ? JSON.parse(userString) : null;

  const fetchData = async () => {
    if (!loggedInUser) return;
    try {
      // 1. Fetch User's Messages
      const msgRes = await fetch(`http://localhost:5000/api/messages/${loggedInUser.id}`);
      const msgData = await msgRes.json();
      setMessages(msgData);

      // 2. Fetch All Users (for the dropdown list)
      const userRes = await fetch('http://localhost:5000/api/users');
      let userData = await userRes.json();
      
      // Filter out the currently logged-in user so they can't message themselves
      userData = userData.filter(u => u._id !== loggedInUser.id);
      setUsers(userData);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!receiverId || !content.trim()) return alert("Please select a user and type a message.");

    setSending(true);
    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: loggedInUser.id,
          receiverId: receiverId,
          content: content
        })
      });

      if (!response.ok) throw new Error("Failed to send message");

      // Clear the form and refresh the inbox
      setContent('');
      fetchData(); 
    } catch (error) {
      alert(error.message);
    } finally {
      setSending(false);
    }
  };

  // 🛑 NEW FUNCTION: Mark a message as read
  const handleMarkAsRead = async (msgId) => {
    try {
      await fetch(`http://localhost:5000/api/messages/${msgId}/read`, {
        method: 'PUT'
      });
      fetchData(); // Instantly refresh the messages to update the UI

      // Force the Navbar to update its count by simulating a reload
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  if (!loggedInUser) {
    return <Container className="my-5 text-center"><h3 className="text-muted">Please log in to view messages.</h3></Container>;
  }

  return (
    <Container className="my-5 main-content">
      <div className="mb-4">
        <h2 className="fw-bold" style={{ color: '#B22222' }}>
          <FaEnvelope className="me-3 mb-1" />
          Message Center
        </h2>
        <p className="text-muted fs-5">Connect with NGOs and fellow volunteers.</p>
      </div>

      <Row className="g-4">
        {/* --- COMPOSE MESSAGE PANEL (Left Side) --- */}
        <Col md={5}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px', backgroundColor: '#FFF8E7' }}>
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4" style={{ color: '#5D4037' }}>Compose Message</h5>
              
              <Form onSubmit={handleSendMessage}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold text-secondary">To:</Form.Label>
                  <Form.Select 
                    value={receiverId} 
                    onChange={(e) => setReceiverId(e.target.value)}
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="">-- Select a User to Message --</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.role === 'ngo' ? 'NGO' : 'Volunteer'})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold text-secondary">Message:</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={4} 
                    placeholder="Type your message here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{ borderRadius: '10px' }}
                  />
                </Form.Group>

                <Button 
                  type="submit" 
                  disabled={sending}
                  className="w-100 fw-bold rounded-pill shadow-sm py-2" 
                  style={{ backgroundColor: '#FF9933', border: 'none' }}
                >
                  <FaPaperPlane className="me-2"/> {sending ? 'Sending...' : 'Send Message'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* --- INBOX PANEL (Right Side) --- */}
        <Col md={7}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4 d-flex flex-column" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <h5 className="fw-bold mb-4" style={{ color: '#5D4037' }}>Your Conversations</h5>
              
              {loading ? (
                <div className="text-center my-4"><Spinner animation="border" style={{ color: '#FF9933' }} /></div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted my-5">
                  <p>Your inbox is empty.</p>
                  <small>Start a conversation using the panel on the left!</small>
                </div>
              ) : (
                messages.map((msg) => {
                  // Determine if the logged-in user sent this message or received it
                  const isSender = msg.sender._id === loggedInUser.id;

                  return (
                    <Card key={msg._id} className="border-0 mb-3 shadow-sm bg-light">
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2 border-bottom pb-2">
                          <div>
                            <FaUserCircle className="me-2 text-secondary" size={20}/>
                            <span className="fw-bold" style={{ color: '#B22222' }}>
                              {isSender ? `To: ${msg.receiver.name}` : `From: ${msg.sender.name}`}
                            </span>
                            <Badge bg={isSender ? 'secondary' : 'success'} className="ms-2">
                              {isSender ? 'Sent' : 'Received'}
                            </Badge>
                          </div>
                          
                          <div className="text-end">
                            <small className="text-muted fw-bold d-block mb-1">
                              {new Date(msg.createdAt).toLocaleDateString('en-IN')}
                            </small>
                            
                            {/* --- THE NEW MARK AS READ BUTTON --- */}
                            {!isSender && !msg.isRead && (
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="rounded-pill fw-bold"
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => handleMarkAsRead(msg._id)}
                              >
                                <FaCheckDouble className="me-1"/> Mark as Read
                              </Button>
                            )}
                            {/* Show a subtle checkmark if it's already read */}
                            {!isSender && msg.isRead && (
                              <small className="text-success fw-bold"><FaCheckDouble className="me-1"/> Read</small>
                            )}
                            {/* ----------------------------------- */}
                          </div>
                        </div>
                        
                        <p className={`mb-0 ${!isSender && !msg.isRead ? 'fw-bold text-dark' : 'text-muted'}`} style={{ whiteSpace: 'pre-wrap' }}>
                          {msg.content}
                        </p>
                      </Card.Body>
                    </Card>
                  );
                })
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Messages;