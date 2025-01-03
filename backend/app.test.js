const request = require('supertest');
const app = require('./app');
const mongoose = require('mongoose');
const Goal = require('./models/goal');

// Mock the Goal model
jest.mock('./models/goal');

describe('App Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mock calls and instances before each test
  });

  afterAll(async () => {
    // Close the MongoDB connection after all tests
    await mongoose.connection.close();
  });

  describe('GET /goals', () => {
    it('should fetch all goals', async () => {
      const mockGoals = [{ id: '1', text: 'Learn Jest' }];
      Goal.find.mockResolvedValue(mockGoals);

      const response = await request(app).get('/goals');
      expect(response.status).toBe(200);
      expect(response.body.goals).toEqual(mockGoals);
    });

    it('should handle errors when fetching goals', async () => {
      Goal.find.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/goals');
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to load goals.');
    });
  });

  describe('POST /goals', () => {
    it('should create a new goal', async () => {
      const goalText = 'Test goal';
      const mockGoal = { id: '1', text: goalText };

      Goal.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockGoal),
      }));

      const response = await request(app).post('/goals').send({ text: goalText });
      expect(response.status).toBe(201);
      expect(response.body.goal).toEqual(mockGoal);
    });

    it('should validate goal text', async () => {
      const response = await request(app).post('/goals').send({ text: '' });
      expect(response.status).toBe(422);
      expect(response.body.message).toBe('Invalid goal text.');
    });

    it('should handle errors when saving goals', async () => {
      Goal.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Database error')),
      }));

      const response = await request(app).post('/goals').send({ text: 'Test goal' });
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to save goal.');
    });
  });

  describe('DELETE /goals/:id', () => {
    it('should delete a goal', async () => {
      Goal.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const response = await request(app).delete('/goals/1');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Goal deleted!');
    });

    it('should handle errors when deleting a goal', async () => {
      Goal.deleteOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete('/goals/1');
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to delete goal.');
    });
  });
});
