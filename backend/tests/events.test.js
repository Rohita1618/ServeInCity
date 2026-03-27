const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // This imports your entire backend brain!

describe('Event API Endpoints', () => {
  
  // This runs after the test finishes to cleanly shut down the database
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // THE ACTUAL TEST
  it('should successfully fetch all events from the database', async () => {
    // 1. The robot pings your API
    const response = await request(app).get('/api/events');
    
    // 2. We EXPECT the server to return a 200 (Success) status code
    expect(response.statusCode).toBe(200);
    
    // 3. We EXPECT the server to send back an array (list) of events
    expect(Array.isArray(response.body)).toBeTruthy();
  });

});