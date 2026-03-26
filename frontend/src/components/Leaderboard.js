import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Spinner, Badge } from 'react-bootstrap';
import { FaTrophy, FaMedal, FaCity } from 'react-icons/fa';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/leaderboard');
        const data = await response.json();
        setLeaders(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // A helper function to assign trophies based on their rank index!
  const getRankBadge = (index) => {
    if (index === 0) return <FaTrophy size={24} style={{ color: '#FFD700' }} title="1st Place - Gold" />; // Gold
    if (index === 1) return <FaMedal size={24} style={{ color: '#C0C0C0' }} title="2nd Place - Silver" />; // Silver
    if (index === 2) return <FaMedal size={24} style={{ color: '#CD7F32' }} title="3rd Place - Bronze" />; // Bronze
    return <span className="fw-bold text-muted px-2">#{index + 1}</span>;
  };

  return (
    <Container className="my-5 main-content d-flex justify-content-center">
      <Card className="border-0 shadow-lg w-100" style={{ maxWidth: '800px', borderRadius: '15px' }}>
        
        {/* --- HEADER --- */}
        <Card.Header className="text-center py-4 border-0" style={{ backgroundColor: '#FFF8E7', borderRadius: '15px 15px 0 0' }}>
          <FaTrophy size={40} className="mb-2" style={{ color: '#FF9933' }} />
          <h2 className="fw-bold mb-0" style={{ color: '#B22222' }}>City Impact Leaderboard</h2>
          <p className="text-muted fw-bold mt-2 mb-0">Honoring our most active community heroes.</p>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center my-5 py-5">
              <Spinner animation="border" style={{ color: '#FF9933' }} />
              <p className="text-muted mt-3 fw-bold">Calculating rankings...</p>
            </div>
          ) : leaders.length === 0 ? (
            <div className="text-center my-5 text-muted">
              <h5>No active volunteers yet!</h5>
              <p>Be the first to join an event and claim the top spot.</p>
            </div>
          ) : (
            
            <Table hover responsive className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-4 text-center border-0 text-secondary">Rank</th>
                  <th className="py-3 border-0 text-secondary">Volunteer Name</th>
                  <th className="py-3 border-0 text-secondary"><FaCity className="me-2"/>City</th>
                  <th className="py-3 px-4 text-center border-0 text-secondary">Events Attended</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((user, index) => (
                  <tr key={user.id} className={index < 3 ? 'bg-light' : ''}>
                    
                    {/* The Trophy Column */}
                    <td className="text-center py-3 px-4" style={{ width: '15%' }}>
                      {getRankBadge(index)}
                    </td>
                    
                    <td className="py-3 fw-bold" style={{ color: '#5D4037', fontSize: index < 3 ? '1.1rem' : '1rem' }}>
                      {user.name}
                    </td>
                    
                    <td className="py-3 text-muted">
                      {user.city}
                    </td>
                    
                    <td className="text-center py-3 px-4">
                      <Badge 
                        bg={index === 0 ? "warning" : index === 1 ? "secondary" : "danger"} 
                        text={index === 0 ? "dark" : "white"}
                        className="fs-6 px-3 py-2 rounded-pill shadow-sm"
                      >
                        {user.eventsJoined}
                      </Badge>
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Leaderboard;