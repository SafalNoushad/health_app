const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db/connect');

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get doctors by hospital ID
 *     parameters:
 *       - in: query
 *         name: hospitalId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the hospital
 *     responses:
 *       200:
 *         description: List of doctors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string }
 *                   name: { type: string }
 *                   specialty: { type: string }
 */
router.get('/', async (req, res) => {
  try {
    const { hospitalId } = req.query;
    if (!hospitalId) {
      return res.status(400).json({ message: 'hospitalId is required' });
    }
    const db = await connectToDatabase();
    const doctors = await db.collection('doctors').find({ hospitalId }).toArray();
    res.json(doctors.map(d => ({ id: d._id.toString(), name: d.name, specialty: d.specialty })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;