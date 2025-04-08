const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db/connect');

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all appointments
 *     responses:
 *       200:
 *         description: List of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   doctorName: { type: string }
 *                   specialty: { type: string }
 *                   date: { type: string, format: date }
 *                   time: { type: string }
 */
router.get('/', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const appointments = await db.collection('appointments').find().toArray();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create a new appointment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctorName: { type: string }
 *               specialty: { type: string }
 *               date: { type: string, format: date }
 *               time: { type: string }
 *     responses:
 *       201:
 *         description: Appointment created
 */
router.post('/', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const result = await db.collection('appointments').insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;