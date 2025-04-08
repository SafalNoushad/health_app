const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db/connect');

/**
 * @swagger
 * /api/hospitals:
 *   get:
 *     summary: Get all hospitals
 *     responses:
 *       200:
 *         description: List of hospitals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string }
 *                   name: { type: string }
 */
router.get('/', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const hospitals = await db.collection('hospitals').find().toArray();
    res.json(hospitals.map(h => ({ id: h._id.toString(), name: h.name })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;