const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db/connect');

/**
 * @swagger
 * /api/medical-conditions:
 *   get:
 *     summary: Get user health conditions
 *     responses:
 *       200:
 *         description: Conditions object
 */
router.get('/', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const conditions = await db.collection('medical_conditions').findOne({ userEmail: req.user.email });
    res.json(conditions || { previousConditions: '', currentConditions: '' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/medical-conditions:
 *   post:
 *     summary: Save user health conditions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               previousConditions: { type: string }
 *               currentConditions: { type: string }
 */
router.post('/', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { previousConditions, currentConditions } = req.body;
    const data = { userEmail: req.user.email, previousConditions, currentConditions };
    await db.collection('medical_conditions').updateOne(
      { userEmail: req.user.email },
      { $set: data },
      { upsert: true }
    );
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;