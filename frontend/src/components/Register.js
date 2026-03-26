import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserPlus, FaEnvelope, FaLock, FaCity, FaUser, FaUserTag, FaIdCard } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    city: 'Jabalpur',
    role: 'volunteer',
    ngoRegistrationNumber: ''
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

    // ==========================================
    // 🛡️ STRICT FRONTEND VALIDATION
    // ==========================================
    
    // 1. Check if core fields are empty
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all compulsory fields marked with an asterisk (*).');
      return; // 🛑 Stops the form from proceeding!
    }

    // 2. Check if password is too short
    if (formData.password.length < 6) {
      setError('For security, your password must be at least 6 characters long.');
      return; // 🛑 Stops the form
    }

    // 3. Strict check for NGOs
    if (formData.role === 'ngo' && !formData.ngoRegistrationNumber.trim()) {
      setError('NGOs must provide a valid Government Registration Number to proceed.');
      return; // 🛑 Stops the form
    }
    
    // ==========================================

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      setSuccess(`🎉 ${formData.role === 'ngo' ? 'NGO' : 'Volunteer'} Account created successfully!`);
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5 d-flex justify-content-center">
      <Card className="border-0 shadow-lg" style={{ borderRadius: '15px', maxWidth: '550px', width: '100%' }}>
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold" style={{ color: '#B22222' }}>
              <FaUserPlus className="me-2 mb-1" /> Join ServeInCity
            </h2>
            <p className="text-muted">Create your account to start making an impact.</p>
          </div>

          {/* This is where our new custom error messages will pop up! */}
          {error && <Alert variant="danger" className="rounded-3 fw-bold shadow-sm">{error}</Alert>}
          {success && <Alert variant="success" className="rounded-3 fw-bold shadow-sm">{success}</Alert>}

          {/* Note: We removed the HTML 'required' tags so our custom React errors can take over! */}
          <Form onSubmit={handleSubmit}>
            
            <Form.Group className="mb-4 p-3 bg-light rounded-3 border">
              <Form.Label className="fw-bold text-secondary mb-3">
                <FaUserTag className="me-2" /> I am registering as a... <span className="text-danger">*</span>
              </Form.Label>
              <div className="d-flex flex-column flex-sm-row gap-3">
                <Form.Check 
                  type="radio"
                  id="role-volunteer"
                  label="Volunteer"
                  name="role"
                  value="volunteer"
                  checked={formData.role === 'volunteer'}
                  onChange={handleChange}
                  className="fw-bold cursor-pointer"
                />
                <Form.Check 
                  type="radio"
                  id="role-ngo"
                  label="NGO (Host events)"
                  name="role"
                  value="ngo"
                  checked={formData.role === 'ngo'}
                  onChange={handleChange}
                  className="fw-bold cursor-pointer"
                  style={{ color: '#B22222' }}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold text-secondary">
                <FaUser className="me-2"/>
                {formData.role === 'ngo' ? 'NGO / Organization Name' : 'Full Name'} <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control 
                type="text" 
                name="name"
                placeholder={formData.role === 'ngo' ? "e.g., Clean Rivers Foundation" : "e.g., Aarav Sharma"} 
                value={formData.name}
                onChange={handleChange}
                style={{ borderRadius: '10px' }} 
              />
            </Form.Group>

            {/* MAGIC CONDITIONAL FIELD FOR NGOs ONLY */}
            {formData.role === 'ngo' && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-secondary">
                  <FaIdCard className="me-2"/>Registration Number <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control 
                  type="text" 
                  name="ngoRegistrationNumber"
                  placeholder="e.g., MP/NGO/2026/1234" 
                  value={formData.ngoRegistrationNumber}
                  onChange={handleChange}
                  style={{ borderRadius: '10px', borderColor: '#FF9933' }} 
                />
                <Form.Text className="text-muted small">
                  Required for official platform verification.
                </Form.Text>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold text-secondary">
                <FaEnvelope className="me-2"/>Email Address <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control 
                type="email" 
                name="email"
                placeholder="name@example.com" 
                value={formData.email}
                onChange={handleChange}
                style={{ borderRadius: '10px' }} 
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
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
                  <Form.Label className="fw-bold text-secondary">
                    <FaLock className="me-2"/>Password <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control 
                    type="password" 
                    name="password"
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={handleChange}
                    style={{ borderRadius: '10px' }} 
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button 
              type="submit" 
              className="w-100 fw-bold rounded-pill py-2 shadow-sm" 
              style={{ backgroundColor: '#FF9933', border: 'none', fontSize: '1.1rem' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : `Create ${formData.role === 'ngo' ? 'NGO' : 'Volunteer'} Account`}
            </Button>
          </Form>

          <div className="text-center mt-4">
            <p className="text-muted small">
              Already have an account? <Link to="/login" className="fw-bold text-decoration-none" style={{ color: '#B22222' }}>Log In here</Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;