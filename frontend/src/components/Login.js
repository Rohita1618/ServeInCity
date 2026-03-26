import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      // 🎉 SUCCESS! Save the VIP Pass and User Data to the browser
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess(`Welcome back, ${data.user.name}!`);
      
      // Send them to the homepage after 1.5 seconds
      setTimeout(() => {
        navigate('/');
        window.location.reload(); // Refresh to update the navbar (we will refine this later!)
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5 d-flex justify-content-center">
      <Card className="border-0 shadow-lg" style={{ borderRadius: '15px', maxWidth: '450px', width: '100%' }}>
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold" style={{ color: '#B22222' }}>
              <FaSignInAlt className="me-2 mb-1" /> Welcome Back
            </h2>
            <p className="text-muted">Log in to continue your impact.</p>
          </div>

          {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
          {success && <Alert variant="success" className="rounded-3 fw-bold">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold text-secondary"><FaEnvelope className="me-2"/>Email Address</Form.Label>
              <Form.Control 
                type="email" 
                name="email"
                placeholder="name@example.com" 
                value={formData.email}
                onChange={handleChange}
                required
                style={{ borderRadius: '10px' }} 
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <div className="d-flex justify-content-between">
                <Form.Label className="fw-bold text-secondary"><FaLock className="me-2"/>Password</Form.Label>
                <Link to="#" className="text-decoration-none small" style={{ color: '#FF9933' }}>Forgot Password?</Link>
              </div>
              <Form.Control 
                type="password" 
                name="password"
                placeholder="••••••••" 
                value={formData.password}
                onChange={handleChange}
                required
                style={{ borderRadius: '10px' }} 
              />
            </Form.Group>

            <Button 
              type="submit" 
              className="w-100 fw-bold rounded-pill py-2 shadow-sm" 
              style={{ backgroundColor: '#B22222', border: 'none', fontSize: '1.1rem' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </Form>

          <div className="text-center mt-4">
            <p className="text-muted small">
              Don't have an account? <Link to="/register" className="fw-bold text-decoration-none" style={{ color: '#FF9933' }}>Sign up here</Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;