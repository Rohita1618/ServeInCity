import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Badge } from 'react-bootstrap';
import { FaBuilding, FaCity, FaEnvelope, FaCheckCircle, FaIdCard } from 'react-icons/fa';

const NgoDirectory = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNgos = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/ngos');
        const data = await response.json();
        setNgos(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching NGOs:", error);
        setLoading(false);
      }
    };

    fetchNgos();
  }, []);

  return (
    <Container className="my-5 main-content">
      <div className="text-center mb-5">
        <h2 className="fw-bold" style={{ color: '#B22222' }}>
          <FaBuilding className="me-3 mb-1" />
          Verified Organizations
        </h2>
        <p className="text-muted fs-5">Meet the incredible NGOs driving change in our cities.</p>
      </div>

      {loading ? (
        <div className="text-center my-5 py-5">
          <Spinner animation="border" style={{ color: '#FF9933' }} />
          <p className="text-muted mt-3 fw-bold">Loading directory...</p>
        </div>
      ) : ngos.length === 0 ? (
        <Card className="border-0 shadow-sm text-center p-5 bg-light" style={{ borderRadius: '15px' }}>
          <h5 className="text-muted m-0">No registered NGOs found yet.</h5>
          <p className="text-muted small mt-2">Organizations will appear here once they join the platform.</p>
        </Card>
      ) : (
        <Row>
          {ngos.map((ngo) => (
            <Col md={4} key={ngo._id} className="mb-4">
              <Card className="h-100 border-0 shadow-sm text-center" style={{ borderRadius: '15px', borderTop: '5px solid #FF9933' }}>
                <Card.Body className="p-4 d-flex flex-column">
                  
                  {/* Verified Badge */}
                  <div className="d-flex justify-content-end mb-2">
                    <Badge bg="success" className="rounded-pill px-3 shadow-sm">
                      <FaCheckCircle className="me-1" /> Verified Partner
                    </Badge>
                  </div>

                  <div className="mb-3 mt-2">
                    <div 
                      className="rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm" 
                      style={{ width: '70px', height: '70px', backgroundColor: '#FFF8E7', color: '#B22222' }}
                    >
                      <FaBuilding size={30} />
                    </div>
                  </div>
                  
                  <Card.Title className="fw-bold fs-5 mb-1" style={{ color: '#5D4037' }}>
                    {ngo.name}
                  </Card.Title>
                  
                  <p className="text-muted small fw-bold mb-4">
                    <FaCity className="me-1 text-secondary" /> {ngo.city}
                  </p>

                  <div className="mt-auto bg-light rounded-3 p-3 text-start">
                    <p className="mb-2 text-muted small" style={{ fontSize: '0.85rem' }}>
                      <FaEnvelope className="me-2" style={{ color: '#FF9933' }}/> 
                      <a href={`mailto:${ngo.email}`} className="text-decoration-none text-muted">{ngo.email}</a>
                    </p>
                    {ngo.ngoRegistrationNumber && (
                      <p className="mb-0 text-muted small" style={{ fontSize: '0.85rem' }}>
                        <FaIdCard className="me-2" style={{ color: '#FF9933' }}/> 
                        Gov. Reg: <span className="fw-bold">{ngo.ngoRegistrationNumber}</span>
                      </p>
                    )}
                  </div>

                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default NgoDirectory;