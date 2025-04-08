const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db/connect');
const { ObjectId } = require('mongodb');

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all appointments for the authenticated user
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
 *                   _id: { type: string }
 *                   doctorName: { type: string }
 *                   specialty: { type: string }
 *                   date: { type: string, format: date }
 *                   time: { type: string }
 *                   status: { type: string, enum: ['pending', 'approved', 'rejected'] }
 *                   hospitalId: { type: string }
 *                   doctorId: { type: string }
 */
router.get('/', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const appointments = await db
      .collection('appointments')
      .find({ userEmail: req.user.email })
      .toArray();
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
 *               hospitalId: { type: string }
 *               doctorId: { type: string }
 *               doctorName: { type: string }
 *               specialty: { type: string }
 *               date: { type: string, format: date }
 *               time: { type: string }
 *               status: { type: string, enum: ['pending', 'approved', 'rejected'] }
 *     responses:
 *       201:
 *         description: Appointment created
 */
router.post('/', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const appointment = {
      ...req.body,
      userEmail: req.user.email,
      createdAt: new Date(),
    };
    const result = await db.collection('appointments').insertOne(appointment);
    res.status(201).json({ _id: result.insertedId, ...appointment });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Reschedule an appointment
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date: { type: string, format: date }
 *               time: { type: string }
 *     responses:
 *       200:
 *         description: Appointment updated
 */
router.put('/:id', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { id } = req.params;
    const { date, time } = req.body;
    const result = await db.collection('appointments').updateOne(
      { _id: new ObjectId(id), userEmail: req.user.email },
      { $set: { date, time, status: 'pending' } }
    );
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment rescheduled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;