import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { FaCog, FaLock, FaShieldAlt, FaUserEdit, FaSave, FaCamera, FaEye, FaEyeSlash } from 'react-icons/fa';
const Settings = () => {
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [profileData, setProfileData] = useState({ name: '', city: '', profilePhoto: '' });
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const loggedInUser = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (loggedInUser) {
      setProfileData({
        name: loggedInUser.name || '',
        city: loggedInUser.city || '',
        profilePhoto: loggedInUser.profilePhoto || ''
      });
      setImagePreview(loggedInUser.profilePhoto || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- THE MAGIC: Convert Image to Base64 String ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // Limit to 5MB
        return setProfileError("Image is too large. Please select an image under 5MB.");
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImagePreview(reader.result); // Show preview instantly
        setProfileData({ ...profileData, profilePhoto: reader.result }); // Save string for backend
      };
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileError('');

    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        setProfileMessage('Profile successfully updated!');
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setProfileError(err.message);
    }
  };

  const handlePasswordChange = async (e) => {
    // ... (Keep your existing password change logic here!)
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      return setPasswordError("New passwords do not match!");
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage('Password successfully updated!');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        throw new Error(data.message || 'Failed to update password');
      }
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  if (!loggedInUser) return <Container className="my-5 text-center"><Alert variant="warning">Please log in.</Alert></Container>;

  return (
    <Container className="my-5 pb-5">
      <h2 className="fw-bold mb-4" style={{ color: '#6c757d' }}><FaCog className="me-2 mb-1" /> Account Settings</h2>
      <Row>
        <Col md={6}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3"><FaUserEdit className="me-2 text-primary"/> Edit Profile</h5>
              <hr />
              {profileMessage && <Alert variant="success">{profileMessage}</Alert>}
              {profileError && <Alert variant="danger">{profileError}</Alert>}

              <Form onSubmit={handleProfileUpdate}>
                
                {/* NEW PHOTO UPLOAD UI */}
                <div className="text-center mb-4">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile Preview" className="rounded-circle shadow-sm mb-3" style={{ width: '120px', height: '120px', objectFit: 'cover', border: '3px solid #f8f9fa' }} />
                  ) : (
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm" style={{ width: '120px', height: '120px', border: '3px solid #f8f9fa' }}>
                      <FaCamera size={40} className="text-secondary" />
                    </div>
                  )}
                  <Form.Group>
                    <Form.Label className="btn btn-outline-primary btn-sm fw-bold rounded-pill shadow-sm" style={{ cursor: 'pointer' }}>
                      Change Photo
                      <Form.Control type="file" accept="image/*" onChange={handleImageUpload} hidden />
                    </Form.Label>
                  </Form.Group>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label className="text-secondary fw-bold small">Full Name</Form.Label>
                  <Form.Control type="text" required value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="text-secondary fw-bold small">City</Form.Label>
                  <Form.Control type="text" required value={profileData.city} onChange={(e) => setProfileData({...profileData, city: e.target.value})} />
                </Form.Group>
                
                <Button type="submit" variant="primary" className="w-100 fw-bold shadow-sm"><FaSave className="me-2"/> Save Changes</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          {/* ... Your Password Card goes here (no changes needed) ... */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3"><FaShieldAlt className="me-2 text-success"/> Security</h5>
              <hr />
              {passwordMessage && <Alert variant="success">{passwordMessage}</Alert>}
              {passwordError && <Alert variant="danger">{passwordError}</Alert>}
              <Form onSubmit={handlePasswordChange}>
                {/* 1. Current Password */}
                <Form.Group className="mb-3">
                  <Form.Label className="text-secondary fw-bold small">Current Password</Form.Label>
                  <InputGroup>
                    <Form.Control 
                      type={showCurrent ? "text" : "password"} 
                      required 
                      value={passwords.currentPassword} 
                      onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} 
                    />
                    <Button variant="outline-secondary" onClick={() => setShowCurrent(!showCurrent)} style={{ borderColor: '#ced4da' }}>
                      {showCurrent ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                </Form.Group>

                {/* 2. New Password */}
                <Form.Group className="mb-3">
                  <Form.Label className="text-secondary fw-bold small">New Password</Form.Label>
                  <InputGroup>
                    <Form.Control 
                      type={showNew ? "text" : "password"} 
                      required 
                      minLength="6"
                      value={passwords.newPassword} 
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} 
                    />
                    <Button variant="outline-secondary" onClick={() => setShowNew(!showNew)} style={{ borderColor: '#ced4da' }}>
                      {showNew ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                </Form.Group>

                {/* 3. Confirm New Password */}
                <Form.Group className="mb-4">
                  <Form.Label className="text-secondary fw-bold small">Confirm New Password</Form.Label>
                  <InputGroup>
                    <Form.Control 
                      type={showConfirm ? "text" : "password"} 
                      required 
                      minLength="6"
                      value={passwords.confirmPassword} 
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} 
                    />
                    <Button variant="outline-secondary" onClick={() => setShowConfirm(!showConfirm)} style={{ borderColor: '#ced4da' }}>
                      {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                </Form.Group>
                <Button type="submit" variant="dark" className="w-100 fw-bold shadow-sm"><FaLock className="me-2"/> Update Password</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Settings;