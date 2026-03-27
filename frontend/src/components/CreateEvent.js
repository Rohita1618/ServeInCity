import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCalendarPlus, FaMapMarkerAlt, FaHeading, FaTags, FaUsers, FaAlignLeft, FaCity, FaCalendarAlt, FaClock } from 'react-icons/fa';

const CreateEvent = () => {
  const navigate = useNavigate();

  // 1. State for form data
  const [formData, setFormData] = useState({
    title: '',
    skill: 'Environment',
    loc: '',
    city: 'Jabalpur',
    description: '',
    volunteersNeeded: 10,
    eventDate: '', 
    eventTime: ''  
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 2. Validation
    if (!formData.title || !formData.loc || !formData.description || !formData.eventDate || !formData.eventTime) {
      setError('Please fill out all required fields, including Date and Time.');
      return;
    }

    setLoading(true);

    try {
      // --- GET USER AND TOKEN FROM LOCAL STORAGE ---
      const userString = localStorage.getItem('user');
      const loggedInUser = userString ? JSON.parse(userString) : null;
      const token = localStorage.getItem('token'); // Get the security token

      if (!loggedInUser || !token) throw new Error("You must be logged in to create an event.");

      // Attach the ID and Email to the form data
      const eventDataToSend = {
        ...formData,
        organizerId: loggedInUser.id,
        ngoEmail: loggedInUser.email // Pass email for Nodemailer
      };
      
      // 3. API Call to Backend
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Send token to backend for verification
        },
        body: JSON.stringify(eventDataToSend),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create event.');
      }

      setSuccess('🎉 Opportunity published successfully! Check your email for confirmation.');
      
      setTimeout(() => {
        navigate('/');
      }, 2500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5 d-flex justify-content-center">
      <Card className="border-0 shadow-lg" style={{ borderRadius: '15px', maxWidth: '700px', width: '100%' }}>
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold" style={{ color: '#FF9933' }}>
              <FaCalendarPlus className="me-2 mb-1" /> Host an Opportunity
            </h2>
            <p className="text-muted">Fill out the details below to recruit volunteers for your cause.</p>
          </div>

          {error && <Alert variant="danger" className="rounded-3 fw-bold">{error}</Alert>}
          {success && <Alert variant="success" className="rounded-3 fw-bold">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-secondary"><FaHeading className="me-2"/>Opportunity Title <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                type="text" 
                name="title"
                placeholder="e.g., Weekend Slum Education Drive" 
                value={formData.title}
                onChange={handleChange}
                style={{ borderRadius: '10px' }} 
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold text-secondary"><FaCalendarAlt className="me-2"/>Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="date" 
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    style={{ borderRadius: '10px' }} 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold text-secondary"><FaClock className="me-2"/>Time <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="time" 
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleChange}
                    style={{ borderRadius: '10px' }} 
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold text-secondary"><FaTags className="me-2"/>Category</Form.Label>
                  <Form.Select 
                    name="skill"
                    value={formData.skill}
                    onChange={handleChange}
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="Environment">Environment & Nature</option>
                    <option value="Education">Education & Mentoring</option>
                    <option value="Healthcare">Healthcare & Medical</option>
                    <option value="Animal Welfare">Animal Welfare</option>
                    <option value="Community Help">Community Help</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold text-secondary"><FaUsers className="me-2"/>Volunteers Needed</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="volunteersNeeded"
                    min="1"
                    value={formData.volunteersNeeded}
                    onChange={handleChange}
                    style={{ borderRadius: '10px' }} 
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold text-secondary"><FaCity className="me-2"/>City</Form.Label>
                  <Form.Select 
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="Jabalpur">Jabalpur</option>
                    <option value="Indore">Indore</option>
                    <option value="Bhopal">Bhopal</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold text-secondary"><FaMapMarkerAlt className="me-2"/>Specific Location <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="text" 
                    name="loc"
                    placeholder="e.g., Bhedaghat Road" 
                    value={formData.loc}
                    onChange={handleChange}
                    style={{ borderRadius: '10px' }} 
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-secondary"><FaAlignLeft className="me-2"/>Description & Tasks <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4}
                name="description"
                placeholder="Describe what the volunteers will be doing..." 
                value={formData.description}
                onChange={handleChange}
                style={{ borderRadius: '10px' }} 
              />
            </Form.Group>

            <Button 
              type="submit" 
              className="w-100 fw-bold rounded-pill py-3 shadow-sm" 
              style={{ backgroundColor: '#B22222', border: 'none', fontSize: '1.2rem' }}
              disabled={loading}
            >
              {loading ? 'Publishing...' : 'Publish Opportunity'}
            </Button>
          </Form>

        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateEvent;