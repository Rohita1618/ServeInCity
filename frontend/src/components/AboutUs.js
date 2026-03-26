import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaHeart, FaGlobe, FaHandsHelping, FaLaptopCode } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <Container className="my-5 main-content">
      
      {/* --- HERO SECTION --- */}
      <div className="text-center mb-5 pb-3 border-bottom">
        <h1 className="display-4 fw-bold" style={{ color: '#B22222' }}>About ServeInCity</h1>
        <p className="text-muted fs-5 mx-auto" style={{ maxWidth: '700px' }}>
          Bridging the gap between passionate volunteers and the organizations that need them most. 
          We believe that local action drives global change.
        </p>
      </div>

      {/* --- MISSION & VISION --- */}
      <Row className="mb-5 g-4">
        <Col md={6}>
          <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#FFF8E7', borderRadius: '15px' }}>
            <Card.Body className="p-4 p-md-5">
              <h3 className="fw-bold mb-3" style={{ color: '#5D4037' }}>
                <FaGlobe className="me-2 mb-1" style={{ color: '#FF9933' }} /> 
                Our Mission
              </h3>
              <p className="text-muted fs-6" style={{ lineHeight: '1.8' }}>
                To empower citizens across India by providing a seamless, transparent, and engaging platform to discover local volunteering opportunities. We strive to help NGOs scale their impact by connecting them with dedicated community heroes.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#FFF8E7', borderRadius: '15px' }}>
            <Card.Body className="p-4 p-md-5">
              <h3 className="fw-bold mb-3" style={{ color: '#5D4037' }}>
                <FaHeart className="me-2 mb-1" style={{ color: '#B22222' }} /> 
                Our Vision
              </h3>
              <p className="text-muted fs-6" style={{ lineHeight: '1.8' }}>
                A future where every individual has the tools to make a tangible difference in their city, fostering a culture of empathy, action, and sustainable community development.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- CORE VALUES --- */}
      <h3 className="text-center fw-bold mb-4" style={{ color: '#B22222' }}>Why We Do It</h3>
      <Row className="mb-5 text-center g-4">
        <Col md={4}>
          <Card className="border-0 h-100 px-3 py-4">
            <div className="mb-3">
              <FaHandsHelping size={50} style={{ color: '#FF9933' }} />
            </div>
            <h5 className="fw-bold text-dark">Community First</h5>
            <p className="text-muted small">Every feature we build is designed to strengthen local communities and foster collaboration.</p>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 h-100 px-3 py-4">
            <div className="mb-3">
              <FaGlobe size={50} style={{ color: '#28a745' }} />
            </div>
            <h5 className="fw-bold text-dark">Accessible Impact</h5>
            <p className="text-muted small">Volunteering shouldn't be hard to find. We make doing good as simple as a few clicks.</p>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 h-100 px-3 py-4">
            <div className="mb-3">
              <FaHeart size={50} style={{ color: '#B22222' }} />
            </div>
            <h5 className="fw-bold text-dark">Trust & Transparency</h5>
            <p className="text-muted small">By verifying NGOs and tracking real hours, we build a platform everyone can trust.</p>
          </Card>
        </Col>
      </Row>

      <hr className="mb-5" />

      {/* --- DEVELOPER SPOTLIGHT (Great for your MCA project!) --- */}
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="border-0 shadow-sm text-center p-4 p-md-5" style={{ borderRadius: '15px', borderLeft: '5px solid #FF9933' }}>
            <Card.Body>
              <FaLaptopCode size={40} className="mb-3" style={{ color: '#5D4037' }} />
              <h4 className="fw-bold mb-3" style={{ color: '#B22222' }}>Built for the Community</h4>
              <p className="text-muted">
                ServeInCity was architected and developed as a comprehensive Full-Stack application, 
                utilizing React, Node.js, Express, and MongoDB. It features secure Role-Based Access Control, 
                RESTful APIs, and dynamic state management to deliver a seamless user experience.
              </p>
              <p className="text-muted mt-3 mb-0 small fw-bold">
                Developed by: <span style={{ color: '#FF9933' }}>Rohit Kumar Namdeo</span> | MCA Major Project 2026
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </Container>
  );
};

export default AboutUs;