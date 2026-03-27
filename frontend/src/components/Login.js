import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { FaSignInAlt, FaEnvelope, FaLock, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  // Main Login State
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // NEW: State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);

  // OTP & Forgot Password State
  const [view, setView] = useState('login'); // 'login', 'forgot', 'reset'
  const [resetData, setResetData] = useState({ email: '', otp: '', newPassword: '' });
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  
  // NEW: State for toggling the new password visibility on the reset screen
  const [showResetPassword, setShowResetPassword] = useState(false);

  // --- 1. STANDARD LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user)); // Fixed to grab data.user directly
        window.location.href = '/'; // Refresh and go home
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. REQUEST OTP ---
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    setLoading(true); // Freeze the button!
    
    try {
      const response = await fetch('http://localhost:5000/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetData.email }),
      });
      const data = await response.json();

      if (response.ok) {
        setResetMessage('OTP sent to your email! It expires in 10 minutes.');
        setView('reset'); // Move to the verification screen
      } else {
        throw new Error(data.message || 'Error sending email');
      }
    } catch (err) {
      setResetError(err.message);
    } finally {
      setLoading(false); // Unfreeze the button!
    }
  };

  // --- 3. VERIFY OTP & RESET PASSWORD ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    try {
      const response = await fetch('http://localhost:5000/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetData),
      });
      const data = await response.json();

      if (response.ok) {
        alert("Password Reset Successful! Please log in.");
        setView('login'); // Send them back to login
      } else {
        throw new Error(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setResetError(err.message);
    }
  };

  return (
    <Container className="my-5 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <Card className="border-0 shadow-lg p-4" style={{ borderRadius: '15px', maxWidth: '450px', width: '100%' }}>
        
        {/* VIEW 1: STANDARD LOGIN */}
        {view === 'login' && (
          <Card.Body>
            <h2 className="text-center fw-bold mb-4" style={{ color: '#B22222' }}>
              <FaSignInAlt className="me-2 mb-1" /> Welcome Back
            </h2>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold"><FaEnvelope className="me-2 text-secondary"/>Email</Form.Label>
                <Form.Control type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold"><FaLock className="me-2 text-secondary"/>Password</Form.Label>
                <InputGroup>
                  <Form.Control 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  />
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ borderColor: '#ced4da' }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Button type="submit" className="w-100 fw-bold rounded-pill" style={{ backgroundColor: '#B22222', border: 'none' }} disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Form>

            <div className="text-center mt-3">
              <span className="text-primary" style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setView('forgot')}>
                Forgot Password?
              </span>
            </div>
          </Card.Body>
        )}

        {/* VIEW 2: REQUEST OTP */}
        {view === 'forgot' && (
          <Card.Body>
            <h4 className="text-center fw-bold mb-3" style={{ color: '#FF9933' }}>Reset Password</h4>
            <p className="text-muted text-center small">Enter your email and we will send you a 6-digit OTP.</p>
            {resetError && <Alert variant="danger">{resetError}</Alert>}
            
            <Form onSubmit={handleForgotPassword}>
              <Form.Group className="mb-4">
                <Form.Control type="email" placeholder="Enter your email" required value={resetData.email} onChange={(e) => setResetData({...resetData, email: e.target.value})} />
              </Form.Group>
              <Button type="submit" variant="warning" className="w-100 fw-bold rounded-pill shadow-sm" disabled={loading}>
                {loading ? 'Processing...' : 'Submit'}
              </Button>
            </Form>
            <div className="text-center mt-3">
              <span className="text-secondary" style={{ cursor: 'pointer' }} onClick={() => setView('login')}>Back to Login</span>
            </div>
          </Card.Body>
        )}

        {/* VIEW 3: VERIFY OTP */}
        {view === 'reset' && (
          <Card.Body>
            <h4 className="text-center fw-bold mb-3 text-success">Enter OTP</h4>
            {resetMessage && <Alert variant="success" className="small">{resetMessage}</Alert>}
            {resetError && <Alert variant="danger">{resetError}</Alert>}
            
            <Form onSubmit={handleResetPassword}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold"><FaKey className="me-2"/>6-Digit OTP</Form.Label>
                <Form.Control type="text" maxLength="6" required value={resetData.otp} onChange={(e) => setResetData({...resetData, otp: e.target.value})} />
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold"><FaLock className="me-2"/>New Password</Form.Label>
                <InputGroup>
                  <Form.Control 
                    type={showResetPassword ? "text" : "password"} 
                    required 
                    minLength="6" 
                    value={resetData.newPassword} 
                    onChange={(e) => setResetData({...resetData, newPassword: e.target.value})} 
                  />
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    style={{ borderColor: '#ced4da' }}
                  >
                    {showResetPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Button type="submit" variant="success" className="w-100 fw-bold rounded-pill shadow-sm">Submit</Button>
            </Form>
          </Card.Body>
        )}

      </Card>
    </Container>
  );
};

export default Login;