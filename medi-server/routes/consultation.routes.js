const express = require('express');
const router = express.Router();
const Consultation = require('../models/consultation.model');
const RFID = require('../models/rfid.model');
const User = require('../models/user.model');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Consultations
 *   description: Consultation management endpoints
 */

/**
 * @swagger
 * /api/consultations/add-by-rfid:
 *   post:
 *     summary: Add doctor as a consulting doctor for a patient using RFID
 *     tags: [Consultations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rfidNumber
 *               - notes
 *             properties:
 *               rfidNumber:
 *                 type: string
 *                 description: RFID card number of the patient
 *               notes:
 *                 type: string
 *                 description: Consultation notes
 *     responses:
 *       201:
 *         description: Consultation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Consultation'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized - only doctors can add consultations
 *       404:
 *         description: RFID card or patient not found
 *       500:
 *         description: Server error
 */
router.post('/add-by-rfid', authenticate, async (req, res) => {
  try {
    // Only doctors can add themselves as consulting doctors
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can add consulting relationships' });
    }

    const { rfidNumber, notes } = req.body;

    // Find patient by RFID
    const rfidCard = await RFID.findOne({ rfidNumber, isActive: true });
    if (!rfidCard) {
      return res.status(404).json({ message: 'Invalid or inactive RFID card' });
    }

    // Verify patient exists
    const patient = await User.findById(rfidCard.userId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if consultation relationship already exists
    let consultation = await Consultation.findOne({
      patientId: patient._id,
      doctorId: req.user._id
    });

    if (consultation) {
      // Update existing consultation
      consultation.status = 'active';
      consultation.lastConsultationDate = new Date();
      consultation.consultationHistory.push({
        date: new Date(),
        notes
      });
    } else {
      // Create new consultation
      consultation = new Consultation({
        patientId: patient._id,
        doctorId: req.user._id,
        consultationHistory: [{
          date: new Date(),
          notes
        }]
      });
    }

    await consultation.save();

    res.status(201).json(consultation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/consultations/patient/{patientId}:
 *   get:
 *     summary: Get all consulting doctors for a patient
 *     tags: [Consultations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the patient
 *     responses:
 *       200:
 *         description: List of consultations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Consultation'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Access denied - can only view own consultations
 *       500:
 *         description: Server error
 */
router.get('/patient/:patientId', authenticate, async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verify access rights
    if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const consultations = await Consultation.find({
      patientId,
      status: 'active'
    })
      .populate('doctorId', 'name speciality hospitalId')
      .populate('patientId', 'name')
      .sort({ lastConsultationDate: -1 });

    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/consultations/doctor:
 *   get:
 *     summary: Get all patients being consulted by the logged-in doctor
 *     tags: [Consultations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of consultations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Consultation'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Access denied - only doctors can access this endpoint
 *       500:
 *         description: Server error
 */
router.get('/doctor', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const consultations = await Consultation.find({
      doctorId: req.user._id,
      status: 'active'
    })
      .populate('patientId', 'name')
      .sort({ lastConsultationDate: -1 });

    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;