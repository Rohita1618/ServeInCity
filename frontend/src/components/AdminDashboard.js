import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Alert } from 'react-bootstrap';
import { FaTrash, FaShieldAlt } from 'react-icons/fa';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const loggedInUser = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/events');
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError('Failed to load database.');
      }
    };
    fetchAllEvents();
  }, []);

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to permanently delete this event?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setEvents(events.filter(event => event._id !== eventId));
        alert("Event deleted successfully.");
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete.");
      }
    } catch (err) {
      alert("An error occurred.");
    }
  };

  if (!loggedInUser || loggedInUser.role !== 'admin') {
    return (
      <Container className="my-5 text-center">
        <Alert variant="danger" className="fw-bold">
          <FaShieldAlt className="me-2"/> Access Denied: You do not have administrator clearance.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h2 className="fw-bold mb-4" style={{ color: '#B22222' }}>
        <FaShieldAlt className="me-2 mb-1" /> System Administration
      </h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h5 className="fw-bold text-secondary mb-3">All Platform Events</h5>
          <Table responsive hover className="align-middle">
            <thead className="bg-light">
              <tr>
                <th>Title</th>
                <th>City</th>
                <th>Category</th>
                <th>Volunteers</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event._id}>
                  <td className="fw-bold">{event.title}</td>
                  <td>{event.city}</td>
                  <td><Badge bg="secondary">{event.skill}</Badge></td>
                  <td>{event.volunteersNeeded} Needed</td>
                  <td>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => handleDeleteEvent(event._id)}
                    >
                      <FaTrash /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminDashboard;