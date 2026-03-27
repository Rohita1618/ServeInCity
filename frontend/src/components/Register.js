import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { FaUserPlus, FaEnvelope, FaLock, FaCity, FaUserAlt, FaIdCard, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', city: '', role: 'volunteer', ngoRegistrationNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // NEW: State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        alert("Registration Successful! Please log in.");
        navigate('/login');
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5 d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
      <Card className="border-0 shadow-lg p-4" style={{ borderRadius: '15px', maxWidth: '600px', width: '100%' }}>
        <Card.Body>
          <h2 className="text-center fw-bold mb-4" style={{ color: '#B22222' }}>
            <FaUserPlus className="me-2 mb-1" /> Join ServeInCity
          </h2>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleRegister}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold"><FaUserAlt className="me-2 text-secondary"/>Full Name</Form.Label>
                  <Form.Control type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold"><FaEnvelope className="me-2 text-secondary"/>Email</Form.Label>
                  <Form.Control type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold"><FaLock className="me-2 text-secondary"/>Password</Form.Label>
                  <InputGroup>
                    <Form.Control 
                      type={showPassword ? "text" : "password"} 
                      required 
                      minLength="6"
                      value={formData.password} 
                      onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    />
                    <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)} style={{ borderColor: '#ced4da' }}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold"><FaCity className="me-2 text-secondary"/>City</Form.Label>
                  <Form.Control type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold mb-2 d-block">I am registering as a:</Form.Label>
              <div className="d-flex gap-4">
                <Form.Check 
                  type="radio" label="Volunteer" name="role" id="role-volunteer"
                  checked={formData.role === 'volunteer'} 
                  onChange={() => setFormData({...formData, role: 'volunteer', ngoRegistrationNumber: ''})} 
                />
                <Form.Check 
                  type="radio" label="Verified NGO" name="role" id="role-ngo"
                  checked={formData.role === 'ngo'} 
                  onChange={() => setFormData({...formData, role: 'ngo'})} 
                />
              </div>
            </Form.Group>

            {/* Extra Field just for NGOs */}
            {formData.role === 'ngo' && (
              <Form.Group className="mb-4 p-3 bg-light rounded border border-warning">
                <Form.Label className="fw-bold text-dark"><FaIdCard className="me-2 text-warning"/>NGO Registration Number</Form.Label>
                <Form.Control 
                  type="text" required 
                  placeholder="e.g. MP-12345-2026"
                  value={formData.ngoRegistrationNumber} 
                  onChange={(e) => setFormData({...formData, ngoRegistrationNumber: e.target.value})} 
                />
              </Form.Group>
            )}

            <Button type="submit" className="w-100 fw-bold rounded-pill mt-2" style={{ backgroundColor: '#B22222', border: 'none' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <span className="text-muted small">Already have an account? </span>
            <Link to="/login" className="text-primary text-decoration-none fw-bold">Login Here</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;