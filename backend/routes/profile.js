const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db/connect');

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get user profile for authenticated user
 *     responses:
 *       200:
 *         description: A profile object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name: { type: string }
 *                 email: { type: string }
 *                 age: { type: number }
 *                 phone: { type: string }
 *                 address: { type: string }
 *                 imageUrl: { type: string }
 *       404:
 *         description: Profile not found
 */
router.get('/', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const profile = await db.collection('users').findOne({ email: req.user.email });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create or update user profile for authenticated user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               age: { type: number }
 *               phone: { type: string }
 *               address: { type: string }
 *               imageUrl: { type: string }
 *     responses:
 *       201:
 *         description: Profile created or updated
 */
router.post('/', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('users');
    const profileData = { ...req.body, email: req.user.email }; // Ensure email matches authenticated user
    const existingProfile = await collection.findOne({ email: req.user.email });
    if (existingProfile) {
      await collection.updateOne({ email: req.user.email }, { $set: profileData });
      const updatedProfile = await collection.findOne({ email: req.user.email });
      res.status(201).json(updatedProfile);
    } else {
      await collection.insertOne(profileData);
      res.status(201).json(profileData);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;