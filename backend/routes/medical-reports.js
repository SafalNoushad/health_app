const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db/connect');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

/**
 * @swagger
 * /api/medical-reports/upload:
 *   post:
 *     summary: Upload a medical report
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Report uploaded successfully
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const db = await connectToDatabase();
    const record = {
      userEmail: req.user.email,
      title: req.file.originalname,
      date: new Date().toISOString(),
      description: `Uploaded file: ${req.file.originalname}`,
      filePath: req.file.path,
      createdAt: new Date(),
    };
    const result = await db.collection('medical_records').insertOne(record);
    res.status(201).json({ _id: result.insertedId, ...record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/medical-reports:
 *   get:
 *     summary: Get medical records for authenticated user
 *     responses:
 *       200:
 *         description: List of medical records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title: { type: string }
 *                   date: { type: string }
 *                   description: { type: string }
 *                   filePath: { type: string }
 */
router.get('/', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const records = await db
      .collection('medical_records')
      .find({ userEmail: req.user.email })
      .toArray();
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;